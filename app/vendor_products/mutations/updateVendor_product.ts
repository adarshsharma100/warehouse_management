import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateVendor_product = z.object({
  id: z.number(),
  sku: z.string(),
  priority: z.number(),
  status: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateVendor_product),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_product = await db.vendor_products.update({
      where: { id },
      data,
    })

    return vendor_product
  }
)
