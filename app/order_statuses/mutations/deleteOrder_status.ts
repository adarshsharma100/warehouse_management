import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteOrder_status = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteOrder_status),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order_status = await db.order_status.deleteMany({ where: { id } });

    return order_status;
  }
);
