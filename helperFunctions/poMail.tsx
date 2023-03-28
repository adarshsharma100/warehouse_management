import db from "db"
import { e_mail } from "./e_mail"
import { renderToStream } from "@react-pdf/renderer"
import MyDocument from "components/PoMailTemplate"

const sendPoEmail = async (po) => {

  const {
    poNumber,
    description,
    from_party,
    expectedDod,
    expiryDate,
    agreement,
    po_terms: { name: poTerm },
    po_products,
    vendors,
  } = po


  let amendedFrom

  const { name: vendorName, gstin, vendor_branches } =
    vendors

  const {
    id,
    buildingNumber,
    areaStreet,
    landmarkName,
    cityCountryProvince,
    state,
    pincode,
    country_addresses_countryTocountry: { name: country },
    emails_emails_addressesToaddresses,
    contact_number
  } = vendor_branches[0].addresses

  const vendor_contact = contact_number.map(({ number }) => number).join(", ")

  const addressParts = [`${buildingNumber || ''}`, `${areaStreet || ''}`, `${landmarkName || ''}`, `${cityCountryProvince || ''}`, `${state || ''}`, `${pincode || ''}`, `${country || ''}`];

  const address = addressParts.filter(part => part !== '').join(', ');

  const vendor_Emails = emails_emails_addressesToaddresses.map(({ email }) => email)

  const headersArray = ["Sl No.", "Name", "Vendor-SKU", "Product-SKU", "Quantity", "Unit Price", "Total"]
  const email = [...vendor_Emails]

  const csvHeader = headersArray.join() + "\n"

  const csvBody = po_products.map(

    ({ price, quantity, vendor_products: { products: { name, description, sku: product_sku }, sku: vendor_sku } }, i) =>
      [
        i + 1,
        name,
        vendor_sku,
        product_sku,
        description,
        quantity,
        price,
        `${quantity * price}`,
      ].toString() + "\n"
  )
  const csvData = csvHeader + csvBody.join("")



  const html = `<div style="position: relative;">
  <h1 style="text-align: center; text-decoration: underline double;">Purchase Order</h1>
  <section>
      <div>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
              <section style="width: 75%;">
                  <h4 style="margin: 0.2rem 0rem;"><strong>From:</strong></h4>
                  <strong>TIFS LABS</strong>
                  <p style="margin: 5px 0px;"></p>
                  <p style="width: 25ch; font-size: small; margin: 5px 0px;">
                      TIF labs, First Floor, 912/10 Survey no. 104 4th G street, Chelekare, Kalyan Nagar, Bengaluru, Karnataka 560043
                  </p>
                  <p style="font-size: small; margin: 5px 0px;"><strong>Phone:</strong> 1234567890</p>
                  <a href="https://tiflabs.in/" style="text-decoration: none; font-size: small; margin: 5px 0px;">TIFLabs.in</a>
              </section>

              <section>
                  <h4 style="margin: 0.2rem 0rem;">PO Details</h4>
                  <div>
                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Number</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong> ${poNumber}</p>
                      </div>

                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Description</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${description ?? "-"}</p>
                      </div>

                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;"> From party </strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${from_party ?? "-"}</p>
                      </div>

                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Expected Delivery</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong> ${new Date(expectedDod).toDateString()}</p >
                      </div >

                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Expiry Date</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${new Date(expiryDate).toDateString()}</p>
                      </div>
                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Terms</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${poTerm}</p>
                      </div>
                      ${amendedFrom &&
    `<div style="display: flex;">
    <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Amended-From</strong></p>
    <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${amendedFrom}</p>
    </div>`

    }
              
                  </div >
              </section >
          </div >

          <hr />
          <section style="width: 33%;">
              <p style="font-size: small;"><strong>To:</strong></p>
              <strong>${vendorName}</strong>
              <p style="margin: 5px 0px;"></p>
              <p style="width: 25ch; font-size: small; margin: 5px 0px;">
                  ${`#${address}`}
              </p>
              <p style="font-size: small; margin: 5px 0px;"><strong>Phone:</strong> ${vendor_contact}</p>
              <p style="font-size: small; margin: 5px 0px;"><strong>GSTIN:</strong> ${gstin}</p>
          </section>
          <hr />

          <h3 style="text-align: center;">Products List:</h3>
          <table style="border-collapse: collapse; width: 100%;">
              <thead style="background-color: black; color: white;">
                  <tr style="border: 1px solid;">
                      ${headersArray
      .map((ele) => `<td style="border: 1px solid; padding: 10px;">${ele}</td>`)
      .join("")}
                  </tr>
              </thead>
              <tbody>
                  ${po_products.map((
        { price, quantity, vendor_products: { products: { name, sku: product_sku }, sku: vendor_sku } }, i
      ) => {
        return `
                  <tr style="border: 1px solid;">
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${i + 1}</td>
                      <td style="border: 1px solid; padding: 10px;">${name}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${vendor_sku}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${product_sku}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${quantity}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${price}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${price * quantity
          }</td>
                  </tr>
                  `
      }
      )
      .join("")}
              </tbody>
          </table>
      </div >
  </section >
</div > `

  const attachment = [
    {
      filename: "Products.csv",
      content: csvData,
    },
    {
      filename: `${poNumber}.pdf`,
      content: await renderToStream(<MyDocument data={po} />),
    },
  ]

  e_mail(
    email,
    `${poNumber}${amendedFrom ? `-Amended-From ${amendedFrom}` : ""} `,
    html,
    attachment
  ).catch((error) => {
    console.log(error)
  })
}

export default sendPoEmail
