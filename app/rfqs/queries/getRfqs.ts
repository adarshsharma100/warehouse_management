import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetRfqsInput
  extends Pick<Prisma.rfqFindManyArgs, "where" | "orderBy" | "skip" | "take"> { }

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
      count: () => db.rfq.count({ where }) ?? 1,
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
            rfq_sentto: {
              include: {
                emails: {
                  include: {
                    addresses_emails_addressesToaddresses: {
                      include: {
                        vendor_branches: {
                          include: {
                            vendors: true
                          }
                        }

                      }
                    }
                  }
                },




              },
            },
            rfq: true,
            purchase_orders: {
              include: {
                po_products: {
                  include: {
                    vendor_products: true
                  }
                }
              }
            }

            //   agreement_terms: true,
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
