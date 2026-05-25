require('dotenv').config();
const axios = require('axios');

const storeName = process.env.SHOPIFY_STORE_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

const shopUrl = `https://${storeName}.myshopify.com`;
const baseEndpoint = `${shopUrl}/admin/api/2023-07/products.json?limit=1`;

async function main() {
  const url = `${baseEndpoint}&fields=id,title,variants`;
  const response = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
  });
  console.log(JSON.stringify(response.data.products[0], null, 2));
}

main().catch(console.error);
