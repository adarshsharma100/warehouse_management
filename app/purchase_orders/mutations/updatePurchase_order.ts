import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdatePurchase_order = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdatePurchase_order),
  resolver.authorize(),
  async ({ po_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_order.update({
      where: { po_id },
      data,
    })

    return purchase_order
  }
)
