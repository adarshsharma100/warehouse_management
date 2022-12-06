import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteRfq = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteRfq),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq = await db.rfq.deleteMany({ where: { id } });

    return rfq;
  }
);
