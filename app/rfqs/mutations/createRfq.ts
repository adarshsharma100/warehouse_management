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
})

// export const sendEmail = async (data, rfq) => {
//   const products = await db.rfq_products.findMany({
//     where: { rfq_id: rfq?.id },
//     include: { products: true },
//   })

//   await Promise.all(
//     data?.rfq_sentto?.create.map(({ email }) => {
//       mail(
//         "care@robocraze.com",
//         email,
//         `${rfq.rfq_code}`,
//         `
//         <section>
//         <div>

//             <h2>RFQ Details:</h2>
//             <p><strong>Doc No.:</strong>${rfq.rfq_code}</p>
//             <p><strong>Description:</strong> ${rfq.rfq_description}</p>
//             <p><strong>Created on:</strong> ${new Date(rfq.createdAt).toLocaleDateString()}</p>
//             <p><strong>Expected Delivery:</strong> ${new Date(
//               rfq.expected_dod
//             ).toLocaleDateString()}</p>
//             <hr />
//         </div>
//         <div>
//             <h2>Products:</h2>
//             <table style="border-collapse: collapse">
//                 <thead style="background-color:black ;color:white">
//                     <tr style="border: 1px solid">
//                         <td style="border: 1px solid; padding:10px">Sl No.</td>
//                         <td style="border: 1px solid; padding:10px">Name</td>
//                         <td style="border: 1px solid; padding:10px">Description</td>
//                         <td style="border: 1px solid; padding:10px">Quantity</td>
//                         <td style="border: 1px solid; padding:10px">Unit Price</td>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${products
//                       .map(
//                         ({ quantity, price_per_unit, products: { name, description } }, i) =>
//                           `<tr style="border: 1px solid">
//                         <td style="border: 1px solid;text-align: center; padding:10px">${i + 1}</td>
//                         <td style="border: 1px solid;text-align: center; padding:10px">${name}</td>
//                         <td style="border: 1px solid;text-align: center; padding:10px">${
//                           description ? description : "-"
//                         }</td>
//                         <td style="border: 1px solid;text-align: center; padding:10px">${
//                           quantity ? quantity : "-"
//                         }</td>
//                         <td style="border: 1px solid;text-align: center; padding:10px">${
//                           price_per_unit ? price_per_unit : "-"
//                         }</td>
//                     </tr>`
//                       )
//                       .join("")}
//                 </tbody>
//             </table>
//         </div>
//       </section>
//         `
//       )
//     })
//   )
// }

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
