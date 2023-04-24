import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetSales_invoice_detailsInput
  extends Pick<Prisma.Sales_invoice_detailFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSales_invoice_detailsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: sales_invoice_details,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.sales_invoice_detail.count({ where }),
      query: (paginateArgs) =>
        db.sales_invoice_detail.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      sales_invoice_details,
      nextPage,
      hasMore,
      count,
    }
  }
)
