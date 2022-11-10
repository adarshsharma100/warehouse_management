import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetPurchase_ordersInput
  extends Pick<Prisma.Purchase_orderFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPurchase_ordersInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: purchase_orders,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.purchase_order.count({ where }),
      query: (paginateArgs) => db.purchase_order.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      purchase_orders,
      nextPage,
      hasMore,
      count,
    }
  }
)
