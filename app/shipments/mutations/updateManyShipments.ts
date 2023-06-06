import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateShipments = z.object({
  where: z.object({
    id: z.object({
      in: z.array(z.number()).optional()
    }).optional()
  }),
  shipmentStatusId: z.number().optional()
});

export default resolver.pipe(
  resolver.zod(UpdateShipments),
  resolver.authorize(),
  async ({ where, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shipment = await db.shipment.updateMany({
      where,
      data
    });

    return shipment;
  }
);
