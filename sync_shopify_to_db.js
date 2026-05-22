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

    for (const p of products) {
      const brandName = p.vendor || 'Unknown';
        let brand = await prisma.product_brand.findFirst({ where: { name: brandName } });
      if (!brand) {
        brand = await prisma.product_brand.create({ data: { name: brandName } });
        console.log(`Created brand: ${brandName}`);
      }
      const sku = p.variants?.[0]?.sku;
      if (!sku) {
        console.warn(`Product ${p.id} has no SKU – skipping`);
        continue;
      }
      const truncatedName = p.title?.substring(0, 100) || '';
      await prisma.products.upsert({
        where: { sku },
        // No update – we only want to insert new products. Existing rows keep their data,
        // including the brand relationship that was set on first insert.
        update: {},
        create: {
          sku,
          name: truncatedName,
          description: p.body_html || '',
          brand: brand.id,
          dimensionsId: defaultDimensions.id,
          type: defaultProductType.id,
        },
      });
      console.log(`Synced SKU ${sku} (Shopify ID ${p.id})`);
    }
    console.log('✅ Sync complete');
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
