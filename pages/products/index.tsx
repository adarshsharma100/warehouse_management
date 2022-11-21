import { Suspense, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"

import getProducts from "app/products/queries/getProducts"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import createProduct from "app/products/mutations/createProduct"
import createInventory_product from "app/inventory_products/mutations/createInventory_product"

const ITEMS_PER_PAGE = 100

export const ProductsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ products, hasMore }] = usePaginatedQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [createProductMutation] = useMutation(createProduct)
  const [createInventoryProductMutation] = useMutation(createInventory_product)
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    product_type: "",
    products_sku: "",
  })
  const [productDialog, setProductDialog] = useState(false)

  return (
    <div>
      <Dialog
        header="Add Products"
        visible={productDialog}
        style={{ width: "50vw" }}
        // footer={renderFooter}
        onHide={() => setProductDialog(false)}
      >
        <form
          // onSubmit={formik.handleSubmit}
          onSubmit={async () => {
            const result = await createProductMutation(productDetails)
            try {
              const all = await createInventoryProductMutation({
                products_product_id: Number(result.product_id),
                quantity: 0,
              })
              console.log("error: ", all)
            } catch (error) {
              console.log(error)
            }
          }}
          className="p-fluid"
        >
          <div className="formgrid grid">
            {[
              { type: "text", label: "Name", field: "name" },

              // { type: "text", label: "Vendor SKU", field: "vendor_sku" },
              { type: "text", label: "Product Type", field: "product_type" },
              { type: "text", label: "products SKU", field: "products_sku" },
              { type: "area", label: "Description", field: "description" },
            ].map((ele, i) => {
              if (ele.type === "text") {
                return (
                  <div key={`${ele.field}${i}`} className="field col-6 mt-4">
                    <span className="p-float-label">
                      <InputText
                        id={ele.field}
                        name={ele.field}
                        value={productDetails[ele.field]}
                        onChange={(e) => {
                          setProductDetails({ ...productDetails, [ele.field]: e.target.value })
                        }}
                        // value={formik.values.name}
                        // onChange={formik.handleChange}
                        // value=
                        autoFocus
                        // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                      />
                      <label
                        htmlFor={ele.field}
                        // className={classNames({ "p-error": isFormFieldValid("name") })}
                      >
                        {ele.label}
                      </label>
                    </span>
                    {/* {getFormErrorMessage("name")} */}
                  </div>
                )
              } else {
                return (
                  <div key={`${ele.field}${i}`} className="field col-6 mt-4">
                    <span className="p-float-label">
                      <InputTextarea
                        id={ele.field}
                        rows={5}
                        name={ele.field}
                        value={productDetails[ele.field]}
                        onChange={(e) => {
                          setProductDetails({ ...productDetails, [ele.field]: e.target.value })
                        }}
                        // value={formik.values.name}
                        // onChange={formik.handleChange}
                        // value=
                        autoFocus
                        // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                      />
                      <label
                        htmlFor={ele.field}
                        // className={classNames({ "p-error": isFormFieldValid("name") })}
                      >
                        {ele.label}
                      </label>
                    </span>
                    {/* {getFormErrorMessage("name")} */}
                  </div>
                )
              }
            })}
          </div>
          <div className="flex justify-content-end">
            <Button type="submit" className="mr-2 mt-2" label="ADD" />
          </div>
        </form>
      </Dialog>
      <h2>Products</h2>
      <div className="flex justify-content-end mb-2 ">
        <Button
          icon="pi pi-plus"
          label="Add Products"
          className="ml-1"
          onClick={() => {
            setProductDetails({
              name: "",
              description: "",
              product_type: "",
              products_sku: "",
            })
            setProductDialog(true)
          }}
        ></Button>
      </div>
      <DataTable
        value={products}
        showGridlines
        scrollable
        scrollHeight="60vh"
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
          field="name"
          header="Name"
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
          field="product_description"
          header="Product Description"
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

const ProductsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <ProductsList />
      </Layout>
    </Suspense>
  )
}

export default ProductsPage
