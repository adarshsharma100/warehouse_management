import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getRfq from "app/rfqs/queries/getRfq"
import deleteRfq from "app/rfqs/mutations/deleteRfq"

export const Rfq = () => {
  const router = useRouter()
  const rfqId = useParam("rfqId", "number")
  const [deleteRfqMutation] = useMutation(deleteRfq)
  const [rfq] = useQuery(getRfq, { id: rfqId })

  return (
    <>
      <Head>
        <title>Rfq {rfq.id}</title>
      </Head>

      <div>
        <h1>Rfq {rfq.id}</h1>
        <pre>{JSON.stringify(rfq, null, 2)}</pre>

        <Link href={Routes.EditRfqPage({ rfqId: rfq.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteRfqMutation({ id: rfq.id })
              await router.push(Routes.RfqsPage())
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

const ShowRfqPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.RfqsPage()}>
          <a>Rfqs</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Rfq />
      </Suspense>
    </div>
  )
}

ShowRfqPage.authenticate = true
ShowRfqPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowRfqPage
