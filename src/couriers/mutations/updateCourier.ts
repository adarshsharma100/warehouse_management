import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateCourier = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateCourier),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const courier = await db.courier.update({ where: { id }, data });

    return courier;
  }
);
