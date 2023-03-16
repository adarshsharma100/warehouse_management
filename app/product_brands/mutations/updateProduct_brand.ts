import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateProduct_brand = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateProduct_brand),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_brand = await db.product_brand.update({
      where: { id },
      data,
    });

    return product_brand;
  }
);
