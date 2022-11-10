import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteRfq_product = z.object({
  rfq_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteRfq_product),
  resolver.authorize(),
  async ({ rfq_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_product = await db.rfq_products.deleteMany({ where: { rfq_id } })

    return rfq_product
  }
)
