import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

// const UpdatePutaway = z.object({
//   id: z.number(),
//   name: z.string(),
// });

const UpdatePutaway = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdatePutaway),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const putaway = await db.putaway.update({ where: { id }, data });

    return putaway;
  }
);
