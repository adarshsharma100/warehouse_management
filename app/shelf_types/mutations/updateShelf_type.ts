import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateShelf_type = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateShelf_type),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shelf_type = await db.shelf_type.update({ where: { id }, data });

    return shelf_type;
  }
);
