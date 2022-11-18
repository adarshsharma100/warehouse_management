import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getProduct from "app/products/queries/getProduct"
import deleteProduct from "app/products/mutations/deleteProduct"

export const Product = () => {
  const router = useRouter()
  const productId = useParam("productId", "number")
  const [deleteProductMutation] = useMutation(deleteProduct)
  const [product] = useQuery(getProduct, { id: productId })

  return (
    <>
      <Head>
        <title>Product {product.id}</title>
      </Head>

      <div>
        <h1>Product {product.id}</h1>
        <pre>{JSON.stringify(product, null, 2)}</pre>

        <Link href={Routes.EditProductPage({ productId: product.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteProductMutation({ id: product.id })
              await router.push(Routes.ProductsPage())
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

const ShowProductPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.ProductsPage()}>
          <a>Products</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Product />
      </Suspense>
    </div>
  )
}

ShowProductPage.authenticate = true
ShowProductPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowProductPage
