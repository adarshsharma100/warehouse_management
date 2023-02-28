import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetProduct_categoriesInput
  extends Pick<Prisma.product_categoriesFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({
    where,
    orderBy,
    skip = 0,
    take = 100,
  }: GetProduct_categoriesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: product_categories,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.product_categories.count({ where }),
      query: (paginateArgs) =>
        db.product_categories.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      product_categories,
      nextPage,
      hasMore,
      count,
    };
  }
);
