import nodemailer from "nodemailer"
import aws from "aws-sdk"

// Configure the AWS SDK
aws.config.update({
  accessKeyId: "AKIAX4TJPVL3G7NM7G4W",
  secretAccessKey: "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",
  region: "eu-west-1",
})

// Create a new SES transporter
const transporter = nodemailer.createTransport({
  SES: new aws.SES(),
})

const sendMail = (mailOptions) => {
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    }
    console.log("Message sent: %s", info.messageId)
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  })
}

export const e_mail = async (to, subject, html, data = null) => {
  // Define the email options
  let mailOptions = {
    from: "care@robocraze.com",
    to,
    subject,
    html,
    // attachments: [
    //   {
    //     filename: data[0].filename,
    //     content: data[0].content,
    //   },
    //   {
    //     filename: data[0].filename,
    //     content: data[0].content,
    //   },
    // ],
  }

  if (data === null) {
    sendMail(mailOptions)
  } else {
    const _mailOptions = {
      ...mailOptions,
      attachments: data,
    }
    sendMail(_mailOptions)
  }
}
