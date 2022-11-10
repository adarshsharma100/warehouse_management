import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeletePurchase_order_product = z.object({
  pop_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeletePurchase_order_product),
  resolver.authorize(),
  async ({ pop_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order_product = await db.purchase_order_products.deleteMany({
      where: { pop_id },
    })

    return purchase_order_product
  }
)
