import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
import createBatch from "app/batches/mutations/createBatch"
import { BatchForm, FORM_ERROR } from "app/batches/components/BatchForm"

const NewBatchPage = () => {
  const router = useRouter()
  const [createBatchMutation] = useMutation(createBatch)

  return (
    <Layout title={"Create New Batch"}>
      <h1>Create New Batch</h1>

      <BatchForm
        submitText="Create Batch"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateBatch}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const batch = await createBatchMutation(values)
            await router.push(Routes.ShowBatchPage({ batchId: batch.id }))
          } catch (error: any) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.BatchesPage()}>
          <a>Batches</a>
        </Link>
      </p>
    </Layout>
  )
}

NewBatchPage.authenticate = true

export default NewBatchPage
