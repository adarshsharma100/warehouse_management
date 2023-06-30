import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetOrder_payment_statusesInput
  extends Pick<
    Prisma.Order_payment_statusFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({
    where,
    orderBy,
    skip = 0,
    take = 100,
  }: GetOrder_payment_statusesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: order_payment_statuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.order_payment_status.count({ where }),
      query: (paginateArgs) =>
        db.order_payment_status.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      order_payment_statuses,
      nextPage,
      hasMore,
      count,
    };
  }
);
