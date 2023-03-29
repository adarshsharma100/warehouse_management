import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetJobsInput
  extends Pick<Prisma.JobFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetJobsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: jobs,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.job.count({ where }),
      query: (paginateArgs) => db.job.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      jobs,
      nextPage,
      hasMore,
      count,
    }
  }
)
