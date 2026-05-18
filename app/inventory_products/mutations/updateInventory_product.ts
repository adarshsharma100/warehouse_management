import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { pushStockToShopify } from "app/shopify/syncToShopify"

const UpdateInventory_product = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdateInventory_product),
  resolver.authorize(),
  async ({ id, ...data }: any) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const inventory_product = await db.inventory_products.update({
      where: { id },
      data,
      include: { products: true } // Include the product so we have the SKU
    })

    // If quantity was updated and we have a valid product SKU, push to Shopify
    if (data.quantity !== undefined && inventory_product.products?.sku) {
      // Calculate total stock across all shelves for this product
      const totalInventory = await db.inventory_products.aggregate({
        where: { product: inventory_product.product },
        _sum: { quantity: true }
      })
      const totalQty = totalInventory._sum.quantity || 0

      // Run this asynchronously so it doesn't block the UI response
      pushStockToShopify(inventory_product.products.sku, totalQty).catch(console.error)
    }

    return inventory_product
  }
)
