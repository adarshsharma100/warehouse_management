import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetPutaway_typesInput
  extends Pick<
    Prisma.Putaway_typeFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPutaway_typesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: putaway_types,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.putaway_types.count({ where }),
      query: (paginateArgs) =>
        db.putaway_types.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      putaway_types,
      nextPage,
      hasMore,
      count,
    };
  }
);
