import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateGrn = z.object({
  grnNumber : z.string(),
  invoiceNo:z.string(),
  invoiceDate:z.date(),
  trackingId:z.string(),
  eta:z.date(),
  createdBy:z.number(),
  status:z.unknown(),
  purchaseOrder:z.unknown(),
  createdAt:z.date(),
  updatedAt:z.date(),

})

export default resolver.pipe(resolver.zod(CreateGrn), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const grn = await db.grn.create({ data: input })

  return grn
})
