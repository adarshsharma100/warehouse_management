import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

import updateManyShipments from "app/shipments/mutations/updateManyShipments";

const CreateManifest = z.object({
  manifestNumber: z.string(),
  shipment: z.array(z.object({ id: z.number() }))
});

export default resolver.pipe(
  resolver.zod(CreateManifest),
  resolver.authorize(),
  async ({ manifestNumber, shipment }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const manifest = await db.manifest.create({
      data: {
        manifestNumber,
        shipment: {
          connect: shipment
        }
      }
    });

    await db.shipment.updateMany({
      where: {
        id: {
          in: shipment.map(({ id }) => id)
        }
      },
      data: {
        shipmentStatusId: 4
      }
    })

    return manifest;
  }
);
