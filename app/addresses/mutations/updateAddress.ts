import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateAddress = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateAddress),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const address = await db.addresses.update({ where: { id }, data });

    return address;
  }
);
