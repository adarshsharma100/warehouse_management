import { Queue } from "quirrel/blitz"
import { syncAllProducts } from "app/orders/functions/fetchAllOrders"

// This job will run automatically once a day at midnight
export default Queue(
  "api/productJobs",
  async () => {
    console.log("--- STARTING DAILY SHOPIFY PRODUCT SYNC ---")
    await syncAllProducts()
    console.log("--- DAILY PRODUCT SYNC COMPLETE ---")
  },
  {
    repeat: {
      cron: "0 0 * * *", // Every day at midnight
    },
  }
)
