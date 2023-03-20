import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateKit_product = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateKit_product),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const kit_product = await db.kit_products.update({ where: { id }, data });

    return kit_product;
  }
);
