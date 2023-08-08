import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetPutaway = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetPutaway),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const putaway = await db.putaway.findFirst(
      {
        where: { id },
        include: {
          putaway_products: {
            include: {
              putaway: true,
              products: true,
              shelves: true,
            }
          }
        }

      });

    if (!putaway) throw new NotFoundError();

    return putaway;
  }
);
