import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateShelf = z.object({
  id: z.number(),
  sellable:z.number().optional(),
  number: z.string().optional(),
  length:z.number().optional(),
  width: z.number().optional(),
  loadingStrength:z.number().optional(),
  reach:z.string().optional(),
  shelfType:z.number().optional(),
  area:z.number().optional(),
});

// const UpdateShelf =z.unknown()

export default resolver.pipe(
  resolver.zod(UpdateShelf),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const shelf = await db.shelfs.update({ where: { id }, data });

    return shelf;
  }
);
