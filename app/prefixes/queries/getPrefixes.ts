import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetPrefixesInput
  extends Pick<
    Prisma.PrefixFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPrefixesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: prefixes,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.prefix.count({ where }),
      query: (paginateArgs) =>
        db.prefix.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      prefixes,
      nextPage,
      hasMore,
      count,
    };
  }
);
