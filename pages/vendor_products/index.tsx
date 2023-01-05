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
import { createCSVFormat, createSearchFunction, tsuccess } from "app/constants"
import { FALSE } from "sass"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { devNull } from "os"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"

const ITEMS_PER_PAGE = 100

export const Vendor_productsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0

  const [{ vendor_products }, { refetch, isLoading }] = useQuery(getVendor_products, {
    orderBy: { vp_id: "asc" },
  })

  const [{ vendors }, { error: vp_VendorFetchingError, isLoading: isVendorsLoading }] = useQuery(
    getVendors,
    {
      orderBy: { vendor_id: "asc" },
    }
  )

  const [{ products }, { error: vp_ProductsFetchingError, isLoading: isProductsLoading }] =
    useQuery(getProducts, {
      orderBy: { product_id: "asc" },
    })

  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)

  const [errorProducts, setErrorProducts] = useState([])
  const [vendorDialog, setVendorDialog] = useState(false)
  const initialProductState = {
    unit_price: null,
    vendor_vendor_id: null,
    products_product_id: null,
    vendor_sku: "",
    name: "",
    vendor: "",
  }
  const [newProduct, setNewProduct] = useState(initialProductState)
  console.log("newProduct", newProduct)
  const [activeRow, setActiveRow] = useState({})
  const { unit_price, vendor_vendor_id, products_product_id, vendor_sku } = newProduct
  const [editState, setEditState] = useState(false)
  const [createVendorProductMutation, { error: createVpMutationError, isLoading: vp_Creating }] =
    useMutation(createVendor_product)
  const [updateVendorMutation, { error: updateVpMutationError, isLoading: vp_Updating }] =
    useMutation(updateVendor_product)
  const [deleteVendorProductMutation] = useMutation(deleteVendor_product)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const productOptions = products.map(({ product_id, name }) => {
    return { name, value: product_id }
  })
  const vendorOptions = vendors.map(({ vendor, vendor_id }) => {
    return { name: vendor, vendor_id }
  })
  const clearupload = useRef(null)
  const [btnVisibility, setBtnVisibility] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)
  const [vendorSuggestions, setVendorSuggestions] = useState<any>(null)
  const [ErrorMsgs, setErrorMsgs] = useState([])

  const [filters, setFilters] = useState({})
  const [globalFilterValue, setGlobalFilterValue] = useState("")

  const clearFilter = () => {
    initFilters()
  }
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters1 = { ...filters }
    _filters1["global"].value = value

    setFilters(_filters1)
    setGlobalFilterValue(value)
  }
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },

      "vendor.vendor": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "vendor.vendor_code": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "products.name": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "products.products_sku": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor_sku: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    })
    setGlobalFilterValue("")
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          className="p-button-outlined"
          onClick={clearFilter}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
      </div>
    )
  }
  const header1 = renderHeader()

  const searchProducts = createSearchFunction(products, setFilteredSuggestions)
  const searchVendor = createSearchFunction(vendorOptions, setVendorSuggestions)

  useEffect(() => {
    const ErrorArray = [
      createVpMutationError,
      updateVpMutationError,
      vp_ProductsFetchingError,
      vp_VendorFetchingError,
    ]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [
    createVpMutationError,
    updateVpMutationError,
    vp_ProductsFetchingError,
    vp_VendorFetchingError,
  ])

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }
  useEffect(() => {
    initFilters()
  }, [])

  // if (isLoading || isVendorsLoading || isProductsLoading) return <div>Loading</div>

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
              toast?.current?.show(tsuccess(null, "Product created successfully."))
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

  // console.log(btnVisibility)
  const formik = useFormik({
    initialValues: newProduct,
    validationSchema: Yup.object().shape({
      unit_price: Yup.number().required("*Required").typeError("Must be a Number"),
      vendor_vendor_id: Yup.string().required("*Required").typeError("*Required"),
      name: Yup.string().required("*Required").typeError("*Required"),
      vendor_sku: Yup.string().required("*Required"),
    }),
    onSubmit: async (data) => {
      const { unit_price, vendor_sku } = data
      if (editState) {
        await updateVendorMutation(
          {
            vp_id: activeRow?.vp_id,
            unit_price,
            vendor_sku,
          },
          {
            onSuccess: () => {
              toast?.current?.show(tsuccess("Updated", "Vendor Product updated successfully"))
            },
          }
        )
        setVendorDialog(false)
      } else {
        await createVendorProductMutation(
          { ...data },
          {
            onSuccess: () => {
              toast?.current?.show(tsuccess(null, "Vendor Product created successfully"))
            },
          }
        )
      }
      await refetch()
      setVendorDialog(false)
      setNewProduct(initialProductState)
      formik.resetForm()
    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  console.log("Form Data", formik.values)

  return (
    <div className="grid w-full" ref={scrolToTop}>
      <Toast ref={toast} />
      {(vp_Creating || vp_Updating) && <LoaderFullScreen />}

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
                setNewProduct(initialProductState)
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
                className=" ml-2"
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
        style={{ width: "99%" }}
        className={`col-12 card ${
          vendorDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        } ml-2`}
      >
        <form className="p-fluid p-5" onSubmit={formik.handleSubmit}>
          <h4 className="mb-3">{editState ? "Update " : "Create "}Vendor Product</h4>
          <div className="formgrid grid justify-content-around">
            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <div className="p-float-label">
                <AutoComplete
                  id="vendor_vendor_id"
                  disabled={editState}
                  value={formik.values.vendor}
                  suggestions={vendorSuggestions}
                  completeMethod={searchVendor}
                  field="name"
                  onChange={async (e) => {
                    console.log(e.value)
                    let vendor_vendor_id = typeof e.value === "string" ? e.value : e.value.vendor_id
                    let vendor = typeof e.value === "string" ? e.value : e.value.name

                    await formik.setValues({
                      ...formik.values,
                      vendor_vendor_id,
                      vendor,
                    })
                    // formik.values = { ...formik.values, vendor_city, vendor_state }
                  }}
                  aria-label="products"
                  dropdownAriaLabel="Select Product"
                  className={classNames({ "p-invalid": isFormFieldValid("vendor_vendor_id") })}
                />

                <label
                  htmlFor="vendor_vendor_id"
                  className={classNames({ "p-error": isFormFieldValid("vendor_vendor_id") })}
                >
                  Select Vendor
                </label>
              </div>
              {getFormErrorMessage("vendor_vendor_id")}
            </div>

            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <div className="p-float-label">
                <AutoComplete
                  id="name"
                  disabled={editState}
                  value={formik.values.name}
                  suggestions={filteredSuggestions}
                  completeMethod={searchProducts}
                  field="name"
                  onChange={async (e) => {
                    console.log(e.value)
                    let products_product_id =
                      typeof e.value === "string" ? e.value : e.value.product_id
                    let name = typeof e.value === "string" ? e.value : e.value.name

                    await formik.setValues({
                      ...formik.values,
                      products_product_id,
                      name,
                    })
                  }}
                  aria-label="products"
                  dropdownAriaLabel="Select Product"
                  className={classNames({ "p-invalid": isFormFieldValid("name") })}
                />

                <label
                  htmlFor="name"
                  className={classNames({ "p-error": isFormFieldValid("name") })}
                >
                  Select Product
                </label>
              </div>
              {getFormErrorMessage("name")}
            </div>
            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <span className="p-float-label">
                <InputText
                  id="vendor_sku"
                  name="vendor_sku"
                  value={formik.values.vendor_sku}
                  onChange={formik.handleChange}
                  autoFocus
                  className={classNames({ "p-invalid": isFormFieldValid("vendor_sku") })}
                />
                <label
                  htmlFor="vendor_sku"
                  className={classNames({ "p-error": isFormFieldValid("vendor_sku") })}
                >
                  Vendor SKU
                </label>
              </span>
              {getFormErrorMessage("vendor_sku")}
            </div>
            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <span className="p-float-label">
                <InputNumber
                  id="unit_price"
                  name="unit_price"
                  value={formik.values.unit_price}
                  onChange={(e) => formik.setValues({ ...formik.values, unit_price: e.value })}
                  autoFocus
                  className={classNames({ "p-invalid": isFormFieldValid("unit_price") })}
                />
                <label
                  htmlFor="unit_price"
                  className={classNames({ "p-error": isFormFieldValid("unit_price") })}
                >
                  Unit Price
                </label>
              </span>
              {getFormErrorMessage("unit_price")}
            </div>
          </div>

          <div className="flex justify-content-end mt-3">
            <Button type="submit" className="mr-2" label={editState ? "UPDATE" : "ADD"} />
            <Button
              className="p-button-secondary"
              type="button"
              label="Cancel"
              onClick={() => {
                // ONHIDE
                formik.resetForm()
                setVendorDialog(false)
                setNewProduct(initialProductState)
                setEditState(false)
              }}
            />
          </div>
        </form>
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
            filters={filters}
            header={header1}
            filterDisplay="menu"
          >
            <Column
              field="vendor.vendor"
              header="Vendor"
              filter
              filterPlaceholder="Search by Vendor"
            />
            <Column
              field="vendor.vendor_code"
              header="Vendor Code"
              filter
              filterPlaceholder="Search by Vendor Code"
            />
            <Column
              field="products.name"
              header="Products"
              filter
              filterPlaceholder="Search by Product"
            />
            <Column
              field="products.products_sku"
              header="SKU"
              filter
              filterPlaceholder="Search by SKU"
            />
            <Column
              field="vendor_sku"
              header="Vendor SKU"
              filter
              filterPlaceholder="Search by Vendor SKU"
            />
            <Column field="unit_price" header="Unit Price" />
            <Column
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      className="mr-1"
                      onClick={async () => {
                        console.log("rowData", rowData)
                        const {
                          vendor_vendor_id,
                          vendor_sku,
                          unit_price,
                          products_product_id,
                          products: { name },
                          vendor: { vendor },
                        } = rowData

                        scrolToTop.current?.scrollIntoView()
                        setActiveRow(rowData)
                        setEditState(true)
                        setVendorDialog(true)

                        await formik.setValues({
                          unit_price,
                          vendor_vendor_id,
                          products_product_id,
                          vendor_sku,
                          name,
                          vendor,
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
