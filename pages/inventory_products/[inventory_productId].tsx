import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getInventory_product from "app/inventory_products/queries/getInventory_product"
import deleteInventory_product from "app/inventory_products/mutations/deleteInventory_product"

export const Inventory_product = () => {
  const router = useRouter()
  const inventory_productId = useParam("inventory_productId", "number")
  const [deleteInventory_productMutation] = useMutation(deleteInventory_product)
  const [inventory_product] = useQuery(getInventory_product, {
    inventory_product_id: inventory_productId,
  })

  return (
    <>
      <Head>
        <title>Inventory_product {inventory_product.inventory_product_id}</title>
      </Head>

      <div>
        <h1>Inventory_product {inventory_product.inventory_product_id}</h1>
        <pre>{JSON.stringify(inventory_product, null, 2)}</pre>

        <Link
          href={Routes.EditInventory_productPage({
            inventory_productId: inventory_product.inventory_product_id,
          })}
        >
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteInventory_productMutation({
                inventory_product_id: inventory_product.inventory_product_id,
              })
              await router.push(Routes.Inventory_productsPage())
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

const ShowInventory_productPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.Inventory_productsPage()}>
          <a>Inventory_products</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Inventory_product />
      </Suspense>
    </div>
  )
}

ShowInventory_productPage.authenticate = true
ShowInventory_productPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowInventory_productPage
