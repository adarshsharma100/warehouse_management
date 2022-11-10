import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateVendor_product = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateVendor_product),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_product = await db.vendor_product.update({
      where: { id },
      data,
    })

    return vendor_product
  }
)
