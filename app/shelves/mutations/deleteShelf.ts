import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteShelf = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteShelf),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shelf = await db.shelfs.deleteMany({ where: { id } });

    return shelf;
  }
);
