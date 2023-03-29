import db from "db"
import { Queue } from "quirrel/blitz"
import { handler } from "app/orders/functions/fetchAllOrders"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default Queue("api/orderJobs", async (uploadId: number) => {
  await db.jobs.update({
    where: { id: uploadId },
    data: {
      isRunning: true,
    },
  })

  // TODO: uncomment handler on server
  // await handler()
  await sleep(360000)

  await db.jobs.update({
    where: { id: uploadId },
    data: {
      isRunning: false,
      isCompleted: true,
    },
  })
})
