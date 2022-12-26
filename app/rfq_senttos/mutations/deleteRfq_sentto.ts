import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteRfq_sentto = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteRfq_sentto),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_sentto = await db.rfq_sentto.deleteMany({ where: { id } });

    return rfq_sentto;
  }
);
