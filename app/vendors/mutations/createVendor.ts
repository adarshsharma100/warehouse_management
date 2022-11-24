import { resolver } from "@blitzjs/rpc"
// import updateVendor from "app/vendors/mutations/updateVendor"
import db from "db"
import { z } from "zod"
// const [updateVendorMutation] = useMutation(updateVendor)

const CreateVendor = z.object({
  vendor_code: z.string(),
  vendor_email: z.string(),
  vendor_city: z.string(),
  vendor_contact: z.string(),
  vendor_gstin: z.string(),
  vendor: z.string(),
  address: z.string(),
  credit_period: z.string(),
  lead_time: z.string(),
})

export default resolver.pipe(resolver.zod(CreateVendor), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const vendor = await db.vendor.create({ data: input })
  return await db.vendor.update({
    where: { vendor_id: vendor.vendor_id },
    data: {
      vendor_id_helper: `TIF_VENDOR_${vendor.vendor_id}`,
    },
  })
})
