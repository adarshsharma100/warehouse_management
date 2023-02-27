import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateGrn = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdateGrn),
  resolver.authorize(),
  async ({ grn_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const grn = await db.grn.update({ where: { grn_id }, data })

    return grn
  }
)
