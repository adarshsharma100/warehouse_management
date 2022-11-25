import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteMutations_function = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteMutations_function),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const mutations_function = await db.mutations_functions.deleteMany({
      where: { id },
    })

    return mutations_function
  }
)
