import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetProductsInput
  extends Pick<Prisma.productsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
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
