const fs = require("fs");
const path = require("path");

// Read .env file manually
try {
  const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf-8");
  envContent.split("\n").forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = value;
    }
  });
} catch (e) {
  console.error("Failed to read .env file:", e);
}

const { GraphQLClient, gql } = require("graphql-request")

const storeName = process.env.SHOPIFY_STORE_NAME
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN
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
