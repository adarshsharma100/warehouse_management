import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetOrder_payment_status = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetOrder_payment_status),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order_payment_status = await db.order_payment_status.findFirst({
      where: { id },
    });

    if (!order_payment_status) throw new NotFoundError();

    return order_payment_status;
  }
);
