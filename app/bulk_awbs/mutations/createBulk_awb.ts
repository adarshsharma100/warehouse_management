import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateBulk_awb = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateBulk_awb),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const bulk_awb = await db.bulk_awb.create({ data: input });

    return bulk_awb;
  }
);
