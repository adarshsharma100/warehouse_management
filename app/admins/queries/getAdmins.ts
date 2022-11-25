import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetAdminsInput
  extends Pick<Prisma.adminsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetAdminsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: admins,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.admins.count({ where }),
      query: (paginateArgs) =>
        db.admins.findMany({
          ...paginateArgs,
          where,
          orderBy,
          select: {
            id: true,
            name: true,
            email: true,
          },
        }),
    })

    return {
      admins,
      nextPage,
      hasMore,
      count,
    }
  }
)
