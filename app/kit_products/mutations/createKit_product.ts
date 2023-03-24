import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateKit_product = z.object({
  quantity:z.number(),
  kitProductID:z.number(),
  // productsId:z.number()
});

export default resolver.pipe(
  resolver.zod(CreateKit_product),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const kit_product = await db.kit_products.create({ data: input });

    return kit_product;
  }
);
