import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetImagesInput
  extends Pick<
    Prisma.ImageFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetImagesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: images,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.image.count({ where }),
      query: (paginateArgs) =>
        db.image.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      images,
      nextPage,
      hasMore,
      count,
    };
  }
);
