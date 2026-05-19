import { resolver } from "@blitzjs/rpc"
import db from "db"
import { GraphQLClient, gql } from "graphql-request"

const store = process.env.SHOPIFY_STORE_NAME || "robocraze-com"
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || "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"
const endpoint = `https://${store}.myshopify.com/admin/api/2023-10/graphql.json`

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  },
})

const changedVariantsQuery = gql`
  query productVariants($query: String!, $after: String) {
    productVariants(first: 50, query: $query, after: $after) {
      nodes {
        sku
        inventoryQuantity
        product {
          title
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export default resolver.pipe(
  resolver.authorize(),
  async (_, ctx) => {
    let updatedCount = 0
    let checkedCount = 0

    const syncRecent = async (after = null) => {
      // Look back 48 hours to fetch any recent Shopify stock adjustments
      const lastSyncTime = new Date(Date.now() - 48 * 60 * 60 * 1000)
      const isoString = lastSyncTime.toISOString()
      const query = `updated_at:>='${isoString}'`

      console.log(`Manual UI Sync: Fetching Shopify stock updates since: ${isoString}`)
      const data = await graphQLClient.request(changedVariantsQuery, { query, after })

      if (!data?.productVariants?.nodes?.length) {
        return
      }

      for (const variant of data.productVariants.nodes) {
        if (!variant.sku) continue
        checkedCount++

        // Find local product by SKU
        const localProduct = await db.products.findFirst({
          where: { sku: variant.sku }
        })

        if (!localProduct) {
          continue
        }

        const stockLevel = variant.inventoryQuantity || 0

        // Update local shelf #1 quantity
        const inventoryRecord = await db.inventory_products.findFirst({
          where: { product: localProduct.id, shelf: 1 }
        })

        if (inventoryRecord) {
          if (inventoryRecord.quantity !== stockLevel) {
            await db.inventory_products.update({
              where: { id: inventoryRecord.id },
              data: { quantity: stockLevel }
            })
            updatedCount++
            console.log(`[Manual Sync] Synced quantity for SKU ${variant.sku}: ${inventoryRecord.quantity} -> ${stockLevel}`)
          }
        } else {
          await db.inventory_products.create({
            data: {
              product: localProduct.id,
              shelf: 1,
              quantity: stockLevel,
              description: "Shopify Sync (Manual)"
            }
          })
          updatedCount++
          console.log(`[Manual Sync] Created new shelf #1 record for SKU ${variant.sku} with quantity ${stockLevel}`)
        }
      }

      if (data.productVariants.pageInfo.hasNextPage) {
        await syncRecent(data.productVariants.pageInfo.endCursor)
      }
    }

    await syncRecent()

    return {
      success: true,
      checkedCount,
      updatedCount,
    }
  }
)
