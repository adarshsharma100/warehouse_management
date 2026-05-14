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

const getAllOrders = async (after = null, timeout = 100) => {
  try {
    await sleep(timeout)
    const latestOrder = await db.shopify.findMany({
      orderBy: { createdAt: "desc" },
      take: 1
    })

    const data = await graphQLClient.request(ordersQuery, after ? { after } : {})
    
    if (!data?.orders?.nodes?.length) {
      console.log("No more orders found on Shopify.")
      return
    }

    // PROCESS AND SAVE ORDERS IMMEDIATELY
    console.log(`Processing batch of ${data.orders.nodes.length} orders...`)
    
    for (const order of data.orders.nodes) {
      const { customer, shippingAddress, billingAddress, lineItems } = order

      // Check if order already exists
      const existingOrder = await db.shopify.findFirst({
        where: { orderId: order.id },
      })
      if (existingOrder) {
        console.log(`Order ${order.id} already exists, skipping.`)
        continue
      }

      console.log(`Syncing Order: ${order.id}`)
      
      let productList = []
      for (let i = 0; i < lineItems.nodes.length; i++) {
        const currentProduct = lineItems.nodes[i]
        const product = await db.products.findFirst({
          where: { sku: currentProduct.sku },
        })

        if (!product && !currentProduct.product) continue

        if (product) {
          productList = [...productList, { ...currentProduct, productId: product.id }]
        } else {
          const price = currentProduct.product?.priceRange?.maxVariantPrice?.amount ? parseInt(currentProduct.product?.priceRange?.maxVariantPrice?.amount) : 0
          
          const newProduct = await db.products.create({
            data: {
              sku: currentProduct.sku,
              name: currentProduct.product?.title,
              description: currentProduct.product?.description,
              imageUrl: currentProduct.product?.featuredImage?.url,
              // Fix: Connect to product_types (ID: 1 is usually 'Finished Goods' or 'Simple')
              product_types: {
                connect: { id: 1 }
              },
              // Fix: Create default dimensions (Required by your schema)
              dimensions: {
                create: {
                  weight: 0,
                  length: 0,
                  width: 0,
                  height: 0
                }
              },
              // Fix: Move price to the product_prices table
              product_prices: {
                create: {
                  sellingPrice: price,
                  mrp: price
                }
              },
              // Fix: Create an inventory record so it shows up in the Inventory section
              inventory_products: {
                create: {
                  shelf: 1, // Connect to Default Shelf (ID: 1)
                  quantity: 0, // Initial quantity
                  description: "Shopify Synced"
                }
              }
            },
          })
          productList = [...productList, { ...currentProduct, productId: newProduct.id }]
        }
      }

      const newOrderObject = {
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          shopifyId: customer.id,
          addresses: {
            create: {
              areaStreet: customer.defaultAddress?.address1 || "",
              landmarkName: customer.defaultAddress?.address2 || "",
              cityCountryProvince: customer.defaultAddress?.city || "",
              state: customer.defaultAddress?.province || "",
              pincode: customer.defaultAddress?.zip || "",
              country: 1,
              contact_number: {
                create: [{ type: "mobile", number: customer.defaultAddress?.phone || "" }],
              },
            },
          },
        },
        order: {
          shopifyId: order.id,
          orderStatus: 4,
          isShippingIsBilling: false,
          shippingAddress: {
            areaStreet: shippingAddress?.address1 || "",
            landmarkName: shippingAddress?.address2 || "",
            cityCountryProvince: shippingAddress?.city || "",
            state: shippingAddress?.province || "",
            pincode: shippingAddress?.zip || "",
            country: 1,
            contact_number: {
              create: [{ type: "mobile", number: shippingAddress?.phone || "" }],
            },
          },
          billingAddress: {
            areaStreet: billingAddress?.address1 || "",
            landmarkName: billingAddress?.address2 || "",
            cityCountryProvince: billingAddress?.city || "",
            state: billingAddress?.province || "",
            pincode: billingAddress?.zip || "",
            country: 1,
            contact_number: {
              create: [{ type: "mobile", number: billingAddress?.phone || "" }],
            },
          },
          paymentStatus: order.displayFinancialStatus === "PAID" ? 2 : 1, // Map PAID to ID 2
          paymentTermsId: 1, // Default to 'Due on Receipt'
          totalPrice: parseInt(order.totalPrice),
          gateway: order.paymentGatewayNames?.join(",").substring(0, 45), // Truncate to fit VarChar(45)
          order_items: {
            create: productList.map((p) => ({
              product: p.productId,
              quantity: p.quantity,
              price: parseInt(p.discountedTotalSet?.shopMoney.amount || "0"),
            })),
          },
        },
      }

      await createOrderFunction(newOrderObject)
    }

    // CHECK IF WE NEED TO FETCH MORE
    const latestOrderTime = latestOrder?.[0]?.["createdAt"] ? moment(latestOrder?.[0]?.["createdAt"]) : moment().subtract(30, 'days')
    const hasOlderOrder = data.orders.nodes.find((data) => moment(data.createdAt).isBefore(latestOrderTime))

    if (hasOlderOrder) {
      console.log("Reached historical limit. Sync complete.")
      return
    }

    // Recurse to next page
    if (data.orders.edges?.length > 0) {
      return await getAllOrders(
        data.orders.edges[data.orders.edges.length - 1].cursor,
        timeout
      )
    }
  } catch (error) {
    console.error("Sync Error: ", error)
    const newTimeout = timeout > 10000 ? 5000 : timeout + 500
    return getAllOrders(after, newTimeout)
  }
}

export const handler = async () => {
  console.log("Starting Shopify Sync (Streaming mode)...")
  await getAllOrders()
  console.log("Sync Finished.")
}

