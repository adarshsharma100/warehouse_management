import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetShelvesInput
  extends Pick<Prisma.shelfsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetShelvesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: shelves,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.shelves.count({ where }),
      query: (paginateArgs) => db.shelves.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      shelves,
      nextPage,
      hasMore,
      count,
    }
  }
)
