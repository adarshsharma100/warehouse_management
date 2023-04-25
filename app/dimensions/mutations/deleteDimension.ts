import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteDimension = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteDimension),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const dimension = await db.dimension.deleteMany({ where: { id } });

    return dimension;
  }
);
