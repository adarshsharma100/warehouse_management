import sendEmail from "helperFunctions/rfqMail"
import { getSession } from "@blitzjs/auth"

const handler = async (req, res) => {
  const session = await getSession(req, res)

  if (req.method === "POST") {
    if (session.$isAuthorized()) {
      const record = req.body
      await sendEmail(record.rfq, record.emailGroup,)
      res.statusCode = 200
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ name: "Success" }))
    } else {
      // User is not authenticated
      // Return an error or redirect to login page
      res.end(JSON.stringify({ name: "fail" }))
    }
  } else {
    // Handle any other HTTP method
  }
}
export default handler
