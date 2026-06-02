import db from "db"
import { Queue } from "quirrel/blitz"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export default Queue("api/process-csv", async (uploadId: number) => {
  const upload = await db.jobs.findUnique({
    where: { id: uploadId },
  })

  await db.jobs.update({
    where: { id: uploadId },
    data: {
      isRunning: true,
    },
  })

  //TODO: switch case functionality to handle processing of pipeline functions with the help of jobType
  console.log("upload.data: ", upload.data)
  await sleep(60000)

  await db.jobs.update({
    where: { id: uploadId },
    data: {
      isRunning: false,
      isCompleted: true,
    },
  })
  await cleanupJobs(1, uploadId)
})

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
