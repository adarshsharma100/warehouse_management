import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteInventory_product = z.object({
  inventory_product_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteInventory_product),
  resolver.authorize(),
  async ({ inventory_product_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const inventory_product = await db.inventory_products.deleteMany({
      where: { inventory_product_id },
    })

    return inventory_product
  }
)
