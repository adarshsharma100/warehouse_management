import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { mail } from "helperFunctions/mail"
import sendEmail from "helperFunctions/rfqMail"

const CreateRfq = z.object({
  rfq_code: z.string(),
  rfq_description: z.string(),
  expected_dod: z.string(),
  rfq_products: z.unknown(),
  rfq_sentto: z.unknown(),
  agreement_terms_id: z.number(),
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
