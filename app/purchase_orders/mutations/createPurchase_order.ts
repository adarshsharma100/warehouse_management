import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreatePurchase_order = z.object({
  vendor_vendor_id: z.number(),
  po_code: z.string(),
  po_description: z.string(),
  expiry_date: z.date(),
  expected_delivery: z.date(),
  from_party: z.string(),
  agreement: z.string(),
  rfq_id: z.number().optional(),
  purchase_order_products: z.unknown(),
})

export default resolver.pipe(
  resolver.zod(CreatePurchase_order),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_order.create({ data: input })

    return purchase_order
  }
)
