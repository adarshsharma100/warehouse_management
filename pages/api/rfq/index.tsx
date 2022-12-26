import { BlitzAPIHandler, BlitzNextApiResponse } from "@blitzjs/next"
import { PrismaClient } from "@prisma/client"
import { mail } from "../../../helperFunctions/mail"
import sendEmail from "helperFunctions/rfqMail"
const prisma = new PrismaClient()

import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import moment from "moment"

// import createAlert from "app/alerts/mutations/createAlert"

const handler = async (req, res) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // const [createAlertMutation] = useMutation(createAlert)
  // const CreateAlert = z.object({
  //   name: z.string(),
  //   created_at: z.date(),
  //   description: z.string(),
  //   is_acknowledged: z.string(),
  //   asset_name: z.string(),
  //   priority: z.string(),
  // })
  console.log(res)

  console.log("body", req.body)
  if (req.method === "POST") {
    // try {
    // const values: any = {
    //   // id: 10,
    //   name: "Name this Check",
    //   created_at: "2022-10-04T11:57:00Z",
    //   description: "Check: Name this Check is: crit",
    //   is_acknowledged: "no",
    //   asset_id: 4,
    //   asset_umbrella_id: 8961,
    //   asset_name: "device4",
    //   priority: "crtic",
    // }
    const record = req.body
    // const values: any = {
    //   // id: 11,
    //   to: record.to,
    //   subject: record.subject,
    //   message:record.message
    // name: record._check_name ?? "Test Check",
    // created_at: record._time ?? moment().toISOString(),
    // description: record._message ?? "-",
    //   // is_acknowledged: "no",
    //   // asset_id: record._source_measurement.split(" ")[1] ?? 4,
    //   // asset_umbrella_id: 8961,
    //   // asset_name: record._source_measurement ?? "device4",
    //   // state: record._level ?? "crit",
    //   // incident_value: record.temperature ?? record.current ?? record.rssi ?? record.voltage ?? "-",
    // }
    // const alerts = await prisma.alert.create({
    //   data: values,
    // })
    // const alert = createAlertMutation(values)

    //   console.log("check")
    //   // await router.push(Routes.ShowAssetPage({ assetId: asset.id }))
    // } catch (error: any) {
    //   console.error("error", error)
    //   //
    // }

    console.log("body", req.body)

    await sendEmail(record.data, record.rfq, { creation: true })
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    // res.end(JSON.stringify({ name: "John Doe" }))
  } else {
    // Handle any other HTTP method
  }
}
export default handler
