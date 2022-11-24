import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetVendorsInput
  extends Pick<Prisma.vendorFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetVendorsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: vendors,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.vendor.count({ where }),
      query: (paginateArgs) =>
        db.vendor.findMany({
          ...paginateArgs,
          where,
          orderBy,
          select: {
            vendor: true,
            vendor_city: true,
            vendor_code: true,
            vendor_contact: true,
            vendor_email: true,
            vendor_gstin: true,
            vendor_id: true,
            // vendor_sku: true,
            vendor_products: true,
            address: true,
            credit_period: true,
            lead_time: true,
            vendor_id_helper: true,
          },
        }),
    })

    return {
      vendors,
      nextPage,
      hasMore,
      count,
    }
  }
)
