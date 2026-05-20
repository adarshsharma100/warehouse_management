const fs = require("fs");
const path = require("path");

// Read .env file manually
try {
  const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  const dbUrlLine = envContent.split("\n").find(line => line.startsWith("DATABASE_URL="));
  if (dbUrlLine) {
    process.env.DATABASE_URL = dbUrlLine.split("=")[1].trim().replace(/['"]/g, "");
  }
} catch (e) {
  console.error("Failed to read .env file:", e);
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Testing search query inside workspace...");
  try {
    const count = await prisma.inventory_products.count();
    console.log("Total inventory products count:", count);

    const firstItems = await prisma.inventory_products.findMany({
      take: 1,
      include: {
        products: true
      }
    });
    
    if (firstItems.length > 0) {
      const realSku = firstItems[0].products.sku;
      console.log("Found a real SKU to search:", realSku);

      const searchCount = await prisma.inventory_products.count({
        where: {
          products: {
            sku: {
              contains: realSku
            }
          }
        }
      });
      console.log(`Count of items matching real SKU "${realSku}":`, searchCount);
      
      const searchItems = await prisma.inventory_products.findMany({
        where: {
          products: {
            sku: {
              contains: realSku
            }
          }
        },
        include: {
          products: true
        }
      });
      console.log("Found items:", JSON.stringify(searchItems, null, 2));
    } else {
      console.log("No inventory products found to test!");
    }
  } catch (error) {
    console.error("Prisma query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
