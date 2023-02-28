import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateProduct_tag = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateProduct_tag),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const product_tag = await db.product_tag.update({ where: { id }, data });

    return product_tag;
  }
);
