import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateShipment = z.object({
  shipmentNumber: z.string(),
  ordersId: z.number(),
  onHold:z.boolean().optional(),
  priority:z.string(),
  shipmentStatus:z.number(),
});


export default resolver.pipe(
  resolver.zod(CreateShipment),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shipment = await db.shipment.create({ data: input });

    return shipment;
  }
);
