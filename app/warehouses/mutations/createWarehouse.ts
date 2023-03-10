import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateWarehouse = z.object({
  name: z.string(),
  description:z.string().optional()
});

export default resolver.pipe(
  resolver.zod(CreateWarehouse),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const warehouse = await db.warehouse.create({ data: input });

    return warehouse;
  }
);
