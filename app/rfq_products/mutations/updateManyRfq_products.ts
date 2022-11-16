import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateManyRfq_product = z.array(
  z.object({
    rfq_products_id: z.number(),
    products_product_id: z.number(),
    quantity: z.number(),
    price_per_unit: z.number(),
    rfq_id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateManyRfq_product),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_product = await db.rfq_products.updateMany({
      data: input,
      // data: {
      //   price_per_unit: 10,
      // },
      // where: {
      //   rfq_products_id: {
      //     in: [9, 10],
      //   },
      // },
    })

    return rfq_product
  }
)
