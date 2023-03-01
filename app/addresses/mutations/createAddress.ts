import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateAddress = z.object({
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(CreateAddress),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const address = await db.addresses.create({ data: input });

    return address;
  }
);
