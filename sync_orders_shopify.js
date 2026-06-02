// sync_orders_shopify.js
// Standalone script to sync Shopify orders and variant inventories.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { GraphQLClient, gql } = require('graphql-request');

const prisma = new PrismaClient();

const store = process.env.SHOPIFY_STORE_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

if (!store || !accessToken) {
  console.error('Shopify credentials missing in .env');
  process.exit(1);
}

const hostName = store + ".myshopify.com";
const apiVersion = "2023-01";
const apiLocation = "/admin/api/";
const endpoint = "https://" + hostName + apiLocation + apiVersion + "/graphql.json";

const header = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": accessToken,
};

const graphQLClient = new GraphQLClient(endpoint, {
  headers: JSON.parse(JSON.stringify(header)),
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ordersQuery = gql`
  query orders($query: String, $after: String) {
    orders(first: 50, query: $query, after: $after) {
      nodes {
        id
        name
        displayFinancialStatus
        statusPageUrl
        sourceName
        lineItems(first: 40) {
          nodes {
            sku
            quantity
            discountedTotalSet {
              presentmentMoney {
                amount
              }
              shopMoney {
                amount
              }
            }
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
        totalDiscountsSet {
          shopMoney {
            amount
          }
        }
        customAttributes {
          key
          value
        }
        displayFulfillmentStatus
        cancelledAt
        transactions(first: 5) {
          id
          gateway
          status
          receiptJson
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

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
`;

// Helper: safe order creation function
async function createOrderFunction(input) {
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
      shopifyOrderNumber,
      orderStatusUrl,
      sourceName,
      gstNumber,
      paymentTermsId,
      paymentReferenceId,
      discountAmount,
      payment_method,
      paymentMethodId,
      channelCreatedAt,
    },
  } = input;

  try {
    const existingShopifyOrder = await prisma.shopify.findFirst({
      where: { orderId: shopifyId }
    });
    if (existingShopifyOrder) {
      console.log(`Order ${shopifyId} already exists in database. Skipping duplicate.`);
      return;
    }

    const createShopify = await prisma.shopify.create({
      data: {
        orderId: shopifyId,
        orderNumber: shopifyOrderNumber || shopifyId,
        orderStatusUrl: orderStatusUrl || shopifyId,
        sourceName: sourceName || null,
      },
    });

    const customer = await prisma.customers.create({
      data: input.customer,
    });

    const ShippingAddress = await prisma.addresses.create({
      data: shippingAddress,
    });

    const BillingAddress =
      !isShippingIsBilling && (await prisma.addresses.create({ data: billingAddress }));

    const order = await prisma.orders.create({
      data: {
        shopifyId: createShopify.id,
        orderStatus,
        paymentStatus: parseInt(paymentStatus) || 1,
        totalPrice,
        gateway: gateway?.substring(0, 45),
        customerId: customer.id,
        shippingAddressId: ShippingAddress.id,
        billingAddressId: isShippingIsBilling ? ShippingAddress.id : BillingAddress.id,
        order_items,
        gstNumber,
        paymentTermsId,
        paymentReferenceId,
        discountAmount,
        payment_method,
        paymentMethodId,
        channelCreatedAt: channelCreatedAt ? new Date(channelCreatedAt) : undefined,
      },
    });
    console.log(`Successfully synced order ${shopifyOrderNumber} to DB.`);
  } catch (error) {
    console.error("Error creating order:", error);
  }
}

async function syncRecentInventoryChanges(lastSyncTime) {
  try {
    const isoString = lastSyncTime.toISOString();
    const query = `updated_at:>='${isoString}'`;

    console.log(`\n======================================================`);
    console.log(`[Shopify 5-Min Sync] Checking for stock updates since: ${isoString}`);
    console.log(`======================================================`);
    
    let after = null;
    let keepFetching = true;

    while (keepFetching) {
      const data = await graphQLClient.request(changedVariantsQuery, { query, after });

      if (!data?.productVariants?.nodes?.length) {
        console.log("[Shopify 5-Min Sync] No inventory changes found on Shopify.");
        console.log(`======================================================\n`);
        break;
      }

      console.log(`[Shopify 5-Min Sync] Found ${data.productVariants.nodes.length} potential stock adjustments on Shopify. Processing...`);

      let changedCount = 0;

      for (const variant of data.productVariants.nodes) {
        if (!variant.sku) continue;

        const localProduct = await prisma.products.findFirst({
          where: { sku: variant.sku }
        });

        if (!localProduct) {
          console.log(`[Shopify 5-Min Sync] local SKU ${variant.sku} not found in warehouse. Skipping.`);
          continue;
        }

        const stockLevel = variant.inventoryQuantity || 0;

        const inventoryRecord = await prisma.inventory_products.findFirst({
          where: { product: localProduct.id, shelf: 1 }
        });

        if (inventoryRecord) {
          if (inventoryRecord.quantity !== stockLevel) {
            const oldQty = inventoryRecord.quantity;
            await prisma.inventory_products.update({
              where: { id: inventoryRecord.id },
              data: { quantity: stockLevel }
            });
            changedCount++;
            console.log(`  -> [CHANGED] SKU: ${variant.sku} | Name: "${localProduct.name}"`);
            console.log(`     Quantity Sync: ${oldQty} -> ${stockLevel}`);
          }
        } else {
          await prisma.inventory_products.create({
            data: {
              product: localProduct.id,
              shelf: 1,
              quantity: stockLevel,
              description: "Shopify Changed Sync"
            }
          });
          changedCount++;
          console.log(`  -> [NEW SHELF ENTRY] SKU: ${variant.sku} | Name: "${localProduct.name}"`);
          console.log(`     Quantity Sync: Created at ${stockLevel}`);
        }
      }

      console.log(`------------------------------------------------------`);
      console.log(`[Shopify 5-Min Sync] Sync Complete. Updated ${changedCount} stock levels.`);
      console.log(`======================================================\n`);

      if (data.productVariants.pageInfo.hasNextPage) {
        after = data.productVariants.pageInfo.endCursor;
      } else {
        keepFetching = false;
      }
    }
  } catch (error) {
    console.error("[Shopify 5-Min Sync] Error:", error);
  }
}

async function getAllOrders(queryStr, after = null, timeout = 100) {
  try {
    await sleep(timeout);

    const data = await graphQLClient.request(ordersQuery, { query: queryStr, after });
    
    if (!data?.orders?.nodes?.length) {
      console.log("No more orders found on Shopify.");
      return;
    }

    console.log(`Processing batch of ${data.orders.nodes.length} orders...`);
    
    for (const order of data.orders.nodes) {
      try {
        const { customer, shippingAddress, billingAddress, lineItems } = order;

        const existingShopify = await prisma.shopify.findFirst({
          where: { orderId: order.id },
          include: { orders: true }
        });
        if (existingShopify) {
          const localOrder = existingShopify.orders[0];
          if (localOrder) {
            let needsUpdate = false;
            const updateData = {};

            // 1. Check order status
            let targetStatus = localOrder.orderStatus;
            if (order.cancelledAt) {
              targetStatus = 6; // CANCELLED
            } else if (order.displayFulfillmentStatus === 'FULFILLED' && localOrder.orderStatus < 4) {
              targetStatus = 4; // SHIPPED
            }

            if (localOrder.orderStatus !== targetStatus) {
              updateData.orderStatus = targetStatus;
              needsUpdate = true;
            }

            // 2. Check payment status
            const targetPaymentStatus = order.displayFinancialStatus === "PAID" ? 2 : 1;
            if (localOrder.paymentStatus !== targetPaymentStatus) {
              updateData.paymentStatus = targetPaymentStatus;
              needsUpdate = true;
            }

            // 3. Update order if needed
            if (needsUpdate) {
              await prisma.orders.update({
                where: { id: localOrder.id },
                data: updateData
              });
              console.log(`Updated existing order #${localOrder.id} (Shopify #${order.name}): status=${targetStatus}, paymentStatus=${targetPaymentStatus}`);
            }

            // 4. Backfill invoice URL if missing
            if (order.statusPageUrl && (!existingShopify.orderStatusUrl || !existingShopify.orderStatusUrl.startsWith('http'))) {
              await prisma.shopify.update({
                where: { id: existingShopify.id },
                data: { orderStatusUrl: order.statusPageUrl }
              });
              console.log(`Backfilled invoice URL for order #${localOrder.id} (Shopify #${order.name})`);
            }

            // 5. Backfill sourceName if missing
            if (order.sourceName && !existingShopify.sourceName) {
              await prisma.shopify.update({
                where: { id: existingShopify.id },
                data: { sourceName: order.sourceName }
              });
              console.log(`Backfilled sourceName for order #${localOrder.id} (Shopify #${order.name}): ${order.sourceName}`);
            }
          }
          continue;
        }

        console.log(`Syncing Order: ${order.id}`);

        // Parse discountAmount
        let discountAmount = 0;
        if (order.totalDiscountsSet?.shopMoney?.amount) {
          discountAmount = Math.round(parseFloat(order.totalDiscountsSet.shopMoney.amount));
        }
        if (discountAmount === 0 && order.customAttributes) {
          const discountAttr = order.customAttributes.find(attr => attr.key.toLowerCase() === 'discount');
          if (discountAttr && discountAttr.value) {
            const matched = discountAttr.value.match(/(\d+)/);
            if (matched) {
              discountAmount = parseInt(matched[1], 10);
            }
          }
        }

        // Parse gstNumber
        let gstNumber = null;
        if (order.customAttributes) {
          const gstAttr = order.customAttributes.find(attr => 
            attr.key.toLowerCase() === 'gst number' || 
            attr.key.toLowerCase() === 'customergstin'
          );
          if (gstAttr && gstAttr.value) {
            gstNumber = gstAttr.value.trim();
          }
        }

        // Parse paymentReferenceId
        let paymentReferenceId = null;
        if (order.transactions && order.transactions.length > 0) {
          const successfulTx = order.transactions.find(t => t.status === 'SUCCESS') || order.transactions[0];
          if (successfulTx) {
            if (successfulTx.receiptJson) {
              try {
                const receipt = JSON.parse(successfulTx.receiptJson);
                paymentReferenceId = receipt.payment_id || receipt.transaction_id || receipt.cf_payment_id || receipt.bank_reference || receipt.authorization;
              } catch (e) {}
            }
            if (!paymentReferenceId) {
              paymentReferenceId = successfulTx.id?.replace("gid://shopify/OrderTransaction/", "");
            }
          }
        }
        
        let productList = [];
        for (const item of lineItems.nodes) {
          if (!item.sku) {
            console.log(`Skipping item without SKU in order ${order.id}`);
            continue;
          }

          const price = item.product?.priceRange?.maxVariantPrice?.amount ? parseInt(item.product?.priceRange?.maxVariantPrice?.amount) : 0;
          const product = await prisma.products.upsert({
            where: { sku: item.sku },
            update: {},
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
          });

          const stockLevel = item.variant?.inventoryQuantity || 0;
          const inventoryRecord = await prisma.inventory_products.findFirst({
            where: { product: product.id, shelf: 1 }
          });

          if (inventoryRecord) {
            await prisma.inventory_products.update({
              where: { id: inventoryRecord.id },
              data: { quantity: stockLevel }
            });
          } else {
            await prisma.inventory_products.create({
              data: {
                product: product.id,
                shelf: 1,
                quantity: stockLevel,
                description: "Shopify Synced"
              }
            });
          }

          productList.push({ ...item, productId: product.id });
        }

        const newOrderObject = {
          customer: {
            firstName: customer?.firstName || "",
            lastName: customer?.lastName || "",
            shopifyId: customer?.id || "",
            addresses: {
              create: {
                areaStreet: customer?.defaultAddress?.address1 || "",
                landmarkName: customer?.defaultAddress?.address2 || "",
                cityCountryProvince: customer?.defaultAddress?.city || "",
                state: customer?.defaultAddress?.province || "",
                pincode: customer?.defaultAddress?.zip || "",
                country: 1,
                contact_number: { create: [{ type: "mobile", number: customer?.defaultAddress?.phone || "" }] },
              },
            },
          },
          order: {
            shopifyId: order.id,
            orderStatusUrl: order.statusPageUrl || "",
            shopifyOrderNumber: order.name?.replace("#", ""),
            sourceName: order.sourceName || "",
            orderStatus: order.cancelledAt ? 6 : (order.displayFulfillmentStatus === 'FULFILLED' ? 4 : 1),
            isShippingIsBilling: false,
            channelCreatedAt: order.createdAt,
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
            totalPrice: parseInt(order.totalPrice || "0"),
            gateway: order.paymentGatewayNames?.join(",").substring(0, 45) || "",
            discountAmount,
            gstNumber,
            paymentReferenceId,
            order_items: {
              create: productList.map((p) => ({
                product: p.productId,
                quantity: p.quantity,
                price: parseInt(p.discountedTotalSet?.shopMoney?.amount || "0"),
              })),
            },
          },
        };

        await createOrderFunction(newOrderObject);
      } catch (orderError) {
        console.error(`Error processing Shopify order ${order.id}:`, orderError);
      }
    }

    if (data.orders.pageInfo.hasNextPage) {
      return await getAllOrders(
        queryStr,
        data.orders.pageInfo.endCursor,
        timeout
      );
    }
  } catch (error) {
    console.error("Order Sync Error:", error);
    if (timeout < 5000) {
      console.log(`Retrying after error with increased timeout of ${timeout + 500}ms...`);
      return getAllOrders(queryStr, after, timeout + 500);
    } else {
      console.error("Max retries exceeded. Aborting sync job.");
      throw error;
    }
  }
}

async function main() {
  console.log("--- STARTING STANDALONE SHOPIFY ORDER/INVENTORY SYNC ---");
  
  // Register sync job in DB
  const firstUser = await prisma.user.findFirst();
  const userId = firstUser ? firstUser.id : 1;

  const record = await prisma.jobs.create({
    data: {
      jobTypesId: 2, // Shopify Order Sync
      userId: userId,
      isRunning: true,
      isCompleted: false,
    }
  });

  try {
    const lastJob = await prisma.jobs.findFirst({
      where: { jobTypesId: 2, isCompleted: true, id: { lt: record.id } },
      orderBy: { id: "desc" }
    });

    const lastSyncTime = lastJob ? new Date(lastJob.createdAt) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const isoString = lastSyncTime.toISOString();
    const queryStr = `created_at:>='${isoString}'`;

    console.log(`[Shopify Sync] Fetching orders created since: ${isoString}`);

    await syncRecentInventoryChanges(lastSyncTime);
    await getAllOrders(queryStr);
    
    await prisma.jobs.update({
      where: { id: record.id },
      data: {
        isRunning: false,
        isCompleted: true,
      }
    });
    console.log("--- ORDER/INVENTORY SYNC COMPLETE ---");
    await cleanupJobs(2, record.id);
  } catch (err) {
    console.error("Sync run failed:", err);
    await prisma.jobs.update({
      where: { id: record.id },
      data: {
        isRunning: false,
        isCompleted: true,
      }
    });
    await cleanupJobs(2, record.id);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupJobs(jobTypesId, currentJobId) {
  try {
    // 1. Delete failed/incomplete jobs older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await prisma.jobs.deleteMany({
      where: {
        jobTypesId,
        isCompleted: false,
        createdAt: { lt: oneHourAgo },
        id: { not: currentJobId }
      }
    });

    // 2. Keep only one successful job per calendar day
    const successfulJobs = await prisma.jobs.findMany({
      where: {
        jobTypesId,
        isCompleted: true
      },
      orderBy: { id: 'desc' }
    });

    const keepIds = new Set();
    const seenDays = new Set();

    if (successfulJobs.length > 0) {
      // Always keep the absolute most recent successful job
      const latestJob = successfulJobs[0];
      keepIds.add(latestJob.id);
      
      const latestDateStr = new Date(latestJob.createdAt).toISOString().split('T')[0];
      seenDays.add(latestDateStr);

      for (let i = 1; i < successfulJobs.length; i++) {
        const job = successfulJobs[i];
        const dayStr = new Date(job.createdAt).toISOString().split('T')[0];
        if (!seenDays.has(dayStr)) {
          seenDays.add(dayStr);
          keepIds.add(job.id);
        }
      }

      const allIds = successfulJobs.map(j => j.id);
      const deleteIds = allIds.filter(id => !keepIds.has(id));

      if (deleteIds.length > 0) {
        await prisma.jobs.deleteMany({
          where: {
            id: { in: deleteIds }
          }
        });
        console.log(`[Cleanup] Deleted ${deleteIds.length} redundant job instances of type ${jobTypesId}.`);
      }
    }
  } catch (error) {
    console.error('[Cleanup] Error cleaning up jobs:', error);
  }
}

main();
