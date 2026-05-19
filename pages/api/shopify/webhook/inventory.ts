import { NextApiRequest, NextApiResponse } from "next"
import { GraphQLClient, gql } from "graphql-request"
import db from "db"

const store = process.env.SHOPIFY_STORE_NAME || "robocraze-com"
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || "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"
const endpoint = `https://${store}.myshopify.com/admin/api/2023-10/graphql.json`

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  },
})

const getSkuQuery = gql`
  query getSkuByInventoryItem($id: ID!) {
    inventoryItem(id: $id) {
      variant {
        sku
      }
    }
  }
`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    console.log("--- RECEIVED SHOPIFY INVENTORY WEBHOOK ---")
    const { inventory_item_id, available, location_id } = req.body

    if (!inventory_item_id) {
      console.warn("Invalid webhook body received: missing inventory_item_id")
      return res.status(400).json({ error: "Missing inventory_item_id" })
    }

    console.log(`Inventory Level Update for Item ID: ${inventory_item_id}, Qty: ${available}, Location: ${location_id}`)

    // 1. Fetch variant SKU from Shopify using inventory_item_id
    const gqlItemId = `gid://shopify/InventoryItem/${inventory_item_id}`
    const data = await graphQLClient.request(getSkuQuery, { id: gqlItemId })
    const sku = data?.inventoryItem?.variant?.sku

    if (!sku) {
      console.warn(`No SKU found on Shopify for inventory item ID ${inventory_item_id}`)
      return res.status(404).json({ error: "SKU not found on Shopify" })
    }

    // 2. Find matching local product by SKU
    const localProduct = await db.products.findFirst({
      where: { sku }
    })

    if (!localProduct) {
      console.warn(`SKU ${sku} does not exist in local database. Skipping.`)
      return res.status(200).json({ message: "SKU ignored (not in warehouse DB)", sku })
    }

    // 3. Update quantity on shelf #1 (Available Stock)
    const stockLevel = available || 0
    const inventoryRecord = await db.inventory_products.findFirst({
      where: { product: localProduct.id, shelf: 1 }
    })

    if (inventoryRecord) {
      const oldQty = inventoryRecord.quantity
      await db.inventory_products.update({
        where: { id: inventoryRecord.id },
        data: { quantity: stockLevel }
      })
      console.log(`[Webhook Sync] Updated SKU ${sku}: ${oldQty} -> ${stockLevel}`)
    } else {
      await db.inventory_products.create({
        data: {
          product: localProduct.id,
          shelf: 1,
          quantity: stockLevel,
          description: "Shopify Webhook Sync"
        }
      })
      console.log(`[Webhook Sync] Created new shelf #1 record for SKU ${sku} with quantity ${stockLevel}`)
    }

    return res.status(200).json({ success: true, sku, quantity: stockLevel })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
