import db from "db"
import ordersFetchQueue from "pages/api/orderJobs/"

export default async function fetchOrdersJob(userId) {
  const existingJob = await db.jobs.findFirst({
    where: {
      isCompleted: false,
      jobTypesId: 2,
    },
  })

  // Existing Job, do not create another
  if (existingJob) return existingJob.id

  console.log("here:")
  const record = await db.jobs.create({
    data: {
      job_types: {
        connect: {
          id: 2,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })

  await ordersFetchQueue.enqueue(record.id)

  return record.id
}
