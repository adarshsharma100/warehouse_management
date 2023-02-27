import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetInventory_product = z.object({
  // This accepts type of undefined, but is required at runtime
  inventory_product_id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetInventory_product),
  resolver.authorize(),
  async ({ inventory_product_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const inventory_product = await db.inventory_products.findFirst({
      where: { inventory_product_id },
      include: {
        products: true,
      },
    })

    if (!inventory_product) throw new NotFoundError()

    return inventory_product
  }
)
