import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
import createVendor from "app/vendors/mutations/createVendor"
import { VendorForm, FORM_ERROR } from "app/vendors/components/VendorForm"

const NewVendorPage = () => {
  const router = useRouter()
  const [createVendorMutation] = useMutation(createVendor)

  return (
    <Layout title={"Create New Vendor"}>
      <h1>Create New Vendor</h1>

      <VendorForm
        submitText="Create Vendor"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateVendor}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const vendor = await createVendorMutation(values)
            await router.push(Routes.ShowVendorPage({ vendorId: vendor.id }))
          } catch (error: any) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.VendorsPage()}>
          <a>Vendors</a>
        </Link>
      </p>
    </Layout>
  )
}

NewVendorPage.authenticate = true

export default NewVendorPage
