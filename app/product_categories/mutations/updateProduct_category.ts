import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateProduct_category = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateProduct_category),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_category = await db.product_category.update({
      where: { id },
      data,
    });

    return product_category;
  }
);
