import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateRfq_product = z.object({
  rfq_products_id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateRfq_product),
  resolver.authorize(),
  async ({ rfq_products_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_product = await db.rfq_products.update({ where: { rfq_products_id }, data })

    return rfq_product
  }
)
