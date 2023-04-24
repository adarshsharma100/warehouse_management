import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateDimension = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateDimension),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const dimension = await db.dimension.update({ where: { id }, data });

    return dimension;
  }
);
