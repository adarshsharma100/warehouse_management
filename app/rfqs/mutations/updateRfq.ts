import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateRfq = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdateRfq),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const rfq = await db.rfq.update({ where: { id }, data })

    return rfq
  }
)
