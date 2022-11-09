import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateVendor = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateVendor),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor = await db.vendor.update({ where: { id }, data });

    return vendor;
  }
);
