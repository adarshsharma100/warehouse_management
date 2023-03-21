import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateOrder_item = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateOrder_item),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order_item = await db.order_items.create({ data: input });

    return order_item;
  }
);
