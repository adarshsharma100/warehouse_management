import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getFulfillment from "app/fulfillments/queries/getFulfillment"
import updateFulfillment from "app/fulfillments/mutations/updateFulfillment"
import { FulfillmentForm, FORM_ERROR } from "app/fulfillments/components/FulfillmentForm"

export const EditFulfillment = () => {
  const router = useRouter()
  const fulfillmentId = useParam("fulfillmentId", "number")
  const [fulfillment, { setQueryData }] = useQuery(
    getFulfillment,
    { id: fulfillmentId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateFulfillmentMutation] = useMutation(updateFulfillment)

  return (
    <>
      <Head>
        <title>Edit Fulfillment {fulfillment.id}</title>
      </Head>

      <div>
        <h1>Edit Fulfillment {fulfillment.id}</h1>
        <pre>{JSON.stringify(fulfillment, null, 2)}</pre>

        <FulfillmentForm
          submitText="Update Fulfillment"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateFulfillment}
          initialValues={fulfillment}
          onSubmit={async (values) => {
            try {
              const updated = await updateFulfillmentMutation({
                id: fulfillment.id,
                ...values,
              })
              await setQueryData(updated)
              await router.push(Routes.ShowFulfillmentPage({ fulfillmentId: updated.id }))
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

const EditFulfillmentPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditFulfillment />
      </Suspense>

      <p>
        <Link href={Routes.FulfillmentsPage()}>
          <a>Fulfillments</a>
        </Link>
      </p>
    </div>
  )
}

EditFulfillmentPage.authenticate = true
EditFulfillmentPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditFulfillmentPage
