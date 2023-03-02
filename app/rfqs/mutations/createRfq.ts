import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { mail } from "helperFunctions/mail"
import sendEmail from "helperFunctions/rfqMail"
import { e_mail } from "helperFunctions/e_mail"

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

export default resolver.pipe(resolver.zod(CreateRfq), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant

  const rfq = await db.rfq.create({ data: input })
  console.log("rfq: ", rfq)
  if (input?.rfq_sentto?.create?.length) {
    await sendEmail(null, rfq, { id: rfq?.id, creation: true })
  }
  return rfq
})
