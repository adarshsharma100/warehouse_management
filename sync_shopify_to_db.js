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
const papa = require('papaparse');
// Axios instance with higher timeout for large payloads
const api = axios.create({ timeout: 30000 });

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
  // Request only needed fields, include updated_at for incremental logic, now requesting product_type too
  let url = `${baseEndpoint}&fields=id,title,body_html,vendor,variants,image,updated_at,product_type&updated_at_min=${encodeURIComponent(since)}`;
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
          const nextMatch = linkHeader.match(/<(.*?)>;\s*rel="next"/);
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

// Helpers for category extraction
function extractCategoryCodeFromSku(skuStr) {
  if (!skuStr) return null;
  const cleanSku = skuStr.replace(/`/g, '').trim().toUpperCase();
  if (cleanSku.startsWith('TIF')) {
    return cleanSku.substring(3, 5);
  } else if (cleanSku.startsWith('DTIF')) {
    return cleanSku.substring(4, 6);
  }
  return null;
}

function generateCategoryCodeFromName(nameStr, existingSet) {
  const cleanName = nameStr.replace(/[^a-zA-Z]/g, '').toUpperCase();
  let codeStr = cleanName.substring(0, 2);
  if (codeStr.length < 2) {
    codeStr = (codeStr + 'XX').substring(0, 2);
  }

  let indexStr = 1;
  let finalCodeStr = codeStr;
  while (existingSet.has(finalCodeStr)) {
    finalCodeStr = (codeStr + indexStr).substring(0, 10);
    indexStr++;
  }
  return finalCodeStr.trim().toUpperCase();
}

async function sync() {
  console.log('🔄 Starting incremental Shopify sync...');
  const lastSync = loadLastSync();
  console.log(`Loaded last sync timestamp: ${lastSync}`);

  // Read and parse product-HSN.csv if available
  const csvPath = path.resolve(__dirname, 'product-HSN.csv');
  const csvMap = new Map();
  if (fs.existsSync(csvPath)) {
    console.log('Reading and parsing product-HSN.csv...');
    try {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const parsed = papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      for (const row of parsed.data) {
        if (row.SKU) {
          const cleanSku = row.SKU.replace(/`/g, '').trim().toLowerCase();
          csvMap.set(cleanSku, row);
        }
      }
      console.log(`Loaded ${csvMap.size} SKUs from product-HSN.csv.`);
    } catch (csvErr) {
      console.error('Error parsing product-HSN.csv:', csvErr.message);
    }
  } else {
    console.warn('Warning: product-HSN.csv not found in the project root.');
  }

  function matchValue(val) {
    return val ? val.replace(/`/g, '') : '0';
  }

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

    // Optimization: pre-fetch brands, products, categories and product prices into maps
    console.log('Pre-fetching brands, products, categories, and prices from DB...');
    const brandsInDb = await prisma.product_brand.findMany();
    const brandMap = new Map(brandsInDb.map(b => [b.name, b.id]));

    const categoriesInDb = await prisma.product_categories.findMany();
    const categoryMap = new Map();
    const categoryCodes = new Set();
    for (const cat of categoriesInDb) {
      const cleanCode = cat.code.trim().toUpperCase();
      categoryMap.set(cleanCode, cat);
      categoryCodes.add(cleanCode);
    }

    const productsInDb = await prisma.products.findMany({
      select: {
        id: true,
        sku: true,
        hsnCode: true,
        imageUrl: true,
        dimensionsId: true,
        category: true,
        dimensions: {
          select: { length: true, width: true, height: true, weight: true }
        }
      }
    });
    const productMap = new Map(
      productsInDb
        .filter(p => p.sku)
        .map(p => [p.sku.trim().toLowerCase(), p])
    );

    const pricesInDb = await prisma.product_prices.findMany();
    const priceMap = new Map(pricesInDb.map(pr => [pr.productId, pr]));
    console.log(`Loaded ${brandMap.size} brands, ${categoryMap.size} categories, ${productMap.size} products, and ${priceMap.size} prices.`);

    let productsCreated = 0;
    let pricesCreated = 0;
    let pricesUpdated = 0;
    let productsSkipped = 0;

    let syncProgress = 0;
    for (const p of products) {
      syncProgress++;
      if (syncProgress % 50 === 0 || syncProgress === products.length) {
        console.log(`   - Synced ${syncProgress}/${products.length} products...`);
      }

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

      const existingProduct = productMap.get(normalizedSku);
      let productId = existingProduct?.id;
      const truncatedName = p.title?.substring(0, 100) || '';

      const csvMatch = csvMap.get(normalizedSku);
      let hsnCodeVal = null;
      let weightVal = 0, lengthVal = 0, heightVal = 0, widthVal = 0;
      if (csvMatch) {
        hsnCodeVal = csvMatch.ProductTaxCode ? csvMatch.ProductTaxCode.replace(/`/g, '').trim() : null;
        weightVal = csvMatch['Weight(gms)'] ? parseFloat(matchValue(csvMatch['Weight(gms)'])) : 0;
        lengthVal = csvMatch['Length(cms)'] ? parseFloat(matchValue(csvMatch['Length(cms)'])) : 0;
        heightVal = csvMatch['Height(cms)'] ? parseFloat(matchValue(csvMatch['Height(cms)'])) : 0;
        widthVal = csvMatch['Width(cms)'] ? parseFloat(matchValue(csvMatch['Width(cms)'])) : 0;
      }

      // Map Shopify category
      let categoryName = null;
      if (csvMatch && csvMatch.Category) {
        categoryName = csvMatch.Category.replace(/`/g, '').trim();
      } else if (p.product_type) {
        categoryName = p.product_type.trim();
      } else {
        categoryName = 'General';
      }

      let categoryCode = extractCategoryCodeFromSku(sku);
      if (!categoryCode) {
        categoryCode = generateCategoryCodeFromName(categoryName, categoryCodes);
      }
      categoryCode = categoryCode.trim().toUpperCase();

      let categoryId = null;
      if (categoryMap.has(categoryCode)) {
        categoryId = categoryMap.get(categoryCode).id;
      } else {
        const truncatedCatName = categoryName.substring(0, 45).trim();
        const truncatedCatCode = categoryCode.substring(0, 10).trim();
        console.log(`Creating missing category: "${truncatedCatName}" with code "${truncatedCatCode}"`);
        let newCat;
        try {
          newCat = await prisma.product_categories.create({
            data: { name: truncatedCatName, code: truncatedCatCode }
          });
        } catch (createErr) {
          if (createErr.code === 'P2002') {
            console.log(`Category code "${truncatedCatCode}" already exists. Reusing it.`);
            newCat = await prisma.product_categories.findFirst({
              where: { code: truncatedCatCode }
            });
          } else {
            throw createErr;
          }
        }
        if (newCat) {
          categoryId = newCat.id;
          categoryMap.set(truncatedCatCode, newCat);
          categoryCodes.add(truncatedCatCode);
        }
      }

      if (!productId) {
        // Determine dimensions record
        let dimsId = defaultDimensions.id;
        if (weightVal !== 0 || lengthVal !== 0 || heightVal !== 0 || widthVal !== 0) {
          const newDims = await prisma.dimensions.create({
            data: { length: lengthVal, width: widthVal, height: heightVal, weight: weightVal }
          });
          dimsId = newDims.id;
        }

        let localProduct;
        try {
          localProduct = await prisma.products.create({
            data: {
              sku,
              name: truncatedName,
              description: p.body_html || '',
              brand: brandId,
              dimensionsId: dimsId,
              type: defaultProductType.id,
              hsnCode: hsnCodeVal,
              imageUrl: p.image?.src || null,
              category: categoryId,
            },
          });
        } catch (err) {
          if (err.code === 'P2002') {
            console.error(`Unique constraint failed for SKU: "${sku}". Normalized: "${normalizedSku}"`);
            continue;
          }
          throw err;
        }
        productId = localProduct.id;

        productMap.set(normalizedSku, {
          id: productId,
          sku,
          hsnCode: hsnCodeVal,
          imageUrl: p.image?.src || null,
          dimensionsId: dimsId,
          category: categoryId,
          dimensions: (weightVal !== 0 || lengthVal !== 0 || heightVal !== 0 || widthVal !== 0) ? {
            length: lengthVal,
            width: widthVal,
            height: heightVal,
            weight: weightVal
          } : null
        });

        productsCreated++;
      } else {
        // Update existing product if needed
        if (existingProduct) {
          const imageUrlVal = p.image?.src || null;
          const hsnChanged = existingProduct.hsnCode !== hsnCodeVal;
          const imageChanged = existingProduct.imageUrl !== imageUrlVal;
          const categoryChanged = existingProduct.category !== categoryId;
          const dimensionsChanged = !existingProduct.dimensions ||
            existingProduct.dimensions.weight !== weightVal ||
            existingProduct.dimensions.length !== lengthVal ||
            existingProduct.dimensions.height !== heightVal ||
            existingProduct.dimensions.width !== widthVal;

          if (hsnChanged || imageChanged || categoryChanged || dimensionsChanged) {
            const dataToUpdate = {};
            if (hsnChanged) dataToUpdate.hsnCode = hsnCodeVal;
            if (imageChanged) dataToUpdate.imageUrl = imageUrlVal;
            if (categoryChanged) dataToUpdate.category = categoryId;

            if (existingProduct.dimensionsId === defaultDimensions.id) {
              if (weightVal === 0 && lengthVal === 0 && heightVal === 0 && widthVal === 0) {
                await prisma.products.update({
                  where: { id: productId },
                  data: dataToUpdate
                });
              } else {
                const newDims = await prisma.dimensions.create({
                  data: { length: lengthVal, width: widthVal, height: heightVal, weight: weightVal }
                });
                await prisma.products.update({
                  where: { id: productId },
                  data: { ...dataToUpdate, dimensionsId: newDims.id }
                });
                existingProduct.dimensionsId = newDims.id;
                existingProduct.dimensions = { length: lengthVal, width: widthVal, height: heightVal, weight: weightVal };
              }
            } else {
              if (dimensionsChanged) {
                await prisma.dimensions.update({
                  where: { id: existingProduct.dimensionsId },
                  data: { length: lengthVal, width: widthVal, height: heightVal, weight: weightVal }
                });
              }
              await prisma.products.update({
                where: { id: productId },
                data: dataToUpdate
              });
              if (!existingProduct.dimensions) existingProduct.dimensions = {};
              existingProduct.dimensions.length = lengthVal;
              existingProduct.dimensions.width = widthVal;
              existingProduct.dimensions.height = heightVal;
              existingProduct.dimensions.weight = weightVal;
            }
            if (hsnChanged) existingProduct.hsnCode = hsnCodeVal;
            if (imageChanged) existingProduct.imageUrl = imageUrlVal;
            if (categoryChanged) existingProduct.category = categoryId;
          }
        }
        productsSkipped++;
      }

      const firstVariant = p.variants?.[0];
      if (firstVariant) {
        const priceVal = firstVariant.price ? Math.round(parseFloat(firstVariant.price)) : 0;
        const mrpVal = firstVariant.compare_at_price ? Math.round(parseFloat(firstVariant.compare_at_price)) : priceVal;

        const existingPrice = priceMap.get(productId);
        if (!existingPrice) {
          const newPrice = await prisma.product_prices.create({
            data: { productId, sellingPrice: priceVal, mrp: mrpVal }
          });
          priceMap.set(productId, newPrice);
          pricesCreated++;
          console.log(`Created missing price for SKU ${sku} (Price: ${priceVal}, MRP: ${mrpVal})`);
        } else if (existingPrice.sellingPrice !== priceVal || existingPrice.mrp !== mrpVal) {
          const updatedPrice = await prisma.product_prices.update({
            where: { id: existingPrice.id },
            data: { sellingPrice: priceVal, mrp: mrpVal }
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

    // 5. Bulk check and sync local DB products against local CSV to ensure HSN, dimensions and categories are up-to-date
    if (csvMap.size > 0) {
      console.log('🔄 Checking database products against product-HSN.csv for updates...');
      const allDbProducts = await prisma.products.findMany({
        select: {
          id: true,
          sku: true,
          dimensionsId: true,
          hsnCode: true,
          category: true,
          dimensions: { select: { length: true, width: true, height: true, weight: true } }
        }
      });

      let csvMatchedCount = 0;
      let csvUpdatedCount = 0;
      let csvCheckProgress = 0;

      for (const product of allDbProducts) {
        csvCheckProgress++;
        if (csvCheckProgress % 500 === 0 || csvCheckProgress === allDbProducts.length) {
          console.log(`   - Checked ${csvCheckProgress}/${allDbProducts.length} database products against HSN CSV...`);
        }
        if (!product.sku) continue;
        const cleanSku = product.sku.trim().toLowerCase();
        const csvMatch = csvMap.get(cleanSku);
        if (!csvMatch) continue;

        csvMatchedCount++;

        const hsnCodeVal = csvMatch.ProductTaxCode ? csvMatch.ProductTaxCode.replace(/`/g, '').trim() : null;
        const weightVal = csvMatch['Weight(gms)'] ? parseFloat(matchValue(csvMatch['Weight(gms)'])) : 0;
        const lengthVal = csvMatch['Length(cms)'] ? parseFloat(matchValue(csvMatch['Length(cms)'])) : 0;
        const heightVal = csvMatch['Height(cms)'] ? parseFloat(matchValue(csvMatch['Height(cms)'])) : 0;
        const widthVal = csvMatch['Width(cms)'] ? parseFloat(matchValue(csvMatch['Width(cms)'])) : 0;

        // Resolve Category from CSV
        let categoryId = product.category;
        let categoryChanged = false;
        if (csvMatch.Category) {
          const categoryName = csvMatch.Category.replace(/`/g, '').trim();
          let categoryCode = extractCategoryCodeFromSku(product.sku);
          if (!categoryCode) {
            categoryCode = generateCategoryCodeFromName(categoryName, categoryCodes);
          }
          categoryCode = categoryCode.trim().toUpperCase();

          let categoryRecord;
          if (categoryMap.has(categoryCode)) {
            categoryRecord = categoryMap.get(categoryCode);
          } else {
            const truncatedCatName = categoryName.substring(0, 45).trim();
            const truncatedCatCode = categoryCode.substring(0, 10).trim();
            console.log(`Creating missing category (CSV check): "${truncatedCatName}" with code "${truncatedCatCode}"`);
            try {
              categoryRecord = await prisma.product_categories.create({
                data: { name: truncatedCatName, code: truncatedCatCode }
              });
            } catch (createErr) {
              if (createErr.code === 'P2002') {
                console.log(`Category code "${truncatedCatCode}" already exists. Reusing it.`);
                categoryRecord = await prisma.product_categories.findFirst({
                  where: { code: truncatedCatCode }
                });
              } else {
                throw createErr;
              }
            }
            if (categoryRecord) {
              categoryMap.set(truncatedCatCode, categoryRecord);
              categoryCodes.add(truncatedCatCode);
            }
          }

          if (product.category !== categoryRecord.id) {
            categoryId = categoryRecord.id;
            categoryChanged = true;
          }
        }

        const hsnChanged = product.hsnCode !== hsnCodeVal;
        const dimensionsChanged = !product.dimensions ||
          product.dimensions.weight !== weightVal ||
          product.dimensions.length !== lengthVal ||
          product.dimensions.height !== heightVal ||
          product.dimensions.width !== widthVal;

        if (hsnChanged || dimensionsChanged || categoryChanged) {
          const dataToUpdate = {};
          if (hsnChanged) dataToUpdate.hsnCode = hsnCodeVal;
          if (categoryChanged) dataToUpdate.category = categoryId;

          if (product.dimensionsId === defaultDimensions.id) {
            if (weightVal === 0 && lengthVal === 0 && heightVal === 0 && widthVal === 0) {
              await prisma.products.update({ where: { id: product.id }, data: dataToUpdate });
              csvUpdatedCount++;
            } else {
              const newDims = await prisma.dimensions.create({ data: { length: lengthVal, width: widthVal, height: heightVal, weight: weightVal } });
              await prisma.products.update({ where: { id: product.id }, data: { ...dataToUpdate, dimensionsId: newDims.id } });
              csvUpdatedCount++;
            }
          } else {
            if (dimensionsChanged) {
              await prisma.dimensions.update({ where: { id: product.dimensionsId }, data: { length: lengthVal, width: widthVal, height: heightVal, weight: weightVal } });
            }
            await prisma.products.update({ where: { id: product.id }, data: dataToUpdate });
            csvUpdatedCount++;
          }
        }
      }
      console.log(`   - Checked ${allDbProducts.length} products. Matched ${csvMatchedCount}. CSV-updated: ${csvUpdatedCount}.`);
    }

    // Determine the newest updated_at among the fetched products and store it.
    const latestTimestamp = products.reduce((max, p) => {
      const t = p.updated_at || '';
      return t > max ? t : max;
    }, lastSync);
    const ts = latestTimestamp || new Date().toISOString();
    saveLastSync(ts);
    console.log(`Saved last sync timestamp: ${ts}`);

    // Automatically run the merge script after syncing
    try {
      console.log('🔄 Running merge_duplicate_products.js...');
      const { execSync } = require('child_process');
      execSync('node merge_duplicate_products.js', { stdio: 'inherit' });
    } catch (mergeErr) {
      console.error('Error running merge script:', mergeErr.message);
    }
  } catch (err) {
    console.error('Error during sync:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

sync();
