import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteCourier = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteCourier),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const courier = await db.courier.deleteMany({ where: { id } });

    return courier;
  }
);
