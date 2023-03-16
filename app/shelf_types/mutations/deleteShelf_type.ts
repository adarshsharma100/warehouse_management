import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteShelf_type = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteShelf_type),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shelf_type = await db.shelf_type.deleteMany({ where: { id } });

    return shelf_type;
  }
);
