import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteMutation_admin_mail = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteMutation_admin_mail),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const mutation_admin_mail = await db.mutation_admin_mail.deleteMany({
      where: { id },
    })

    return mutation_admin_mail
  }
)
