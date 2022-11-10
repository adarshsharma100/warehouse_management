import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"

const ITEMS_PER_PAGE = 100

export const Purchase_ordersList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ purchase_orders, hasMore }] = usePaginatedQuery(getPurchase_orders, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {purchase_orders.map((purchase_order) => (
          <li key={purchase_order.id}>
            <Link
              href={Routes.ShowPurchase_orderPage({
                purchase_orderId: purchase_order.id,
              })}
            >
              <a>{purchase_order.name}</a>
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

const Purchase_ordersPage = () => {
  return (
    <Layout>
      <Head>
        <title>Purchase_orders</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewPurchase_orderPage()}>
            <a>Create Purchase_order</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <Purchase_ordersList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default Purchase_ordersPage
