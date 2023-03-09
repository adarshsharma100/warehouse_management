import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetGrnsInput
  extends Pick<Prisma.grnFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetGrnsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: grns,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.grn.count({ where }),
      query: (paginateArgs) =>
        db.grn.findMany({
          ...paginateArgs,
          where,
          orderBy,
        }),
    })

    return {
      grns,
      nextPage,
      hasMore,
      count,
    }
  }
)
