// merge_duplicate_products.js
// Safe database script to merge duplicate products into their correct counterparts.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mergeMapping = [
  {
    fromId: 4630,
    fromSku: 'TIFEC0286',
    toId: 219,
    toSku: 'TIFEC0060',
    name: '3.3V Small Piezo Buzzer'
  },
  {
    fromId: 4554,
    fromSku: 'DTIFQC0072',
    toId: 57,
    toSku: 'TIFQC0072',
    name: 'DM002 Mini DIY Drone Kit with Manual'
  },
  {
    fromId: 4552,
    fromSku: 'DTIFQC0073',
    toId: 1680,
    toSku: 'TIFQC0073',
    name: 'DM002HW DIY Drone Kit with WiFi and Camera'
  }
];

async function mergeProduct(mapping) {
  const { fromId, toId, fromSku, toSku, name } = mapping;
  console.log(`\n==================================================`);
  console.log(`Merging "${name}":`);
  console.log(`  From: ID ${fromId} (SKU: ${fromSku})`);
  console.log(`  To:   ID ${toId}   (SKU: ${toSku})`);
  console.log(`==================================================`);

  // 1. Merge inventory_products (respecting unique constraints)
  console.log('Merging inventory_products...');
  const fromInventory = await prisma.inventory_products.findMany({ where: { product: fromId } });
  for (const inv of fromInventory) {
    const toInv = await prisma.inventory_products.findFirst({
      where: { product: toId, shelf: inv.shelf }
    });

    if (toInv) {
      console.log(`  -> Found existing stock on shelf ${inv.shelf}. Merging quantities: ${toInv.quantity} + ${inv.quantity}`);
      // First, update any inventory history references from fromInv.id to toInv.id
      await prisma.inventory_history.updateMany({
        where: { inventoryProduct: inv.id },
        data: { inventoryProduct: toInv.id }
      });
      // Update putaway product references
      await prisma.putaway_products.updateMany({
        where: { inventoryProductId: inv.id },
        data: { inventoryProductId: toInv.id }
      });
      // Update quantity
      await prisma.inventory_products.update({
        where: { id: toInv.id },
        data: { quantity: (toInv.quantity || 0) + (inv.quantity || 0) }
      });
      // Delete the fromInv record
      await prisma.inventory_products.delete({ where: { id: inv.id } });
    } else {
      console.log(`  -> Moving stock on shelf ${inv.shelf} to correct product...`);
      await prisma.inventory_products.update({
        where: { id: inv.id },
        data: { product: toId }
      });
    }
  }

  // 2. Merge order_items
  console.log('Updating order_items references...');
  const orderUpdateRes = await prisma.order_items.updateMany({
    where: { product: fromId },
    data: { product: toId }
  });
  console.log(`  -> Updated ${orderUpdateRes.count} order items.`);

  // 3. Merge vendor_products (respecting unique constraints)
  console.log('Merging vendor_products...');
  const fromVendors = await prisma.vendor_products.findMany({ where: { product: fromId } });
  for (const vp of fromVendors) {
    const toVp = await prisma.vendor_products.findFirst({
      where: {
        product: toId,
        OR: [
          { vendor: vp.vendor },
          { priority: vp.priority }
        ]
      }
    });

    if (toVp) {
      console.log(`  -> Conflict found for vendor ${vp.vendor} / priority ${vp.priority}. Deleting duplicate vendor product.`);
      // Update po_products references if any exist
      await prisma.po_products.updateMany({
        where: { vendorProduct: vp.id },
        data: { vendorProduct: toVp.id }
      });
      await prisma.vendor_products.delete({ where: { id: vp.id } });
    } else {
      console.log(`  -> Moving vendor product reference to correct product...`);
      await prisma.vendor_products.update({
        where: { id: vp.id },
        data: { product: toId }
      });
    }
  }

  // 4. Merge kit_products (where product is a kit component or kit itself)
  console.log('Updating kit_products references...');
  const kitUpdateRes1 = await prisma.kit_products.updateMany({
    where: { productId: fromId },
    data: { productId: toId }
  });
  const kitUpdateRes2 = await prisma.kit_products.updateMany({
    where: { kitProductId: fromId },
    data: { kitProductId: toId }
  });
  console.log(`  -> Updated ${kitUpdateRes1.count + kitUpdateRes2.count} kit product references.`);

  // 5. Merge rfq_products
  console.log('Updating rfq_products...');
  const rfqUpdateRes = await prisma.rfq_products.updateMany({
    where: { product: fromId },
    data: { product: toId }
  });
  console.log(`  -> Updated ${rfqUpdateRes.count} RFQ products.`);

  // 6. Merge quality_ckeck
  console.log('Updating quality_ckeck...');
  const qcUpdateRes = await prisma.quality_ckeck.updateMany({
    where: { products: fromId },
    data: { products: toId }
  });
  console.log(`  -> Updated ${qcUpdateRes.count} quality check references.`);

  // 7. Merge product_tags (respecting unique constraints)
  console.log('Merging product_tags...');
  const fromTags = await prisma.product_tags.findMany({ where: { product: fromId } });
  for (const tag of fromTags) {
    const toTag = await prisma.product_tags.findFirst({
      where: { product: toId, tags: tag.tags }
    });

    if (toTag) {
      await prisma.product_tags.delete({ where: { id: tag.id } });
    } else {
      await prisma.product_tags.update({
        where: { id: tag.id },
        data: { product: toId }
      });
    }
  }

  // 8. Delete duplicate product_prices
  console.log('Deleting duplicate product_prices...');
  await prisma.product_prices.deleteMany({
    where: { productId: fromId }
  });

  // 9. Delete duplicate product
  console.log('Deleting duplicate product record...');
  await prisma.products.delete({
    where: { id: fromId }
  });

  console.log(`✅ Merge complete for "${name}"!`);
}

async function main() {
  console.log('🚀 Starting database merge for duplicates...');
  
  for (const mapping of mergeMapping) {
    await mergeProduct(mapping);
  }
  
  console.log('\n🎉 All duplicate products successfully merged!');
}

main()
  .catch(e => console.error('Error during merge:', e))
  .finally(() => prisma.$disconnect());
