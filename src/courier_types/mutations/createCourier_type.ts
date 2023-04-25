import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateCourier_type = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateCourier_type),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const courier_type = await db.courier_type.create({ data: input });

    return courier_type;
  }
);
