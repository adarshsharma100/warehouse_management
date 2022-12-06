import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateRfq = z.object({
  rfq_code: z.string(),
  rfq_description: z.string(),
  expected_dod: z.string(),
  rfq_products: z.unknown(),
  rfq_sentto: z.unknown(),
})

export default resolver.pipe(resolver.zod(CreateRfq), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const rfq = await db.rfq.create({ data: input })

  return rfq
})
