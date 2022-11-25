import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetMutation_admin_mailsInput
  extends Pick<Prisma.mutation_admin_mailFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetMutation_admin_mailsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: mutation_admin_mails,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.mutation_admin_mail.count({ where }),
      query: (paginateArgs) =>
        db.mutation_admin_mail.findMany({
          ...paginateArgs,
          where,
          orderBy,
          select: {
            id: true,
            admins_id: true,
            mutations_id: true,
          },
        }),
    })

    return {
      mutation_admin_mails,
      nextPage,
      hasMore,
      count,
    }
  }
)
