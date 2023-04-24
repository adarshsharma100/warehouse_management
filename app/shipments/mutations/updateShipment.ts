import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateShipment = z.object({
  id: z.number(),
  shipment_status: z.object({
    connect: z.object({
      id: z.number()
    })
  }).optional()
});

export default resolver.pipe(
  resolver.zod(UpdateShipment),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shipment = await db.shipment.update({
      where: { id }, data
    });

    return shipment;
  }
);
