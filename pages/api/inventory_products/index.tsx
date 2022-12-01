import { BlitzAPIHandler, BlitzNextApiResponse } from "@blitzjs/next"
import { PrismaClient } from "@prisma/client"
import { mail } from "../../../helperFunctions/mail"
// import { getSession, useAuthenticatedSession } from "@blitzjs/auth"
// import { useSession } from "@blitzjs/auth"

const prisma = new PrismaClient()

import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import moment from "moment"

// import createAlert from "app/alerts/mutations/createAlert"

// handler.authenticate = true
const handler = async (req, res) => {
  // const session = await getSession(req, res)
  // console.log("session: ", session)
  console.log("body", req.body)
  if (req.method === "POST") {
    const record = req.body

    console.log("body", req.body)
    mail("inventory_products@robocraze.com", record.to, record.subject, record.message)
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ name: "John Doe" }))
  } else {
    // Handle any other HTTP method
  }
}
export default handler
