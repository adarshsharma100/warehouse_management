import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateEmail = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateEmail),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const email = await db.email.update({ where: { id }, data });

    return email;
  }
);
