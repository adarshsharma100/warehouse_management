import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import { Purchase_orderForm, FORM_ERROR } from "app/purchase_orders/components/Purchase_orderForm"

const NewPurchase_orderPage = () => {
  const router = useRouter()
  const [createPurchase_orderMutation] = useMutation(createPurchase_order)

  return (
    <Layout title={"Create New Purchase_order"}>
      <h1>Create New Purchase_order</h1>

      <Purchase_orderForm
        submitText="Create Purchase_order"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreatePurchase_order}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const purchase_order = await createPurchase_orderMutation(values)
            await router.push(
              Routes.ShowPurchase_orderPage({
                purchase_orderId: purchase_order.po_id,
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
        <Link href={Routes.Purchase_ordersPage()}>
          <a>Purchase_orders</a>
        </Link>
      </p>
    </Layout>
  )
}

NewPurchase_orderPage.authenticate = true

export default NewPurchase_orderPage
