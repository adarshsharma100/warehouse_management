import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetOrder_itemsInput
  extends Pick<
    Prisma.Order_itemFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetOrder_itemsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: order_items,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.order_items.count({ where }),
      query: (paginateArgs) =>
        db.order_items.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      order_items,
      nextPage,
      hasMore,
      count,
    };
  }
);
