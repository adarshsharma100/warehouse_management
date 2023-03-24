import db from "db"
import csvProcessingQueue from "pages/api/process-csv/"

export default async function uploadCsvForProcessing(data: string) {
  const blob = Buffer.from(data, "utf-8")
  console.log("blob: ", blob)
  const record = await db.jobs.create({
    data: {
      data: blob,
      jobTypesId: 1,
    },
  })
  console.log("record: ", record)

  await csvProcessingQueue.enqueue(record.id)

  return record.id
}
