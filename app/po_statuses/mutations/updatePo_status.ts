import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdatePo_status = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdatePo_status),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const po_status = await db.po_status.update({ where: { id }, data });

    return po_status;
  }
);
