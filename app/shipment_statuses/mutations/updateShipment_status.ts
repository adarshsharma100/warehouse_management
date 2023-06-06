import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateShipment_status = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateShipment_status),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shipment_status = await db.shipment_status.update({
      where: { id },
      data,
    });

    return shipment_status;
  }
);
