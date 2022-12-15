import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteGrn = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteGrn),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const grn = await db.grn.deleteMany({ where: { id } });

    return grn;
  }
);
