require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

const store = process.env.SHOPIFY_STORE_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

async function executeWithRetry(fn, retries = 5, delay = 2000) {
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

async function main() {
  console.log("--- STARTING COMPREHENSIVE SHOPIFY SOURCENAME BACKFILL ---");

  // Load all shopify records that need sourceName backfill
  const shopifyRecords = await prisma.shopify.findMany({
    where: { sourceName: null },
    select: { id: true, orderId: true }
  });

  console.log(`Found ${shopifyRecords.length} records in local DB with null sourceName.`);
  if (shopifyRecords.length === 0) {
    console.log("No records to backfill.");
    return;
  }

  // Map Shopify orderId (e.g. "gid://shopify/Order/123456") to local DB ID
  const recordMap = new Map();
  shopifyRecords.forEach(r => {
    if (r.orderId) {
      const match = r.orderId.match(/\d+$/);
      if (match) {
        recordMap.set(match[0], r.id);
      }
    }
  });

  console.log(`Mapped ${recordMap.size} unique numeric order IDs from DB.`);

  let url = `https://${store}.myshopify.com/admin/api/2023-07/orders.json?limit=250&fields=id,name,source_name&status=any`;
  let pageCount = 0;
  let totalUpdated = 0;

  while (url) {
    pageCount++;
    console.log(`\nFetching page ${pageCount} from Shopify API...`);
    
    let response;
    let attempts = 0;
    while (attempts < 5) {
      try {
        response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
          timeout: 15000
        });
        break;
      } catch (err) {
        attempts++;
        console.warn(`Shopify API fetch failed (attempt ${attempts}/5): ${err.message}`);
        if (attempts >= 5) throw err;
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    const orders = response.data?.orders;
    if (!orders || orders.length === 0) {
      console.log("No more orders returned from Shopify API.");
      break;
    }

    console.log(`Fetched ${orders.length} orders from Shopify. Updating database...`);

    let pageUpdated = 0;
    for (const order of orders) {
      const dbId = recordMap.get(String(order.id));
      if (dbId) {
        await executeWithRetry(async () => {
          await prisma.shopify.update({
            where: { id: dbId },
            data: { sourceName: order.source_name || "web" }
          });
        });
        pageUpdated++;
        totalUpdated++;
      }
    }

    console.log(`Updated ${pageUpdated} DB records from this page. Cumulative total updated: ${totalUpdated}/${shopifyRecords.length}`);

    // Pagination link parsing
    const linkHeader = response.headers['link'];
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<(.*?)>;\s*rel="next"/);
      url = nextMatch ? nextMatch[1] : null;
      if (url) {
        // Sleep 1 second between pages to respect Shopify API rate limits and avoid database load spikes
        await new Promise(r => setTimeout(r, 1000));
      }
    } else {
      url = null;
    }
  }

  console.log(`\n--- BACKFILL COMPLETE. Total records updated: ${totalUpdated} ---`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
