import { getSession } from "@blitzjs/auth"
import { NextApiRequest, NextApiResponse } from "next"
import { GraphQLClient, gql } from "graphql-request"

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

const customersQuery = gql`
  query customers($after: String) {
    customers(first: 250, after: $after) {
      nodes {
        id
        displayName
        email
        addresses {
          address1
          address2
          city
          country
          province
          provinceCode
          zip
        }
      }
    }
  }
`

const getAllCustomers = async (customers = [], after = null, timeout = 2000) => {
  console.log(`Completed: ${customers.length}`)
  try {
    await sleep(timeout)
    const data = await graphQLClient.request(customersQuery, after ? { after } : {})
    if (data?.customers?.nodes?.length) {
      const lastCustomer = data.customers.nodes[data.customers.nodes.length - 1]
      return await getAllCustomers(
        [...customers, ...data.customers.nodes],
        lastCustomer.cursor,
        timeout
      )
    }
    return customers?.nodes
  } catch (error) {
    console.log("error! ", error)
    console.log("timeout: ", timeout)
    return getAllCustomers(customers, after, timeout + 100)
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("here")
  const customers = await getAllCustomers()
  console.log("customers: ", customers)
  // const session = await getSession(req, res)
  // if (req.method === "GET") {
  //   if (session.$isAuthorized()) {
  //     console.log("here")
  //   } else {
  //     res.status(404)
  //   }
  // } else {
  //   // Handle any other HTTP method
  //   res.status(404)
  // }
}
export default handler
