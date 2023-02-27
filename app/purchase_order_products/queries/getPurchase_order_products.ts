import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetPurchase_order_productsInput
  extends Pick<Prisma.purchase_order_productsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPurchase_order_productsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: purchase_order_products,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.purchase_order_products.count({ where }),
      query: (paginateArgs) =>
        db.purchase_order_products.findMany({
          ...paginateArgs,
          where,
          orderBy,

          select: {
            pop_id: true,
            price_per_unit: true,
            // purchase_order: true,
            purchase_order_po_id: true,

            purchase_order_vendor_vendor_id: true,
            quantity: true,
            received_quantity: true,
            vendor_products: { select: { products: true } },
            vendor_products_products_product_id: true,
            vendor_products_vendor_vendor_id: true,
            vendor_products_vp_id: true,
          },
        }),
    })

    return {
      purchase_order_products,
      nextPage,
      hasMore,
      count,
    }
  }
)
