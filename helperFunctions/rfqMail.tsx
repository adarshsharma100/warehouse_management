import db from "db"
import { e_mail } from "./e_mail"
// import { mail } from "./mail"

const sendEmail = async (data, rfq, info) => {
  const products = await db.rfq_products.findMany({
    where: { rfq_id: rfq?.id },
    include: { products: true },
  })
  const sentmails = await db.rfq_sentto.findMany({
    where: { rfq_id: info.id },
  })

  const emailLists = data?.rfq_sentto?.create?.length
    ? data?.rfq_sentto?.create.map(({ email }) => email)
    : sentmails?.map(({ email }) => email)

  // console.log("products4Rfq", products)s

  // const emailLists = additionalInfo.creation
  //   ? data?.rfq_sentto?.create.map(({ email }) => email)
  //   : sentmails?.map(({ email }) => email)

  const headersArray = ["Sl No.", "Name", "Description", "Quantity", "Unit Price"]

  const html = `<section>
  <div>
  
      <h2>RFQ Details:</h2>
      <p><strong>Doc No.:</strong>${rfq.rfq_code}</p>
      <p><strong>Description:</strong> ${rfq.rfq_description}</p>
      <p><strong>Created on:</strong> ${new Date(rfq.createdAt).toLocaleDateString()}</p>
      <p><strong>Expected Delivery:</strong> ${new Date(rfq.expected_dod).toLocaleDateString()}</p>
      <hr />
  </div>
  <div>
      <h2>Products:</h2>
      <table style="border-collapse: collapse">
          <thead style="background-color:black ;color:white">
              <tr style="border: 1px solid">
                  ${headersArray
                    .map((ele) => `<td style="border: 1px solid; padding:10px">${ele}</td>`)
                    .join("")}
              </tr>
          </thead>
          <tbody>
              ${products
                .map(
                  ({ quantity, price_per_unit, products: { name, description } }, i) =>
                    `<tr style="border: 1px solid">
                  <td style="border: 1px solid;text-align: center; padding:10px">${i + 1}</td>
                  <td style="border: 1px solid;text-align: center; padding:10px">${name}</td>
                  <td style="border: 1px solid;text-align: center; padding:10px">${
                    description ? description : "-"
                  }</td>
                  <td style="border: 1px solid;text-align: center; padding:10px">${
                    quantity ? quantity : "-"
                  }</td>
                  <td style="border: 1px solid;text-align: center; padding:10px">${
                    price_per_unit ? price_per_unit : "-"
                  }</td>
              </tr>`
                )
                .join("")}
          </tbody>
      </table>
  </div>
</section>
  `

  const csvHeader = "Sl No,Name,Description,Quantity,Unit Price\n"

  const csvBody = products.map((ele, i) => {
    const {
      quantity,
      price_per_unit,
      products: { name, description, products_sku },
    } = ele

    return [i + 1, name, description, quantity, price_per_unit].toString() + "\n"
  })
  const csvData = csvHeader + csvBody.join("")

  console.log("csvData", csvData)

  const attachment = [
    {
      filename: "Products.csv",
      content: csvData,
    },
  ]

  await Promise.all(
    emailLists.map((email) => {
      e_mail(email, `${rfq.rfq_code}${info?.class ? info.class : ""}`, html, attachment).catch(
        (error) => console.log(error)
      )
    })
  )
}

export default sendEmail
