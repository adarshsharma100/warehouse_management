import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
// import { mail } from "helperFunctions/mail"
import sendPoEmail from "helperFunctions/poMail"

const CreatePurchase_order = z.object({
  vendor_vendor_id: z.number(),
  po_code: z.string(),
  po_description: z.string(),
  expiry_date: z.date(),
  expected_delivery: z.date(),
  from_party: z.string(),
  agreement: z.string().optional(),
  rfq_id: z.number().optional(),
  purchase_order_products: z.unknown(),
  agreement_terms_id: z.number(),
  purchase_order_status_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreatePurchase_order),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    console.log(input)
    const purchase_order = await db.purchase_order.create({ data: input })

    // await sendPoEmail(input, purchase_order)

    return purchase_order
  }
)
