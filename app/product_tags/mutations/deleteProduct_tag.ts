import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteProduct_tag = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteProduct_tag),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_tag = await db.product_tag.deleteMany({ where: { id } });

    return product_tag;
  }
);
