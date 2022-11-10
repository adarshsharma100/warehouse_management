import { Suspense, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { InputNumber } from "primereact/inputnumber"
import getRfqs from "app/rfqs/queries/getRfqs"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import moment from "moment"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import getProducts from "app/products/queries/getProducts"
import createRfq from "app/rfqs/mutations/createRfq"

const ITEMS_PER_PAGE = 100

export const RfqsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ rfqs, hasMore }, { refetch }] = usePaginatedQuery(getRfqs, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ products }] = usePaginatedQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  console.log("rfqs: ", rfqs)
  const [createRFQMutation] = useMutation(createRfq)
  const productOptions = products.map(({ product_id, name }) => {
    return { name, value: product_id }
  })
  console.log("rfqs: ", rfqs)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [rfqDialog, setRfqDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [rfqDetails, setRfqDetails] = useState({
    expected_dod: "",
    price_per_unit: "",
    quantity: "",
    products_product_id: "",
  })
  const tableRFQ = rfqs.map((ele) => {
    return {
      ...ele,
      created_at: moment(ele.created_at).format("DD-MM-YYYY, HH:MM"),
      updated_at: moment(ele.updated_at).format("DD-MM-YYYY, HH:MM"),
      // name: ele.products.name,
    }
  })

  // {
  //     "id": 1,
  //     "created_at": "2022-09-30T10:14:46.000Z",
  //     "updated_at": "2022-09-30T10:14:46.000Z",
  //     "expected_dod": 4,
  //     "products_product_id": 1,
  //     "products_inventory_products_inventory_product_id": 1,
  //     "quantity": 50,
  //     "price_per_unit": "400"
  // }
  return (
    <div>
      <Dialog
        header="Create RFQ"
        visible={rfqDialog}
        style={{ width: "60vw" }}
        // footer={renderFooter}
        onHide={() => setRfqDialog(false)}
      >
        <form
          // onSubmit={formik.handleSubmit}
          onSubmit={async () => {
            // if (!editState) {
            await createRFQMutation({
              expected_dod: Number(rfqDetails.expected_dod),
              price_per_unit: Number(rfqDetails.price_per_unit),
              quantity: Number(rfqDetails.quantity),
              products_product_id: Number(selectedProduct),
            })
            // } else {
            //   await updateVendorMutation({ ...vendorDetails })
            // }
            await refetch()
            // setActiveVendor(false)
          }}
          className="p-fluid"
        >
          <div className="flex justify-content-center">
            {" "}
            <Dropdown
              className="mr-2"
              // disabled={editState}
              optionLabel="name"
              value={selectedProduct}
              options={productOptions}
              onChange={(e) => setSelectedProduct(e.value)}
              placeholder="Select  Product"
            />
            <InputNumber className="mr-2" />
            <InputNumber className="mr-2" />
            <Button icon="pi pi-plus" className="mr-2" />
          </div>
          <div className="flex justify-content-end">
            <Button type="submit" className="col-3 mr-2 mt-2" label="CREATE" />
          </div>
        </form>
      </Dialog>
      <h2>Request for Quotations</h2>
      <div className="flex justify-content-end mb-2 ">
        <Button icon="pi pi-plus" label="Create RFQ" onClick={() => setRfqDialog(true)}></Button>
      </div>
      <DataTable
        value={tableRFQ}
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
          field="id"
          header="ID"
          // className="text-center"
        />
        <Column
          field="rfq_code"
          header="Code"
          // className="text-center"
        />
        <Column
          field="rfq_name"
          header="Name"
          // className="text-center"
        />
        <Column
          field="expected_dod"
          header="Delivery days"

          // className="text-center"
        />

        <Column
          field="created_at"
          header="Created at"
          // className="text-center"
        />
        <Column
          field="updated_at"
          header="Updated at"
          // className="text-center"
        />
        <Column
          // field="vendor_gstin"
          header="Action"
          body={(rowData) => {
            return (
              <div>
                <Button
                  label="Edit"
                  icon="pi pi-pencil"
                  className="mr-1"
                  // onClick={() => {
                  //   setActiveVendor(true)
                  //   setVendorDetails({ ...rowData })
                  //   setVendorDialog(true)
                  // }}
                />
                <Button
                  label="Delete"
                  icon="pi pi-trash"
                  // onClick={async () => {
                  //   await deleteVendorMutation({ vendor_id: rowData.vendor_id })
                  //   await refetch()
                  // }}
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

const RfqsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <RfqsList />
      </Layout>
    </Suspense>
  )
}

export default RfqsPage
