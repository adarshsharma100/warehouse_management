import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteProduct_brand = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteProduct_brand),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_brand = await db.product_brand.deleteMany({ where: { id } });

    return product_brand;
  }
);
