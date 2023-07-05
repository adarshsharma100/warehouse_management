import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetCustomersInput
  extends Pick<
    Prisma.CustomersFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > { }

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCustomersInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: customers,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.customers.count({ where }),
      query: (paginateArgs) =>
        db.customers.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      customers,
      nextPage,
      hasMore,
      count,
    };
  }
);


