import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeletePutaway = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeletePutaway),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const putaway = await db.putaway.deleteMany({ where: { id } });

    return putaway;
  }
);
