import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { mail } from "helperFunctions/mail"

const CreateRfq = z.object({
  rfq_code: z.string(),
  rfq_description: z.string(),
  expected_dod: z.string(),
  rfq_products: z.unknown(),
  rfq_sentto: z.unknown(),
})

const sendEmail = async (data, rfq) => {
  const products = await db.rfq_products.findMany({ where: { rfq_id: rfq?.id } })
  console.log("products: ", products)
  // await Promise.all(
  //   data?.rfq_sentto?.create.map(({ email }) => {
  //     mail(
  //       "care@robocraze.com",
  //       email,
  //       `RFQ #${rfq?.id}`,
  //       `
  //         test
  //       `
  //     )
  //   })
  // )
}

export default resolver.pipe(resolver.zod(CreateRfq), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const rfq = await db.rfq.create({ data: input })
  console.log("rfq: ", rfq)
  if (input?.rfq_sentto?.create?.length) {
    console.log("input?.rfq_sentto: ", input?.rfq_sentto?.create)
    await sendEmail(input, rfq)
  }

  return rfq
})
