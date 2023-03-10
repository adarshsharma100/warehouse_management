import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteWarehouse = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteWarehouse),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const warehouse = await db.warehouse.deleteMany({ where: { id } });

    return warehouse;
  }
);
