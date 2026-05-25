// sync_shopify_to_db.js
// Incremental Shopify sync: only fetch products updated since the last successful run.
// Fetches all pages (pagination) and upserts products/brands. After a successful sync the
// timestamp is saved to sync_state.json so subsequent runs are fast.
// Run with: `node sync_shopify_to_db.js`

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
// Axios instance with higher timeout for large payloads
const api = axios.create({ timeout: 30000 });
// const LAST_SYNC_FILE = path.join(__dirname, '.last_sync'); // deprecated, using sync_state.json


const prisma = new PrismaClient();

const storeName = process.env.SHOPIFY_STORE_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

if (!storeName || !accessToken) {
  console.error('Shopify credentials missing in .env');
  process.exit(1);
}

const shopUrl = `https://${storeName}.myshopify.com`;
// Use the maximum allowed per request (250) and handle pagination via the Link header.
const baseEndpoint = `${shopUrl}/admin/api/2023-07/products.json?limit=250`;

// Path to a tiny JSON file that stores the ISO timestamp of the last successful sync.
const stateFile = path.resolve(__dirname, 'sync_state.json');
function loadLastSync() {
  try {
    const raw = fs.readFileSync(stateFile, 'utf8');
    const obj = JSON.parse(raw);
    return obj.lastSync || '1970-01-01T00:00:00Z';
  } catch (_) {
    // If the file does not exist or is malformed, start from the beginning.
    return '1970-01-01T00:00:00Z';
  }
}
function saveLastSync(timestamp) {
  const data = { lastSync: timestamp };
  fs.writeFileSync(stateFile, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Fetch all products that have been created/updated since `since`.
 * Handles pagination using the Link header.
 */
async function fetchAllProducts(since) {
  const allProducts = [];
  // Request only needed fields, include updated_at for incremental logic
  let url = `${baseEndpoint}&fields=id,title,body_html,vendor,variants,updated_at&updated_at_min=${encodeURIComponent(since)}`;
  while (url) {
    let attempts = 0;
    while (attempts < 3) {
      try {
        const response = await api.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
        });
        const data = response.data;
        if (Array.isArray(data.products)) {
          allProducts.push(...data.products);
        } else {
          console.error('Unexpected response format while fetching products');
          break;
        }
        const linkHeader = response.headers['link'];
        if (linkHeader) {
          const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
          url = nextMatch ? nextMatch[1] : null;
          if (url) {
            // sleep 500ms before next fetch to avoid Shopify rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } else {
          url = null;
        }
        break; // success – exit retry loop
      } catch (err) {
        attempts++;
        console.warn(`Fetch attempt ${attempts} failed: ${err.message}`);
        if (attempts >= 3) {
          console.error('Failed to fetch page after 3 attempts, aborting sync');
          throw err;
        }
        // wait a bit before retrying
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  return allProducts;
}

async function sync() {
  console.log('🔄 Starting incremental Shopify sync...');
  const lastSync = loadLastSync();
  console.log(`Loaded last sync timestamp: ${lastSync}`);
  console.log(`Fetching products changed since ${lastSync}`);
  try {
    const products = await fetchAllProducts(lastSync);
    console.log(`Fetched ${products.length} products. Syncing…`);

    // Ensure default dimensions and product type exist once.
    let defaultDimensions = await prisma.dimensions.findFirst();
    if (!defaultDimensions) {
      defaultDimensions = await prisma.dimensions.create({ data: {} });
      console.log(`Created default dimensions with id ${defaultDimensions.id}`);
    }
    let defaultProductType = await prisma.product_types.findFirst();
    if (!defaultProductType) {
      defaultProductType = await prisma.product_types.create({ data: { type: 'General' } });
      console.log(`Created default product type with id ${defaultProductType.id}`);
    }

    // Optimization: pre-fetch brands, products and product prices into maps
    console.log('Pre-fetching brands, products, and prices from DB...');
    const brandsInDb = await prisma.product_brand.findMany();
    const brandMap = new Map(brandsInDb.map(b => [b.name, b.id]));

    const productsInDb = await prisma.products.findMany({
      select: { id: true, sku: true }
    });
    const productMap = new Map(
      productsInDb
        .filter(p => p.sku)
        .map(p => [p.sku.trim().toLowerCase(), p.id])
    );

    const pricesInDb = await prisma.product_prices.findMany();
    const priceMap = new Map(pricesInDb.map(pr => [pr.productId, pr]));
    console.log(`Loaded ${brandMap.size} brands, ${productMap.size} products, and ${priceMap.size} prices.`);

    let productsCreated = 0;
    let pricesCreated = 0;
    let pricesUpdated = 0;
    let productsSkipped = 0;

    for (const p of products) {
      const brandName = p.vendor || 'Unknown';
      let brandId = brandMap.get(brandName);
      if (!brandId) {
        const brand = await prisma.product_brand.create({ data: { name: brandName } });
        brandId = brand.id;
        brandMap.set(brandName, brandId);
        console.log(`Created brand: ${brandName}`);
      }

      const rawSku = p.variants?.[0]?.sku;
      if (!rawSku) {
        continue;
      }
      const sku = rawSku.trim();
      const normalizedSku = sku.toLowerCase();
      
      let productId = productMap.get(normalizedSku);
      const truncatedName = p.title?.substring(0, 100) || '';

      if (!productId) {
        const localProduct = await prisma.products.create({
          data: {
            sku,
            name: truncatedName,
            description: p.body_html || '',
            brand: brandId,
            dimensionsId: defaultDimensions.id,
            type: defaultProductType.id,
          },
        });
        productId = localProduct.id;
        productMap.set(normalizedSku, productId);
        productsCreated++;
      } else {
        productsSkipped++;
      }

      const firstVariant = p.variants?.[0];
      if (firstVariant) {
        const priceVal = firstVariant.price ? Math.round(parseFloat(firstVariant.price)) : 0;
        const mrpVal = firstVariant.compare_at_price ? Math.round(parseFloat(firstVariant.compare_at_price)) : priceVal;

        const existingPrice = priceMap.get(productId);
        if (!existingPrice) {
          const newPrice = await prisma.product_prices.create({
            data: {
              productId,
              sellingPrice: priceVal,
              mrp: mrpVal,
            },
          });
          priceMap.set(productId, newPrice);
          pricesCreated++;
          console.log(`Created missing price for SKU ${sku} (Price: ${priceVal}, MRP: ${mrpVal})`);
        } else if (existingPrice.sellingPrice !== priceVal || existingPrice.mrp !== mrpVal) {
          const updatedPrice = await prisma.product_prices.update({
            where: { id: existingPrice.id },
            data: {
              sellingPrice: priceVal,
              mrp: mrpVal,
            },
          });
          priceMap.set(productId, updatedPrice);
          pricesUpdated++;
          console.log(`Updated price for SKU ${sku} (Price: ${existingPrice.sellingPrice} -> ${priceVal}, MRP: ${existingPrice.mrp} -> ${mrpVal})`);
        }
      }
    }

    console.log(`✅ Sync complete:`);
    console.log(`   - New products created: ${productsCreated}`);
    console.log(`   - Existing products matched: ${productsSkipped}`);
    console.log(`   - Missing prices created: ${pricesCreated}`);
    console.log(`   - Prices updated: ${pricesUpdated}`);

    // Determine the newest updated_at among the fetched products and store it.
    const latestTimestamp = products.reduce((max, p) => {
      const t = p.updated_at || '';
      return t > max ? t : max;
    }, lastSync);
    const ts = latestTimestamp || new Date().toISOString();
    saveLastSync(ts);
    console.log(`Saved last sync timestamp: ${ts}`);

  } catch (err) {
    console.error('Error during sync:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

sync();
