import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteVendor_product = z.object({
  vp_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteVendor_product),
  resolver.authorize(),
  async ({ vp_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_product = await db.vendor_products.deleteMany({
      where: { vp_id },
    })

    return vendor_product
  }
)
