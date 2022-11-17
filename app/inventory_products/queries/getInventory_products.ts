import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetInventory_productsInput
  extends Pick<Prisma.inventory_productsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetInventory_productsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: inventory_products,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.inventory_products.count({ where }),
      query: (paginateArgs) => db.inventory_products.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      inventory_products,
      nextPage,
      hasMore,
      count,
    }
  }
)
