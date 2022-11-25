import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateAdmin = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateAdmin),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const admin = await db.admins.update({ where: { id }, data })

    return admin
  }
)
