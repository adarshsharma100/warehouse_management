import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateShipment_status = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateShipment_status),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shipment_status = await db.shipment_status.create({ data: input });

    return shipment_status;
  }
);
