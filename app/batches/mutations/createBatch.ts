import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateBatch = z.object({
  batchNumber: z.string(),
  shipment: z.object({
    connect: z.array(z.object({
      id: z.number()
    }))
  })
})

export default resolver.pipe(resolver.zod(CreateBatch), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const batch = await db.batch.create({ data: input })

  return batch
})
