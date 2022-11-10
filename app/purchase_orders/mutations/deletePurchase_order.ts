import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeletePurchase_order = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeletePurchase_order),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_order.deleteMany({
      where: { id },
    })

    return purchase_order
  }
)
