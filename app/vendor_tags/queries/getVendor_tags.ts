import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetVendor_tagsInput
  extends Pick<
    Prisma.Vendor_tagFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetVendor_tagsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: vendor_tags,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.vendor_tag.count({ where }),
      query: (paginateArgs) =>
        db.vendor_tag.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      vendor_tags,
      nextPage,
      hasMore,
      count,
    };
  }
);
