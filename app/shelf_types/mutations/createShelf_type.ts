import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateShelf_type = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateShelf_type),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shelf_type = await db.shelf_type.create({ data: input });

    return shelf_type;
  }
);
