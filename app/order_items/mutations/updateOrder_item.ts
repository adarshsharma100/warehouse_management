import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateOrder_item = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateOrder_item),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order_item = await db.order_items.update({ where: { id }, data });

    return order_item;
  }
);
