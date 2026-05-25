const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const duplicateIds = [4630, 4554, 4552];
  
  for (const id of duplicateIds) {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        inventory_products: true,
        order_items: true
      }
    });
    
    console.log(`Product ID: ${id} | SKU: ${product?.sku} | Name: "${product?.name}"`);
    console.log(`  -> Inventory Records Count: ${product?.inventory_products?.length || 0}`);
    console.log(`  -> Order Items Count: ${product?.order_items?.length || 0}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
