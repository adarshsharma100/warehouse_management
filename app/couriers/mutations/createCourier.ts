import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateCourier = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateCourier),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const courier = await db.courier.create({ data: input });

    return courier;
  }
);
