import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import moment from "moment"

const CreatePurchase_order = z.object({
  poNumber: z.unknown(),
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
  rfq: z.unknown(),
  warehouse: z.object({
    connect: z.object({
      id: z.number()
    })
  }).optional()
})

export default resolver.pipe(
  resolver.zod(CreatePurchase_order),
  resolver.authorize(),
  async ({ poNumber, ...input }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_orders.create({
      data: {
        poNumber: poNumber?.trim()?.length > 0 ? poNumber : moment().format("x"),
        ...input,
      },
      include: {
        po_products: true,


      },
    })

    if (!poNumber || !poNumber?.trim()?.length) {
      await db.purchase_orders.update({
        where: {
          id: purchase_order.id,
        },
        data: { poNumber: `PO#${purchase_order.id}` },
      })
    }


    return purchase_order
  }
)
