import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getBatch from "app/batches/queries/getBatch"
import deleteBatch from "app/batches/mutations/deleteBatch"

export const Batch = () => {
  const router = useRouter()
  const batchId = useParam("batchId", "number")
  const [deleteBatchMutation] = useMutation(deleteBatch)
  const [batch] = useQuery(getBatch, { id: batchId })

  return (
    <>
      <Head>
        <title>Batch {batch.id}</title>
      </Head>

      <div>
        <h1>Batch {batch.id}</h1>
        <pre>{JSON.stringify(batch, null, 2)}</pre>

        <Link href={Routes.EditBatchPage({ batchId: batch.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteBatchMutation({ id: batch.id })
              await router.push(Routes.BatchesPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowBatchPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.BatchesPage()}>
          <a>Batches</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Batch />
      </Suspense>
    </div>
  )
}

ShowBatchPage.authenticate = true
ShowBatchPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowBatchPage
