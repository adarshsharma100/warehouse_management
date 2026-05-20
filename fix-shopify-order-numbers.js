const fs = require("fs");
const path = require("path");

// Read .env file manually before importing Prisma
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const ordersQuery = gql`
  query orders($after: String) {
    orders(first: 250, after: $after, reverse: true) {
      nodes {
        id
        name
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

async function main() {
  console.log("=== STARTING SEQUENTIAL SHOPIFY ORDER NUMBER RESYNC ===")
  let after = null
  let totalProcessed = 0
  let totalUpdated = 0

  while (true) {
    try {
      console.log(`Fetching 250 orders... (Cursor: ${after})`)
      const data = await graphQLClient.request(ordersQuery, { after })
      const nodes = data?.orders?.nodes || []
      
      if (nodes.length === 0) {
        console.log("No more orders returned from Shopify.")
        break
      }

      console.log(`Fetched ${nodes.length} orders from Shopify. Querying local database...`)
      
      const shopifyIds = nodes.map(node => node.id)
      
      // Batch query existing records in DB in a single round-trip
      const localRecords = await db.shopify.findMany({
        where: {
          orderId: { in: shopifyIds }
        }
      })

      // Create a map of orderId to local record
      const recordMap = new Map()
      for (const rec of localRecords) {
        recordMap.set(rec.orderId, rec)
      }

      // Prepare update tasks
      const updateTasks = []
      let batchUpdatesCount = 0
      for (const node of nodes) {
        totalProcessed++
        const shopifyId = node.id
        const orderNumber = node.name ? node.name.replace("#", "") : null
        
        if (orderNumber) {
          const record = recordMap.get(shopifyId)
          if (record) {
            if (record.orderNumber !== orderNumber) {
              updateTasks.push(async () => {
                try {
                  await db.shopify.update({
                    where: { orderId: shopifyId },
                    data: { orderNumber: orderNumber }
                  })
                  totalUpdated++
                  batchUpdatesCount++
                } catch (updateErr) {
                  console.error(`Failed to update order ${shopifyId}:`, updateErr.message)
                }
              })
            }
          }
        }
      }

      // Execute update tasks in parallel chunks of 8 to avoid connection limit issues
      const chunkSize = 8
      for (let i = 0; i < updateTasks.length; i += chunkSize) {
        const chunk = updateTasks.slice(i, i + chunkSize)
        await Promise.all(chunk.map(task => task()))
      }

      console.log(`Batch processed. Updated ${batchUpdatesCount} records. Total processed: ${totalProcessed}, Total updated: ${totalUpdated}`)

      // Stop once we process everything or if we reach a point where no more records are updated and all processed match
      if (totalProcessed > 9000) {
        console.log("Processed all potential records in the DB. Ending early.")
        break
      }

      if (data?.orders?.pageInfo?.hasNextPage) {
        after = data.orders.pageInfo.endCursor
        // Sleep a short time to avoid rate limiting
        await sleep(200)
      } else {
        console.log("Reached end of pages.")
        break
      }
    } catch (err) {
      console.error("Error during batch fetch/update:", err)
      console.log("Sleeping for 5 seconds before retry...")
      await sleep(5000)
    }
  }

  console.log(`=== ORDER NUMBER RESYNC COMPLETE. Total Processed: ${totalProcessed}, Total Updated: ${totalUpdated} ===`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
