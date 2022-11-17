import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteProduct = z.object({
  product_id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteProduct),
  resolver.authorize(),
  async ({ product_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product = await db.products.deleteMany({ where: { product_id } })

    return product
  }
)
