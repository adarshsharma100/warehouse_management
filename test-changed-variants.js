const { GraphQLClient, gql } = require("graphql-request")

const storeName = "robocraze-com"
const accessToken = "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"
const endpoint = `https://${storeName}.myshopify.com/admin/api/2023-01/graphql.json`

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Access-Token": accessToken,
  },
})

const changedVariantsQuery = gql`
  query productVariants($query: String!) {
    productVariants(first: 10, query: $query) {
      nodes {
        sku
        inventoryQuantity
        product {
          title
        }
      }
    }
  }
`

async function test() {
  try {
    const query = `updated_at:>='2030-01-01'`
    
    console.log(`Querying productVariants with query: "${query}"`)
    const data = await graphQLClient.request(changedVariantsQuery, { query })
    console.log("Result:", JSON.stringify(data, null, 2))
  } catch (err) {
    console.error("Error:", err)
  }
}

test()
