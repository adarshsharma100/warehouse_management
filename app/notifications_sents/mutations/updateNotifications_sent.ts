import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateNotifications_sent = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateNotifications_sent),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const notifications_sent = await db.notifications_sent.update({
      where: { id },
      data,
    })

    return notifications_sent
  }
)
