import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetPurchase_order_product = z.object({
  // This accepts type of undefined, but is required at runtime
  pop_id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetPurchase_order_product),
  resolver.authorize(),
  async ({ pop_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order_product = await db.purchase_order_products.findFirst({
      where: { pop_id },
    })

    if (!purchase_order_product) throw new NotFoundError()

    return purchase_order_product
  }
)
