import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetProduct_pricesInput
  extends Pick<
    Prisma.Product_priceFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetProduct_pricesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: product_prices,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.product_prices.count({ where }),
      query: (paginateArgs) =>
        db.product_prices.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      product_prices,
      nextPage,
      hasMore,
      count,
    };
  }
);
