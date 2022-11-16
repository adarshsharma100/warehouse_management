import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreatePurchase_status = z.object({
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreatePurchase_status),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_status = await db.purchase_status.create({ data: input })

    return purchase_status
  }
)
