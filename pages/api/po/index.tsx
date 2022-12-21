import sendPoEmail from "helperFunctions/poMail"

const poMailHandler = async (req, res) => {
  //   console.log(res)
  //   console.log("body", req.body)

  if (req.method === "POST") {
    const record = req.body

    console.log("body", req.body)

    await sendPoEmail(record.data, record.po)
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    // res.end(JSON.stringify({ name: "John Doe" }))
  } else {
    // Handle any other HTTP method
  }
}
export default poMailHandler
