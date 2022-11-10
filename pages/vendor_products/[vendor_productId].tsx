import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getVendor_product from "app/vendor_products/queries/getVendor_product"
import deleteVendor_product from "app/vendor_products/mutations/deleteVendor_product"

export const Vendor_product = () => {
  const router = useRouter()
  const vendor_productId = useParam("vendor_productId", "number")
  const [deleteVendor_productMutation] = useMutation(deleteVendor_product)
  // const [vendor_product] = useQuery(getVendor_product, {
  //   id: vendor_productId,
  // });

  return (
    <>
      {/*

      <div>
        <h1>Vendor_product {vendor_product.id}</h1>
        <pre>{JSON.stringify(vendor_product, null, 2)}</pre>

        <Link
          href={Routes.EditVendor_productPage({
            vendor_productId: vendor_product.id,
          })}
        >
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteVendor_productMutation({ id: vendor_product.id });
              router.push(Routes.Vendor_productsPage());
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div> */}
    </>
  )
}

const ShowVendor_productPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.Vendor_productsPage()}>
          <a>Vendor_products</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Vendor_product />
      </Suspense>
    </div>
  )
}

ShowVendor_productPage.authenticate = true
ShowVendor_productPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowVendor_productPage
