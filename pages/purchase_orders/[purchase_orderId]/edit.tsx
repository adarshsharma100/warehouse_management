import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getPurchase_order from "app/purchase_orders/queries/getPurchase_order"
import updatePurchase_order from "app/purchase_orders/mutations/updatePurchase_order"
import { Purchase_orderForm, FORM_ERROR } from "app/purchase_orders/components/Purchase_orderForm"
import Loading from "components/loading"

export const EditPurchase_order = () => {
  const router = useRouter()
  const purchase_orderId = useParam("purchase_orderId", "number")
  const [purchase_order, { setQueryData }] = useQuery(
    getPurchase_order,
    { po_id: purchase_orderId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updatePurchase_orderMutation] = useMutation(updatePurchase_order)

  return (
    <>
      <Head>
        <title>Edit Purchase_order {purchase_order.po_id}</title>
      </Head>

      <div>
        <h1>Edit Purchase_order {purchase_order.po_id}</h1>
        <pre>{JSON.stringify(purchase_order, null, 2)}</pre>

        <Purchase_orderForm
          submitText="Update Purchase_order"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdatePurchase_order}
          initialValues={purchase_order}
          onSubmit={async (values) => {
            try {
              const updated = await updatePurchase_orderMutation({
                id: purchase_order.po_id,
                ...values,
              })
              await setQueryData(updated)
              await router.push(Routes.ShowPurchase_orderPage({ purchase_orderId: updated.po_id }))
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

const EditPurchase_orderPage = () => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <EditPurchase_order />
      </Suspense>

      <p>
        <Link href={Routes.Purchase_ordersPage()}>
          <a>Purchase_orders</a>
        </Link>
      </p>
    </div>
  )
}

EditPurchase_orderPage.authenticate = true
EditPurchase_orderPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditPurchase_orderPage
