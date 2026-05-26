import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetProduct = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(GetProduct),
  // resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product = await db.products.findFirst({
      where: { id },
      include: {
        product_categories: true,
        product_brand: true,
        product_types: true,
        product_prices: true,
        dimensions: true,
      },
    })

    if (!product) throw new NotFoundError()

    return product
  }
)
