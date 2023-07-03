import { resolver } from "@blitzjs/rpc";
import db from "db";
import { DeleteImageSchema } from "../schemas";

export default resolver.pipe(
  resolver.zod(DeleteImageSchema),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const image = await db.image.deleteMany({ where: { id } });

    return image;
  }
);
