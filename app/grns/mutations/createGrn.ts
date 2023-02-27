import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateGrn = z.object({
  grn_batch_code: z.string(),
  purchase_order: z.unknown(),
})

export default resolver.pipe(resolver.zod(CreateGrn), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const grn = await db.grn.create({ data: input })

  return grn
})
