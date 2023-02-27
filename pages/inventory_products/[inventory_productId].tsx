import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "layouts/Layout"
import getInventory_product from "app/inventory_products/queries/getInventory_product"
import deleteInventory_product from "app/inventory_products/mutations/deleteInventory_product"
import Loading from "components/loading"
import Image from "next/image"

export const Inventory_product = () => {
  const router = useRouter()
  const inventory_productId = useParam("inventory_productId", "number")
  const [deleteInventory_productMutation] = useMutation(deleteInventory_product)
  const [inventory_product] = useQuery(getInventory_product, {
    inventory_product_id: inventory_productId,
  })

  const {
    inventory_product_id: ProductID,
    product_description,
    price,
    quantity,
    products_product_id,
    created_at,
    good_stock,
    bad_stock,
    products: { product_id, name, description, product_type, products_sku, Price, product_unit },
  } = inventory_product

  return (
    <>
      <Head>
        <title>{products_sku}</title>
      </Head>

      <div>
        <h1 className="inventoryName">{name}</h1>
        <div className="flex  h-full" style={{ height: "100px" }}>
          <section className="border-1  h-full">
            {/* <img src="https://picsum.photos/id/237/200/300" height="90vh" width="90vw" alt="logo" />  */}
          </section>
          <section className="border-1 "></section>
        </div>
      </div>
    </>
  )
}

const ShowInventory_productPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Inventory_product />
      </Layout>
    </Suspense>
  )
}

// ShowInventory_productPage.authenticate = true
// ShowInventory_productPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowInventory_productPage
