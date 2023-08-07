import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreatePutaway_type = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreatePutaway_type),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const putaway_type = await db.putaway_types.create({ data: input });

    return putaway_type;
  }
);
