import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteVendor_tag = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteVendor_tag),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_tag = await db.vendor_tag.deleteMany({ where: { id } });

    return vendor_tag;
  }
);
