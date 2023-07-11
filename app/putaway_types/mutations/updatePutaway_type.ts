import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdatePutaway_type = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdatePutaway_type),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const putaway_type = await db.putaway_types.update({ where: { id }, data });

    return putaway_type;
  }
);
