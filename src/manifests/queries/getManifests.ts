import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetManifestsInput
  extends Pick<
    Prisma.ManifestFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetManifestsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: manifests,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.manifest.count({ where }),
      query: (paginateArgs) =>
        db.manifest.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      manifests,
      nextPage,
      hasMore,
      count,
    };
  }
);
