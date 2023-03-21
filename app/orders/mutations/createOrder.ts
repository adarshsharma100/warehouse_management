import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateOrder = z.object({
  orderStatus: z.number(),
  shippingAddressId: z.number(),
  billingAddressId: z.number(),
  createdAt: z.date(),
  // shopifyId: z.number(),
  shopifyId: z.unknown(),
  customerId: z.number(),
  paymentStatus: z.string(),
  totalPrice: z.number(),
  gateway: z.string(),
  channelCreatedAt: z.date(),
  shopify: z.unknown(),
  order_items: z.unknown(),
  customer_orders_customerTocustomer: z.unknown(),
})

export default resolver.pipe(resolver.zod(CreateOrder), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const order = await db.orders.create({ data: input })

  return order
})
