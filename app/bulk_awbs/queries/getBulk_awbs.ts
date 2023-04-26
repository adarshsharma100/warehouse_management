import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetBulk_awbsInput
  extends Pick<
    Prisma.Bulk_awbFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetBulk_awbsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: bulk_awbs,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.bulk_awb.count({ where }),
      query: (paginateArgs) =>
        db.bulk_awb.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      bulk_awbs,
      nextPage,
      hasMore,
      count,
    };
  }
);
