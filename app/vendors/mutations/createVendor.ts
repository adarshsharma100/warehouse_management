import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateVendor = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateVendor),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor = await db.vendor.create({ data: input });

    return vendor;
  }
);
