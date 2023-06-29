import { resolver } from "@blitzjs/rpc";
import db from "db";
import { UpdateImageSchema } from "../schemas";

export default resolver.pipe(
  resolver.zod(UpdateImageSchema),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const image = await db.image.update({ where: { id }, data });

    return image;
  }
);
