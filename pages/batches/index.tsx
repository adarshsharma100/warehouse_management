import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getBatches from "app/batches/queries/getBatches"

const ITEMS_PER_PAGE = 100

export const BatchesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ batches, hasMore }] = usePaginatedQuery(getBatches, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {batches.map((batch) => (
          <li key={batch.id}>
            <Link href={Routes.ShowBatchPage({ batchId: batch.id })}>
              <a>{batch.name}</a>
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

const BatchesPage = () => {
  return (
    <Layout>
      <Head>
        <title>Batches</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewBatchPage()}>
            <a>Create Batch</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <BatchesList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default BatchesPage
