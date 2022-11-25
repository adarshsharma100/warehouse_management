import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateMutations_function = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateMutations_function),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const mutations_function = await db.mutations_functions.update({
      where: { id },
      data,
    })

    return mutations_function
  }
)
