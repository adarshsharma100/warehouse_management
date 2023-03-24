import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

// const UpdateOrder = z.object({
//   id: z.number(),
//   name: z.string().optional(),
//   orderStatus: z.number().optional(),
// })
const UpdateOrder = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdateOrder),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order = await db.orders.update({ where: { id }, data })

    return order
  }
)
