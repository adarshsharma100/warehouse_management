import db from "db"
import { e_mail } from "./e_mail"
import { renderToStream } from "@react-pdf/renderer"
import MyDocument from "components/PoMailTemplate"

const sendPoEmail = async (po) => {
  console.log('PoEmail789: ', po);
  /*
  {
  id: 2,
  poNumber: 'PO#6',
  agreement: 'sdsdsd',
  description: 'axsc',
  expectedDod: '2023-03-28T18:30:00.000Z',
  rejectedReason: null,
  expiryDate: '2023-03-28T18:30:00.000Z',
  approvedOn: null,
  createdAT: '2023-03-03T11:32:31.000Z',
  updatedAT: '2023-03-03T11:32:31.000Z',
  rfq: null,
  vendor: ' DA: Dylan Alisson',
  status: 3,
  po_term: 2,
  approvedBy: null,
  amendedFrom: null,
  piNumber: null,
  piDate: null,
  po_status: {
    id: 3,
    name: 'Approved',
    description: 'The PO has been approved to be placed with/em'
  },
  vendors: {
    id: 1,
    name: 'Dylan Alisson',
    code: 'DA',
    gstin: 'GSTRIO783211111',
    creditPeriod: 5,
    leadTime: 4,
    status: 'Active',
    vendorScore: 1,
    vendor_branches: [ [Object], [Object] ]
  },
  po_terms: { id: 2, name: 'Net-30', description: 'Net-30' },
  po_products: [],
  vendor_vendor_id: 1,
  po_code: 'PO#6',
  expiry_date: '2023-03-28T18:30:00.000Z',
  expected_delivery: '2023-03-28T18:30:00.000Z',
  itemsLength: true,
  purchase_order_status: {
    id: 3,
    name: 'Approved',
    description: 'The PO has been approved to be placed with/em'
  },
  terms: { id: 2, name: 'Net-30', description: 'Net-30' }
}*/
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
    // purchase_orders: { poNumber: amendedFrom }
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
  console.log('vendor_branches[0].addresses: ', vendor_branches[0].addresses);

  const vendor_contact = contact_number.map(({ number }) => number).join(", ")


  // const addressParts = Object.keys(vendor_branches[0].addresses)
  //   .filter(key => !["id", "emails_emails_addressesToaddresses"].includes(key))
  //   .map(key => `${key || ''}`)
  const addressParts = [`${buildingNumber || ''}`, `${areaStreet || ''}`, `${landmarkName || ''}`, `${cityCountryProvince || ''}`, `${state || ''}`, `${pincode || ''}`, `${country || ''}`];

  const address = addressParts.filter(part => part !== '').join(', ');

  const vendor_Emails = emails_emails_addressesToaddresses.map(({ email }) => email)
  console.log('vendor_Emails: ', vendor_Emails);


  console.log('address: ', address);
  const email = ["varunram.66@gmail.com", ...vendor_Emails]

  const csvHeader = "Sl No,Name,Vendor-SKU,Product-SKU,Description,Quantity,Unit Price,Total\n"

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
  // console.log("csvData", csvData)
  // const csvData = "name,age,gender\nAlice,25,female\nBob,30,male\nCharlie,35,male" \\EXAMPLE

  const headersArray = ["Sl No.", "Name", "Vendor-SKU", "Product-SKU", "Quantity", "Unit Price", "Total"]

  console.log('vendor123: ', vendorName);


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
