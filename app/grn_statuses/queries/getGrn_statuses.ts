import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetGrn_statusesInput
  extends Pick<
    Prisma.Grn_statusFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetGrn_statusesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: grn_statuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.grn_status.count({ where }),
      query: (paginateArgs) =>
        db.grn_status.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      grn_statuses,
      nextPage,
      hasMore,
      count,
    };
  }
);
