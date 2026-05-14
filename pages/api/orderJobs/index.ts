import db from "db"
import { Queue } from "quirrel/blitz"
import { handler } from "app/orders/functions/fetchAllOrders"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default Queue("api/orderJobs", async (uploadId: number) => {
  const job = await db.jobs.findUnique({ where: { id: uploadId } })
  
  if (job) {
    await db.jobs.update({
      where: { id: uploadId },
      data: { isRunning: true },
    })
  }

  await handler()
  await sleep(2000) // Reduced sleep time

  if (job) {
    await db.jobs.update({
      where: { id: uploadId },
      data: {
        isRunning: false,
        isCompleted: true,
      },
    })
  }
})
