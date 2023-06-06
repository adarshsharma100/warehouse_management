import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteBatch = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(DeleteBatch), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const batch = await db.batch.deleteMany({ where: { id } })

  return batch
})
