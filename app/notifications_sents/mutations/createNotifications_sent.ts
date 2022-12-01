import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateNotifications_sent = z.object({
  user_id: z.number(),
  user_name: z.string(),
  user_email: z.string(),
  mutations: z.string(),
  created_at: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateNotifications_sent),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const notifications_sent = await db.notifications_sent.create({
      data: input,
    })

    return notifications_sent
  }
)
