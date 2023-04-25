import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetBatchesInput
  extends Pick<Prisma.BatchFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetBatchesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: batches,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.batch.count({ where }),
      query: (paginateArgs) => db.batch.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      batches,
      nextPage,
      hasMore,
      count,
    }
  }
)
