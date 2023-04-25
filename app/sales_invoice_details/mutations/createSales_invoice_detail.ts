import { resolver } from "@blitzjs/rpc"
import db from "db"
import moment from "moment"
import { z } from "zod"

const CreateSales_invoice_detail = z.array(z.number())

export default resolver.pipe(
  resolver.zod(CreateSales_invoice_detail),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const sales_invoice_detail = await db.sales_invoice_details.createMany({
      data: input.map(shipmentId => ({
        invoiceNumber: "INV_" + moment().format('x'),
        shipmentId
      }))
    })

    await db.shipment.updateMany({
      where: {
        id: {
          in: input.map(shipmentId => shipmentId)
        }
      },
      data: {
        shipmentStatusId: 2
      }
    })

    console.log('sales_invoice_detail: ', sales_invoice_detail);
    return sales_invoice_detail
  }
)
