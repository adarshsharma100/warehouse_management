import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetPurchase_order = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetPurchase_order),
  resolver.authorize(),
  async ({ po_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_orders.findFirst({
      where: { id },
      include: {
        vendors: true,
        po_products: {
          include: {
            vendor_products: {
              include: {
                products: true,
              },
            },
          },
        },
      },
    })

    if (!purchase_order) throw new NotFoundError()

    return purchase_order
  }
)
