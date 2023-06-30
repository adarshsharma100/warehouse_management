import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"
import { handler } from "../functions/fetchAllOrders"
import fetchOrdersJob from "../functions/fetchOrdersJobCreation"
import { Ctx } from "@blitzjs/next"

interface GetOrdersInput
  extends Pick<Prisma.ordersFindManyArgs, "where" | "orderBy" | "skip" | "take"> { }

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetOrdersInput, ctx: Ctx) => {
    const jobId = await fetchOrdersJob(ctx.session.userId)

    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: orders,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.orders.count({ where }),
      query: (paginateArgs) =>
        db.orders.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {
            order_items: {
              include: {
                products: true,
              },
            },
            order_status: true,
            shopify: true,
            shipment: true,

            addresses_orders_billingAddressIdToaddresses: true,
            addresses_orders_shippingAddressIdToaddresses: true,
            customers: {
              include: {          
                addresses: {
                  include: {
                    contact_number: true,
                    emails_emails_addressesToaddresses: true,
                    country_addresses_countryTocountry:true,
                    // orders_orders_billingAddressIdToaddresses:true,
                    // orders_orders_shippingAddressIdToaddresses:true
                  },
                },
              },
             
            },
          },
        }),
    })

    return {
      orders,
      nextPage,
      hasMore,
      count,
      jobId,
    }
  }
)
