import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"
import { handler } from "../functions/fetchAllOrders"

interface GetOrdersInput
  extends Pick<Prisma.ordersFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetOrdersInput) => {
    // await handler()

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
          
          // include:{
          //   order_status:true,
          //   order_items:{
          //     include: {
          //       products:true
          //     }
          //   },
          //   shopify:true,
          //   customer:{
          //     include:{
          //       addresses:{
          //         select:{
          //           contact_number:true,
          //           emails_emails_addressesToaddresses:true
          //         }
          //       }
          //     }
          //   }
          // },

          include: {
            order_items: {
              include: {
                 products: true,
              },

            },
            order_status: true,
            // shopify: true,
            addresses_orders_billingAddressIdToaddresses:true,
            addresses_orders_shippingAddressIdToaddresses:true,
            customers: {
              include: {
                addresses: {
                  select: {
                    contact_number: true,
                    emails_emails_addressesToaddresses: true,

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
    }
  }
)
