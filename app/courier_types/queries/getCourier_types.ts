import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetCourier_typesInput
  extends Pick<Prisma.courier_typesFindManyArgs, "where" | "orderBy" | "skip" | "take"> { }

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCourier_typesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: courier_types,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.courier_types.count({ where }),
      query: (paginateArgs) =>
        db.courier_types.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      courier_types,
      nextPage,
      hasMore,
      count,
    };
  }
);
