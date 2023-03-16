import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateEmail = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateEmail),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const email = await db.email.create({ data: input });

    return email;
  }
);
