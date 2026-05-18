import db from "db"
import { Queue } from "quirrel/blitz"
import { handler } from "app/orders/functions/fetchAllOrders"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// This job will now run automatically every 15 minutes
export default Queue(
  "api/orderJobs",
  async (uploadId: number | null) => {
    // GLOBAL LOCK: Check if any sync is ALREADY running
    const runningSync = await db.jobs.findFirst({
      where: { isRunning: true, jobTypesId: 2 }
    })

    if (runningSync && runningSync.id !== uploadId) {
      console.log("A Shopify sync is already in progress. Skipping this trigger.")
      return
    }

    const job = uploadId ? await db.jobs.findUnique({ where: { id: uploadId } }) : null
    
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
  },
  {
    repeat: {
      cron: "*/15 * * * *",
    },
  }
)
