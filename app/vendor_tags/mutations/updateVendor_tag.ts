import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateVendor_tag = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateVendor_tag),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_tag = await db.vendor_tag.update({ where: { id }, data });

    return vendor_tag;
  }
);
