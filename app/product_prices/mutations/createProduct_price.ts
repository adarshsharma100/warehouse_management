import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateProduct_price = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateProduct_price),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_price = await db.product_prices.create({ data: input });

    return product_price;
  }
);
