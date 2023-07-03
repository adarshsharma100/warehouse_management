import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetPayment_methodsInput
  extends Pick<
    Prisma.Payment_methodFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPayment_methodsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: payment_methods,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.payment_method.count({ where }),
      query: (paginateArgs) =>
        db.payment_method.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      payment_methods,
      nextPage,
      hasMore,
      count,
    };
  }
);
