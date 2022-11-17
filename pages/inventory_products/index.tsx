import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "app/core/layouts/Layout"
import getInventory_products from "app/inventory_products/queries/getInventory_products"

const ITEMS_PER_PAGE = 100

export const Inventory_productsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ inventory_products, hasMore }] = usePaginatedQuery(getInventory_products, {
    orderBy: { inventory_product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {inventory_products.map((inventory_product) => (
          <li key={inventory_product.inventory_product_id}>
            <Link
              href={Routes.ShowInventory_productPage({
                inventory_productId: inventory_product.id,
              })}
            >
              <a>{inventory_product.name}</a>
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

const Inventory_productsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Inventory_products</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewInventory_productPage()}>
            <a>Create Inventory_product</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <Inventory_productsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default Inventory_productsPage
