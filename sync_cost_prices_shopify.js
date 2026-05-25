// sync_cost_prices_shopify.js
// Bulk sync all cost prices from Shopify to the local database.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const storeName = process.env.SHOPIFY_STORE_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

if (!storeName || !accessToken) {
  console.error('Shopify credentials missing in .env');
  process.exit(1);
}

const shopUrl = `https://${storeName}.myshopify.com`;
const endpoint = `${shopUrl}/admin/api/2023-07/graphql.json`;

const query = `
  query getProductsWithCost($after: String) {
    products(first: 50, after: $after) {
      nodes {
        variants(first: 50) {
          nodes {
            sku
            inventoryItem {
              unitCost {
                amount
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function main() {
  console.log('🔄 Starting bulk cost price sync from Shopify...');
  
  // 1. Pre-fetch all local products and their price records to make DB updates fast
  console.log('Fetching local product and price maps...');
  const localProducts = await prisma.products.findMany({
    select: {
      id: true,
      sku: true,
      product_prices: {
        select: {
          id: true,
          averageCostPrice: true
        }
      }
    }
  });

  const productMap = new Map();
  for (const p of localProducts) {
    if (p.sku) {
      productMap.set(p.sku.trim().toLowerCase(), {
        id: p.id,
        priceRecord: p.product_prices
      });
    }
  }
  console.log(`Loaded ${productMap.size} local products with SKUs.`);

  // 2. Fetch all products and variant costs from Shopify using pagination
  let hasNextPage = true;
  let cursor = null;
  let pageCount = 0;
  let shopifyMatchCount = 0;
  let updatedCount = 0;

  while (hasNextPage) {
    pageCount++;
    console.log(`Fetching page ${pageCount} from Shopify...`);
    
    let response;
    let attempts = 0;
    while (attempts < 3) {
      try {
        response = await axios.post(
          endpoint,
          {
            query,
            variables: { after: cursor }
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
            },
            timeout: 15000
          }
        );
        break; // Success
      } catch (err) {
        attempts++;
        console.warn(`Attempt ${attempts} failed: ${err.message}. Retrying in 2 seconds...`);
        if (attempts >= 3) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    const data = response.data?.data?.products;
    if (!data) {
      console.error('Invalid response structure from Shopify API.');
      break;
    }

    const products = data.nodes || [];
    const dbPromises = [];

    for (const product of products) {
      const variants = product.variants?.nodes || [];
      for (const variant of variants) {
        if (!variant.sku) continue;
        
        const skuKey = variant.sku.trim().toLowerCase();
        const localProduct = productMap.get(skuKey);
        
        if (localProduct) {
          const costAmountStr = variant.inventoryItem?.unitCost?.amount;
          if (costAmountStr !== null && costAmountStr !== undefined) {
            shopifyMatchCount++;
            const costAmount = Math.round(parseFloat(costAmountStr));
            
            // Check if DB update is actually needed (avoid redundant queries)
            const currentCost = localProduct.priceRecord?.averageCostPrice;
            if (currentCost !== costAmount) {
              if (localProduct.priceRecord) {
                dbPromises.push(
                  prisma.product_prices.update({
                    where: { id: localProduct.priceRecord.id },
                    data: { averageCostPrice: costAmount }
                  }).then(updated => {
                    localProduct.priceRecord = updated;
                  })
                );
              } else {
                dbPromises.push(
                  prisma.product_prices.create({
                    data: {
                      productId: localProduct.id,
                      averageCostPrice: costAmount
                    }
                  }).then(created => {
                    localProduct.priceRecord = created;
                  })
                );
              }
              updatedCount++;
            }
          }
        }
      }
    }

    if (dbPromises.length > 0) {
      await Promise.all(dbPromises);
    }

    hasNextPage = data.pageInfo?.hasNextPage || false;
    cursor = data.pageInfo?.endCursor || null;

    console.log(`Page ${pageCount} complete. Synced matches: ${shopifyMatchCount}. Updated: ${updatedCount}`);
    
    // Sleep a bit to avoid hitting Shopify API rate limits
    if (hasNextPage) {
      await new Promise(r => setTimeout(r, 250));
    }
  }

  console.log(`\n✅ Bulk Sync complete:`);
  console.log(`   - Pages processed: ${pageCount}`);
  console.log(`   - Matched Shopify products with costs: ${shopifyMatchCount}`);
  console.log(`   - Local DB price records updated: ${updatedCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
