import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetMutations_functionsInput
  extends Pick<Prisma.mutations_functionsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetMutations_functionsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: mutations_functions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.mutations_functions.count({ where }),
      query: (paginateArgs) =>
        db.mutations_functions.findMany({
          ...paginateArgs,
          where,
          orderBy,
          select: {
            id: true,
            name: true,
          },
        }),
    })

    return {
      mutations_functions,
      nextPage,
      hasMore,
      count,
    }
  }
)
