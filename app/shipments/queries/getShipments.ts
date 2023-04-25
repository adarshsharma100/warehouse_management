import { paginate } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db";

interface GetShipmentsInput
  extends Pick<
    Prisma.ShipmentFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > { }

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetShipmentsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: shipments,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.shipment.count({ where }),
      query: (paginateArgs) =>
        db.shipment.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {

            orders: {
              include: {
                order_items: {
                  include: {
                    products: true
                  }
                },
                addresses_orders_shippingAddressIdToaddresses: true
              }
            },
            shipment_status: true,
            shipment_items: true
            // shipment_items: {
            //  include: {
            //   order_items:true,
            //  }
            // }
          }
        }),
    });

    return {
      shipments,
      nextPage,
      hasMore,
      count,
    };
  }
);
