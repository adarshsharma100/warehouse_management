import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

// const UpdateVendor = z.object({
//   vendor_code: z.string().optional(),
//   // vendor_sku: z.string(),
//   vendor_email: z.string().optional(),
//   vendor_city: z.string().optional(),
//   vendor_contact: z.string().optional(),
//   vendor_gstin: z.string().optional(),
//   vendor: z.string().optional(),
//   vendor_id: z.number().optional(),
//   address: z.string().optional(),
//   credit_period: z.string().optional(),
//   lead_time: z.string().optional(),
//   status: z.boolean().optional(),
// })  
const UpdateVendor = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdateVendor),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor = await db.vendors.update({ where: { id }, data })

    return vendor
  }
)
