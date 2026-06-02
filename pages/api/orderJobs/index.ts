import db from "db"
import { Queue } from "quirrel/blitz"
import { handler } from "app/orders/functions/fetchAllOrders"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// This job will now run automatically every 5 minutes
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
      await cleanupJobs(2, uploadId)
    }
  },
  {
    repeat: {
      cron: "*/5 * * * *",
    },
  }
)

async function cleanupJobs(jobTypesId: number, currentJobId: number) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    await db.jobs.deleteMany({
      where: {
        jobTypesId,
        isCompleted: false,
        createdAt: { lt: oneHourAgo },
        id: { not: currentJobId }
      }
    })

    const successfulJobs = await db.jobs.findMany({
      where: {
        jobTypesId,
        isCompleted: true
      },
      orderBy: { id: 'desc' }
    })

    const keepIds = new Set<number>()
    const seenDays = new Set<string>()

    if (successfulJobs.length > 0) {
      const latestJob = successfulJobs[0]!
      keepIds.add(latestJob.id)
      
      const latestDateStr = new Date(latestJob.createdAt!).toISOString().split('T')[0]!
      seenDays.add(latestDateStr)

      for (let i = 1; i < successfulJobs.length; i++) {
        const job = successfulJobs[i]!
        const dayStr = new Date(job.createdAt!).toISOString().split('T')[0]!
        if (!seenDays.has(dayStr)) {
          seenDays.add(dayStr)
          keepIds.add(job.id)
        }
      }

      const allIds = successfulJobs.map(j => j.id)
      const deleteIds = allIds.filter(id => !keepIds.has(id))

      if (deleteIds.length > 0) {
        await db.jobs.deleteMany({
          where: {
            id: { in: deleteIds }
          }
        })
        console.log(`[Cleanup] Deleted ${deleteIds.length} redundant job instances of type ${jobTypesId}.`)
      }
    }
  } catch (error) {
    console.error('[Cleanup] Error cleaning up jobs:', error)
  }
}
