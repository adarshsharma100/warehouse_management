import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetVendor_shipment = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetVendor_shipment),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_shipment = await db.vendor_shipments.findFirst({
      where: { id },
    });

    if (!vendor_shipment) throw new NotFoundError();

    return vendor_shipment;
  }
);
