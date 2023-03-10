import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteArea = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteArea),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const area = await db.area.deleteMany({ where: { id } });

    return area;
  }
);
