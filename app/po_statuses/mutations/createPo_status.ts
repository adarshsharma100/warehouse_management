import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreatePo_status = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreatePo_status),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const po_status = await db.po_status.create({ data: input });

    return po_status;
  }
);
