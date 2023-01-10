import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
// import Layout from "app/core/layouts/Layout"
import getPurchase_order from "app/purchase_orders/queries/getPurchase_order"
import deletePurchase_order from "app/purchase_orders/mutations/deletePurchase_order"
import Loading from "components/loading"
import Layout from "layouts/Layout"
import getGrns from "app/grns/queries/getGrns"

export const Purchase_order = () => {
  const router = useRouter()
  const purchase_orderId = useParam("purchase_orderId", "number")
  console.log("purchase_orderId", purchase_orderId)
  const [deletePurchase_orderMutation] = useMutation(deletePurchase_order)
  const [purchase_order] = useQuery(getPurchase_order, {
    po_id: purchase_orderId,
  })
  const [{ grns }] = useQuery(getGrns, {
    orderBy: { grn_id: "asc" },
  })

  // const relatedGrn = grns.filter

  return (
    <>
      <Head>
        <title>Purchase_order {purchase_order.po_id}</title>
      </Head>

      <div>
        <h1>Purchase_order {purchase_order.po_id}</h1>
        <pre>{JSON.stringify(purchase_order, null, 2)}</pre>
        {/* <pre>{JSON.stringify(grns[], null, 2)}</pre> */}

        <Link
          href={Routes.EditPurchase_orderPage({
            purchase_orderId: purchase_order.po_id,
          })}
        >
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deletePurchase_orderMutation({ po_id: purchase_order.po_id })
              await router.push(Routes.Purchase_ordersPage())
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

const ShowPurchase_orderPage = () => {
  return (
    // <div>
    //   <p>
    //     <Link href={Routes.Purchase_ordersPage()}>
    //       <a>Purchase_orders</a>
    //     </Link>
    //   </p>

    <Suspense fallback={<Loading />}>
      <Layout>
        <Purchase_order />
      </Layout>
    </Suspense>
    // </div>
  )
}

// ShowPurchase_orderPage.authenticate = true
// ShowPurchase_orderPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowPurchase_orderPage
