import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeletePo_status = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeletePo_status),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const po_status = await db.po_status.deleteMany({ where: { id } });

    return po_status;
  }
);
