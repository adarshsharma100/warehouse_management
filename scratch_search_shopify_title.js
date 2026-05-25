require('dotenv').config();
const axios = require('axios');

const storeName = process.env.SHOPIFY_STORE_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

const shopUrl = `https://${storeName}.myshopify.com`;
const endpoint = `${shopUrl}/admin/api/2023-07/graphql.json`;

const query = `
  query searchProducts($titleQuery: String!) {
    products(first: 5, query: $titleQuery) {
      nodes {
        id
        title
        status
        variants(first: 10) {
          nodes {
            id
            sku
            price
            compareAtPrice
            inventoryItem {
              unitCost {
                amount
              }
            }
          }
        }
      }
    }
  }
`;

async function main() {
  const title = '3.3V Small Piezo Buzzer';
  console.log(`Searching Shopify for title: "${title}"...`);
  const response = await axios.post(
    endpoint,
    {
      query,
      variables: { titleQuery: `title:"${title}"` }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    }
  );
  console.log(JSON.stringify(response.data.data.products.nodes, null, 2));
}

main().catch(console.error);
