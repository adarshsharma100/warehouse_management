import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetPurchase_order_status = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetPurchase_order_status),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order_status = await db.purchase_order_status.findFirst({
      where: { id },
    })

    if (!purchase_order_status) throw new NotFoundError()

    return purchase_order_status
  }
)
