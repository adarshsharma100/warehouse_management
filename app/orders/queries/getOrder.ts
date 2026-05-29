import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { getEasyEcomInvoiceUrl } from "utils/easyecom"

const GetOrder = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetOrder), resolver.authorize(), async ({ id }) => {
  const order = await db.orders.findFirst({
    where: { id },
    include: {
      shopify: true,
      shipment: {
        include: {
          sales_invoice_details: true,
          shipment_status: true,
          shipment_items: {
            include: {
              shipment: {
                include: {
                  shipment_status: true
                }
              },
              order_items: {
                include: {
                  products: true
                }
              }
            }
          },
        }
      },
      order_items: {
        include: {
          shipment_items: true,
          products: {
            include: {
              product_prices: true
            }
          },
        }
      }
    },
  })

  if (!order) throw new NotFoundError()

  const orderNumber = order.shopify?.orderNumber || order.id.toString()

  // 1. Check DB cache first (invoiceUrl stored in shopify table)
  let easyecomInvoiceUrl: string | null = order.shopify?.invoiceUrl || null

  // 2. If not in DB, fetch from EasyEcom API and then cache it
  if (!easyecomInvoiceUrl) {
    easyecomInvoiceUrl = await getEasyEcomInvoiceUrl(orderNumber)

    // Cache the URL in DB for future requests
    if (easyecomInvoiceUrl && order.shopify?.id) {
      try {
        await db.shopify.update({
          where: { id: order.shopify.id },
          data: { invoiceUrl: easyecomInvoiceUrl },
        })
        console.log(`[getOrder] Cached invoice URL in DB for order ${orderNumber}`)
      } catch (e: any) {
        console.warn(`[getOrder] Failed to cache invoice URL in DB: ${e.message}`)
      }
    }
  } else {
    console.log(`[getOrder] Using cached invoice URL from DB for order ${orderNumber}`)
  }

  return {
    ...order,
    easyecomInvoiceUrl,
  }
})
