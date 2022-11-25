import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateAdmin = z.object({
  name: z.string(),
  email: z.string(),
})

export default resolver.pipe(resolver.zod(CreateAdmin), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const admin = await db.admins.create({ data: input })

  return admin
})
