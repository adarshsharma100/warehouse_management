import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeletePurchase_order_status = z.object({
  pos_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeletePurchase_order_status),
  resolver.authorize(),
  async ({ pos_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order_status = await db.purchase_order_status.deleteMany({
      where: { pos_id },
    })

    return purchase_order_status
  }
)
