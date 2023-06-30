import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteProduct_price = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteProduct_price),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_price = await db.product_prices.deleteMany({ where: { id } });

    return product_price;
  }
);
