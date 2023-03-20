import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteKit_product = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteKit_product),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const kit_product = await db.kit_products.deleteMany({ where: { id } });

    return kit_product;
  }
);
