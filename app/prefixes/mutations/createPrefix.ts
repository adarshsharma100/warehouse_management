import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreatePrefix = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreatePrefix),
  // resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const prefix = await db.prefix.create({ data: input });

    return prefix;
  }
);
