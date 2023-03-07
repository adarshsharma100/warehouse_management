import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreatePo_term = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreatePo_term),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const po_term = await db.po_term.create({ data: input });

    return po_term;
  }
);
