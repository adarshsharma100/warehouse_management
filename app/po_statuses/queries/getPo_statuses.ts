import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetPo_statusesInput
  extends Pick<
    Prisma.Po_statusFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPo_statusesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: po_statuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.po_status.count({ where }),
      query: (paginateArgs) =>
        db.po_status.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      po_statuses,
      nextPage,
      hasMore,
      count,
    };
  }
);
