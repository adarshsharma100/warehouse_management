import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteOrder_item = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteOrder_item),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order_item = await db.order_items.deleteMany({ where: { id } });

    return order_item;
  }
);
