import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateArea = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export default resolver.pipe(
  resolver.zod(UpdateArea),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const area = await db.areas.update({ where: { id }, data });

    return area;
  }
);
