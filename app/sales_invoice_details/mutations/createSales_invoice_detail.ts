import { resolver } from "@blitzjs/rpc"
import db from "db"
import moment from "moment"
import { z } from "zod"

const CreateSales_invoice_detail = z.object({
  shipmentIds: z.array(z.number()),
  shipmentProducts: z.array(z.object({
    product: z.number(),
    quantity: z.number()
  }))
})

export default resolver.pipe(
  resolver.zod(CreateSales_invoice_detail),
  resolver.authorize(),
  async ({ shipmentIds, shipmentProducts }) => {
    console.log('shipmentIds: ', { shipmentIds, shipmentProducts });
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const sales_invoice_detail = await db.sales_invoice_details.createMany({
      data: shipmentIds.map(shipmentId => ({
        invoiceNumber: "INV_" + moment().format('x'),
        shipmentId
      }))
    })

    await db.shipment.updateMany({
      where: {
        id: {
          in: shipmentIds.map(shipmentId => shipmentId)
        }
      },
      data: {
        shipmentStatusId: 2
      }
    })

    const updateInventoryProduct = async (productId: number, quantity: number) => {
      const updatedProduct = await db.inventory_products.update({
        where: {
          product_shelf: {
            product: productId,
            shelf: 2
          }
        },
        data: { quantity: { decrement: quantity } },
      })
      return updatedProduct
    }

    const updatedProducts = await Promise.all(shipmentProducts.map(({ product, quantity }) => updateInventoryProduct(product, quantity)))


    console.log('sales_invoice_detail: ', sales_invoice_detail);
    return sales_invoice_detail
  }
)
