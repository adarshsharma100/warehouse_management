import { Suspense, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"

import getVendor_products from "app/vendor_products/queries/getVendor_products"
import Layout from "layouts/Layout"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import getVendors from "app/vendors/queries/getVendors"
import { Dropdown } from "primereact/dropdown"
import getProducts from "app/products/queries/getProducts"
import { InputText } from "primereact/inputtext"
import createVendor_product from "app/vendor_products/mutations/createVendor_product"
import deleteVendor_product from "app/vendor_products/mutations/deleteVendor_product"
import { FileUpload } from "primereact/fileupload"
import Loading from "components/loading"
const papa = require("papaparse")

const ITEMS_PER_PAGE = 100

export const Vendor_productsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ vendor_products, hasMore }, { refetch }] = usePaginatedQuery(getVendor_products, {
    orderBy: { vp_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ vendors }] = usePaginatedQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [{ products }] = usePaginatedQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  console.log("vendors", vendors)
  console.log("products", products)
  const [vendorDialog, setVendorDialog] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [editState, setEditState] = useState(false)
  console.log("products: ", products)
  const [createVendorProductMutation] = useMutation(createVendor_product)
  // const [updateVendorMutation] = useMutation(updateVendor)
  const [deleteVendorProductMutation] = useMutation(deleteVendor_product)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const productOptions = products.map(({ product_id, name }) => {
    return { name, value: product_id }
  })
  const vendorOptions = vendors.map(({ vendor, vendor_id }) => {
    return { name: vendor, value: vendor_id }
  })
  const renderFooter = () => {
    return (
      <div className="flex justify-content-end">
        <Button
          className="mr-2"
          label="ADD"
          onClick={async () => {
            await createVendorProductMutation({
              unit_price: Number(unitPrice),
              vendor_vendor_id: Number(selectedVendor),
              products_product_id: Number(selectedProduct),
            })
            await refetch()
            setVendorDialog(false)
            setSelectedVendor("")
            setSelectedProduct("")
            setUnitPrice("")
          }}
        />
      </div>
    )
  }
  // console.log("vendors: ", vendors)
  const tableVendorProducts = vendor_products.map(
    ({ products, unit_price, vendor, vp_id, vendor_sku }) => {
      return {
        vp_id,
        unit_price,
        item_name: products.name,
        sku_code: products.products_sku,
        vendor_code: vendor.vendor_code,
        vendor_sku: vendor_sku,
        vendor: vendor.vendor,
        vendor_id: vendor.vendor_id,
        product_id: products.product_id,
      }
    }
  )
  const onBasicUpload = async (e) => {
    // console.log("FileUpload", e)
    // await papa.parse(e.files[0], (data) => {
    //   console.log("FileUpload", data)
    // })
    const failedCsv = []
    const csv = []
    papa.parse(e.files[0], {
      header: true,
      step: function (result) {
        csv.push(result.data)
      },
      complete: async function (results, file) {
        console.log("FileUpload ", csv)
        const header = csv.pop()
        const finalResults = csv.map((el) => {
          const vendor_vendor_id = vendors.filter(({ vendor_code }) => {
            // console.log("vendor code21", vendor_code, el["Vendor Code"])
            return vendor_code === el["Vendor Code"]
          })[0]?.vendor_id
          const products_product_id = products.filter(({ products_sku }) => {
            return products_sku === el["Product Sku"]
          })[0]?.product_id
          return {
            vendor_sku: el["Vendor SkuCode"],
            priority: Number(el["Priority"]),
            enabled: Number(el["Enabled"]),
            unit_price: Number(el["Vendor Price"]),
            vendor_vendor_id: Number(vendor_vendor_id),
            products_product_id: Number(products_product_id),
          }
        })
        finalResults.forEach(async (ele) => {
          try {
            await createVendorProductMutation(ele)
            await refetch()
          } catch (error) {
            failedCsv.push(ele)
          }
        })
        // failedCsv.push(header)
        // console.log("failedCsv: ", failedCsv)
        // console.log("finalResults: ", finalResults)
        // const csv_2 = papa.unparse(failedCsv)
        // console.log("csv_2: ", csv_2)
      },
    })
  }
  return (
    <div>
      <Dialog
        header="Add Vendor Product"
        visible={vendorDialog}
        style={{ width: "50vw" }}
        footer={renderFooter}
        onHide={() => {
          setVendorDialog(false)
          setSelectedVendor("")
          setSelectedProduct("")
          setUnitPrice("")
        }}
      >
        <div className="formgrid grid">
          <Dropdown
            className="field col-5 mr-3 "
            disabled={editState}
            optionLabel="name"
            value={selectedVendor}
            options={vendorOptions}
            onChange={(e) => setSelectedVendor(e.value)}
            placeholder="Select Vendor"
          />
          <Dropdown
            className="field col-5"
            disabled={editState}
            optionLabel="name"
            value={selectedProduct}
            options={productOptions}
            onChange={(e) => setSelectedProduct(e.value)}
            placeholder="Select  Product"
          />
          <div className="field col-6 mt-4">
            <span className="p-float-label">
              <InputText
                // id={ele.field}
                // name={ele.field}
                value={unitPrice}
                onChange={(e) => {
                  setUnitPrice(e.target.value)
                }}
                autoFocus
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                Unit Price
              </label>
            </span>
          </div>
        </div>
        {/* <form
          // onSubmit={formik.handleSubmit}
          onSubmit={async () => {
            if (!activeVendor) {
              await createVendorMutation({
                ...vendorDetails,
              })
            } else {
              await updateVendorMutation({ ...vendorDetails })
            }
            await refetch()
            setActiveVendor(false)
          }}
          className="p-fluid"
        >
          <div className="formgrid grid">
            {[
              { type: "text", label: "Vendor", field: "vendor" },
              { type: "text", label: "Vendor Code", field: "vendor_code" },
              { type: "text", label: "Vendor SKU", field: "vendor_sku" },
              { type: "email", label: "Vendor Email", field: "vendor_email" },
              { type: "text", label: "Vendor City", field: "vendor_city" },
              { type: "text", label: "Vendor Contact", field: "vendor_contact" },
              { type: "text", label: "Vendor GSTIN", field: "vendor_gstin" },
            ].map((ele, i) => {
              return (
                <div key={`${ele.field}${i}`} className="field col-6 mt-4">
                  <span className="p-float-label">
                    <InputText
                      id={ele.field}
                      name={ele.field}
                      value={vendorDetails[ele.field]}
                      onChange={(e) => {
                        setVendorDetails({ ...vendorDetails, [ele.field]: e.target.value })
                      }}

                      autoFocus

                    />
                    <label
                      htmlFor={ele.field}
                      className={classNames({ "p-error": isFormFieldValid("name") })}
                    >
                      {ele.label}
                    </label>
                  </span>

                </div>
              )
            })}
          </div>
          <div className="flex justify-content-end">
            <Button type="submit" className="mr-2 mt-2" label="ADD" />
          </div>
        </form> */}
      </Dialog>
      <h4>Vendor Catalog</h4>
      <div className="flex justify-content-end mb-2 ">
        <FileUpload
          mode="basic"
          customUpload
          // name="demo[]"
          // url="https://primefaces.org/primereact/showcase/upload.php"
          // accept="image/*"
          maxFileSize={1000000}
          uploadHandler={(e) => onBasicUpload(e)}
          // onUpload={(e) => onBasicUpload(e)}
        />
        <Button
          icon="pi pi-plus"
          label="Add Vendor Products"
          onClick={() => setVendorDialog(true)}
        ></Button>
      </div>
      <DataTable
        value={tableVendorProducts}
        scrollable
        scrollHeight="60vh"
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
        {/* <Column
          field="vp_id"
          header="product ID"
          // className="text-center"
        /> */}
        <Column
          field="vendor"
          header="Vendor"
          // className="text-center"
        />
        <Column
          field="vendor_code"
          header="Vendor Code"
          // className="text-center"
        />
        <Column
          field="item_name"
          header="Item Name"
          // className="text-center"
        />
        <Column
          field="sku_code"
          header="SKU code"
          // className="text-center"
        />
        <Column
          field="vendor_sku"
          header="Vendor Sku"
          // className="text-center"
        />
        <Column
          field="unit_price"
          header="Unit Price"
          // className="text-center"
        />

        <Column
          // field="vendor_gstin"
          header="Action"
          body={(rowData) => {
            console.log("rowData: ", rowData)
            return (
              <div>
                <Button
                  // label="Edit"
                  icon="pi pi-pencil"
                  className="mr-1"
                  onClick={() => {
                    // setActiveVendor(true)
                    setEditState(true)
                    setVendorDialog(true)
                    setSelectedVendor(rowData.vendor_id)
                    setSelectedProduct(rowData.product_id)
                    setUnitPrice(rowData.unit_price)

                    // setVendorDetails({ ...rowData })
                    // setVendorDialog(true)
                  }}
                />
                <Button
                  // label="Delete"
                  disabled={true}
                  icon="pi pi-trash"
                  className="mr-1"
                  onClick={async () => {
                    await deleteVendorProductMutation({ vp_id: Number(rowData.vp_id) })
                    await refetch()
                  }}
                />
                {/* <Button
                  label="Generate PO"
                  icon="pi pi-truck"
                  // onClick={async () => {
                  //   await deleteVendorProductMutation({ vp_id: Number(rowData.vp_id) })
                  //   await refetch()
                  // }}
                /> */}
              </div>
            )
          }}
          // className="text-center"
        />
      </DataTable>
    </div>
  )
}

const Vendor_productsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Vendor_productsList />
      </Layout>
    </Suspense>
  )
}

export default Vendor_productsPage
