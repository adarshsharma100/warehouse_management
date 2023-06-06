import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetCouriersInput
  extends Pick<
    Prisma.courierFindManyArgs, "where" | "orderBy" | "skip" | "take"> { }

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCouriersInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: couriers,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.courier.count({ where }),
      query: (paginateArgs) =>
        db.courier.findMany({
          ...paginateArgs, where, orderBy, include: {
            courier_types: true,
            bulk_awb: true
          }
        }),
    });

    return {
      couriers,
      nextPage,
      hasMore,
      count,
    };
  }
);
