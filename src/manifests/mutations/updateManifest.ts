import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const UpdateManifest = z.object({
  id: z.number(),
  name: z.string(),
});

export default resolver.pipe(
  resolver.zod(UpdateManifest),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const manifest = await db.manifest.update({ where: { id }, data });

    return manifest;
  }
);
