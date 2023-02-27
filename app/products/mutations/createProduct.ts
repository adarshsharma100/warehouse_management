import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateProduct = z.object({
  name: z.string(),
  description: z.string(),
  product_type: z.string(),
  products_sku: z.string(),
  product_unit: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateProduct),
  // resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product = await db.products.create({ data: input })

    return product
  }
)
