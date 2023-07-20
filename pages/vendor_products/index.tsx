import { Suspense, useEffect, useRef, useState, useReducer, startTransition } from "react"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getVendor_products from "app/vendor_products/queries/getVendor_products"
import Layout from "layouts/Layout"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
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
import { Toast } from "primereact/toast"
import { InputNumber } from "primereact/inputnumber"
import ErrorCard from "components/ErrorCard"
import { createCSVFormat, createSearchFunction, tsuccess } from "app/constants"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { devNull } from "os"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { MultiSelect } from "primereact/multiselect"
import { Paginator } from "primereact/paginator"
import Head from "next/head"

const ITEMS_PER_PAGE = 100

const initialState = {
  tableRowsCount: 10,
  skipCount: 0,
  productSearchQuery: "new"
}

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'UPDATE_VENDOR_STATE':
      return { ...state, [payload.key]: payload.value }
    case 'UPDATE_TABLE_ROWS_COUNT':
      return { ...state, tableRowsCount: payload }
    case 'UPDATE_SKIP_COUNT':
      return { ...state, skipCount: payload }
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}



export const Vendor_productsList = () => {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initialState);
  const { skipCount, tableRowsCount, productSearchQuery } = state;
  const page = Number(router.query.page) || 0


  const [{ vendor_products, count: total_vendor_products }, { refetch, isLoading }] = usePaginatedQuery(getVendor_products, {
    orderBy: { id: "desc" },
    where: { status: "Active" },
    skip: skipCount,
    take: tableRowsCount
  })

  console.log("vendor_products", vendor_products);

  const [{ vendors }, { error: vp_VendorFetchingError, isLoading: isVendorsLoading }] = useQuery(
    getVendors,
    {
      orderBy: { id: "asc" },
    }
  )

  const [{ products }, { error: vp_ProductsFetchingError, isLoading: isProductsLoading }] =
    useQuery(getProducts, {
      orderBy: { id: "asc" },
      where: {
        OR: [
          {
            name: { contains: productSearchQuery ?? undefined },
          },
          {
            sku: { contains: productSearchQuery ?? undefined },
          },


        ]
      }
    })

  console.log("Products", products);


  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const [productDialog, setProductDialog] = useState(false)
  const [activeVendorData, setActiveVendorData] = useState({})

  const [errorProducts, setErrorProducts] = useState([])
  const [vendorDialog, setVendorDialog] = useState(false)
  const initialProductState = {

    vendor_vendor_id: null,
    products_product_id: null,
    product: "",
    vendor_sku: "",
    vendor: "",
    status: { name: "Active" },
    priority: null,
  }
  const [newProduct, setNewProduct] = useState(initialProductState)

  const [activeRow, setActiveRow] = useState({})
  const { unit_price, vendor_vendor_id, products_product_id, vendor_sku } = newProduct
  const [editState, setEditState] = useState(false)
  const [readOnly, setReadOnly] = useState(false)

  const [createVendorProductMutation, { error: createVpMutationError, isLoading: vp_Creating }] =
    useMutation(createVendor_product)
  const [updateVendorMutation, { error: updateVpMutationError, isLoading: vp_Updating }] =
    useMutation(updateVendor_product)
  const [deleteVendorProductMutation] = useMutation(deleteVendor_product)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [productEditState, setProductEditState] = useState(false)

  // const _filteredVendorName = vendor_products.filter((eachVendor) => {

  //   if (formik?.values) {
  //     // console.log("ecahVendor", eachVendor);
  //     console.log("In formik if")
  //     if (eachVendor.vendors.name === formik.values.vendor.name) {
  //       console.log("ecahVendor", eachVendor);
  //       return true
  //     } else {
  //       return false
  //     }

  //   }


  // })
  // console.log("_filteredVendorName", _filteredVendorName);

  const productOptions = products.map(({ id, sku, name }) => {
    return { name: ` ${sku} - ${name} `, id }
  })
  const vendorOptions = vendors.map(({ name, id }) => {
    return { name, id }
  })
  const clearupload = useRef(null)
  const [btnVisibility, setBtnVisibility] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)
  const [vendorSuggestions, setVendorSuggestions] = useState<any>(null)
  const [ErrorMsgs, setErrorMsgs] = useState([])
  const [storeData, setStoreData] = useState({})

  const columns = [
    { field: "vendors.name", header: "Vendor", filter: true, filterPlaceholder: "Search By Vendor" },
    { field: "vendors.code", header: "Code", filter: true, filterPlaceholder: "Search By Vendor_Code" },
    { field: "products.name", header: "Products", filter: true, filterPlaceholder: "Search By product" },
    { field: "sku", header: "Vendor SKU", filter: true, filterPlaceholder: "Search By Vendor SKU" },
    { field: "products.sku", header: "SKU", filter: true, filterPlaceholder: "Search By Product SKU" },
    { field: "status", header: "Status", filter: true, filterPlaceholder: "Search By Status" },
    { field: "priority", header: "Priority", filter: true, filterPlaceholder: "Search By Priority" },
  ]
  const statusOptions = [
    { name: 'Active' },
    { name: 'Inactive' },
  ];

  const priorityOptions = [
    { name: 'High', value: 30 },
    { name: 'Medium', value: 20 },
    { name: 'Low', value: 10 }
  ]

  const [selectedColumns, setSelectedColumns] = useState(columns)

  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    )
    setSelectedColumns(orderedSelectedColumns)
  }

  const header = (
    <div style={{ textAlign: "left" }}>
      <MultiSelect
        value={selectedColumns}
        options={columns}
        optionLabel="header"
        onChange={onColumnToggle}
        style={{ width: "20em" }}
      />
    </div>
  )

  const columnComponents = selectedColumns.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        filter={col.filter}
        filterPlaceholder={col.filterPlaceholder}
      />
    )
  })

  useEffect(() => {
    const defaultColumns = columns.filter(
      col => !["vendors.code"].includes(col.field))

    onColumnToggle({ value: defaultColumns })
  }, [])

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

      "vendors.name": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "vendors.code": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "products.name": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "products.sku": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      priority: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    })
    setGlobalFilterValue("")
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <MultiSelect
          value={selectedColumns}
          options={columns}
          optionLabel="header"
          onChange={onColumnToggle}
          style={{ width: "20em" }}
        />
        <div className="flex gap-4">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Keyword Search"
            />
          </span>
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Clear"
            className="p-button-outlined"
            onClick={clearFilter}
          />
        </div>
      </div>
    )
  }
  const header1 = renderHeader()

  const searchProducts = createSearchFunction(productOptions, setFilteredSuggestions)
  const searchVendor = createSearchFunction(vendorOptions, setVendorSuggestions)

  useEffect(() => {
    const ErrorArray = [
      createVpMutationError,
      updateVpMutationError,
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
  ])

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }
  useEffect(() => {
    initFilters()
  }, [])




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



  const formik = useFormik({
    initialValues: newProduct,
    validationSchema: Yup.object().shape({
      priority: Yup.number().optional().typeError("Must be a Number"),
      vendor: Yup.object().required("Vendor is required"),
      product: Yup.object().required("Vendor is required"),

    }),
    onSubmit: async (data) => {
      const {
        vendor_sku,
        vendor,
        priority,
        status,
        product,
        id

      } = data

      console.log("Data Vendor", data);
      if (editState) {
        await updateVendorMutation(
          {
            id,
            sku: vendor_sku,
            priority,
            status: status.name,
          },
          {
            onSuccess: () => {
              toast?.current?.show(tsuccess("Updated", "Vendor Product updated successfully"))
              setReadOnly(false)
              setEditState(false)

            },
          }
        )
        setVendorDialog(false)
      } else {
        await createVendorProductMutation(
          {
            sku: vendor_sku,
            priority,
            status: status.name,
            product: product.id,
            vendor: vendor.id,
          },

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

  console.log("Formik data", formik.values)


  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const handlePageChange = async (event) => {
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
  }


  const pagination = () => <Paginator first={skipCount} rows={tableRowsCount} totalRecords={total_vendor_products} rowsPerPageOptions={[10, 20, 30]} onPageChange={handlePageChange} />


  return (
    <div className="grid w-full" ref={scrolToTop}>
      <Toast ref={toast} />
      {(vp_Creating || vp_Updating) && <LoaderFullScreen />}

      <div className="col-12 ">

        <div className="card flex justify-content-between align-items-center mb-0">
          <h4 className="mb-0">Vendor Catalog</h4>
          <div className="flex">
            <Button
              icon="pi pi-plus"
              className="ml-2 p-2"
              label="Add Vendor Products"
              onClick={() => {
                setVendorDialog(true)
                setNewProduct(initialProductState)
              }}
            ></Button>
            {/* <span className=" flex justify-content-center align-items-center">
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
            </span> */}
            {/* <Button
              icon="pi pi-download"
              className="ml-2"
              label="CSV format"
              onClick={() => createCSVFormat(vpCsvFormatDetails)}
            /> */}
          </div>
        </div>
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
      </div>

      <div
        style={{ width: "99%" }}
        className={`col-12 card ${vendorDialog
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
          } ml-2`}
      >
        <form className="p-fluid p-5" onSubmit={formik.handleSubmit}>
          <div className="flex justify-content-between">
            {/* <h4 className="mb-3">{editState ? "Update " : "Create "}Vendor Product</h4> */}
            <h4 className="mb-3">
              {" "}
              {readOnly
                ? "Vendor Product"
                : editState
                  ? "Update Vendor Product "
                  : "Create Vendor Product "}
            </h4>

            {readOnly ? (
              <Button
                icon="pi pi-pencil"
                className="mr-1"
                onClick={async (e) => {
                  e.preventDefault()
                  setVendorDialog(true)
                  setReadOnly(false)
                  setEditState(true)
                }}
                tooltip="Edit Form"
                tooltipOptions={{ position: "top" }}
              />
            ) : null}
          </div>

          <div className="formgrid grid justify-content-start">
            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <div className="p-float-label">
                <AutoComplete
                  id="vendor"
                  disabled={readOnly || editState}
                  value={formik.values.vendor}
                  suggestions={vendorSuggestions}
                  completeMethod={searchVendor}
                  field="name"
                  onChange={async (e) => {
                    let vendor_vendor_id = typeof e.value === "string" ? e.value : e.value.id
                    let vendor = typeof e.value === "string" ? e.value : e.value

                    await formik.setValues({
                      ...formik.values,
                      vendor,
                    })
                  }}
                  aria-label="products"
                  dropdownAriaLabel="Select Vendor"
                  className={classNames({ "p-invalid": isFormFieldValid("vendor") })}
                />

                <label
                  htmlFor="vendor"
                  className={classNames({ "p-error": isFormFieldValid("vendor") })}
                >
                  Select Vendor
                </label>
              </div>
              {getFormErrorMessage("vendor")}
            </div>

            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <div className="p-float-label">
                <AutoComplete
                  id="name"
                  disabled={readOnly || editState}
                  value={formik.values.product}
                  suggestions={filteredSuggestions}
                  completeMethod={searchProducts}
                  field="name"
                  onChange={async (e) => {

                    let product = typeof e.value === "string" ? e.value : e.value
                    let _productSearchQuery = typeof e.value === "string" ? e.value : undefined
                    startTransition(() => {
                      dispatch({ type: "UPDATE_VENDOR_STATE", payload: { key: "productSearchQuery", value: _productSearchQuery }, })
                    });


                    await formik.setValues({
                      ...formik.values,
                      product,
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
                  disabled={readOnly}
                  name="vendor_sku"
                  value={formik?.values?.vendor_sku}
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
                <Dropdown
                  disabled={readOnly}
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  options={priorityOptions}
                  optionLabel="name"
                  placeholder="Preference"
                  className="w-full"
                  id="priority"
                />
                <label
                  htmlFor={"type"}
                  className={classNames({ "p-error": isFormFieldValid("priority") })}
                >
                  Preference
                </label>
              </span>


              {getFormErrorMessage("priority")}
            </div>
            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <span className="p-float-label">
                <Dropdown
                  disabled={readOnly}
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  options={statusOptions}
                  optionLabel="name"
                  placeholder="Status"
                  className="w-full"
                  id="status"
                />
                <label
                  htmlFor={"type"}
                  className={classNames({ "p-error": isFormFieldValid("status") })}
                >
                  Status
                </label>
              </span>
              {getFormErrorMessage("status")}
            </div>
          </div>

          <div className="flex justify-content-end mt-3">
            <Button type="submit" className="mr-2" label={editState ? "UPDATE" : "SUBMIT"} />
            <Button
              className="p-button-secondary"
              type="button"
              label="Cancel"
              onClick={() => {
                formik.resetForm()
                setVendorDialog(false)
                setNewProduct(initialProductState)
                setEditState(false)
                setReadOnly(false)
              }}
            />
          </div>
        </form>
      </div>

      <div
        className={`col-12 ${errorProducts.length
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
        <div className="card mb-0">
          <DataTable
            value={vendor_products}
            showGridlines
            stripedRows
            className="text-s datatable-responsive"
            filters={filters}
            header={header1}
            footer={pagination}
            filterDisplay="menu"
            scrollable scrollHeight="455px"
            onRowClick={async (e) => {

              const {
                id: vendorProductId,
                vendors: { name: vendorName, id: vendorId },
                status,
                sku,
                priority,
                products: { name: productName, sku: productSku, id: productId },
              } = e.data

              await formik.setValues({
                id: vendorProductId,
                vendor_sku: sku,
                vendor: { name: vendorName, id: vendorId },
                product: { name: ` ${productSku} - ${productName} `, id: productId },
                status: { name: status },
                priority,
              })
              setReadOnly(true)
              setVendorDialog(true)
            }}
          >
            {columnComponents}
          </DataTable>
        </div>
      </div>
    </div >
  )
}

const Vendor_productsPage = () => {
  return (
    // <Suspense fallback={<Loading />}>
    //   <Layout>
    //     <Vendor_productsList />
    //   </Layout>
    // </Suspense>
    <Layout>
      <Head>
        <title>Vendor Catalog</title>
      </Head>
      <div>
        <Suspense fallback={<Loading />}>
          <Vendor_productsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default Vendor_productsPage
