import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteCourier_type = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteCourier_type),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const courier_type = await db.courier_type.deleteMany({ where: { id } });

    return courier_type;
  }
);
