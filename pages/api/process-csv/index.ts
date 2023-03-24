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
})
