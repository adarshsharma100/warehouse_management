import { Suspense, useState, useRef } from "react"
import { Routes } from "@blitzjs/next"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import papa from "papaparse"

import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { FileUpload } from "primereact/fileupload"
import { Toast } from "primereact/toast"

import createProduct from "app/products/mutations/createProduct"
import updateProduct from "app/products/mutations/updateProduct"
import getProducts from "app/products/queries/getProducts"
import getPrefix from "app/prefixes/queries/getPrefix"
import createInventory_product from "app/inventory_products/mutations/createInventory_product"

import Loading from "components/loading"

const ITEMS_PER_PAGE = 100

export const ProductsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ products }, { isLoading: isProductsLoading }] = useQuery(getProducts, {
    orderBy: { product_id: "asc" },
  })
  const [prefix, { isLoading }] = useQuery(getPrefix, { name: "PRODUCT" })
  const [createProductMutation] = useMutation(createProduct)
  const [updateProductMutation] = useMutation(updateProduct)

  const [createInventoryProductMutation] = useMutation(createInventory_product)
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    product_type: "",
    products_sku: "",
  })
  const [productDialog, setProductDialog] = useState(false)

  const [errorProducts, setErrorProducts] = useState([])

  const toast = useRef(null)

  if (isLoading || isProductsLoading) {
    return <Loading />
  }

  return (
    <div className="grid">
      <Toast ref={toast} />
      <div className="col-12 ">
        <div className="card flex justify-content-between align-items-center">
          <h2>Products</h2>
          <div className="flex">
            <FileUpload
              mode="basic"
              name="products"
              // url="https://primefaces.org/primereact/showcase/upload.php"
              accept=".csv"
              maxFileSize={1000000}
              customUpload
              uploadHandler={(e) => {
                let index = 2
                setErrorProducts([])
                papa.parse(e.files[0], {
                  header: true,
                  skipEmptyLines: true,
                  step: async ({ data }, parser) => {
                    const missingKey = ["NAME", "DESCRIPTION", "SKU", "TYPE"].find(
                      (key) => !(key in data)
                    )

                    if (missingKey) {
                      setErrorProducts([
                        ...errorProducts,
                        { message: `Column ${missingKey} missing.` },
                      ])
                      parser.abort()
                    }
                    // setErrorProducts([
                    //   ...errorProducts,
                    //   { ...data, message: error.message, rowNum: index },
                    // ])
                    const result = await createProductMutation(
                      {
                        name: data?.["NAME"],
                        description: data?.["DESCRIPTION"],
                        products_sku: data?.["SKU"],
                        product_type: data?.["TYPE"],
                      },
                      {
                        onSuccess: () => {
                          toast?.current?.show({
                            severity: "success",
                            summary: "Product Created",
                            detail: "Product created successfully.",
                            life: 3000,
                          })
                        },
                        onError: (error) => {
                          console.log("Product failed: ", data)
                          setErrorProducts([
                            ...errorProducts,
                            { ...data, message: error.message, rowNum: index },
                          ])
                        },
                      }
                    )
                    index += 1
                  },
                })
              }}
              chooseLabel="Upload Products (.csv)"
            />
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
                setProductDialog(!productDialog)
              }}
            />
          </div>
        </div>
      </div>
      <div
        className={`col-12 ${
          productDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <div className="card">
          <h4>Create Product</h4>
          <form
            // onSubmit={formik.handleSubmit}
            onSubmit={async () => {
              const result = await createProductMutation(productDetails, {
                onSuccess: () => {
                  setProductDialog(false)
                },
              })

              // try {
              //   const all = await createInventoryProductMutation({
              //     products_product_id: Number(result.product_id),
              //     quantity: 0,
              //   })
              //
              // } catch (error) {
              //
              // }
            }}
            className="p-fluid"
          >
            <div className="formgrid grid">
              {[
                { type: "text", label: "Name", field: "name" },
                { type: "text", label: "Product Type", field: "product_type" },
                { type: "text", label: "Product SKU", field: "products_sku" },
                { type: "area", label: "Description", field: "description" },
              ].map((ele, i) => {
                if (ele.type === "text") {
                  return (
                    <div key={`${ele.field}${i}`} className="field col-12 lg:col-4 mt-4">
                      <span className="p-float-label">
                        <InputText
                          id={ele.field}
                          name={ele.field}
                          value={productDetails[ele.field]}
                          onChange={(e) => {
                            setProductDetails({ ...productDetails, [ele.field]: e.target.value })
                          }}
                          autoFocus
                        />
                        <label htmlFor={ele.field}>{ele.label}</label>
                      </span>
                    </div>
                  )
                } else {
                  return (
                    <div key={`${ele.field}${i}`} className="field col-12 mt-4">
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
        </div>
      </div>
      <div
        className={`col-12 ${
          errorProducts.length
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <div className="card border-primary border-2 bg-primary-reverse">
          <h6>Following are a list of failed entries: </h6>
          <ul>
            {errorProducts.map(({ rowNum, message }, index) => {
              if (rowNum)
                return (
                  <li key={"error-" + index}>
                    Row Number {rowNum}:{" "}
                    <ul>
                      <li>{message}</li>
                    </ul>
                  </li>
                )
              return (
                <li key={"error-" + index}>
                  <li>{message}</li>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="col-12">
        <Button
          label="update"
          onClick={async () => {
            try {
              const data = await updateProductMutation({
                product_id: 21,
                name: "Watermelon",
                description:
                  "Water-melon is a flowering plant species of the Cucurbitaceae family and the name of its edible fruit. A scrambling and trailing vine-like plant, it is a highly cultivated fruit worldwide, with more than 1,000 varieties.",
                product_type: "Fruit",
              })
            } catch (error) {}
          }}
        />
      </div>
      <div className="col-12">
        <div className="card">
          <DataTable
            value={products}
            showGridlines
            scrollable
            // scrollHeight="60vh"
            stripedRows
            className="text-s datatable-responsive"
          >
            {prefix?.prefix && (
              <Column
                header="ID"
                body={({ product_id }) => (
                  <span>
                    {prefix.prefix}_{product_id}
                  </span>
                )}
              />
            )}
            <Column field="products_sku" header="SKU" />
            <Column field="name" header="Name" />
            <Column field="product_type" header="Type" />
            <Column field="description" header="Product Description" />

            <Column
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      className="m-1"
                      onClick={() => {
                        // setActiveVendor(true)
                        // setVendorDetails({ ...rowData })
                        // setVendorDialog(true)
                      }}
                    />
                    {/* <Button
                  disabled={true}
                  icon="pi pi-trash"
                  className="m-1"
                  onClick={async () => {
                    // await deleteVendorMutation({ vendor_id: rowData.vendor_id })
                    // await refetch()
                  }}
                /> */}
                  </div>
                )
              }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  )
}

const ProductsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <ProductsList />
      </Layout>
    </Suspense>
  )
}

export default ProductsPage
