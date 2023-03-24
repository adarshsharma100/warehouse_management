import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetKit_productsInput
  extends Pick<
    Prisma.Kit_productFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetKit_productsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: kit_products,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.kit_products.count({ where }),
      query: (paginateArgs) =>
        db.kit_products.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      kit_products,
      nextPage,
      hasMore,
      count,
    };
  }
);
