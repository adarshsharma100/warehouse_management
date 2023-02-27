import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateVendor_tag = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateVendor_tag),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor_tag = await db.vendor_tag.create({ data: input });

    return vendor_tag;
  }
);
