import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetRfq_sentto = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetRfq_sentto),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_sentto = await db.rfq_sentto.findFirst({ where: { id } });

    if (!rfq_sentto) throw new NotFoundError();

    return rfq_sentto;
  }
);
