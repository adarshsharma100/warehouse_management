import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateProduct_brand = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateProduct_brand),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_brand = await db.product_brand.create({ data: input });

    return product_brand;
  }
);
