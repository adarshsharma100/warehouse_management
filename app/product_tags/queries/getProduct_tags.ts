import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetProduct_tagsInput
  extends Pick<
    Prisma.Product_tagFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetProduct_tagsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: product_tags,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.product_tag.count({ where }),
      query: (paginateArgs) =>
        db.product_tag.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      product_tags,
      nextPage,
      hasMore,
      count,
    };
  }
);
