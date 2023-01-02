import sendEmail from "helperFunctions/rfqMail"
import { getSession } from "@blitzjs/auth"

const handler = async (req, res) => {
  const session = await getSession(req, res)

  // console.log("body", req.body)
  // if (req.method === "POST") {
  //   const record = req.body

  //   console.log("body", req.body)

  //   await sendEmail(record.data, record.rfq, {})
  //   res.statusCode = 200
  //   res.setHeader("Content-Type", "application/json")
  //   // res.end(JSON.stringify({ name: "John Doe" }))
  // } else {
  //   // Handle any other HTTP method
  // }

  if (req.method === "POST") {
    if (session.$isAuthorized()) {
      const record = req.body
      // console.log("body", req.body)
      // console.log("User ID:", session.userId)
      // console.log("User isAuthorized:", session.$isAuthorized())

      await sendEmail(record.data, record.rfq, {})
      res.statusCode = 200
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ name: "Sucess" }))
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
