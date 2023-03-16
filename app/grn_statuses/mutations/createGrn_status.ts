import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateGrn_status = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateGrn_status),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const grn_status = await db.grn_status.create({ data: input });

    return grn_status;
  }
);
