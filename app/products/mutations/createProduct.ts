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

  // length: z.number().optional().nullable(),
  // width: z.number().optional(),
  // height: z.number().optional(),
  // weight: z.number().optional(),
  color: z.string().optional(),
  customDuty: z.string().optional(),
  hsnCode: z.string().optional(),
  imageUrl: z.string().optional(),
  gstTaxTypeCode: z.number().optional(),
  gstTaxTypeCode: z.number().optional(),
  taxCalcType: z.string().optional(),
  brand: z.number().optional(),
  product_categories: z.object({
    connect: z.object({
      id: z.number()
    })
  }),
  product_brand: z.object({
    connect: z.object({
      id: z.number()
    })
  }),
  // costPrice: z.number(),
  product_prices: z.object({
    create: z.object({
      sellingPrice: z.number(),
      averageCostPrice: z.number()
    }),
  }).optional(),
  dimensions: z.object({
    create: z.object({
      width: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional(),
      length: z.number().optional()
    })
  }).optional(),
  product_types: z.object({
    connect: z.object({
      id: z.number()
    })
  }),
  sku: z.string(),
  kit_products_kit_products_productIdToproducts: z.object({
    create: z.array(z.object({
      products_kit_products_kitProductIdToproducts: z.object({
        connect: z.object({
          id: z.number()
        })
      }),
      quantity: z.number()
    }))
  }).optional()

  // category: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateProduct),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product = await db.products.create({

      // data: {
      //   ...input,
      //   kit
      // },
      data: { ...input },
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
