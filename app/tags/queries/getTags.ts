import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetTagsInput
  extends Pick<Prisma.tagsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetTagsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: tags,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.tags.count({ where }),
      query: (paginateArgs) => db.tags.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      tags,
      nextPage,
      hasMore,
      count,
    }
  }
)
