import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetEmailsInput
  extends Pick<Prisma.emailsFindManyArgs, "where" | "orderBy" | "skip" | "take"> { }

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetEmailsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: emails,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.emails.count({ where }),
      query: (paginateArgs) =>
        db.emails.findMany({
          ...paginateArgs,
          where: {
            OR: [
              {
                addresses_emails_addressesToaddresses: {
                  vendor_branches: {
                    some: {
                      vendors: {
                        name: {
                          contains: "Ka"
                        }
                      }
                    }
                  }
                }
              },
              { email: { contains: "Ka" } }
            ]
          },
          orderBy,

        }),
    })

    return {
      emails,
      nextPage,
      hasMore,
      count,
    }
  }
)
