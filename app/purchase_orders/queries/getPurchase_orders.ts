import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetPurchase_ordersInput
  extends Pick<Prisma.purchase_orderFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPurchase_ordersInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: purchase_orders,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.purchase_order.count({ where }),
      query: (paginateArgs) =>
        db.purchase_order.findMany({
          ...paginateArgs,
          where,
          orderBy,
          select: {
            agreement: true,
            approved_on: true,
            created_at: true,
            expected_delivery: true,
            expiry_date: true,
            from_party: true,
            gatepass_order: true,
            gatepass_order_gpo_id: true,
            ordered_qty: true,
            po_id: true,
            po_status: true,
            po_type: true,
            purchase_order_status: true,
            purchase_order_status_pos_id: true,
            received_qty: true,
            rfq: true,
            rfq_id: true,
            total: true,
            updated_on: true,
            vendor: true,
            vendor_vendor_id: true,
          },
        }),
    })

    return {
      purchase_orders,
      nextPage,
      hasMore,
      count,
    }
  }
)
