import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreatePurchase_order_product = z.object({
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreatePurchase_order_product),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order_product = await db.purchase_order_products.create({
      data: input,
    })

    return purchase_order_product
  }
)
