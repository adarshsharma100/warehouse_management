import { NotFoundError } from "blitz";
import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const GetKit_product = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
});

export default resolver.pipe(
  resolver.zod(GetKit_product),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const kit_product = await db.kit_products.findFirst({ where: { id } });

    if (!kit_product) throw new NotFoundError();

    return kit_product;
  }
);
