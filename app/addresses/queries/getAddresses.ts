import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetAddressesInput
  extends Pick<
    Prisma.AddressFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetAddressesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: addresses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.addresses.count({ where }),
      query: (paginateArgs) =>
        db.addresses.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      addresses,
      nextPage,
      hasMore,
      count,
    };
  }
);
