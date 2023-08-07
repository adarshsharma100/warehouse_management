import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

// const CreatePutaway = z.object({
//   putawayNumber: z.string(),
//   pendingQuantity: z.number(),
//   quantity: z.number(),
//   status: z.string(),
//   grnId: z.number(),
//   createdBy: z.number(),
//   putawayTypeId: z.number(),
//   // user:z.string(),
//   // grn: z.string(),
// });

const CreatePutaway = z.unknown()

export default resolver.pipe(
  // resolver.zod(CreatePutaway),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const putaway = await db.putaway.create({ data: input });

    return putaway;
  }
);
