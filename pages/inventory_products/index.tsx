import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getInventory_products from "app/inventory_products/queries/getInventory_products"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"

const ITEMS_PER_PAGE = 100

export const Inventory_productsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ inventory_products, hasMore }] = usePaginatedQuery(getInventory_products, {
    orderBy: { inventory_product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const tableInventory = inventory_products.map(({ quantity, products }) => {
    return {
      products_sku: products.products_sku,
      name: products.name,
      product_type: products.product_type,
      quantity,
    }
  })
  return (
    <div>
      <h2>Inventory</h2>
      <DataTable
        value={tableInventory}
        showGridlines
        // header={renderHeader}
        stripedRows
        className="text-s datatable-responsive"
      >
        {/* <Column
          field="vendor_id"
          header="Vendor ID"
          // className="text-center"
        /> */}
        <Column
          field="products_sku"
          header="SKU"
          // className="text-center"
        />
        <Column
          field="product_type"
          header="Type"
          // className="text-center"
        />
        {/* <Column
          field="vendor_sku"
          header="Vendor Sku"
          // className="text-center"
        /> */}
        <Column
          field="quantity"
          header="Quantity"
          // className="text-center"
        />

        <Column
          // field="vendor_gstin"
          header="Action"
          body={(rowData) => {
            return (
              <div>
                <Button
                  // label="Edit"
                  icon="pi pi-pencil"
                  className="m-1"
                  onClick={() => {
                    // setActiveVendor(true)
                    // setVendorDetails({ ...rowData })
                    // setVendorDialog(true)
                  }}
                />
                <Button
                  // label="Delete"
                  disabled={true}
                  icon="pi pi-trash"
                  className="m-1"
                  onClick={async () => {
                    // await deleteVendorMutation({ vendor_id: rowData.vendor_id })
                    // await refetch()
                  }}
                />
              </div>
            )
          }}
          // className="text-center"
        />
      </DataTable>
    </div>
  )
}

const Inventory_productsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <Inventory_productsList />
      </Layout>
    </Suspense>
  )
}

export default Inventory_productsPage
