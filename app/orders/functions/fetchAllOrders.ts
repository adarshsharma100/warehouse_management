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
    orders(first: 50, after: $after, reverse: true) {
      nodes {
        id
        displayFinancialStatus
        lineItems(first: 40) {
          nodes {
            sku
            quantity
            product {
              description
              title
              featuredImage { url }
              priceRange { maxVariantPrice { amount } }
            }
            variant {
              inventoryQuantity
            }
          }
        }
        shippingAddress { address1 address2 city country province zip phone }
        billingAddress { address1 address2 city country province zip phone }
        createdAt
        customer {
          firstName
          lastName
          id
          defaultAddress { address1 address2 city zip province phone }
        }
        totalPrice
        paymentGatewayNames
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const productsQuery = gql`
  query products($after: String) {
    products(first: 50, after: $after) {
      nodes {
        title
        descriptionHtml
        featuredImage { url }
        variants(first: 10) {
          nodes {
            sku
            price
            inventoryQuantity
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const syncAllProducts = async (after = null) => {
  try {
    console.log("Fetching products from Shopify...")
    const data = await graphQLClient.request(productsQuery, { after })
    
    if (!data?.products?.nodes?.length) return

    for (const product of data.products.nodes) {
      for (const variant of product.variants.nodes) {
        if (!variant.sku) continue

        // 1. Create or Update Product Master
        let localProduct = await db.products.findFirst({
          where: { sku: variant.sku }
        })

        const price = variant.price ? parseInt(variant.price) : 0

        if (!localProduct) {
          console.log(`Creating new product: ${variant.sku}`)
          localProduct = await db.products.create({
            data: {
              sku: variant.sku,
              name: product.title.substring(0, 100),
              description: product.descriptionHtml,
              imageUrl: product.featuredImage?.url,
              product_types: { connect: { id: 1 } },
              dimensions: { create: { weight: 0, length: 0, width: 0, height: 0 } },
              product_prices: { create: { sellingPrice: price, mrp: price } }
            }
          })
        }

        // 2. Update Inventory / Stock Level
        const stockLevel = variant.inventoryQuantity || 0
        const inventoryRecord = await db.inventory_products.findFirst({
          where: { product: localProduct.id, shelf: 1 }
        })

        if (inventoryRecord) {
          await db.inventory_products.update({
            where: { id: inventoryRecord.id },
            data: { quantity: stockLevel }
          })
        } else {
          await db.inventory_products.create({
            data: {
              product: localProduct.id,
              shelf: 1,
              quantity: stockLevel,
              description: "Shopify Sync"
            }
          })
        }
      }
    }

    if (data.products.pageInfo.hasNextPage) {
      await syncAllProducts(data.products.pageInfo.endCursor)
    }
  } catch (error) {
    console.error("Product Sync Error:", error)
  }
}

const getAllOrders = async (after = null, timeout = 100) => {
  try {
    await sleep(timeout)

    const data = await graphQLClient.request(ordersQuery, after ? { after } : {})
    
    if (!data?.orders?.nodes?.length) {
      console.log("No more orders found on Shopify.")
      return
    }

    console.log(`Processing batch of ${data.orders.nodes.length} orders...`)
    
    for (const order of data.orders.nodes) {
      try {
        const { customer, shippingAddress, billingAddress, lineItems } = order

        const existingOrder = await db.shopify.findFirst({
          where: { orderId: order.id },
        })
        if (existingOrder) continue

        console.log(`Syncing Order: ${order.id}`)
        
        let productList = []
        for (const item of lineItems.nodes) {
          // Skip line items without a SKU to avoid database constraint violations
          if (!item.sku) {
            console.log(`Skipping item without SKU in order ${order.id}`)
            continue
          }

          // Use upsert to avoid race conditions with duplicate SKUs
          const price = item.product?.priceRange?.maxVariantPrice?.amount ? parseInt(item.product?.priceRange?.maxVariantPrice?.amount) : 0
          const product = await db.products.upsert({
            where: { sku: item.sku },
            update: {}, // Don't change anything if it exists
            create: {
              sku: item.sku,
              name: (item.product?.title || "Unknown Product").substring(0, 100),
              description: item.product?.description,
              imageUrl: item.product?.featuredImage?.url,
              product_types: { connect: { id: 1 } },
              dimensions: { create: { weight: 0, length: 0, width: 0, height: 0 } },
              product_prices: { create: { sellingPrice: price, mrp: price } },
              inventory_products: {
                create: {
                  shelf: 1,
                  quantity: item.variant?.inventoryQuantity || 0,
                  description: "Shopify Synced"
                }
              }
            },
          })
          // Update local inventory from Shopify's latest count (Real-time update)
          const stockLevel = item.variant?.inventoryQuantity || 0
          const inventoryRecord = await db.inventory_products.findFirst({
            where: { product: product.id, shelf: 1 }
          })

          if (inventoryRecord) {
            await db.inventory_products.update({
              where: { id: inventoryRecord.id },
              data: { quantity: stockLevel }
            })
          } else {
            await db.inventory_products.create({
              data: {
                product: product.id,
                shelf: 1,
                quantity: stockLevel,
                description: "Shopify Synced"
              }
            })
          }

          productList.push({ ...item, productId: product.id })
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
                contact_number: { create: [{ type: "mobile", number: customer.defaultAddress?.phone || "" }] },
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
              contact_number: { create: [{ type: "mobile", number: shippingAddress?.phone || "" }] },
            },
            billingAddress: {
              areaStreet: billingAddress?.address1 || "",
              landmarkName: billingAddress?.address2 || "",
              cityCountryProvince: billingAddress?.city || "",
              state: billingAddress?.province || "",
              pincode: billingAddress?.zip || "",
              country: 1,
              contact_number: { create: [{ type: "mobile", number: billingAddress?.phone || "" }] },
            },
            paymentStatus: order.displayFinancialStatus === "PAID" ? 2 : 1,
            paymentTermsId: 1,
            totalPrice: parseInt(order.totalPrice),
            gateway: order.paymentGatewayNames?.join(",").substring(0, 45),
            order_items: {
              create: productList.map((p) => ({
                product: p.productId,
                quantity: p.quantity,
                price: parseInt(p.discountedTotalSet?.shopMoney?.amount || "0"),
              })),
            },
          },
        }

        await createOrderFunction(newOrderObject)
      } catch (orderError) {
        console.error(`Error processing Shopify order ${order.id}:`, orderError)
      }
    }

    if (data.orders.pageInfo.hasNextPage) {
      return await getAllOrders(
        data.orders.pageInfo.endCursor,
        timeout
      )
    }
  } catch (error) {
    console.error("Order Sync Error:", error)
    if (timeout < 5000) {
      console.log(`Retrying after error with increased timeout of ${timeout + 500}ms...`)
      return getAllOrders(after, timeout + 500)
    } else {
      console.error("Max retries exceeded. Aborting sync job.")
      throw error
    }
  }
}

const changedVariantsQuery = gql`
  query productVariants($query: String!, $after: String) {
    productVariants(first: 50, query: $query, after: $after) {
      nodes {
        sku
        inventoryQuantity
        product {
          title
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const syncRecentInventoryChanges = async (after = null) => {
  try {
    // 1. Get the last successful sync job to know the start time
    const lastJob = await db.jobs.findFirst({
      where: { jobTypesId: 2, isCompleted: true },
      orderBy: { id: "desc" }
    })

    // Fall back to 24 hours ago if no previous successful job was found
    const lastSyncTime = lastJob ? new Date(lastJob.createdAt) : new Date(Date.now() - 24 * 60 * 60 * 1000)
    const isoString = lastSyncTime.toISOString()
    const query = `updated_at:>='${isoString}'`

    console.log(`\n======================================================`)
    console.log(`[Shopify 5-Min Sync] Checking for stock updates since: ${isoString}`)
    console.log(`======================================================`)
    const data = await graphQLClient.request(changedVariantsQuery, { query, after })

    if (!data?.productVariants?.nodes?.length) {
      console.log("[Shopify 5-Min Sync] No inventory changes found on Shopify.")
      console.log(`======================================================\n`)
      return
    }

    console.log(`[Shopify 5-Min Sync] Found ${data.productVariants.nodes.length} potential stock adjustments on Shopify. Processing...`)

    let changedCount = 0

    for (const variant of data.productVariants.nodes) {
      if (!variant.sku) continue

      // Find local product by SKU
      const localProduct = await db.products.findFirst({
        where: { sku: variant.sku }
      })

      if (!localProduct) {
        console.log(`[Shopify 5-Min Sync] local SKU ${variant.sku} not found in warehouse. Skipping.`)
        continue
      }

      const stockLevel = variant.inventoryQuantity || 0

      // Update local shelf #1 quantity
      const inventoryRecord = await db.inventory_products.findFirst({
        where: { product: localProduct.id, shelf: 1 }
      })

      if (inventoryRecord) {
        if (inventoryRecord.quantity !== stockLevel) {
          const oldQty = inventoryRecord.quantity
          await db.inventory_products.update({
            where: { id: inventoryRecord.id },
            data: { quantity: stockLevel }
          })
          changedCount++
          console.log(`  -> [CHANGED] SKU: ${variant.sku} | Name: "${localProduct.name}"`)
          console.log(`     Quantity Sync: ${oldQty} -> ${stockLevel}`)
        }
      } else {
        await db.inventory_products.create({
          data: {
            product: localProduct.id,
            shelf: 1,
            quantity: stockLevel,
            description: "Shopify Changed Sync"
          }
        })
        changedCount++
        console.log(`  -> [NEW SHELF ENTRY] SKU: ${variant.sku} | Name: "${localProduct.name}"`)
        console.log(`     Quantity Sync: Created at ${stockLevel}`)
      }
    }

    console.log(`------------------------------------------------------`)
    console.log(`[Shopify 5-Min Sync] Sync Complete. Updated ${changedCount} stock levels.`)
    console.log(`======================================================\n`)

    if (data.productVariants.pageInfo.hasNextPage) {
      await syncRecentInventoryChanges(data.productVariants.pageInfo.endCursor)
    }
  } catch (error) {
    console.error("[Shopify 5-Min Sync] Error:", error)
  }
}

export const handler = async () => {
  console.log("--- STARTING SHOPIFY ORDER SYNC ---")
  await syncRecentInventoryChanges() // Sync stock for recently changed products
  await getAllOrders()               // Sync orders
  console.log("--- ORDER SYNC COMPLETE ---")
}

