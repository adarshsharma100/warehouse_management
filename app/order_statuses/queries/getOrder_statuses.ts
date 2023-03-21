import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetOrder_statusesInput
  extends Pick<
    Prisma.Order_statusFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetOrder_statusesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: order_statuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.order_status.count({ where }),
      query: (paginateArgs) =>
        db.order_status.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      order_statuses,
      nextPage,
      hasMore,
      count,
    };
  }
);
