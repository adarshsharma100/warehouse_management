import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
import createVendor_product from "app/vendor_products/mutations/createVendor_product"
import { Vendor_productForm, FORM_ERROR } from "app/vendor_products/components/Vendor_productForm"

const NewVendor_productPage = () => {
  const router = useRouter()
  const [createVendor_productMutation] = useMutation(createVendor_product)

  return (
    <Layout title={"Create New Vendor_product"}>
      <h1>Create New Vendor_product</h1>

      <Vendor_productForm
        submitText="Create Vendor_product"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateVendor_product}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const vendor_product = await createVendor_productMutation(values)
            await router.push(
              Routes.ShowVendor_productPage({
                vendor_productId: vendor_product.id,
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

      <p>
        <Link href={Routes.Vendor_productsPage()}>
          <a>Vendor_products</a>
        </Link>
      </p>
    </Layout>
  )
}

NewVendor_productPage.authenticate = true

export default NewVendor_productPage
