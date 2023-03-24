import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import sendEmail from "helperFunctions/rfqMail"
import moment from "moment"

const CreateRfq = z.object({
  rfqNumber: z.string(),
  description: z.string(),
  expectedDod: z.date(),
  rfq_products: z.unknown(),
  rfq_sentto: z.unknown(),
  agreement: z.string(),
  status: z.string(),
  rfq: z.unknown(),
})

export default resolver.pipe(
  resolver.zod(CreateRfq),
  resolver.authorize(),
  async ({ rfqNumber, ...input }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant

    const rfq = await db.rfq.create({
      data: {
        rfqNumber: rfqNumber?.trim()?.length > 0 ? rfqNumber.trim() : moment().format("x"),
        ...input,
      },
      include: {
        rfq_products: true,
        rfq_sentto: {
          select: {
            emails: true,
          },
        },
      },
    })

    if (!rfqNumber || !rfqNumber?.trim()?.length)
      await db.rfq.update({
        where: { id: rfq.id },
        data: {
          rfqNumber: `RFQ#${rfq.id}`,
        },
      })

    if (rfq?.rfq_sentto?.length) {
      const groupedEmails = Object.values(
        rfq.rfq_sentto.reduce((acc, cur) => {
          const address = cur.emails.addresses
          if (!acc[address]) {
            acc[address] = []
          }
          acc[address].push(cur.emails.email)
          return acc
        }, {})
      )
      for (let i = 0; i < groupedEmails.length; i++)
        await sendEmail(null, rfq, { id: rfq.id, creation: true }, groupedEmails[i])
    }
    return rfq
  }
)
