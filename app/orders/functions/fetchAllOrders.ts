import db from "db"
import { GraphQLClient, gql } from "graphql-request"
import { createOrderFunction } from "../mutations/createOrder"
import moment from "moment"

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
    orders(first: 3, after: $after, reverse: true) {
      nodes {
        id
        displayFinancialStatus
        lineItems(first: 40) {
          nodes {
            sku
            quantity
            originalTotal
            totalDiscount
            product {
              description
              title
              featuredImage {
                url
              }
              priceRange {
                maxVariantPrice {
                  amount
                }
              }
            }
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

const getAllOrders = async (orders = [], after = null, timeout = 100) => {
  console.log(`Completed: ${orders.length}`)
  // //TODO: remove return
  // if (orders.length > 0) return orders
  try {
    await sleep(timeout)
    const latestOrder = await db.shopify.findMany({
      orderBy: { createdAt: "desc" },
      take: 1
    })

    const data = await graphQLClient.request(ordersQuery, after ? { after } : {})
    const foundIndex = data.orders.nodes.findIndex((data) => data.id === latestOrder[0]?.orderId)
    if (!data?.orders?.nodes?.length) {
      console.log("No more from shopify")
      return orders
    }
    if (foundIndex >= 0) {
      console.log("foundIndex: ", foundIndex)
      return [...orders, ...data.orders.nodes.slice(0, foundIndex)]
    }
    const latestOrderTime = latestOrder?.[0]?.["createdAt"] ? moment(latestOrder?.[0]?.["createdAt"]) : moment().subtract(5, 'days')

    const hasOlderOrder = data.orders.nodes.find((data) => moment(data.createdAt).isBefore(latestOrderTime))
    console.log('hasOlderOrder: ', hasOlderOrder);
    if (hasOlderOrder) {
      console.log('latestOrderTime: ', latestOrderTime);
      return [...orders, ...data.orders.nodes]
    }

    // console.log('data.orders.edges: ', data.orders.edges);

    return await getAllOrders(
      [...orders, ...data.orders.nodes],
      data.orders.edges[data.orders.edges.length - 1].cursor,
      timeout
    )
  } catch (error) {
    console.log("error! ", error)
    console.log("timeout: ", timeout)
    const newTimeout = timeout > 10000 ? 5000 : timeout + 100
    return getAllOrders(orders, after, newTimeout)
  }
}

export const handler = async () => {
  const orders = await getAllOrders()
  console.log('orders: ', orders.length);
  await Promise.all(
    orders.map(async (order) => {
      const { customer, shippingAddress, billingAddress, lineItems } = order

      const latestOrder = await db.shopify.findFirst({
        where: {
          orderId: order.id,
        },
      })
      if (latestOrder) return

      let productList = []
      //Create products if do not exist
      for (let i = 0; i < lineItems.nodes.length; i++) {
        const currentProduct = lineItems.nodes[i]
        const product = await db.products.findFirst({
          where: {
            sku: currentProduct.sku,
          },
        })

        if (!product && !currentProduct.product) continue

        if (product) productList = [...productList, { ...currentProduct, productId: product.id }]
        else {
          console.log('currentProduct.product?.title: ', currentProduct.product?.title);
          const newProduct = await db.products.create({
            data: {
              sku: currentProduct.sku,
              name: currentProduct.product?.title,
              description: currentProduct.product?.description,
              type: 1,
              costPrice: currentProduct.product?.priceRange?.maxVariantPrice?.amount ? parseInt(currentProduct.product?.priceRange?.maxVariantPrice?.amount) : 0,
              imageUrl: currentProduct.product?.featuredImage?.url,
            },
          })
          productList = [...productList, { ...lineItems, productId: newProduct.id }]
        }
      }


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
          totalPrice: parseInt(order.totalPrice),
          gateway: order.paymentGatewayNames?.join(","),
          order_items: {
            create: productList.map((lineItem) => {
              const product = lineItem?.nodes?.[0] ?? lineItem
              if (!product.productId)
                console.log('product:-> ', product);

              return {
                product: product.productId,
                quantity: product.quantity,
                price: parseInt(product.discountedTotalSet?.shopMoney.amount),
              }
            }),
          },
        },
      }

      await createOrderFunction(newOrderObject)
    })
  )

  console.timeEnd()

  // console.log("orders: ", orders)
}
