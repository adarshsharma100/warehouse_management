import { getSession } from "@blitzjs/auth"
import { NextApiRequest, NextApiResponse } from "next"
import { GraphQLClient, gql } from "graphql-request"
import db from "db"
import { createOrderFunction } from "app/orders/mutations/createOrder"

const store = "robocraze-com"
const hostName = store + ".myshopify.com"
const apiVersion = "2023-01"
const apiLocation = "/admin/api/"
const endpoint = "https://" + hostName + apiLocation + apiVersion + "/graphql.json"
const header = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": "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",
}
const graphQLClient = new GraphQLClient(endpoint, {
  headers: JSON.parse(JSON.stringify(header)),
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const ordersQuery = gql`
  query orders($after: String) {
    orders(first: 5, after: $after) {
      nodes {
        id
        displayFinancialStatus
        lineItems(first: 50) {
          nodes {
            sku
            quantity
            originalTotal
            totalDiscount
            discountedTotalSet {
              presentmentMoney {
                amount
              }
              shopMoney {
                amount
              }
            }
          }
        }
        shippingAddress {
          address1
          address2
          city
          country
          province
          zip
          phone
        }
        billingAddress {
          address1
          address2
          city
          country
          province
          zip
          phone
        }
        createdAt
        customer {
          firstName
          lastName
          id
          defaultAddress {
            address1
            address2
            city
            zip
            province
            phone
          }
        }
        totalPrice
        paymentGatewayNames
      }
      edges {
        cursor
      }
    }
  }
`
const latestOrder = { id: null }

const getAllOrders = async (orders = [], after = null, timeout = 100) => {
  console.log(`Completed: ${orders.length}`)
  try {
    await sleep(timeout)
    const data = await graphQLClient.request(ordersQuery, after ? { after } : {})
    const foundIndex = data.orders.nodes.findIndex((data) => data.id === latestOrder.id)
    if (!data?.orders?.nodes?.length) {
      console.log("No more from shopify")
      return orders
    }
    if (foundIndex >= 0) {
      console.log("foundIndex: ", foundIndex)
      console.log("Found", data.orders.nodes[foundIndex])
      return [...orders, ...data.orders.nodes.slice(0, foundIndex)]
    } else
      return await getAllOrders(
        [...orders, ...data.orders.nodes],
        data.orders.edges.cursor,
        timeout
      )
  } catch (error) {
    console.log("error! ", error)
    console.log("timeout: ", timeout)
    // return getAllOrders(orders, after, timeout + 100)
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("here")
  console.time()

  const orders = await getAllOrders()
  await Promise.all(
    orders.map(async (order) => {
      const { customer, shippingAddress, billingAddress, lineItems } = order
      const newOrderObject = {
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          shopifyId: customer.id,
          addresses: {
            create: {
              areaStreet: customer.defaultAddress.address1,
              landmarkName: customer.defaultAddress.address2,
              cityCountryProvince: customer.defaultAddress.city,
              state: customer.defaultAddress.province,
              pincode: customer.defaultAddress.zip,
              country: 1,
              contact_number: {
                create: [
                  {
                    type: "mobile",
                    number: customer.defaultAddress.phone,
                  },
                ],
              },
            },
          },
        },
        order: {
          shopifyId: order.id,
          orderStatus: 4,
          isShippingIsBilling: false,
          shippingAddress: {
            areaStreet: shippingAddress.address1,
            landmarkName: shippingAddress.address2,
            cityCountryProvince: shippingAddress.city,
            state: shippingAddress.province,
            pincode: shippingAddress.zip,
            country: 1,
            contact_number: {
              create: [
                {
                  type: "mobile",
                  number: shippingAddress.phone,
                },
              ],
            },
          },
          billingAddress: {
            areaStreet: billingAddress.address1,
            landmarkName: billingAddress.address2,
            cityCountryProvince: billingAddress.city,
            state: billingAddress.province,
            pincode: billingAddress.zip,
            country: 1,
            contact_number: {
              create: [
                {
                  type: "mobile",
                  number: billingAddress.phone,
                },
              ],
            },
          },
          paymentStatus: order.displayFinancialStatus,
          totalPrice: parseFloat(order.totalPrice),
          gateway: order.paymentGatewayNames?.join(","),
          order_items: {
            create: lineItems.nodes.map((lineItem) => ({
              product: 11,
              quantity: lineItem.quantity,
              price: parseFloat(lineItem.discountedTotalSet.shopMoney.amount),
            })),
          },
        },
      }

      await createOrderFunction(newOrderObject)
    })
  )

  console.timeEnd()

  console.log("orders: ", orders)
}
export default handler
