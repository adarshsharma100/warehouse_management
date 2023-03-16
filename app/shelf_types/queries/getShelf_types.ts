import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetShelf_typesInput
  extends Pick<
    Prisma.Shelf_typeFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetShelf_typesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: shelf_types,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.shelf_type.count({ where }),
      query: (paginateArgs) =>
        db.shelf_type.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      shelf_types,
      nextPage,
      hasMore,
      count,
    };
  }
);
