import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteAdmin = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(DeleteAdmin), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const admin = await db.admins.deleteMany({ where: { id } })

  return admin
})
