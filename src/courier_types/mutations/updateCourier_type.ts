import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateCourier_type = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateCourier_type),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const courier_type = await db.courier_type.update({ where: { id }, data });

    return courier_type;
  }
);
