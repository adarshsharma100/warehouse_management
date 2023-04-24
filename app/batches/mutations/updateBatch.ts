import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateBatch = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateBatch),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const batch = await db.batch.update({ where: { id }, data })

    return batch
  }
)
