import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdatePrefix = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdatePrefix),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const prefix = await db.prefix.update({ where: { id }, data });

    return prefix;
  }
);
