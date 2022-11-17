import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateRfq_product = z.object({
  rfq_products_id: z.number(),
  products_product_id: z.number(),
  quantity: z.number(),
  rfq_id: z.number(),
  price_per_unit: z.number(),
})

export default resolver.pipe(
  resolver.zod(UpdateRfq_product),
  resolver.authorize(),
  async ({ rfq_products_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const update_rfq_product = await db.rfq_products.update({
      where: { rfq_products_id },
      data,
    })

    return update_rfq_product
  }
)
