import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateVendor = z.object({
  vendor_code: z.string(),
  // vendor_sku: z.string(),
  vendor_email: z.string(),
  vendor_city: z.string(),
  vendor_contact: z.string(),
  vendor_gstin: z.string(),
  vendor: z.string(),
  vendor_id: z.number(),
  address: z.string(),
  credit_period: z.string(),
  lead_time: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateVendor),
  resolver.authorize(),
  async ({ vendor_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor = await db.vendor.update({ where: { vendor_id }, data })

    return vendor
  }
)
