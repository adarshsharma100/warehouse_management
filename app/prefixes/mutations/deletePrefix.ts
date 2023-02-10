import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeletePrefix = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeletePrefix),
  // resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const prefix = await db.prefix.deleteMany({ where: { id } })

    return prefix
  }
)
