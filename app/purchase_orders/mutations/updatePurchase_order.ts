import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdatePurchase_order = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdatePurchase_order),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_order.update({
      where: { id },
      data,
    })

    return purchase_order
  }
)
