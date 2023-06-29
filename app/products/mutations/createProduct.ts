import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateProduct = z.object({
  name: z.string().min(3).max(45).transform((str) => str.trim()),
  description: z
    .string()
    .max(100)
    .transform((str) => str.trim())
    .optional(),
  kit_products: z.unknown(),
  length: z.number().optional().nullable(),
  width: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  color: z.string().optional(),
  customDuty: z.string().optional(),
  hsnCode: z.string().optional(),
  imageUrl: z.string().optional(),
  gstTaxTypeCode: z.string().optional(),
  taxCalcType: z.string().optional(),
  brand: z.number().optional(),
  // costPrice: z.number(),
  type: z.number(),
  sku: z.string(),
  category: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateProduct),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product = await db.products.create({
      data: input,
      include: {
        product_categories: true,
        // images: true
      }
    })

    const updatedProduct = await db.products.update({
      where: {
        id: product.id
      }, data: {
        sku: `TIF${product?.product_categories?.code}${product.id}`
      }
    })
    return updatedProduct
  }
)
