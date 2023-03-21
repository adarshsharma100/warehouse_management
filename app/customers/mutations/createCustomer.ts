import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateCustomer = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateCustomer),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const customer = await db.customer.create({ data: input });

    return customer;
  }
);
