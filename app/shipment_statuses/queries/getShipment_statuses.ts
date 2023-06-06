import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetShipment_statusesInput
  extends Pick<
    Prisma.Shipment_statusFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

export default resolver.pipe(
  resolver.authorize(),
  async ({
    where,
    orderBy,
    skip = 0,
    take = 100,
  }: GetShipment_statusesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: shipment_statuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.shipment_status.count({ where }),
      query: (paginateArgs) =>
        db.shipment_status.findMany({ ...paginateArgs, where, orderBy }),
    });

    return {
      shipment_statuses,
      nextPage,
      hasMore,
      count,
    };
  }
);
