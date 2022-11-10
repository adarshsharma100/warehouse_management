import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateVendor_product = z.object({
  // vp_id: z.string(),
  unit_price: z.number(),
  vendor_vendor_id: z.number(),
  products_product_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateVendor_product),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_product = await db.vendor_products.create({ data: input })

    return vendor_product
  }
)
