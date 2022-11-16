import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetPurchase_statusesInput
  extends Pick<Prisma.Purchase_statusFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPurchase_statusesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: purchase_statuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.purchase_status.count({ where }),
      query: (paginateArgs) => db.purchase_status.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      purchase_statuses,
      nextPage,
      hasMore,
      count,
    }
  }
)
