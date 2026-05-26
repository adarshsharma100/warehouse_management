const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const targetFile = 'Product-HSN.csv';
const csvPath = path.resolve(__dirname, targetFile);

console.log(`👀 Watching directory for changes to ${targetFile}...`);

let debounceTimeout = null;
let isRunning = false;

function triggerSync() {
  if (isRunning) {
    console.log('⏳ Sync is already in progress. Retrying in 3 seconds...');
    setTimeout(triggerSync, 3000);
    return;
  }
  
  isRunning = true;
  console.log(`🔄 Triggering sync_shopify_to_db.js...`);
  
  exec('node sync_shopify_to_db.js', (err, stdout, stderr) => {
    isRunning = false;
    if (err) {
      console.error(`❌ Sync failed:`, err);
      return;
    }
    console.log(`✅ Sync completed successfully.\n--- Sync Log ---\n${stdout.trim()}\n----------------`);
  });
}

// Watch the root directory for file events
fs.watch(__dirname, (eventType, filename) => {
  if (filename === targetFile || filename === targetFile.toLowerCase() || !filename) {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
      if (fs.existsSync(csvPath)) {
        triggerSync();
      }
    }, 2000); // 2 second debounce to allow file writes/transfers to finish
  }
});
