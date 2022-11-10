import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getVendor_product from "app/vendor_products/queries/getVendor_product"
import updateVendor_product from "app/vendor_products/mutations/updateVendor_product"
import { Vendor_productForm, FORM_ERROR } from "app/vendor_products/components/Vendor_productForm"

export const EditVendor_product = () => {
  const router = useRouter()
  const vendor_productId = useParam("vendor_productId", "number")
  const [vendor_product, { setQueryData }] = useQuery(
    getVendor_product,
    { id: vendor_productId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateVendor_productMutation] = useMutation(updateVendor_product)

  return (
    <>
      <Head>
        <title>Edit Vendor_product {vendor_product.id}</title>
      </Head>

      <div>
        <h1>Edit Vendor_product {vendor_product.id}</h1>
        <pre>{JSON.stringify(vendor_product, null, 2)}</pre>

        <Vendor_productForm
          submitText="Update Vendor_product"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateVendor_product}
          initialValues={vendor_product}
          onSubmit={async (values) => {
            try {
              const updated = await updateVendor_productMutation({
                id: vendor_product.id,
                ...values,
              })
              await setQueryData(updated)
              await router.push(Routes.ShowVendor_productPage({ vendor_productId: updated.id }))
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

const EditVendor_productPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditVendor_product />
      </Suspense>

      <p>
        <Link href={Routes.Vendor_productsPage()}>
          <a>Vendor_products</a>
        </Link>
      </p>
    </div>
  )
}

EditVendor_productPage.authenticate = true
EditVendor_productPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditVendor_productPage
