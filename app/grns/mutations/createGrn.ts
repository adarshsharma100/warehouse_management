import { resolver } from "@blitzjs/rpc"
import db from "db"
import moment from "moment"
import { z } from "zod"

const CreateGrn = z.object({
  grnNumber: z.string(),
  invoiceNo: z.string(),
  invoiceDate: z.date(),
  trackingId: z.string(),
  eta: z.date(),
  createdBy: z.number(),
  status: z.unknown(),
  purchaseOrder: z.unknown(),
  grn_products: z.unknown(),
  // po_products:z.unknown(),
})

export default resolver.pipe(
  resolver.zod(CreateGrn),
  resolver.authorize(),
  async ({ grnNumber, ...input }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant

    const grn = await db.grn.create({
      data: {
        grnNumber: grnNumber.trim() ?? moment().format("x"),
        ...input,
      },
    })

    if (!grnNumber.trim()) {
      await db.grn.update({
        where: { id: grn.id },
        data: {
          grnNumber: `GRN#${grn.id}`,
        },
      })
    }

    return grn
  }
)
