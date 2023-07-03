import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeletePayment_method = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeletePayment_method),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const payment_method = await db.payment_method.deleteMany({
      where: { id },
    });

    return payment_method;
  }
);
