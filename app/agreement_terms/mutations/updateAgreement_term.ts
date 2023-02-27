import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateAgreement_term = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateAgreement_term),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const agreement_term = await db.agreement_term.update({
      where: { id },
      data,
    });

    return agreement_term;
  }
);
