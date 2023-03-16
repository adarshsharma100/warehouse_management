import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetProduct_brandsInput
  extends Pick<
    Prisma.Product_brandFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetProduct_brandsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: product_brands,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.product_brand.count({ where }),
      query: (paginateArgs) =>
        db.product_brand.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      product_brands,
      nextPage,
      hasMore,
      count,
    };
  }
);
