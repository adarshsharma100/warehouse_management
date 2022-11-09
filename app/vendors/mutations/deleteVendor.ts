import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteVendor = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteVendor),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const vendor = await db.vendor.deleteMany({ where: { id } });

    return vendor;
  }
);
