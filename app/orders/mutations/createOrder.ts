import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

// Old zod delete after new zod object implementation

// const CreateOrder = z.object({
//   orderStatus: z.number(),
//   shippingAddressId: z.number(),
//   billingAddressId: z.number(),
//   createdAt: z.date(),
//   // shopifyId: z.number(),
//   shopifyId: z.unknown(),
//   customerId: z.number(),
//   paymentStatus: z.string(),
//   totalPrice: z.number(),
//   gateway: z.string(),
//   channelCreatedAt: z.date(),
//   shopify: z.unknown(),
//   order_items: z.unknown(),
//   customer_orders_customerTocustomer: z.unknown(),
// })

// zod reolver to check and implement also need to take care duplicate enteries inthe DB

// const ContactNumber = z.object({
//   type: z.enum(['landline', 'mobile']),
//   number: z.number(),
// });

// const Email = z.object({
//   email: z.string().email(),
// });

// const Address = z.object({
//   buildingNumber: z.string(),
//   areaStreet: z.string(),
//   landmarkName: z.string(),
//   cityCountryProvince: z.string(),
//   state: z.string(),
//   pincode: z.number(),
//   country: z.number(),
//   emails_emails_addressesToaddresses: z.object({
//     create: z.array(Email),
//   }),
//   contact_number: z.object({
//     create: z.array(ContactNumber),
//   }),
// });

// const Customer = z.object({
//   firstName: z.string(),
//   lastName: z.string(),
//   shopifyId: z.string(),
//   addresses: z.object({
//     create: z.array(Address),
//   }),
// });

// const OrderItem = z.object({
//   product: z.number(),
//   quantity: z.number(),
//   price: z.number(),
// });

// const Order = z.object({
//   orderStatus: z.number(),
//   isShippingIsBilling: z.boolean(),
//   shippingAddress: Address,
//   billingAddress: Address.optional(),
//   paymentStatus: z.string(),
//   totalPrice: z.number(),
//   gateway: z.string(),
//   channelCreatedAt: z.date(),
//   order_items: z.object({
//     create: z.array(OrderItem),
//   }),
// });

// const CreateOrder = z.object({
//   customer: Customer,
//   order: Order,
// });

export default resolver.pipe(
  // resolver.zod(CreateOrder),
  resolver.authorize(),
  async (input) => {
    // console.log("input: ", input)

    if (input.shopifyId) {
    } else {
      const {
        order: {
          billingAddress,
          shippingAddress,
          orderStatus,
          paymentStatus,
          totalPrice,
          gateway,
          isShippingIsBilling,
          order_items,
        },
      } = input

      try {
        const customer = await db.customers.create({
          data: input.customer,
        })
        const ShippingAddress = await db.addresses.create({
          data: shippingAddress,
        })
        //run only when isShippingIsBilling = true
        const BillingAddress =
          !isShippingIsBilling && (await db.addresses.create({ data: billingAddress }))

        const order = await db.orders.create({
          data: {
            orderStatus,
            paymentStatus,
            totalPrice,
            gateway,
            customerId: customer.id,
            shippingAddressId: ShippingAddress.id,
            billingAddressId: isShippingIsBilling ? ShippingAddress.id : BillingAddress.id,
            order_items,
          },
        })
        return order
        // console.log("order123: ", order)
      } catch (error) {
        console.log("error12: ", error)
      }
    }

    return
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order = await db.orders.create({ data: input })
  }
)

export const createOrderFunction = async (input) => {
  const {
    order: {
      billingAddress,
      shippingAddress,
      orderStatus,
      paymentStatus,
      totalPrice,
      gateway,
      isShippingIsBilling,
      order_items,
      shopifyId,
    },
  } = input

  try {
    const createShopify = await db.shopify.create({
      data: {
        orderId: shopifyId,
        orderNumber: shopifyId,
        orderStatusUrl: shopifyId,
      },
    })
    const customer = await db.customers.create({
      data: input.customer,
    })
    const ShippingAddress = await db.addresses.create({
      data: shippingAddress,
    })
    //run only when isShippingIsBilling = true
    const BillingAddress =
      !isShippingIsBilling && (await db.addresses.create({ data: billingAddress }))

    const order = await db.orders.create({
      data: {
        shopifyId: createShopify.id,
        orderStatus,
        paymentStatus,
        totalPrice,
        gateway,
        customerId: customer.id,
        shippingAddressId: ShippingAddress.id,
        billingAddressId: isShippingIsBilling ? ShippingAddress.id : BillingAddress.id,
        order_items,
      },
    })
    // console.log("order123: ", order)
  } catch (error) {
    console.log("error20: ", error)
  }
}
