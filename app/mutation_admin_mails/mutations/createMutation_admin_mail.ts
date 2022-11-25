import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateMutation_admin_mail = z.object({
  admins_id: z.number(),
  mutations_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateMutation_admin_mail),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const mutation_admin_mail = await db.mutation_admin_mail.create({
      data: input,
    })

    return mutation_admin_mail
  }
)
