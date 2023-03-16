import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetPo_termsInput
  extends Pick<Prisma.po_termsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPo_termsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: po_terms,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.po_terms.count({ where }),
      query: (paginateArgs) => db.po_terms.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      po_terms,
      nextPage,
      hasMore,
      count,
    }
  }
)
