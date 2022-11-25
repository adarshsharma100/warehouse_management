import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetMutation_admin_mail = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetMutation_admin_mail),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const mutation_admin_mail = await db.mutation_admin_mail.findFirst({
      where: { id },
    })

    if (!mutation_admin_mail) throw new NotFoundError()

    return mutation_admin_mail
  }
)
