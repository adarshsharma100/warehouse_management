import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateManyPurchase_order_product = z.array(
  z.object({
    purchase_order_po_id: z.number(),
    purchase_order_purchase_order_status_pos_id: z.number(),
    purchase_order_vendor_vendor_id: z.number(),
    vendor_products_vp_id: z.number(),
    vendor_products_vendor_vendor_id: z.number(),
    vendor_products_products_product_id: z.number(),
    quantity: z.number(),
    price_per_unit: z.number(),
    received_quantity: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(CreateManyPurchase_order_product),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order_product = await db.purchase_order_products.createMany({
      data: input,
    })

    return purchase_order_product
  }
)
