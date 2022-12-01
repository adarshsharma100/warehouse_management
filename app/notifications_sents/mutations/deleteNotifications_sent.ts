import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteNotifications_sent = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteNotifications_sent),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const notifications_sent = await db.notifications_sent.deleteMany({
      where: { id },
    })

    return notifications_sent
  }
)
