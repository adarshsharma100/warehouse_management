import sendPoEmail from "helperFunctions/poMail"
import { getSession } from "@blitzjs/auth"

const poMailHandler = async (req, res) => {
  const session = await getSession(req, res)

  console.log("session", session)

  if (req.method === "POST") {
    if (session.$isAuthorized()) {
      const record = req.body
      // console.log("body", req.body)
      // console.log("User ID:", session.userId)
      // console.log("User isAuthorized:", session.$isAuthorized())

      await sendPoEmail(record.data, record.po)
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
export default poMailHandler

// import sendPoEmail from "helperFunctions/poMail"

// const poMailHandler = async (req, res) => {
//   if (req.method === "POST") {
//     const record = req.body

//     console.log("body", req.body)

//     await sendPoEmail(record.data, record.po)
//     res.statusCode = 200
//     res.setHeader("Content-Type", "application/json")
//     res.end(JSON.stringify({ name: "John Doe" }))
//   } else {
//     // Handle any other HTTP method
//   }
// }
// export default poMailHandler
