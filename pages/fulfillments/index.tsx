import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getFulfillments from "app/fulfillments/queries/getFulfillments"

const ITEMS_PER_PAGE = 100

export const FulfillmentsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ fulfillments, hasMore }] = usePaginatedQuery(getFulfillments, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {fulfillments.map((fulfillment) => (
          <li key={fulfillment.id}>
            <Link href={Routes.ShowFulfillmentPage({ fulfillmentId: fulfillment.id })}>
              <a>{fulfillment.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const FulfillmentsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Fulfillments</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewFulfillmentPage()}>
            <a>Create Fulfillment</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <FulfillmentsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default FulfillmentsPage
