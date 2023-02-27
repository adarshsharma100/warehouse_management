import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateRfq_sentto = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateRfq_sentto),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_sentto = await db.rfq_sentto.update({ where: { id }, data });

    return rfq_sentto;
  }
);
