import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetRfq_product = z.object({
  // This accepts type of undefined, but is required at runtime
  rfq_products_id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetRfq_product),
  resolver.authorize(),
  async ({ rfq_products_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_product = await db.rfq_products.findFirst({ where: { rfq_products_id } })

    if (!rfq_product) throw new NotFoundError()

    return rfq_product
  }
)
