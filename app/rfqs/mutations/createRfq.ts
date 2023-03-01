import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { mail } from "helperFunctions/mail"
import sendEmail from "helperFunctions/rfqMail"

const CreateRfq = z.object({
  rfqNumber: z.string(),
  description: z.string(),
  expectedDod: z.date(),
  rfq_products: z.unknown(),
  rfq_sentto: z.unknown(),
  agreement: z.string(),
  status: z.string(),
})

export default resolver.pipe(resolver.zod(CreateRfq), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const rfq = await db.rfq.create({ data: input })
  console.log("rfqdata: ", rfq)
  if (input?.rfq_sentto?.create?.length) {
    // console.log("input?.rfq_sentto: ", input?.rfq_sentto?.create)

    await sendEmail(input, rfq, { creation: true })
  }
  return rfq
})
