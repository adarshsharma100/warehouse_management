import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateBulk_awb = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateBulk_awb),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const bulk_awb = await db.bulk_awb.update({ where: { id }, data });

    return bulk_awb;
  }
);
