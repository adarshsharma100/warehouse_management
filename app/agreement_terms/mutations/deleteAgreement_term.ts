import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteAgreement_term = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteAgreement_term),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const agreement_term = await db.agreement_term.deleteMany({
      where: { id },
    });

    return agreement_term;
  }
);
