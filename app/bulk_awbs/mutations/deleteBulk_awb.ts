import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteBulk_awb = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteBulk_awb),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const bulk_awb = await db.bulk_awb.deleteMany({ where: { id } });

    return bulk_awb;
  }
);
