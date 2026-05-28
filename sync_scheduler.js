// sync_scheduler.js
// Runs the Shopify products sync and Shopify orders sync every 5 minutes.
const { exec } = require('child_process');

// Keep track of whether a sync is currently running to prevent overlaps
let isRunning = false;

function runSync() {
  if (isRunning) {
    console.log('[Scheduler] A sync is already in progress. Skipping this iteration.');
    return;
  }

  isRunning = true;
  console.log(`\n======================================================`);
  console.log(`[Scheduler] Starting scheduled sync at: ${new Date().toLocaleString()}`);
  console.log(`======================================================`);

  console.log('[Scheduler] Step 1: Running products sync (sync_shopify_to_db.js)...');
  exec('node sync_shopify_to_db.js', (productErr, productStdout, productStderr) => {
    if (productErr) {
      console.error('[Scheduler] Product sync failed:', productErr);
      console.error(productStderr);
    } else {
      console.log('[Scheduler] Product sync completed successfully.');
      console.log(productStdout.trim());
    }

    console.log('[Scheduler] Step 2: Running orders and inventory sync (sync_orders_shopify.js)...');
    exec('node sync_orders_shopify.js', (orderErr, orderStdout, orderStderr) => {
      if (orderErr) {
        console.error('[Scheduler] Order sync failed:', orderErr);
        console.error(orderStderr);
      } else {
        console.log('[Scheduler] Order sync completed successfully.');
        console.log(orderStdout.trim());
      }

      console.log('[Scheduler] Step 3: Running EasyEcom invoice sync (sync_easyecom_invoices.js)...');
      exec('node sync_easyecom_invoices.js', (invoiceErr, invoiceStdout, invoiceStderr) => {
        isRunning = false;
        if (invoiceErr) {
          console.error('[Scheduler] Invoice sync failed:', invoiceErr);
          console.error(invoiceStderr);
        } else {
          console.log('[Scheduler] Invoice sync completed successfully.');
          console.log(invoiceStdout.trim());
        }
        console.log(`======================================================`);
        console.log(`[Scheduler] Scheduled sync iteration complete.`);
        console.log(`======================================================\n`);
      });
    });
  });
}

// Run immediately on start
runSync();

// Schedule to run every 5 minutes (5 * 60 * 1000 ms)
const FIVE_MINUTES = 5 * 60 * 1000;
setInterval(runSync, FIVE_MINUTES);

console.log('⏰ Shopify background sync scheduler started (runs every 5 minutes).');
