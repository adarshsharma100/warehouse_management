import { Suspense, useEffect, useRef, useState } from "react"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
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
import updateVendor_product from "app/vendor_products/mutations/updateVendor_product"
import deleteVendor_product from "app/vendor_products/mutations/deleteVendor_product"
import { FileUpload } from "primereact/fileupload"
import Loading from "components/loading"
import papa from "papaparse"
import downloadCsv from "download-csv"
import { Toast } from "primereact/toast"
import { InputNumber } from "primereact/inputnumber"
import ErrorCard from "components/ErrorCard"
import { createCSVFormat } from "app/constants"

const ITEMS_PER_PAGE = 100

export const Vendor_productsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0

  const [{ vendor_products }, { refetch, isLoading }] = useQuery(getVendor_products, {
    orderBy: { vp_id: "asc" },
  })

  const [{ vendors }, { isLoading: isVendorsLoading }] = useQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
  })

  const [{ products }, { isLoading: isProductsLoading }] = useQuery(getProducts, {
    orderBy: { product_id: "asc" },
  })

  const toast = useRef(null)

  const [errorProducts, setErrorProducts] = useState([])
  const [vendorDialog, setVendorDialog] = useState(false)
  const [newProduct, setNewProduct] = useState({
    unit_price: 0,
    vendor_vendor_id: 0,
    products_product_id: 0,
    vendor_sku: "",
  })
  const [activeRow, setActiveRow] = useState({})
  const { unit_price, vendor_vendor_id, products_product_id, vendor_sku } = newProduct
  const [editState, setEditState] = useState(false)
  const [createVendorProductMutation, { error: createVpMutationError }] =
    useMutation(createVendor_product)
  const [updateVendorMutation, { error: updateVpMutationError }] = useMutation(updateVendor_product)
  const [deleteVendorProductMutation] = useMutation(deleteVendor_product)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const productOptions = products.map(({ product_id, name }) => {
    return { name, value: product_id }
  })
  const vendorOptions = vendors.map(({ vendor, vendor_id }) => {
    return { name: vendor, value: vendor_id }
  })
  const clearupload = useRef(null)
  const [btnVisibility, setBtnVisibility] = useState(false)

  const [ErrorMsgs, setErrorMsgs] = useState([])
  useEffect(() => {
    const ErrorArray = [createVpMutationError, updateVpMutationError]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [createVpMutationError, updateVpMutationError])

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  if (isLoading || isVendorsLoading || isProductsLoading) return <div>Loading</div>

  const renderFooter = () => {
    return (
      <div className="flex justify-content-end">
        <Button
          className="mr-2"
          label={editState ? "UPDATE" : "ADD"}
          onClick={async () => {
            if (editState) {
              // update
              console.log("test")

              await updateVendorMutation({
                vp_id: activeRow?.vp_id,
                unit_price: newProduct.unit_price,
                vendor_sku: newProduct.vendor_sku,
              })
              setVendorDialog(false)
              await refetch()
            } else {
              await createVendorProductMutation({
                unit_price,
                vendor_vendor_id,
                products_product_id,
                vendor_sku,
              })
              await refetch()
              setVendorDialog(false)
              setNewProduct({
                unit_price: 0,
                vendor_vendor_id: 0,
                products_product_id: 0,
                vendor_sku: "",
              })
            }
          }}
        />
      </div>
    )
  }
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
    setErrorProducts([])

    let index = 2
    papa.parse(e.files[0], {
      header: true,
      skipEmptyLines: true,
      step: async ({ data }, parser) => {
        const missingKey = ["VENDOR_ID", "PRODUCT_ID", "UNIT_PRICE", "SKU"].find(
          (key) => !(key in data)
        )

        if (missingKey) {
          setErrorProducts([...errorProducts, { message: `Column ${missingKey} missing.` }])
          parser.abort()
        }

        const result = await createVendorProductMutation(
          {
            vendor_vendor_id: Number(data["VENDOR_ID"]),
            products_product_id: Number(data["PRODUCT_ID"]),
            unit_price: Number(data["UNIT_PRICE"]),
            vendor_sku: data["SKU"],
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
              console.error("Product failed: ", data)
              setErrorProducts([
                ...errorProducts,
                { ...data, message: error.message, rowNum: index },
              ])
            },
          }
        )
        index += 1
        await refetch()
      },
    })
  }

  const vpCsvFormatDetails = {
    headers: ["VENDOR_ID", "PRODUCT_ID", "UNIT_PRICE", "SKU"],
    name: "Vendor-catalog-format.csv",
  }

  console.log(btnVisibility)

  return (
    <div className="grid w-full">
      <Toast ref={toast} />

      <Dialog
        header="Add Vendor Product"
        visible={vendorDialog}
        style={{ width: "50vw" }}
        footer={renderFooter}
        onHide={() => {
          setVendorDialog(false)
          setNewProduct({
            unit_price: 0,
            vendor_vendor_id: 0,
            products_product_id: 0,
            vendor_sku: "",
          })
          setEditState(false)
        }}
      >
        <div className="grid p-fluid">
          <div className="field col-12 lg:col-6 mt-3">
            <Dropdown
              disabled={editState}
              optionLabel="name"
              value={vendor_vendor_id}
              options={vendorOptions}
              onChange={(e) => setNewProduct({ ...newProduct, vendor_vendor_id: e.value })}
              placeholder="Select Vendor"
            />
          </div>
          <div className="field col-12 lg:col-6 mt-3">
            <Dropdown
              disabled={editState}
              optionLabel="name"
              value={products_product_id}
              options={productOptions}
              onChange={(e) => setNewProduct({ ...newProduct, products_product_id: e.value })}
              placeholder="Select  Product"
            />
          </div>
          <div className="field col-12 lg:col-6 mt-3">
            <span className="p-float-label">
              <InputText
                value={vendor_sku}
                onChange={(e) => {
                  setNewProduct({
                    ...newProduct,
                    vendor_sku: e.target.value,
                  })
                }}
                autoFocus
              />
              <label>Vendor SKU</label>
            </span>
          </div>
          <div className="field col-12 lg:col-6 mt-3">
            <span className="p-float-label">
              <InputNumber
                value={unit_price}
                onChange={(e) => {
                  setNewProduct({
                    ...newProduct,
                    unit_price: e.value,
                  })
                }}
                autoFocus
              />
              <label>Unit Price</label>
            </span>
          </div>
        </div>
      </Dialog>
      <div className="col-12 ">
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
        <div className="card flex justify-content-between align-items-center">
          <h4 className="mb-0">Vendor Catalog</h4>
          <div className="flex">
            <Button
              icon="pi pi-plus"
              className="ml-2"
              label="Add Vendor Products"
              onClick={() => {
                setVendorDialog(true)
                setNewProduct({
                  unit_price: 0,
                  vendor_vendor_id: 0,
                  products_product_id: 0,
                  vendor_sku: "",
                })
              }}
            ></Button>
            <span className=" flex justify-content-center align-items-center">
              <FileUpload
                accept=".csv"
                className="ml-2 inline-block "
                mode="basic"
                customUpload
                maxFileSize={1000000}
                uploadHandler={(e) => onBasicUpload(e)}
                ref={clearupload}
                onSelect={() => setBtnVisibility(true)}
                onBeforeSelect={() => setBtnVisibility(false)}
                onClear={() => setBtnVisibility(false)}
              />
              <Button
                visible={btnVisibility}
                style={{ backgroundColor: "var(--red-400)", border: "var(--red-400)" }}
                icon="pi pi-file-excel                "
                className=" ml-1 co"
                onClick={() => {
                  clearupload?.current.clear()
                  setErrorProducts([])
                  setErrorMsgs([])
                }}
                tooltip="Clear the File"
                tooltipOptions={{ position: "top" }}
              />
            </span>

            <Button
              icon="pi pi-download"
              className="ml-2"
              label="CSV format"
              onClick={() => createCSVFormat(vpCsvFormatDetails)}
            />
          </div>
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
        <div className="card">
          <DataTable
            value={vendor_products}
            showGridlines
            stripedRows
            className="text-s datatable-responsive"
          >
            <Column field="vendor.vendor" header="Vendor" />
            <Column field="vendor.vendor_code" header="Vendor Code" />
            <Column field="products.name" header="Item Name" />
            <Column field="products.products_sku" header="SKU" />
            <Column field="vendor_sku" header="Vendor Sku" />
            <Column field="unit_price" header="Unit Price" />
            <Column
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      className="mr-1"
                      onClick={() => {
                        setActiveRow(rowData)
                        setEditState(true)
                        setVendorDialog(true)
                        setNewProduct({
                          ...newProduct,
                          vendor_vendor_id: rowData.vendor.vendor_id,
                          unit_price: rowData.unit_price,
                          products_product_id: rowData.products.product_id,
                          vendor_sku: rowData.vendor_sku,
                        })
                      }}
                    />
                    <Button
                      disabled={true}
                      icon="pi pi-trash"
                      className="mr-1"
                      onClick={async () => {
                        await deleteVendorProductMutation({ vp_id: Number(rowData.vp_id) })
                        await refetch()
                      }}
                    />
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
