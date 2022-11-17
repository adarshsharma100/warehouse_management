import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateProduct = z.object({
  product_id: z.number(),
  name: z.string(),
  description: z.string(),
  product_type: z.string(),
  products_sku: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateProduct),
  resolver.authorize(),
  async ({ product_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product = await db.products.update({ where: { product_id }, data })

    return product
  }
)
