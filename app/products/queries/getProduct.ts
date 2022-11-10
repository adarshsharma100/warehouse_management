import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetProduct = z.object({
  // This accepts type of undefined, but is required at runtime
  product_id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetProduct),
  resolver.authorize(),
  async ({ product_id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product = await db.products.findFirst({ where: { product_id } })

    if (!product) throw new NotFoundError()

    return product
  }
)
