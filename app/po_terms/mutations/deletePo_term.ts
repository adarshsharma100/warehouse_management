import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeletePo_term = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeletePo_term),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const po_term = await db.po_term.deleteMany({ where: { id } });

    return po_term;
  }
);
