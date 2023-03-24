import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetVendor_productsInput
  extends Pick<Prisma.vendor_productsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetVendor_productsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: vendor_products,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.vendor_products.count({ where }),
      query: (paginateArgs) =>
        db.vendor_products.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {
            products: true,
            vendors: true,
          },
        }),
    })

    console.log("vendor_products: ", vendor_products)
    return {
      vendor_products,
      nextPage,
      hasMore,
      count,
    }
  }
)
