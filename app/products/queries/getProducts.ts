import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetProductsInput
  extends Pick<Prisma.productsFindManyArgs, "where" | "orderBy" | "skip" | "take"> { }

export default resolver.pipe(
  // resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetProductsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: products,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.products.count({ where }),
      query: (paginateArgs) =>
        db.products.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {
            vendor_products: true,
            kit_products_kit_products_productIdToproducts: {
              include: {
                products_kit_products_kitProductIdToproducts: {
                  select: {
                    name: true,
                    id: true,
                    sku: true,

                  }
                }

              }
            },
            dimensions: true,
            product_categories: true,
            product_types: true,
            product_brand: {
              select: {
                id: true,
                name: true,
              },
            },
            product_prices: {
              select: {
                sellingPrice: true,
                averageCostPrice: true,
              }
            },
            inventory_products: {
              select: {
                quantity: true
              }
            },
            // images: {
            //   select: {
            //     imageUrl: true
            //   }
            // }

          },

        }),
    })

    return {
      products,
      nextPage,
      hasMore,
      count,
    }
  }
)
