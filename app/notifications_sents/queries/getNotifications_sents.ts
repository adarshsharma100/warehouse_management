import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetNotifications_sentsInput
  extends Pick<Prisma.Notifications_sentFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetNotifications_sentsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: notifications_sents,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.notifications_sent.count({ where }),
      query: (paginateArgs) => db.notifications_sent.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      notifications_sents,
      nextPage,
      hasMore,
      count,
    }
  }
)
