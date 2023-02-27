import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetRfq_senttosInput
  extends Pick<
    Prisma.Rfq_senttoFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetRfq_senttosInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: rfq_senttos,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.rfq_sentto.count({ where }),
      query: (paginateArgs) =>
        db.rfq_sentto.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      rfq_senttos,
      nextPage,
      hasMore,
      count,
    };
  }
);
