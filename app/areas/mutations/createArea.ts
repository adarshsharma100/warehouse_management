import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateArea = z.object({
  name: z.string(),
  warehouse:z.number(),
  description:z.string().optional()
});

export default resolver.pipe(
  resolver.zod(CreateArea),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const area = await db.areas.create({ data: input });

    return area;
  }
);
