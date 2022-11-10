import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateRfq = z.object({
  expected_dod: z.number(),
  price_per_unit: z.number(),
  quantity: z.number(),
  products_product_id: z.number(),
})

export default resolver.pipe(resolver.zod(CreateRfq), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const rfq = await db.rfq.create({ data: input })

  return rfq
})
