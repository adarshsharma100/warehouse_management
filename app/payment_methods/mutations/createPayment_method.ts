import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreatePayment_method = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreatePayment_method),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const payment_method = await db.payment_method.create({ data: input });

    return payment_method;
  }
);
