import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteVendor_shipment = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteVendor_shipment),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_shipment = await db.vendor_shipments.deleteMany({
      where: { id },
    });

    return vendor_shipment;
  }
);
