import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateInventory_product = z.object({
  inventory_product_id: z.number(),
  name: z.string(),
  product_description: z.string(),
  price: z.number(),
  quantity: z.number(),
  products_product_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(UpdateInventory_product),
  resolver.authorize(),
  async ({ inventory_product_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const inventory_product = await db.inventory_products.update({
      where: { inventory_product_id },
      data,
    })

    return inventory_product
  }
)
