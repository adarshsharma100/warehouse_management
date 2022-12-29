import db from "db"
import { mail } from "./mail"

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

  // const emailLists = additionalInfo.creation
  //   ? data?.rfq_sentto?.create.map(({ email }) => email)
  //   : sentmails?.map(({ email }) => email)

  await Promise.all(
    emailLists.map((email) => {
      mail(
        "care@robocraze.com",
        email,
        `${rfq.rfq_code}${info?.class ? info.class : ""}`,
        `
          <section>
          <div>
          
              <h2>RFQ Details:</h2>
              <p><strong>Doc No.:</strong>${rfq.rfq_code}</p>
              <p><strong>Description:</strong> ${rfq.rfq_description}</p>
              <p><strong>Created on:</strong> ${new Date(rfq.createdAt).toLocaleDateString()}</p>
              <p><strong>Expected Delivery:</strong> ${new Date(
                rfq.expected_dod
              ).toLocaleDateString()}</p>
              <hr />
          </div>
          <div>
              <h2>Products:</h2>
              <table style="border-collapse: collapse">
                  <thead style="background-color:black ;color:white">
                      <tr style="border: 1px solid">
                          <td style="border: 1px solid; padding:10px">Sl No.</td>
                          <td style="border: 1px solid; padding:10px">Name</td>
                          <td style="border: 1px solid; padding:10px">Description</td>
                          <td style="border: 1px solid; padding:10px">Quantity</td>
                          <td style="border: 1px solid; padding:10px">Unit Price</td>
                      </tr>
                  </thead>
                  <tbody>
                      ${products
                        .map(
                          ({ quantity, price_per_unit, products: { name, description } }, i) =>
                            `<tr style="border: 1px solid">
                          <td style="border: 1px solid;text-align: center; padding:10px">${
                            i + 1
                          }</td>
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
      )
    })
  )
}

export default sendEmail
