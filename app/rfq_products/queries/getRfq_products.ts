import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetRfq_productsInput
  extends Pick<Prisma.rfq_productsFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  // async ({ where, orderBy, skip = 0, take = 100 }: GetRfq_productsInput) => {
  //   // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  //   const {
  //     items: rfq_products,
  //     hasMore,
  //     nextPage,
  //     count,
  //   } = await paginate({
  //     skip,
  //     take,
  //     count: () => db.rfq_products.count({ where }),
  //     query: (paginateArgs) =>
  //       db.rfq_products.findMany({
  //         ...paginateArgs,
  //         where,
  //         orderBy,
  //         select: {
  //           price_per_unit: true,
  //           products: true,
  //           quantity: true,
  //           rfq_products_id: true,
  //           rfq_id: true,
  //           products_product_id: true,
  //         },
  //       }),
  //   })

  //   return {
  //     rfq_products,
  //     nextPage,
  //     hasMore,
  //     count,
  //   }
  // }
  async ({ where, orderBy }: GetRfq_productsInput) => {
    const rfq_products = await db.rfq_products.findMany({
      where,
      orderBy,
      select: {
        price_per_unit: true,
        products: true,
        quantity: true,
        rfq_products_id: true,
        rfq_id: true,
        products_product_id: true,
      },
    })
    return {
      rfq_products,
    }
  }
)
