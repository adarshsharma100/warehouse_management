import db from "db"
import { e_mail } from "./e_mail"

const sendEmail = async (rfq, emailGroup) => {

  const {
    rfqNumber,
    description,
    agreement,
    createdAt,
    rfq_products: products,
    ammendedFrom
  } = rfq

  let ammendedRfq = {}

  if (ammendedFrom) {
    const FindammendedRfq = await db.rfq.findUnique({
      where: { id: ammendedFrom },
    })
    ammendedRfq = FindammendedRfq
  }

  const { rfqNumber: ammendedFromRfq } = ammendedRfq

  const headersArray = ["Sl No.", "Item", "Image", "Qty", "Target Price"]

  const html = `<section>
  <div>

      <h2>RFQ Details:</h2>
      <p><strong>Doc No.:</strong>${rfqNumber}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Created on:</strong> ${new Date(createdAt).toLocaleDateString()}</p>
      <p><strong>Expected Delivery:</strong> ${new Date(rfq.expectedDod).toLocaleDateString()}</p>
      <p><strong>Agreement:</strong> ${agreement}</p>
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
        ({ quantity, price, products: { name, description, imageUrl } }, i) =>
          `<tr style="border: 1px solid">
                  <td style="border: 1px solid;text-align: center; padding:10px">${i + 1}</td>
                  <td style="border: 1px solid;text-align: center; padding:10px">${name}</td>
                  <td style="border: 1px solid;text-align: center; padding:10px">
                  <img src=${imageUrl} height=100 width=100>
                  </td>
                  <td style="border: 1px solid;text-align: center; padding:10px">${quantity ? quantity : "-"
          }</td>
                  <td style="border: 1px solid;text-align: center; padding:10px">${price ? price : "-"
          }</td>
              </tr>`
      )
      .join("")}
          </tbody>
      </table>
  </div>
</section>
  `
  const csvHeader = headersArray.join(',') + '\n';

  const csvBody = products.map((ele, i) => {
    const {
      quantity,
      price,
      products: { name: item, description, imageUrl },
    } = ele

    return [i + 1, item, imageUrl, quantity, price].toString() + "\n"
  })
  const csvData = csvHeader + csvBody.join("")

  const attachment = [
    {
      filename: "Products.csv",
      content: csvData,
    },
  ]

  const subject = ammendedRfq?.rfqNumber ? `${rfqNumber}- Ammended From ${ammendedFromRfq}` : `${rfqNumber}`


  e_mail(emailGroup, subject, html, attachment).catch(
    (error) => console.log(error)
  )

}

export default sendEmail
