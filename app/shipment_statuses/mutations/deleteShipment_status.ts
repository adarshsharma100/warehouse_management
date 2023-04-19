import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteShipment_status = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteShipment_status),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shipment_status = await db.shipment_status.deleteMany({
      where: { id },
    });

    return shipment_status;
  }
);
