import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetRfqsInput
  extends Pick<Prisma.RfqFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetRfqsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: rfqs,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.rfq.count({ where }),
      query: (paginateArgs) =>
        db.rfq.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {
            rfq_products: {
              include: {
                products: true,
              },
            },
          },
        }),
    })

    return {
      rfqs,
      nextPage,
      hasMore,
      count,
    }
  }
)
