import { resolver } from "@blitzjs/rpc";
import db from "db";
import { CreateImageSchema } from "../schemas";

export default resolver.pipe(
  resolver.zod(CreateImageSchema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const image = await db.images.create({ data: input });

    return image;
  }
);
