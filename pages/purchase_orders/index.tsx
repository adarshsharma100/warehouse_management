import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import Layout from "layouts/Layout"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Button } from "primereact/button"

const ITEMS_PER_PAGE = 100

export const Purchase_ordersList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  // const [{ purchase_orders, hasMore }] = usePaginatedQuery(getPurchase_orders, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <div className="flex justify-content-end mb-2 ">
        <Button icon="pi pi-plus" label="Create RFQ" onClick={() => setRfqDialog(true)}></Button>
      </div>
      <DataTable
        value={[]}
        showGridlines
        // header={renderHeader}

        stripedRows
        className="text-s datatable-responsive"
        // paginator
        // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
        // rows={PAGINATION_VARIABLES.rows}
        // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
        // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
      >
        <Column
          field="rfq_products_id"
          header="ID"
          // className="text-center"
        />

        <Column
          field="product_name"
          header="Name"
          // className="text-center"
        />
        <Column
          field="price_per_unit"
          header="Price / Unit"
          // className="text-center"
        />
        <Column
          field="quantity"
          header="Quantity"
          // className="text-center"
        />
      </DataTable>
    </div>
  )
}

const Purchase_ordersPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <Purchase_ordersList />
      </Layout>
    </Suspense>
  )
}

export default Purchase_ordersPage
