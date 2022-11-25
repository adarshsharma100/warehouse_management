import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateMutation_admin_mail = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateMutation_admin_mail),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const mutation_admin_mail = await db.mutation_admin_mail.update({
      where: { id },
      data,
    })

    return mutation_admin_mail
  }
)
