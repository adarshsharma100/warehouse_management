import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
import createInventory_product from "app/inventory_products/mutations/createInventory_product"
import {
  Inventory_productForm,
  FORM_ERROR,
} from "app/inventory_products/components/Inventory_productForm"

const NewInventory_productPage = () => {
  const router = useRouter()
  const [createInventory_productMutation] = useMutation(createInventory_product)

  return (
    <Layout title={"Create New Inventory_product"}>
      <h1>Create New Inventory_product</h1>

      <Inventory_productForm
        submitText="Create Inventory_product"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateInventory_product}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            // testing with hardcoded values
            // const values = {
            //   inventory_product_id: 1,
            //   product_description: "inventory product description",
            //   price: 222,
            //   quantity: 22,
            //   products_product_id: 1,
            // }
            const inventory_product = await createInventory_productMutation(values)
            await router.push(
              Routes.ShowInventory_productPage({
                inventory_productId: inventory_product.inventory_product_id,
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
        <Link href={Routes.Inventory_productsPage()}>
          <a>Inventory_products</a>
        </Link>
      </p>
    </Layout>
  )
}

NewInventory_productPage.authenticate = true

export default NewInventory_productPage
