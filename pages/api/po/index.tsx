import sendPoEmail from "helperFunctions/poMail"
import { getSession } from "@blitzjs/auth"
import { getAntiCSRFToken } from "@blitzjs/auth"

const PoMailHandler = async (req, res) => {
  const antiCSRFToken = getAntiCSRFToken()

  const session = await getSession(req, res)
  console.log("User ID:", session)
  console.log("auth:", session.$isAuthorized)
  //   console.log(res)
  console.log("body", req.header)

  if (req.method === "POST") {
    const record = req.body

    console.log("body", req.body)

    await sendPoEmail(record.data, record.po)
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ name: "John Doe" }))
  } else {
    // Handle any other HTTP method
  }
}
export default PoMailHandler
