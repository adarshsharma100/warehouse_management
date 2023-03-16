import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateProduct_category = z.object({
  name: z.string(),
  code:z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateProduct_category),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_category = await db.product_categories.create({ data: input });

    return product_category;
  }
);
