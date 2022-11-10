import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeletePurchase_order = z.object({
  po_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeletePurchase_order),
  resolver.authorize(),
  async ({ po_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_order.deleteMany({
      where: { po_id },
    })

    return purchase_order
  }
)
