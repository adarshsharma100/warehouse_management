import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetVendor_product = z.object({
  // This accepts type of undefined, but is required at runtime
  vp_id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetVendor_product),
  resolver.authorize(),
  async ({ vp_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_product = await db.vendor_products.findFirst({ where: { vp_id } })

    if (!vendor_product) throw new NotFoundError()

    return vendor_product
  }
)
