import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getFulfillment from "app/fulfillments/queries/getFulfillment"
import deleteFulfillment from "app/fulfillments/mutations/deleteFulfillment"

export const Fulfillment = () => {
  const router = useRouter()
  const fulfillmentId = useParam("fulfillmentId", "number")
  const [deleteFulfillmentMutation] = useMutation(deleteFulfillment)
  const [fulfillment] = useQuery(getFulfillment, { id: fulfillmentId })

  return (
    <>
      <Head>
        <title>Fulfillment {fulfillment.id}</title>
      </Head>

      <div>
        <h1>Fulfillment {fulfillment.id}</h1>
        <pre>{JSON.stringify(fulfillment, null, 2)}</pre>

        <Link href={Routes.EditFulfillmentPage({ fulfillmentId: fulfillment.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteFulfillmentMutation({ id: fulfillment.id })
              await router.push(Routes.FulfillmentsPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowFulfillmentPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.FulfillmentsPage()}>
          <a>Fulfillments</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Fulfillment />
      </Suspense>
    </div>
  )
}

ShowFulfillmentPage.authenticate = true
ShowFulfillmentPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowFulfillmentPage
