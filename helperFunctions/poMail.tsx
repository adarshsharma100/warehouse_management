import db from "db"
// import { mail } from "./mail"
import { e_mail } from "./e_mail"
import { renderToStream } from "@react-pdf/renderer"
import MyDocument from "components/PoMailTemplate"

const sendPoEmail = async (data, po, info) => {
  const vendorDetails = await db.vendor.findUnique({
    where: { vendor_id: data.vendor_vendor_id },
  })

  const poMailData = { ...po, vendorDetails }

  const pop = await db.purchase_order_products.findMany({
    where: { purchase_order_po_id: po.po_id },
    include: {
      vendor_products: {
        include: { products: true },
      },
    },
  })
  const { address, vendor, vendor_id, vendor_city, vendor_contact, vendor_gstin, vendor_email } =
    vendorDetails
  const {
    po_id,
    po_code,
    po_description,
    from_party,
    expected_delivery,
    expiry_date,
    agreement,
    purchase_order_terms,
    vendor_Emails,
    amendedFrom,
    AmendNotes,
    purchase_order_products: po_products,
  } = po
  const email = ["varunram.66@gmail.com", ...vendor_Emails]

  const csvHeader = "Sl No,Name,Product-SKU,Description,Quantity,Unit Price,Total\n"

  const csvBody = po.purchase_order_products.map(
    (ele, i) =>
      [
        i + 1,
        ele.vendor_products.products.name,
        ele.vendor_products.vendor_sku,
        ele.vendor_products.products.description,
        ele.quantity,
        ele.price_per_unit,
        `${ele.quantity * ele.price_per_unit}`,
      ].toString() + "\n"
  )
  const csvData = csvHeader + csvBody.join("")
  // console.log("csvData", csvData)
  // const csvData = "name,age,gender\nAlice,25,female\nBob,30,male\nCharlie,35,male" \\EXAMPLE

  const headersArray = ["Sl No.", "Name", "Product", "Quantity", "Unit Price", "Total"]

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
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Code</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong> ${po_code}</p>
                      </div>

                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Description</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${
                            po_description ? po_description : "-"
                          }</p>
                      </div>

                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;"> From party </strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${from_party}</p>
                      </div>

                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Expected Delivery</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong> ${new Date(
                            expected_delivery
                          ).toLocaleDateString()}</p>
                      </div>

                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Expiry Date</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${new Date(
                            expiry_date
                          ).toLocaleDateString()}</p>
                      </div>
                      <div style="display: flex;">
                          <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Terms</strong></p>
                          <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${purchase_order_terms}</p>
                      </div>
                      ${[amendedFrom, AmendNotes]
                        .map(
                          (field) => `<div style="display: flex;">
                        <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">${field}</strong></p>
                        <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${field}</p>
                          </div>`
                        )
                        .join("")}
                  </div>
              </section>
          </div>

          <hr />
          <section style="width: 30%;">
              <p style="font-size: small;"><strong>To:</strong></p>
              <strong>${vendor}</strong>
              <p style="margin: 5px 0px;"></p>
              <p style="width: 25ch; font-size: small; margin: 5px 0px;">
                  ${`${vendor_city},${address}`}
              </p>
              <p style="font-size: small; margin: 5px 0px;"><strong>Phone:</strong> ${vendor_contact}</p>
              <p style="font-size: small; margin: 5px 0px;"><strong>GSTIN:</strong> ${vendor_gstin}</p>
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
                  ${po_products
                    .map(
                      (
                        {
                          vendor_products: {
                            products: { name, description },
                            vendor_sku,
                          },
                          quantity,
                          price_per_unit,
                        },
                        i
                      ) => {
                        return `
                  <tr style="border: 1px solid;">
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${
                        i + 1
                      }</td>
                      <td style="border: 1px solid; padding: 10px;">${name}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${vendor_sku}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${quantity}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${price_per_unit}</td>
                      <td style="border: 1px solid; padding: 10px; text-align: center;">${
                        price_per_unit * quantity
                      }</td>
                  </tr>
                  `
                      }
                    )
                    .join("")}
              </tbody>
          </table>
      </div>
  </section>
</div>`

  const attachment = [
    {
      filename: "Products.csv",
      content: csvData,
    },
    {
      filename: `${po_code}.pdf`,
      content: await renderToStream(<MyDocument data={poMailData} />),
    },
  ]

  e_mail(
    email,
    `${po_code}${amendedFrom ? `-Amended-From ${amendedFrom}` : ""}`,
    html,
    attachment
  ).catch((error) => {
    console.log(error)
  })
}

export default sendPoEmail

// mail(
//   "care@robocraze.com",
//   email,
//   `${po_code}${info?.class ? info.class : ""}`,

//   `<div style="position: relative;">
//   <h1 style="text-align: center; text-decoration: underline double;">Purchase Order</h1>
//   <section>
//       <div>
//           <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
//       </div>
//       <div>
//           <div style="display:flex;justify-content:space-between;align-items:center;">
//               <section style="width: 75%;">
//                   <h4 style="margin: 0.2rem 0rem;"><strong>From:</strong></h4>
//                   <strong>TIFS LABS</strong>
//                   <p style="margin: 5px 0px;"></p>
//                   <p style="width: 25ch; font-size: small; margin: 5px 0px;">
//                       TIF labs, First Floor, 912/10 Survey no. 104 4th G street, Chelekare, Kalyan Nagar, Bengaluru, Karnataka 560043
//                   </p>
//                   <p style="font-size: small; margin: 5px 0px;"><strong>Phone:</strong> 1234567890</p>
//                   <a href="https://tiflabs.in/" style="text-decoration: none; font-size: small; margin: 5px 0px;">TIFLabs.in</a>
//               </section>

//               <section>
//                   <h4 style="margin: 0.2rem 0rem;">PO Details</h4>
//                   <div>
//                       <div style="display: flex;">
//                           <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Code</strong></p>
//                           <p style="font-size: small; margin: 5px 0px;"><strong>: </strong> ${po_code}</p>
//                       </div>

//                       <div style="display: flex;">
//                           <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Description</strong></p>
//                           <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${
//                             po_description ? po_description : "-"
//                           }</p>
//                       </div>

//                       <div style="display: flex;">
//                           <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;"> From party </strong></p>
//                           <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${from_party}</p>
//                       </div>

//                       <div style="display: flex;">
//                           <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Expected Delivery</strong></p>
//                           <p style="font-size: small; margin: 5px 0px;"><strong>: </strong> ${new Date(
//                             expected_delivery
//                           ).toLocaleDateString()}</p>
//                       </div>

//                       <div style="display: flex;">
//                           <p style="font-size: small; margin: 5px 0px;"><strong style="width: 16ch; display: inline-block;">Expiry Date</strong></p>
//                           <p style="font-size: small; margin: 5px 0px;"><strong>: </strong>${new Date(
//                             expiry_date
//                           ).toLocaleDateString()}</p>
//                       </div>
//                   </div>
//               </section>
//           </div>

//           <hr />
//           <section style="width: 30%;">
//               <p style="font-size: small;"><strong>To:</strong></p>
//               <strong>${vendor}</strong>
//               <p style="margin: 5px 0px;"></p>
//               <p style="width: 25ch; font-size: small; margin: 5px 0px;">
//                   ${`${vendor_city},${address}`}
//               </p>
//               <p style="font-size: small; margin: 5px 0px;"><strong>Phone:</strong> ${vendor_contact}</p>
//               <p style="font-size: small; margin: 5px 0px;"><strong>GSTIN:</strong> ${vendor_gstin}</p>
//           </section>
//           <hr />

//           <h3 style="text-align: center;">Products List:</h3>
//           <table style="border-collapse: collapse; width: 100%;">
//               <thead style="background-color: black; color: white;">
//                   <tr style="border: 1px solid;">
//                       <td style="border: 1px solid; padding: 10px;">Sl No.</td>
//                       <td style="border: 1px solid; padding: 10px;">Name</td>
//                       <td style="border: 1px solid; padding: 10px;">Product-SKU</td>
//                       <td style="border: 1px solid; padding: 10px;">Description</td>
//                       <td style="border: 1px solid; padding: 10px;">Quantity</td>
//                       <td style="border: 1px solid; padding: 10px;">Unit Price</td>
//                       <td style="border: 1px solid; padding: 10px;">Total</td>
//                   </tr>
//               </thead>
//               <tbody>
//                   ${pop
//                     .map(
//                       (
//                         {
//                           vendor_products: {
//                             products: { name, description },
//                             vendor_sku,
//                           },
//                           quantity,
//                           price_per_unit,
//                         },
//                         i
//                       ) => {
//                         return `
//                   <tr style="border: 1px solid;">
//                       <td style="border: 1px solid; padding: 10px; text-align: center;">${
//                         i + 1
//                       }</td>
//                       <td style="border: 1px solid; padding: 10px;">${name}</td>
//                       <td style="border: 1px solid; padding: 10px; text-align: center;">${vendor_sku}</td>

//                       <td style="border: 1px solid; padding: 10px; text-align: center;">
//                           ${description ? description : "-"}
//                       </td>
//                       <td style="border: 1px solid; padding: 10px; text-align: center;">${quantity}</td>
//                       <td style="border: 1px solid; padding: 10px; text-align: center;">${price_per_unit}</td>
//                       <td style="border: 1px solid; padding: 10px; text-align: center;">${
//                         price_per_unit * quantity
//                       }</td>
//                   </tr>
//                   `
//                       }
//                     )
//                     .join("")}
//               </tbody>
//           </table>
//       </div>
//   </section>
// </div>`
// )
