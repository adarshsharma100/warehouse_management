import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdatePo_term = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdatePo_term),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const po_term = await db.po_term.update({ where: { id }, data });

    return po_term;
  }
);
