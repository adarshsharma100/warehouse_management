import nodemailer from "nodemailer"
import stringify from "csv-stringify"
import aws from "aws-sdk"

aws.config.update({
  accessKeyId: "AKIAX4TJPVL3G7NM7G4W",
  secretAccessKey: "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",
  region: "eu-west-1",
})

const ses = new aws.SES()

const converter = (data) => {
  if (!data) return null

  const keys = Object.keys(data[0])

  return [
    keys,
    ...data.map((report) => {
      return keys.map((key) => report[key])
    }),
  ]
}

export const mail = (from, to, subject, html, data = null, filename = null, extra = null) => {
  const transporter = nodemailer.createTransport({
    SES: ses,
  })

  let mailOptions = {
    from, // sender address
    to, // list of receivers
    subject, // Subject line,
    // text, // plain text body

    html, // html body
  }
  if (extra) {
    mailOptions = {
      ...mailOptions,
      ...extra,
    }
  }
  if (data === null) {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
      console.log("Message sent: %s", info.messageId)
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))

      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    })
  } else {
    stringify(converter(data), (e, content) => {
      console.log("content: ", content)
      mailOptions = {
        ...mailOptions,
        attachments: [
          {
            filename,
            content,
          },
        ],
      }

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error)
        }
        console.log("Message sent: %s", info.messageId)
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      })
    })
    // setup email data with unicode symbols
  }
}
