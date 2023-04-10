import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
import createFulfillment from "app/fulfillments/mutations/createFulfillment"
import { FulfillmentForm, FORM_ERROR } from "app/fulfillments/components/FulfillmentForm"

const NewFulfillmentPage = () => {
  const router = useRouter()
  const [createFulfillmentMutation] = useMutation(createFulfillment)

  return (
    <Layout title={"Create New Fulfillment"}>
      <h1>Create New Fulfillment</h1>

      <FulfillmentForm
        submitText="Create Fulfillment"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateFulfillment}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const fulfillment = await createFulfillmentMutation(values)
            await router.push(Routes.ShowFulfillmentPage({ fulfillmentId: fulfillment.id }))
          } catch (error: any) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.FulfillmentsPage()}>
          <a>Fulfillments</a>
        </Link>
      </p>
    </Layout>
  )
}

NewFulfillmentPage.authenticate = true

export default NewFulfillmentPage
