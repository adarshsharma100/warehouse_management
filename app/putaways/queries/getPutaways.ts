import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";
import { T } from "@blitzjs/auth/dist/index-c7aa9db2";

interface GetPutawaysInput
  extends Pick<
    Prisma.PutawayFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPutawaysInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: putaways,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.putaway.count({ where }),
      query: (paginateArgs) =>
        db.putaway.findMany({ ...paginateArgs, where, orderBy ,
          include:{
            putaway_products: {
              include:{
                putaway:true,
                products:true,
                shelves:true,
              }
            }
          }
        }),
    });

    return {
      putaways,
      nextPage,
      hasMore,
      count,
    };
  }
);
