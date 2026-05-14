import db from "./index"

async function checkCount() {
  const shopifyCount = await db.shopify.count()
  const productCount = await db.products.count()
  const orderCount = await db.orders.count()
  
  console.log("--- DATABASE STATUS ---")
  console.log(`Shopify Records: ${shopifyCount}`)
  console.log(`Product Records: ${productCount}`)
  console.log(`Total Orders: ${orderCount}`)
  console.log("-----------------------")
}

checkCount()
  .catch((e) => console.error(e))
  .finally(() => process.exit())
