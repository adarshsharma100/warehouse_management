import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
// import { mail } from "helperFunctions/mail"
import sendPoEmail from "helperFunctions/poMail"

const CreatePurchase_order = z.object({
  poNumber: z.string(),
  piNumber: z.string().optional().nullable(),
  description: z.string().optional(),
  agreement: z.string().optional(),
  expiryDate: z.date(),
  piDate: z.date().optional().nullable(),
  expectedDod: z.date(),
  vendors: z.unknown(),
  po_status: z.unknown(),
  po_terms: z.unknown(),
  po_products: z.unknown(),
  po_sentto: z.unknown(),
  purchase_orders: z.unknown(),
  // rfq: z.number().optional().nullable(),
  rfq_purchase_orders_rfqTorfq: z.unknown(),
  // amendedFrom: z.number().optional().nullable().nullish(),

  // from_party: z.string(),
  // rfq_id: z.number().optional(),
  // agreement_terms_id: z.number(),
  // purchase_order_status_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreatePurchase_order),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    console.log(input)
    const purchase_order = await db.purchase_orders.create({
      data: input,
      include: {
        po_products: true,
      },
    })

    // await sendPoEmail(input, purchase_order)

    return purchase_order
  }
)
