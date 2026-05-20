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
  try {
    const withGidCount = await prisma.shopify.count({
      where: {
        orderNumber: {
          contains: "gid://"
        }
      }
    });
    const withoutGidCount = await prisma.shopify.count({
      where: {
        NOT: {
          orderNumber: {
            contains: "gid://"
          }
        }
      }
    });
    console.log("Total records with 'gid://':", withGidCount);
    console.log("Total records without 'gid://':", withoutGidCount);

    if (withoutGidCount > 0) {
      const recordsWithoutGid = await prisma.shopify.findMany({
        where: {
          NOT: {
            orderNumber: {
              contains: "gid://"
            }
          }
        },
        take: 10
      });
      console.log("Example records without 'gid://':", JSON.stringify(recordsWithoutGid, null, 2));
    }
  } catch (error) {
    console.error("Prisma query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
