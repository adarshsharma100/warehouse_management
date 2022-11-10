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
import getRfq_products from "app/rfq_products/queries/getRfq_products"
import createRfq_product from "app/rfq_products/mutations/createRfq_product"
import createManyRfq_products from "app/rfq_products/mutations/createManyRfq_products"
import deleteRfq_product from "app/rfq_products/mutations/deleteRfq_product"
import deleteRfq from "app/rfqs/mutations/deleteRfq"

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
  const [{ rfq_products }] = usePaginatedQuery(getRfq_products, {
    orderBy: { rfq_products_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  // console.log("rfq_products: ", rfq_products)
  // console.log("rfqs: ", rfqs)
  const [createRFQMutation] = useMutation(createRfq)
  const [createRFQProductMutation] = useMutation(createManyRfq_products)
  const [deleteRFQProductMutation] = useMutation(deleteRfq_product)
  const [deleteRFQMutation] = useMutation(deleteRfq)
  const productOptions = products.map(({ product_id, name }) => {
    return { name, value: product_id }
  })
  // console.log("rfqs: ", rfqs)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [rfqDialog, setRfqDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [rfqDetails, setRfqDetails] = useState({
    rfq_code: "",
    rfq_name: "",
    expected_dod: "",
  })
  const [itemList, setItemList] = useState([
    { products_product_id: "", quantity: "", price_per_unit: "" },
  ])
  const [activeRfq, setActiveRfq] = useState([])
  const tableRfqProducts = rfq_products.map((ele) => {
    return {
      ...ele,
      product_name: ele.products.name,
    }
  })
  const tableRFQ = rfqs.map((ele) => {
    return {
      ...ele,
      created_at: moment(ele.created_at).format("DD-MM-YYYY, HH:MM"),
      updated_at: moment(ele.updated_at).format("DD-MM-YYYY, HH:MM"),
      // name: ele.products.name,
    }
  })
  const addFields = () => {
    let newfield = { products_product_id: "", quantity: "", price_per_unit: "" }

    setItemList([...itemList, newfield])
  }
  const removeFields = (index) => {
    let data = [...itemList]
    data.splice(index, 1)
    setItemList(data)
  }
  const handleFormChange = (e: any, i: number) => {
    let data = [...itemList]
    e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)
    setItemList(data)
  }
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
        header="Product List"
        visible={productDialog}
        style={{ width: "60vw" }}
        // footer={renderFooter}
        onHide={() => setProductDialog(false)}
      >
        <DataTable
          value={activeRfq}
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
      </Dialog>

      <Dialog
        header="Create RFQ"
        visible={rfqDialog}
        style={{ width: "60vw" }}
        // footer={renderFooter}
        onHide={() => setRfqDialog(false)}
      >
        <form
          onSubmit={async () => {
            const rfc = await createRFQMutation({ ...rfqDetails })
            // console.log(" rfc:132 ", rfc)
            const all = []

            const many = itemList.map((ele) => {
              return {
                rfq_id: rfc.id,
                price_per_unit: Number(ele.price_per_unit),
                products_product_id: Number(ele.products_product_id),
                quantity: Number(ele.quantity),
              }
            })
            console.log("many: ", many)
            try {
              await createRFQProductMutation(many)
            } catch (error: any) {
              console.log("error: ", error)
            }

            await refetch()
          }}
          className="p-fluid"
        >
          <div className="flex justify-content-between mt-2 mb-2 pt-4">
            <div className="p-float-label">
              <InputText
                name=""
                className="mr-2 w-15rem"
                value={rfqDetails.rfq_code}
                onChange={(e) => setRfqDetails({ ...rfqDetails, rfq_code: e.target.value })}
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                RFQ Code
              </label>
            </div>

            <div className="p-float-label">
              <InputText
                className="mr-2 w-15rem"
                value={rfqDetails.rfq_name}
                onChange={(e) => setRfqDetails({ ...rfqDetails, rfq_name: e.target.value })}
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                RFQ Name
              </label>
            </div>
            <div className="p-float-label">
              <InputText
                className="mr-2 w-15rem"
                value={rfqDetails.expected_dod}
                onChange={(e) => setRfqDetails({ ...rfqDetails, expected_dod: e.target.value })}
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                Delivery time
              </label>
            </div>
          </div>
          <div>Select Items</div>
          <hr />
          {itemList.map((ele, i) => {
            return (
              <div key={i} className="flex justify-content-between mt-2 pt-4">
                <Dropdown
                  className="mr-2 w-15rem"
                  name="products_product_id"
                  // disabled={editState}
                  optionLabel="name"
                  value={ele.products_product_id}
                  options={productOptions}
                  onChange={(e) => handleFormChange(e, i)}
                  placeholder="Select  Product"
                />
                <div className="p-label ">
                  <label
                    className="mr-2"
                    // htmlFor={ele.field}
                    // className={classNames({ "p-error": isFormFieldValid("name") })}
                  >
                    Price per unit
                  </label>
                  <InputNumber
                    name="price_per_unit"
                    className="mr-2 w-15rem"
                    onChange={(e) => handleFormChange(e, i)}
                  />
                </div>
                <div className="p-label ">
                  <label
                    className="mr-2"
                    // htmlFor={ele.field}
                    // className={classNames({ "p-error": isFormFieldValid("name") })}
                  >
                    Quantity
                  </label>
                  <InputNumber
                    name="quantity"
                    className="mr-2 w-15rem"
                    onChange={(e) => handleFormChange(e, i)}
                    // onChange={(e) => handleFormChange(e, i)}
                  />
                </div>
              </div>
            )
          })}
          <div className="flex justify-content-end">
            <Button
              type="button"
              icon="pi pi-minus"
              className="m-2 p-button-rounded "
              onClick={removeFields}
            />

            <Button
              type="button"
              icon="pi pi-plus"
              className="m-2 p-button-rounded "
              onClick={addFields}
            />
          </div>
          <div className="flex justify-content-end">
            <Button type="button" className="col-3 mr-2 mt-2" label="CREATE" />
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
                  // label="Edit"
                  icon="pi pi-pencil"
                  className="mr-1"
                  // onClick={() => {
                  //   setActiveVendor(true)
                  //   setVendorDetails({ ...rowData })
                  //   setVendorDialog(true)
                  // }}
                />
                <Button
                  // label="Delete"
                  icon="pi pi-trash"
                  className="mr-1"
                  onClick={async () => {
                    await deleteRFQProductMutation({ rfq_id: rowData.id })
                    await deleteRFQMutation({ id: rowData.id })
                    await refetch()
                  }}
                />
                <Button
                  label="View Products"
                  icon="pi pi-external-link"
                  onClick={() => {
                    const active = tableRfqProducts.filter(({ rfq_id }) => {
                      return rfq_id === rowData.id
                    })
                    console.log("active: ", active)
                    setActiveRfq(active)
                    setProductDialog(true)
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
