import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateOrder_status = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateOrder_status),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order_status = await db.order_status.update({ where: { id }, data });

    return order_status;
  }
);
