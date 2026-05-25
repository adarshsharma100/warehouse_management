require('dotenv').config();
const axios = require('axios');

const storeName = process.env.SHOPIFY_STORE_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

const shopUrl = `https://${storeName}.myshopify.com`;
const endpoint = `${shopUrl}/admin/api/2023-07/graphql.json`;

const query = `
  query getVariant($skuQuery: String!) {
    productVariants(first: 5, query: $skuQuery) {
      nodes {
        id
        sku
        price
        compareAtPrice
        title
        inventoryQuantity
        inventoryItem {
          unitCost {
            amount
          }
        }
        product {
          id
          title
          status
          totalInventory
        }
      }
    }
  }
`;

async function main() {
  const skus = [
    'TIFC00020', 'TIFC00150',
    'DTIFPS0206', 'DTIFPS0226',
    'TIFPS0503', 'TIFPS0507',
    'TIFPS0642', 'TIFPS0644', 'TIFPS0646'
  ];
  for (const sku of skus) {
    console.log(`Querying Shopify for SKU: ${sku}...`);
    const response = await axios.post(
      endpoint,
      {
        query,
        variables: { skuQuery: `sku:${sku}` }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      }
    );
    console.log(JSON.stringify(response.data.data.productVariants.nodes, null, 2));
  }
}

main().catch(console.error);
