import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateRfq_sentto = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateRfq_sentto),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq_sentto = await db.rfq_sentto.create({ data: input });

    return rfq_sentto;
  }
);
