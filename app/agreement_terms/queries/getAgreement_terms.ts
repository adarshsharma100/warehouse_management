import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetAgreement_termsInput
  extends Pick<Prisma.Agreement_termFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetAgreement_termsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: agreement_terms,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.agreement_terms.count({ where }),
      query: (paginateArgs) => db.agreement_terms.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      agreement_terms,
      nextPage,
      hasMore,
      count,
    }
  }
)
