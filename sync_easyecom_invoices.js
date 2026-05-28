// sync_easyecom_invoices.js
// Periodically checks for new EasyEcom invoices and updates the DB.
// Runs after order sync in the scheduler.

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

const EASYECOM_API_KEY = process.env.EASYECOM_API_KEY;
const EASYECOM_EMAIL = process.env.EASYECOM_EMAIL;
const EASYECOM_PASSWORD = process.env.EASYECOM_PASSWORD;
const EASYECOM_LOCATION_KEY = process.env.EASYECOM_LOCATION_KEY;

function postRequest(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(data.substring(0, 300))); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url.startsWith('http') ? url : `https://api.easyecom.io${url}`);
    const options = { hostname: urlObj.hostname, path: urlObj.pathname + urlObj.search, method: 'GET', headers };
    const req = https.get(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(new Error(data.substring(0, 300))); } });
    });
    req.on('error', reject);
  });
}

async function getEasyEcomToken() {
  const loginData = JSON.stringify({
    email: EASYECOM_EMAIL,
    password: EASYECOM_PASSWORD,
    location_key: EASYECOM_LOCATION_KEY
  });
  const res = await postRequest('https://api.easyecom.io/access/token', loginData);
  if (!res?.data?.token?.jwt_token) throw new Error('EasyEcom login failed: ' + JSON.stringify(res));
  return `Bearer ${res.data.token.jwt_token}`;
}

async function main() {
  console.log('=== EasyEcom Invoice Sync ===');
  
  if (!EASYECOM_API_KEY || !EASYECOM_EMAIL || !EASYECOM_PASSWORD || !EASYECOM_LOCATION_KEY) {
    console.error('[Invoice Sync] Missing EasyEcom credentials in .env. Skipping.');
    process.exit(1);
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const missingInvoices = await prisma.shopify.findMany({
    where: {
      invoiceUrl: null,
      orderNumber: { not: null },
      orders: {
        some: {
          channelCreatedAt: { gte: fourteenDaysAgo }
        }
      }
    },
    select: { id: true, orderNumber: true }
  });

  console.log(`[Invoice Sync] Found ${missingInvoices.length} recent orders missing invoiceUrl in DB.`);

  if (missingInvoices.length === 0) {
    console.log('[Invoice Sync] No recent orders missing invoiceUrl. Done!');
    await prisma.$disconnect();
    return;
  }

  // Build a map for fast lookup: orderNumber -> dbRecord
  const pendingMap = new Map();
  for (const record of missingInvoices) {
    pendingMap.set(record.orderNumber.trim(), record);
  }

  // 1. Log in to EasyEcom
  console.log('[Invoice Sync] Logging into EasyEcom...');
  const token = await getEasyEcomToken();
  console.log('[Invoice Sync] Logged in successfully.');

  // 2. Fetch the first page of EasyEcom orders (the latest 50 orders)
  // This will cover almost all newly processed orders without making many API calls
  console.log('[Invoice Sync] Scanning latest EasyEcom orders page...');
  const latestRes = await getRequest('https://api.easyecom.io/orders/V2/getAllOrders', {
    'x-api-key': EASYECOM_API_KEY,
    'Authorization': token
  });

  let matchedCount = 0;
  const updates = [];

  if (latestRes?.code === 200 && latestRes?.data?.orders?.length) {
    const orders = latestRes.data.orders;
    console.log(`[Invoice Sync] Scanned ${orders.length} orders from EasyEcom latest page.`);

    for (const eOrder of orders) {
      const refCode = (eOrder.reference_code || '').toString().trim();
      const invoiceUrl = eOrder.documents?.easyecom_invoice;

      if (!invoiceUrl || !refCode) continue;

      // Check if this matches one of our pending orders
      let dbRecord = pendingMap.get(refCode);
      if (!dbRecord) {
        // Try prefix/fuzzy matching
        for (const [orderNum, record] of pendingMap.entries()) {
          if (refCode.startsWith(orderNum) || orderNum.startsWith(refCode)) {
            dbRecord = record;
            break;
          }
        }
      }

      if (dbRecord) {
        updates.push({ id: dbRecord.id, invoiceUrl, orderNumber: dbRecord.orderNumber });
        pendingMap.delete(dbRecord.orderNumber.trim());
        matchedCount++;
      }
    }
  }

  // 3. Fallback: If there are still pending orders, query them directly one-by-one
  // (Limit to 10 lookups per sync cycle to avoid rate limits)
  if (pendingMap.size > 0) {
    const fallbackList = Array.from(pendingMap.values()).slice(0, 10);
    console.log(`[Invoice Sync] Fallback: Doing direct API lookup for ${fallbackList.length} remaining orders...`);

    for (const record of fallbackList) {
      const cleanNum = record.orderNumber.trim();
      try {
        const searchUrl = `https://api.easyecom.io/orders/V2/getAllOrders?reference_num=${cleanNum}`;
        const searchRes = await getRequest(searchUrl, {
          'x-api-key': EASYECOM_API_KEY,
          'Authorization': token
        });

        if (searchRes?.code === 200 && searchRes?.data?.orders?.length) {
          const matchedOrder = searchRes.data.orders.find((o) =>
            o.reference_code &&
            (o.reference_code.toString().trim() === cleanNum ||
             o.reference_code.toString().trim().startsWith(cleanNum + '-') ||
             o.reference_code.toString().trim().startsWith(cleanNum))
          );

          if (matchedOrder?.documents?.easyecom_invoice) {
            updates.push({
              id: record.id,
              invoiceUrl: matchedOrder.documents.easyecom_invoice,
              orderNumber: record.orderNumber
            });
            matchedCount++;
          }
        }
      } catch (err) {
        console.error(`[Invoice Sync] Direct lookup failed for order ${cleanNum}: ${err.message}`);
      }
    }
  }

  // 4. Save updates to database
  if (updates.length > 0) {
    console.log(`[Invoice Sync] Saving ${updates.length} new invoice URLs to the database...`);
    for (const update of updates) {
      await prisma.shopify.update({
        where: { id: update.id },
        data: { invoiceUrl: update.invoiceUrl }
      });
      console.log(`  ✔ Saved invoice URL for order ${update.orderNumber}`);
    }
  }

  console.log(`[Invoice Sync] Complete. Updated ${matchedCount} order invoice URLs.`);
  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('[Invoice Sync] Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
