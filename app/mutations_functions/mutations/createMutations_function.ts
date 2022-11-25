import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateMutations_function = z.object({
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateMutations_function),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const mutations_function = await db.mutations_functions.create({
      data: input,
    })

    return mutations_function
  }
)
