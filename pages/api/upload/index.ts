import { getSession } from "@blitzjs/auth"
import { IncomingForm } from "formidable"
import fs from "fs/promises"
import { NextApiRequest, NextApiResponse } from "next"
import path from "path"

export const config = {
  api: {
    bodyParser: false, // disable body-parser to get the raw request body
  },
}

async function saveFile(file) {
  const { originalFilename, filepath } = file
  const filename = `${Date.now()}-${originalFilename}`

  const destination = path.join(process.cwd(), "public", "uploads", filename)

  await fs.copyFile(filepath, destination)
  await fs.unlink(filepath)

  const baseUrl = process.env.BASE_URL || "http://localhost:3000"
  const fileUrl = `${baseUrl}/uploads/${filename}`
  console.log("fileUrl: ", fileUrl)
  return fileUrl
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res)
  if (req.method === "POST") {
    if (session.$isAuthorized()) {
      const form = new IncomingForm()
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error(err)
          res.status(500).end("Server Error")
          return
        }

        console.log("files: ", files)
        const savedFile = await saveFile(files.product_image)
        res.status(200).json({ filename: savedFile })
      })
    } else {
      res.status(404)
    }
  } else {
    // Handle any other HTTP method
    res.status(404)
  }
}
export default handler
