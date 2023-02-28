import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateProduct_tag = z.object({
  tags: z.string(),
  products: z.unknown(),
})

export default resolver.pipe(
  resolver.zod(CreateProduct_tag),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_tag = await db.product_tags.create({ data: input })

    return product_tag
  }
)
