import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetShipment = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetShipment),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shipment = await db.shipment.findFirst({
      where: { id },
      include: {
        sales_invoice_details: true,
        shipment_items: {
          include: {
            order_items: {
              include: {
                products: true
              }
            }
          }
        },
        orders: {
          include: {
            customers: true,
            addresses_orders_billingAddressIdToaddresses: {
              include: {
                contact_number: true
              }
            },
            addresses_orders_shippingAddressIdToaddresses: {
              include: {
                contact_number: true
              }
            },
          }
        }
      }
    });

    if (!shipment) throw new NotFoundError();

    return shipment;
  }
);
