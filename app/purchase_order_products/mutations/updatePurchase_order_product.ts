import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdatePurchase_order_product = z.object({
  pop_id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdatePurchase_order_product),
  resolver.authorize(),
  async ({ pop_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order_product = await db.purchase_order_products.update({
      where: { pop_id },
      data,
    })

    return purchase_order_product
  }
)
