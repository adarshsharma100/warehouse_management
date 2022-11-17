import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getInventory_product from "app/inventory_products/queries/getInventory_product"
import updateInventory_product from "app/inventory_products/mutations/updateInventory_product"
import {
  Inventory_productForm,
  FORM_ERROR,
} from "app/inventory_products/components/Inventory_productForm"

export const EditInventory_product = () => {
  const router = useRouter()
  const inventory_productId = useParam("inventory_productId", "number")
  const [inventory_product, { setQueryData }] = useQuery(
    getInventory_product,
    { inventory_product_id: inventory_productId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateInventory_productMutation] = useMutation(updateInventory_product)

  return (
    <>
      <Head>
        <title>Edit Inventory_product {inventory_product.inventory_product_id}</title>
      </Head>

      <div>
        <h1>Edit Inventory_product {inventory_product.inventory_product_id}</h1>
        <pre>{JSON.stringify(inventory_product, null, 2)}</pre>

        <Inventory_productForm
          submitText="Update Inventory_product"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateInventory_product}
          initialValues={inventory_product}
          onSubmit={async (values) => {
            try {
              const updated = await updateInventory_productMutation({
                id: inventory_product.inventory_product_id,
                ...values,
              })
              await setQueryData(updated)
              await router.push(
                Routes.ShowInventory_productPage({
                  inventory_productId: updated.inventory_product_id,
                })
              )
            } catch (error: any) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </div>
    </>
  )
}

const EditInventory_productPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditInventory_product />
      </Suspense>

      <p>
        <Link href={Routes.Inventory_productsPage()}>
          <a>Inventory_products</a>
        </Link>
      </p>
    </div>
  )
}

EditInventory_productPage.authenticate = true
EditInventory_productPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditInventory_productPage
