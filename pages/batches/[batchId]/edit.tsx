import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getBatch from "app/batches/queries/getBatch"
import updateBatch from "app/batches/mutations/updateBatch"
import { BatchForm, FORM_ERROR } from "app/batches/components/BatchForm"

export const EditBatch = () => {
  const router = useRouter()
  const batchId = useParam("batchId", "number")
  const [batch, { setQueryData }] = useQuery(
    getBatch,
    { id: batchId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateBatchMutation] = useMutation(updateBatch)

  return (
    <>
      <Head>
        <title>Edit Batch {batch.id}</title>
      </Head>

      <div>
        <h1>Edit Batch {batch.id}</h1>
        <pre>{JSON.stringify(batch, null, 2)}</pre>

        <BatchForm
          submitText="Update Batch"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateBatch}
          initialValues={batch}
          onSubmit={async (values) => {
            try {
              const updated = await updateBatchMutation({
                id: batch.id,
                ...values,
              })
              await setQueryData(updated)
              await router.push(Routes.ShowBatchPage({ batchId: updated.id }))
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

const EditBatchPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditBatch />
      </Suspense>

      <p>
        <Link href={Routes.BatchesPage()}>
          <a>Batches</a>
        </Link>
      </p>
    </div>
  )
}

EditBatchPage.authenticate = true
EditBatchPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditBatchPage
