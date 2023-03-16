import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteEmail = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteEmail),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const email = await db.email.deleteMany({ where: { id } });

    return email;
  }
);
