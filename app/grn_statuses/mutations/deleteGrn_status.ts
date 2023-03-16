import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteGrn_status = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteGrn_status),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const grn_status = await db.grn_status.deleteMany({ where: { id } });

    return grn_status;
  }
);
