import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateVendor_shipment = z.object({
  trackingId: z.string().optional(),
  shipmentId: z.string().optional(),
  courier: z.string().optional(),
  purchase_orders: z.object({
    connect: z.object({
      id: z.number().optional(),
    })
  })
});

export default resolver.pipe(
  resolver.zod(CreateVendor_shipment),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_shipment = await db.vendor_shipments.create({ data: input });

    return vendor_shipment;
  }
);
