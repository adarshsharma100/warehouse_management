const fs = require("fs");
const path = require("path");

// Read .env file manually
try {
  const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = value;
    }
  });
} catch (e) {
  console.error("Failed to read .env file:", e);
}

const { GraphQLClient, gql } = require("graphql-request")
const { PrismaClient } = require("@prisma/client")
const db = new PrismaClient()

const store = process.env.SHOPIFY_STORE_NAME
const endpoint = "https://" + store + ".myshopify.com/admin/api/2023-01/graphql.json"
const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
  },
})

const getOrderQuery = gql`
  query getOrder($id: ID!) {
    order(id: $id) {
      createdAt
    }
  }
`

async function main() {
  console.log("=== FIXING ORDER TIMESTAMPS FROM SHOPIFY ===")
  const localOrders = await db.orders.findMany({
    where: {
      shopifyId: { not: null }
    },
    include: {
      shopify: true
    }
  })

  console.log(`Found ${localOrders.length} locally synced Shopify orders to fix.`)

  for (const order of localOrders) {
    if (!order.shopify?.orderId) continue
    try {
      const data = await graphQLClient.request(getOrderQuery, { id: order.shopify.orderId })
      const originalTime = data?.order?.createdAt

      if (originalTime) {
        await db.orders.update({
          where: { id: order.id },
          data: {
            channelCreatedAt: new Date(originalTime)
          }
        })
        console.log(`Updated Order Local ID: ${order.id} | Shopify ID: ${order.shopify.orderId} -> Shopify Time: ${originalTime}`)
      } else {
        console.warn(`Could not fetch original time from Shopify for Order ID: ${order.shopify.orderId}`)
      }
    } catch (err) {
      console.error(`Error updating Order ID ${order.id}:`, err.message)
    }
  }
  console.log("=== TIMESTAMP RECOVERY COMPLETE ===")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
