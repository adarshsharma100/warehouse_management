import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdatePayment_method = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdatePayment_method),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const payment_method = await db.payment_method.update({
      where: { id },
      data,
    });

    return payment_method;
  }
);
