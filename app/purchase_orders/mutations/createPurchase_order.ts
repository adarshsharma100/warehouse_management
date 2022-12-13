import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { mail } from "helperFunctions/mail"

const CreatePurchase_order = z.object({
  vendor_vendor_id: z.number(),
  po_code: z.string(),
  po_description: z.string(),
  expiry_date: z.date(),
  expected_delivery: z.date(),
  from_party: z.string(),
  agreement: z.string(),
  rfq_id: z.number().optional(),
  purchase_order_products: z.unknown(),
})

const sendEmail = async (data, po) => {
  const vendorDetails = await db.vendor.findUnique({
    where: { vendor_id: data.vendor_vendor_id },
  })

  const pop = await db.purchase_order_products.findMany({
    where: { purchase_order_po_id: po.po_id },
    include: {
      vendor_products: {
        include: { products: true },
      },
    },
  })
  const { address, vendor, vendor_id, vendor_city, vendor_contact, vendor_gstin } = vendorDetails
  console.log(vendorDetails?.address)
  const { po_id, po_code, po_description, from_party, expected_delivery, expiry_date, agreement } =
    po
  const email = "varunram.66@gmail.com"
  mail(
    "care@robocraze.com",
    email,
    `PO #${po_id}`,
    `
    <div style="position: relative;">
    <h1 style="text-align: center; text-decoration: underline double;">Purchase Order</h1>
    <section>
    <div style="position: absolute; top: 88px; right: 0;">
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>#</strong> : PO-${po_id}</p>
    </div>
    <section style="width: 30%;">
        <p style="font-size: small;"><strong>From:</strong></p>
        <strong>TIFS LABS</strong>
        <p style="margin: 5px 0px;"></p>
        <p style="width: 25ch; font-size: small; margin: 5px 0px;">
            TIF labs, First Floor, 912/10 Survey no. 104 4th G street, Chelekare, Kalyan Nagar, Bengaluru, Karnataka 560043
        </p>
        <p style="font-size: small; margin: 5px 0px;"><strong>Phone:</strong> 1234567890</p>
        <a href="https://tiflabs.in/" style="text-decoration: none; font-size: small; margin: 5px 0px;">TIFLabs.in</a>
    </section>

    </section

    
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
    <section>
    <h3 style="text-align: center">PO Details:</h3>
        <table style="border-collapse: collapse; width: 80%; text-align: center; margin: auto; margin-bottom: 1rem;">
            <thead style="background-color: gray; color: black;">
                <tr style="border: 1px solid;">
                    <td style="border: 1px solid; padding: 10px;">Code</td>
                    <td style="border: 1px solid; padding: 10px;">Description</td>
                    <td style="border: 1px solid; padding: 10px;">From party</td>
                    <td style="border: 1px solid; padding: 10px;">Expected Delivery</td>
                    <td style="border: 1px solid; padding: 10px;">Expiry Date</td>
                    <td style="border: 1px solid; padding: 10px;">Agreement</td>
                </tr>
            </thead>
            <tbody>
                <tr style="border: 1px solid;">
                    <td style="border: 1px solid; padding: 10px;">${po_code}</td>
                    <td style="border: 1px solid; padding: 10px;">${
                      po_description ? po_description : "-"
                    }</td>
                    <td style="border: 1px solid; padding: 10px;">${from_party}</td>
                    <td style="border: 1px solid; padding: 10px;">${new Date(
                      expected_delivery
                    ).toLocaleDateString()}</td>
                    <td style="border: 1px solid; padding: 10px;">${new Date(
                      expiry_date
                    ).toLocaleDateString()}</td>
                    <td style="border: 1px solid; padding: 10px;">${agreement}</td>
                </tr>
            </tbody>
        </table>
        <h3 style="text-align: center">Products List:</h3>
        <table style="border-collapse: collapse; width: 100%;">
            <thead style="background-color: black; color: white;">
                <tr style="border: 1px solid;">
                    <td style="border: 1px solid; padding: 10px;">Sl No.</td>
                    <td style="border: 1px solid; padding: 10px;">Name</td>
                    <td style="border: 1px solid; padding: 10px;">Product-SKU</td>
                    <td style="border: 1px solid; padding: 10px;">Description</td>
                    <td style="border: 1px solid; padding: 10px;">Quantity</td>
                    <td style="border: 1px solid; padding: 10px;">Unit Price</td>
                    <td style="border: 1px solid; padding: 10px;">Total</td>
                </tr>
            </thead>
            <tbody>
            ${pop
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
                <td style="border: 1px solid; padding: 10px;text-align: center">${i + 1}</td> 
                <td style="border: 1px solid; padding: 10px;">${name}</td>
                <td style="border: 1px solid; padding: 10px;text-align: center" >${vendor_sku}</td>

                <td style="border: 1px solid; padding: 10px;text-align: center" >
                    ${description ? description : "-"}
                </td>
                <td style="border: 1px solid; padding: 10px;text-align: center" >${quantity}</td>
                <td style="border: 1px solid; padding: 10px;text-align: center" >${price_per_unit}</td>
                <td style="border: 1px solid; padding: 10px;text-align: center" >${
                  price_per_unit * quantity
                }</td>
            </tr>`
                }
              )
              .join("")}
            </tbody>
        </table>
    </section>
</div>`
  )
}

export default resolver.pipe(
  resolver.zod(CreatePurchase_order),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    console.log(input)
    const purchase_order = await db.purchase_order.create({ data: input })

    await sendEmail(input, purchase_order)

    return purchase_order
  }
)
