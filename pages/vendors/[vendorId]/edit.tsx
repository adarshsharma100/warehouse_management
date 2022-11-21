import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getVendor from "app/vendors/queries/getVendor"
import updateVendor from "app/vendors/mutations/updateVendor"
import { VendorForm, FORM_ERROR } from "app/vendors/components/VendorForm"
import Loading from "components/loading"

export const EditVendor = () => {
  const router = useRouter()
  const vendorId = useParam("vendorId", "number")
  const [vendor, { setQueryData }] = useQuery(
    getVendor,
    { id: vendorId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateVendorMutation] = useMutation(updateVendor)

  return (
    <>
      <Head>
        <title>Edit Vendor {vendor.id}</title>
      </Head>

      <div>
        <h1>Edit Vendor {vendor.id}</h1>
        <pre>{JSON.stringify(vendor, null, 2)}</pre>

        <VendorForm
          submitText="Update Vendor"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateVendor}
          initialValues={vendor}
          onSubmit={async (values) => {
            try {
              const updated = await updateVendorMutation({
                id: vendor.id,
                ...values,
              })
              await setQueryData(updated)
              router.push(Routes.ShowVendorPage({ vendorId: updated.id }))
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

const EditVendorPage = () => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <EditVendor />
      </Suspense>

      <p>
        <Link href={Routes.VendorsPage()}>
          <a>Vendors</a>
        </Link>
      </p>
    </div>
  )
}

EditVendorPage.authenticate = true
EditVendorPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditVendorPage
