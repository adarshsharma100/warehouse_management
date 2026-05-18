import { GraphQLClient, gql } from "graphql-request"

const endpoint = `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2023-01/graphql.json`

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || "",
  },
})

// Query to get the Inventory Item ID based on SKU
const getVariantBySkuQuery = gql`
  query productVariantBySku($query: String!) {
    productVariants(first: 1, query: $query) {
      nodes {
        id
        inventoryItem {
          id
        }
      }
    }
  }
`

// Query to get the primary Location ID
const getLocationsQuery = gql`
  query {
    locations(first: 1) {
      nodes {
        id
      }
    }
  }
`

// Mutation to set the inventory quantity
const setQuantityMutation = gql`
  mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup {
        createdAt
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const pushStockToShopify = async (sku: string, newQuantity: number) => {
  try {
    if (!process.env.SHOPIFY_STORE_NAME || !process.env.SHOPIFY_ACCESS_TOKEN) {
      console.warn("Shopify credentials missing. Cannot push stock.")
      return false
    }

    // 1. Get Location ID (We just use the first location for now)
    const locationData = await graphQLClient.request(getLocationsQuery)
    const locationId = locationData?.locations?.nodes?.[0]?.id

    if (!locationId) {
      console.error("No Shopify location found.")
      return false
    }

    // 2. Get Inventory Item ID for this SKU
    const variantData = await graphQLClient.request(getVariantBySkuQuery, { query: `sku:${sku}` })
    const inventoryItemId = variantData?.productVariants?.nodes?.[0]?.inventoryItem?.id

    if (!inventoryItemId) {
      console.warn(`SKU ${sku} not found on Shopify. Cannot push stock.`)
      return false
    }

    // 3. Push the new quantity to Shopify
    const input = {
      name: "available",
      reason: "correction",
      ignoreCompareQuantity: true,
      quantities: [
        {
          inventoryItemId: inventoryItemId,
          locationId: locationId,
          quantity: newQuantity,
        },
      ],
    }

    const result = await graphQLClient.request(setQuantityMutation, { input })
    
    if (result.inventorySetQuantities?.userErrors?.length > 0) {
      console.error("Shopify Stock Sync Errors:", result.inventorySetQuantities.userErrors)
      return false
    }

    console.log(`Successfully pushed stock update to Shopify: ${sku} -> ${newQuantity}`)
    return true
  } catch (error) {
    console.error("Error pushing stock to Shopify:", error)
    return false
  }
}
