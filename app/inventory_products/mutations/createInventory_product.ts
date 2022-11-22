import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateInventory_product = z.object({
  // product_description: z.string(),
  // price: z.number(),
  quantity: z.number(),
  products_product_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateInventory_product),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const inventory_product = await db.inventory_products.create({
      data: input,
    })

    return inventory_product
  }
)
