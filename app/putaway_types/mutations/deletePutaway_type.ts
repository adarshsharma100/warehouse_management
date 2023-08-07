import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeletePutaway_type = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeletePutaway_type),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const putaway_type = await db.putaway_types.deleteMany({ where: { id } });

    return putaway_type;
  }
);
