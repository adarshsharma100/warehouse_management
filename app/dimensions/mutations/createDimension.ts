import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateDimension = z.object({
  length: z.number(),
  width: z.number(),
  height: z.number(),
  weight: z.number(),
  // shipment: z.object({
  //   connect: {
  //     id: z.number()
  //   }
  // })
  shipment: z.unknown()
});

export default resolver.pipe(
  resolver.zod(CreateDimension),
  resolver.authorize(),
  async (input) => {
    console.log('input123: ', input);
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const dimension = await db.dimensions.create({ data: input });

    return dimension;
  }
);
