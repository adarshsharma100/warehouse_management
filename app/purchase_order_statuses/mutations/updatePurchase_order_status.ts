import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdatePurchase_order_status = z.object({
  pos_id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdatePurchase_order_status),
  resolver.authorize(),
  async ({ pos_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order_status = await db.purchase_order_status.update({
      where: { pos_id },
      data,
    })

    return purchase_order_status
  }
)
