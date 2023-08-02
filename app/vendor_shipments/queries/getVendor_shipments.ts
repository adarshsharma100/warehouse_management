import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetVendor_shipmentsInput
  extends Pick<
    Prisma.Vendor_shipmentFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({
    where,
    orderBy,
    skip = 0,
    take = 100,
  }: GetVendor_shipmentsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: vendor_shipments,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.vendor_shipments.count({ where }),
      query: (paginateArgs) =>
        db.vendor_shipments.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      vendor_shipments,
      nextPage,
      hasMore,
      count,
    };
  }
);
