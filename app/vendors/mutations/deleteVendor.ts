import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteVendor = z.object({
  vendor_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteVendor),
  resolver.authorize(),
  async ({ vendor_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor = await db.vendor.deleteMany({ where: { vendor_id } })

    return vendor
  }
)
