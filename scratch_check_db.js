const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Count total products
  const productsCount = await prisma.products.count();
  
  // Products that are out of stock (no stock in any inventory shelf, or total quantity = 0)
  const outOfStockProducts = await prisma.products.findMany({
    where: {
      OR: [
        {
          inventory_products: {
            none: {}
          }
        },
        {
          inventory_products: {
            every: {
              quantity: 0
            }
          }
        }
      ]
    },
    select: {
      id: true,
      product_prices: {
        select: {
          sellingPrice: true
        }
      }
    }
  });

  const outOfStockCount = outOfStockProducts.length;
  const outOfStockWithZeroPrice = outOfStockProducts.filter(p => p.product_prices?.sellingPrice === 0).length;
  const outOfStockWithNonZeroPrice = outOfStockProducts.filter(p => p.product_prices && p.product_prices.sellingPrice > 0).length;
  const outOfStockWithNoPriceRecord = outOfStockProducts.filter(p => !p.product_prices).length;

  console.log(`Total Products: ${productsCount}`);
  console.log(`Out-of-Stock Products (Qty = 0 or no inventory record): ${outOfStockCount}`);
  console.log(`  -> With Selling Price = 0: ${outOfStockWithZeroPrice}`);
  console.log(`  -> With Selling Price > 0: ${outOfStockWithNonZeroPrice}`);
  console.log(`  -> With No Price Record: ${outOfStockWithNoPriceRecord}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
