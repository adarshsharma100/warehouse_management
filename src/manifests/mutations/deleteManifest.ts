import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const DeleteManifest = z.object({
  id: z.number(),
});

export default resolver.pipe(
  resolver.zod(DeleteManifest),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const manifest = await db.manifest.deleteMany({ where: { id } });

    return manifest;
  }
);
