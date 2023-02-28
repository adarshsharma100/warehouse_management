import { resolver } from "@blitzjs/rpc"
import db from "db"
import { optional, z } from "zod"

const CreateProduct = z.object({
  name: z.string(),
  description: z.string(),
  sku: z.string(),
  product_tags: z.unknown(),
  costPrice: z.number(),
  length: z.unknown().optional(),
  width: z.unknown().optional(),
  height: z.unknown().optional(),
  weight: z.unknown().optional(),
  color: z.unknown().optional(),
  hsnCode: z.unknown().optional(),
  imageUrl: z.unknown().optional(),
  gstTaxTypeCode: z.unknown().optional(),
  taxCalcType: z.unknown().optional(),
  category: z.unknown().optional(),
  brand: z.unknown().optional(),
  product_tags: z.unknown(),
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
