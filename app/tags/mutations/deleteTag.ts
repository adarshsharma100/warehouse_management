import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteTag = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteTag),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const tag = await db.tags.deleteMany({ where: { id } });

    return tag;
  }
);
