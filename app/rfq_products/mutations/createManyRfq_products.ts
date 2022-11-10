import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateManyRfq_product = z.array(
  z.object({
    products_product_id: z.number(),
    quantity: z.number(),
    price_per_unit: z.number(),
    rfq_id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(CreateManyRfq_product),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_product = await db.rfq_products.createMany({ data: input })

    return rfq_product
  }
)
