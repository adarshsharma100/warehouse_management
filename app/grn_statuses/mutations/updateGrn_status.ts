import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateGrn_status = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateGrn_status),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const grn_status = await db.grn_status.update({ where: { id }, data });

    return grn_status;
  }
);
