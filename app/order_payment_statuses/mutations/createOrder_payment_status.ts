import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateOrder_payment_status = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateOrder_payment_status),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order_payment_status = await db.order_payment_status.create({
      data: input,
    });

    return order_payment_status;
  }
);
