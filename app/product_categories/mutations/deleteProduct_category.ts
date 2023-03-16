import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteProduct_category = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteProduct_category),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_category = await db.product_categories.deleteMany({
      where: { id },
    });

    return product_category;
  }
);
