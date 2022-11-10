import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetPurchase_order_statusesInput
  extends Pick<Prisma.purchase_order_statusFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPurchase_order_statusesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: purchase_order_statuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.purchase_order_status.count({ where }),
      query: (paginateArgs) =>
        db.purchase_order_status.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      purchase_order_statuses,
      nextPage,
      hasMore,
      count,
    }
  }
)
