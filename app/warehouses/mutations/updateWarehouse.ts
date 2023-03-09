import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateWarehouse = z.object({
  id: z.number(),
  name: z.string(),
  description:z.string().optional(),
});

export default resolver.pipe(
  resolver.zod(UpdateWarehouse),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const warehouse = await db.warehouse.update({ where: { id }, data });

    return warehouse;
  }
);
