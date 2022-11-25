import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetMutations_function = z.object({
  // This accepts type of undefined, but is required at runtime
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(GetMutations_function),
  resolver.authorize(),
  async ({ name }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const mutations_function = await db.mutations_functions.findFirst({
      where: { name },
    })

    if (!mutations_function) throw new NotFoundError()

    return mutations_function
  }
)
