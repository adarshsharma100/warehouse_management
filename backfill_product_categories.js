require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const papa = require('papaparse');

const prisma = new PrismaClient();
const store = process.env.SHOPIFY_STORE_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

async function executeWithRetry(fn, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`Database operation failed (attempt ${i + 1}/${retries}): ${err.message}`);
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
}

// Extract the 2-character category code from a SKU (e.g. TIFDP0015 -> DP, DTIF3P0075 -> 3P)
function extractCategoryCodeFromSku(sku) {
  if (!sku) return null;
  const cleanSku = sku.replace(/`/g, '').trim().toUpperCase();
  if (cleanSku.startsWith('TIF')) {
    return cleanSku.substring(3, 5);
  } else if (cleanSku.startsWith('DTIF')) {
    return cleanSku.substring(4, 6);
  }
  return null;
}

// Generate a fallback category code from the category name
function generateCategoryCodeFromName(name, existingCodes) {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  let code = cleanName.substring(0, 2);
  if (code.length < 2) {
    code = (code + 'XX').substring(0, 2);
  }

  let index = 1;
  let finalCode = code;
  while (existingCodes.has(finalCode)) {
    finalCode = (code + index).substring(0, 10);
    index++;
  }
  return finalCode;
}

async function main() {
  console.log("--- STARTING SHOPIFY PRODUCT CATEGORY BACKFILL ---");

  // 1. Read Product-HSN.csv to build SKU -> Category name map
  const csvPath = path.resolve(__dirname, 'Product-HSN.csv');
  const csvSkuToCategory = new Map();
  if (fs.existsSync(csvPath)) {
    console.log('Reading and parsing Product-HSN.csv...');
    try {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const parsed = papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      for (const row of parsed.data) {
        if (row.SKU && row.Category) {
          const cleanSku = row.SKU.replace(/`/g, '').trim().toLowerCase();
          const cleanCategory = row.Category.replace(/`/g, '').trim();
          csvSkuToCategory.set(cleanSku, cleanCategory);
        }
      }
      console.log(`Loaded ${csvSkuToCategory.size} SKU-to-Category mappings from HSN CSV.`);
    } catch (csvErr) {
      console.error('Error parsing Product-HSN.csv:', csvErr.message);
    }
  } else {
    console.warn('Warning: Product-HSN.csv not found.');
  }

  // 2. Fetch all products from Shopify to map SKU -> product_type
  const shopifySkuToType = new Map();
  if (!store || !accessToken) {
    console.warn('Warning: Shopify credentials missing. Skipping live Shopify fetch.');
  } else {
    console.log('Fetching products from Shopify API to resolve product_types...');
    let url = `https://${store}.myshopify.com/admin/api/2023-07/products.json?limit=250&fields=id,variants,product_type`;
    let page = 0;

    while (url) {
      page++;
      console.log(`Fetching page ${page} from Shopify...`);
      let response;
      let attempts = 0;
      while (attempts < 5) {
        try {
          response = await axios.get(url, {
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
            },
            timeout: 20000
          });
          break;
        } catch (err) {
          attempts++;
          console.warn(`Shopify fetch failed (attempt ${attempts}/5): ${err.message}`);
          if (attempts >= 5) throw err;
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      const products = response.data?.products;
      if (!products || products.length === 0) {
        break;
      }

      for (const p of products) {
        const type = p.product_type ? p.product_type.trim() : null;
        if (type && p.variants) {
          for (const variant of p.variants) {
            if (variant.sku) {
              shopifySkuToType.set(variant.sku.trim().toLowerCase(), type);
            }
          }
        }
      }

      const linkHeader = response.headers['link'];
      if (linkHeader) {
        const nextMatch = linkHeader.match(/<(.*?)>;\s*rel="next"/);
        url = nextMatch ? nextMatch[1] : null;
        if (url) {
          await new Promise(r => setTimeout(r, 500));
        }
      } else {
        url = null;
      }
    }
    console.log(`Fetched ${shopifySkuToType.size} SKU-to-product_type mappings from Shopify.`);
  }

  // 3. Pre-fetch existing categories from DB to build cache
  console.log('Caching existing categories from database...');
  const categoriesInDb = await prisma.product_categories.findMany();
  const categoryCache = new Map(); // code -> category record
  const existingCodes = new Set();

  for (const cat of categoriesInDb) {
    categoryCache.set(cat.code.toUpperCase(), cat);
    existingCodes.add(cat.code.toUpperCase());
  }
  console.log(`Cached ${categoryCache.size} existing categories from DB.`);

  // Helper to find or create category in DB/cache
  async function findOrCreateCategory(name, code) {
    const cleanCode = code.substring(0, 10).toUpperCase();
    const cleanName = name.substring(0, 45);

    if (categoryCache.has(cleanCode)) {
      return categoryCache.get(cleanCode);
    }

    // Try to find by code in DB (just in case)
    let cat = await prisma.product_categories.findUnique({
      where: { code: cleanCode }
    });

    if (!cat) {
      console.log(`Creating category: "${cleanName}" with code "${cleanCode}"`);
      cat = await prisma.product_categories.create({
        data: { name: cleanName, code: cleanCode }
      });
      existingCodes.add(cleanCode);
    }

    categoryCache.set(cleanCode, cat);
    return cat;
  }

  // 4. Fetch all local products that need category mapping or update
  console.log('Fetching products from database...');
  const products = await prisma.products.findMany({
    select: {
      id: true,
      sku: true,
      category: true
    }
  });
  console.log(`Found ${products.length} products in DB.`);

  let updatedCount = 0;
  let skippedCount = 0;
  const updates = [];

  for (const product of products) {
    if (!product.sku) {
      skippedCount++;
      continue;
    }

    const normalizedSku = product.sku.trim().toLowerCase();

    // Determine category name
    let categoryName = null;
    if (csvSkuToCategory.has(normalizedSku)) {
      categoryName = csvSkuToCategory.get(normalizedSku);
    } else if (shopifySkuToType.has(normalizedSku)) {
      categoryName = shopifySkuToType.get(normalizedSku);
    } else {
      categoryName = 'General';
    }

    // Determine category code
    let categoryCode = extractCategoryCodeFromSku(product.sku);
    if (!categoryCode) {
      categoryCode = generateCategoryCodeFromName(categoryName, existingCodes);
    }

    // Get the category record
    const categoryRecord = await findOrCreateCategory(categoryName, categoryCode);

    // If product category is not set, or is set to a different ID, queue update
    if (product.category !== categoryRecord.id) {
      updates.push({
        productId: product.id,
        categoryId: categoryRecord.id,
        sku: product.sku
      });
    } else {
      skippedCount++;
    }
  }

  console.log(`Prepared ${updates.length} products to update. ${skippedCount} products already correctly mapped or skipped.`);

  if (updates.length > 0) {
    console.log('Executing database updates in chunks of 50...');
    const chunkSize = 50;
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(update => {
          return executeWithRetry(async () => {
            await prisma.products.update({
              where: { id: update.productId },
              data: { category: update.categoryId }
            });
          });
        })
      );
      if ((i + chunkSize) % 500 === 0 || i + chunkSize >= updates.length) {
        console.log(`   - Updated ${Math.min(i + chunkSize, updates.length)}/${updates.length} products...`);
      }
    }
    updatedCount = updates.length;
  }

  console.log('\n--- BACKFILL SUMMARY ---');
  console.log(`Products updated: ${updatedCount}`);
  console.log(`Products skipped: ${skippedCount}`);
  console.log(`Total categories in DB now: ${categoryCache.size}`);
  console.log('Category mapping and backfill complete!');
}

main()
  .catch(err => {
    console.error('Fatal error during backfill:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
