import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { invoke, useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getInventory_products from "app/inventory_products/queries/getInventory_products"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import Loading from "components/loading"
import { FileUpload } from "primereact/fileupload"
import papa from "papaparse"
import downloadCsv from "download-csv"
import createInventory_product from "app/inventory_products/mutations/createInventory_product"
import updateInventory_product from "app/inventory_products/mutations/updateInventory_product"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import getProducts from "app/products/queries/getProducts"
import deleteInventory_product from "app/inventory_products/mutations/deleteInventory_product"
import axios from "axios"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { createCSVFormat, createSearchFunction, exportExcel, filterExistingValues, tsuccess } from "app/constants"
import { Toast } from "primereact/toast"
import ErrorCard from "components/ErrorCard"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import getShelves from "app/shelves/queries/getShelves"
import getWarehouses from "app/warehouses/queries/getWarehouses"
import getWarehouse from "app/warehouses/queries/getWarehouse"
import getArea from "app/areas/queries/getArea"

const ITEMS_PER_PAGE = 100

export const Inventory_productsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [createInventory_productMutation, { error: createInventoryError, isLoading: creatingInventory },] = useMutation(createInventory_product)
  const [updateInventory_productMutation, { error: updateInventoryError, isLoading: updatingInventory },] = useMutation(updateInventory_product)
  const [deleteInventory_productsMutation] = useMutation(deleteInventory_product)
  const [createNotifications_sentMutation] = useMutation(createNotifications_sent)


  const [{ inventory_products, hasMore }, { refetch }] = usePaginatedQuery(getInventory_products, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  console.log("inventory_products", inventory_products)

  const [{ products }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ warehouses }] = useQuery(getWarehouses, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  console.log('warehouses: ', warehouses);


  const productOptions = products.map(({ id: product_id, name, sku, description }) => {
    return {
      name: `${sku} - ${name}`,
      product_id,
      description,
    }
  })
  console.log('productOptions: ', productOptions);



  const productInitialState = {
    name: "",
    price: null,
    quantity: null,
    products_product_id: "",
    product_description: "",
    good_stock: null,
    warehouse: "",
    area: "",
    shelf: "",
  }

  const [productForm, setProductForm] = useState<boolean>(false)
  const [productEditState, setProductEditState] = useState(false)
  const [productSuggestions, setProductSuggestions] = useState<any>(null)
  const [productDetails, setProductDetails] = useState(productInitialState)
  const [activeRowData, setActiveRowData] = useState({})
  const [btnVisibility, setBtnVisibility] = useState(false)
  const [errorProducts, setErrorProducts] = useState([])
  const [filters, setFilters] = useState({})
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [warehouseSuggestions, setWarehouseSuggestions] = useState<any>(null)
  const [areaOptions, setAreaOptions] = useState<any>(null)
  const [areaSuggestions, setAreaSuggestions] = useState<any>(null)
  const [shelfOptions, setShelfOptions] = useState<any>(null)
  const [shelfSuggestions, setShelfSuggestions] = useState<any>(null)
  const [expandedRows, setExpandedRows] = useState(null)

  const toast = useRef(null)
  const clearUpload = useRef<FileUpload>(null)
  const scroolToTop = useRef<HTMLDivElement>(null)

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
      products_sku: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      price: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      product_type: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    })
    setGlobalFilterValue("")
  }

  const createExcelExportData = () => {
    const excelData = inventory_products.map((ele) => {
      const {
        products: { products_sku, name, product_type },
        good_stock,
        quantity,
      } = ele

      return {
        SKU: products_sku,
        Product: name,
        Type: product_type,
        "Good-Stock": good_stock,
        "Bad-Stock": quantity - good_stock,
        "Total-Stock": quantity,
      }
    })
    exportExcel(excelData)
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-">
        <span
          className="flex justify-content-between flex-grow-1 pr-3"
          style={{ display: "inline-block" }}
        >
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
        </span>
        <Button
          type="button"
          icon="pi pi-file-excel"
          onClick={createExcelExportData}
          className="p-button-success mr-2"
          // data-pr-tooltip="XLS"
          tooltip="Export-XLS"
          tooltipOptions={{ position: "bottom" }}
        />
      </div>
    )
  }
  const header1 = renderHeader()

  const rowExpansionTemplate = (data) => {
    return (
      <div className="w-full expandTable">
        <DataTable
          value={data.rfq_products}
          responsiveLayout="scroll"
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
          {/* <Column field="rfq_products_id" header="ID" style={{ paddingTop: "0.5rem" }} /> */}
          {/* <Column field="products.imageUrl" header="Image" body={(rowdata) => <img src={rowdata?.products?.imageUrl} alt="Product Image" height="100" width="100" />} /> */}
          <Column
            field="products.sku"
            header="Area"
          // className="text-center"
          />
          <Column
            field=""
            header="Shelf"
            body={() => <a href='/purchase_orders/id'>PO Num</a>}
          // className="text-center"
          />

          <Column
            field="products.name"
            header="Quantity"
          // className="text-center"
          />
          {/* <Column
            field="price"
            header="Target Price / Unit"
          // className="text-center"
          />
          <Column
            field="quantity"
            header="Quantity"
          // className="text-center"
          /> */}
        </DataTable>
      </div>
    )
  }

  // const productsId = products.map((ele, i) => ele.product_id)
  // const inventoryProductsId = inventory_products.map((ele, i) => ele.products_product_id)
  // console.log("inventoryProductsId", inventoryProductsId)
  // console.log("productsId", productsId)
  // const avilableProductsID = filterExistingValues(productsId, inventoryProductsId)

  const searchProducts = createSearchFunction(productOptions, setProductSuggestions)
  const searchWarehouse = createSearchFunction(warehouses, setWarehouseSuggestions)
  const searchArea = createSearchFunction(areaOptions, setAreaSuggestions)
  const searchShelf = createSearchFunction(shelfOptions, setShelfSuggestions)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  console.log('inventory_products: ', inventory_products);
  const inventoryTableData = Object.values(
    inventory_products.reduce((acc, curr) => {
      const { id, quantity, products, shelves } = curr

      if (acc[products.sku]) {
        acc[products.sku].shelves.push({ ...shelves, quantity })

      } else {
        acc[products.sku] = {
          inventoryProductId: id,
          product: products,
          shelves: [{ ...shelves, quantity }],
        }
      }
      return acc;

    }, {})
  )

  const findQuantityByShelfType = (shelfType, shelves) => {
    const qty = shelves.reduce((acc, { shelf_type: { name }, quantity }) => name === shelfType ? acc + quantity : acc, 0)
    return qty
  }
  console.log('inventoryTableData: ', inventoryTableData);

  const onBasicUpload = async (e) => {
    const csv = [] // this will contain all the data of imported csv file

    setErrorProducts([])
    let index = 2
    papa.parse(e.files[0], {
      header: true,
      skipEmptyLines: true,
      step: async ({ data }, parser) => {
        console.log(`${index}-data`, data)
        const missingKey = ["PRODUCT_ID", "PRICE", "QUANTITY", "DESCRIPTION", "GOOD-STOCK"].find(
          (key) => !(key in data)
        )
        console.log("missingKey", missingKey)
        if (missingKey) {
          setErrorProducts([...errorProducts, { message: `Column ${missingKey} missing.` }])
          parser.abort()
        }
        try {
          const result = await createInventory_productMutation(
            {
              price: Number(data["PRICE"]),
              quantity: Number(data["QUANTITY"]),
              products_product_id: Number(data["PRODUCT_ID"]),
              product_description: data["DESCRIPTION"],
              good_stock: Number(data["GOOD-STOCK"]),
            },
            {
              onSuccess: (data) => {
                toast?.current?.show(tsuccess("Products Created", `Products created successfully.`))
              },
              onError: (error) => {
                console.log("Product failed: ", data)
                console.log("error: ", error)
                setErrorProducts([
                  ...errorProducts,
                  { ...data, message: error.message, rowNum: index },
                ])
              },
            }
          )
          index += 1
          // console.log(result)
        } catch (error) {
          console.log(error)
        }
        await refetch()
      },
    })
  }

  // console.log("error-products", errorProducts)
  const vpCsvFormatDetails = {
    headers: ["PRODUCT_ID", "PRICE", "QUANTITY", "DESCRIPTION", "GOOD-STOCK"],
    name: "Inventory-Product-format.csv",
  }

  const formik = useFormik({
    initialValues: productDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required"),
      // price: Yup.number().required("*Required").typeError("Must be a Number"),
      quantity: Yup.number().required("*Required").typeError("Must be a Number"),
      // good_stock: Yup.number().required("*Required").typeError("Must be a Number"),
    }),
    onSubmit: async (data) => {
      // console.log("data", data)

      const { quantity, products_product_id, shelf } = data

      if (!productEditState) {
        try {
          await createInventory_productMutation(
            {
              quantity: quantity,
              product: products_product_id,
              shelf: shelf.id,
            },
            {
              onSuccess: () => {
                toast?.current?.show(
                  tsuccess("Product Created", `${data.name} created successfully.`)
                )
              },
            }
          )
        } catch (error) {
          console.log("error", error)
          return
        }
      } else {
        const inventory_product_id = activeRowData.inventory_product_id

        try {
          await updateInventory_productMutation(
            {
              inventory_product_id,
              price: Number(price),
              quantity: Number(quantity),
              good_stock,
            },
            {
              onSuccess: () => {
                toast?.current?.show(
                  tsuccess("Product Updated", `${data.name} updated successfully.`)
                )
              },
            }
          )
        } catch (error) {
          console.log("Updation", error)
        }
      }
      await refetch()
      setProductEditState(false)
      setProductForm(false)
      formik.resetForm()
    },
  })
  // console.log(formik.values)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const [ErrorMsgs, setErrorMsgs] = useState([])
  useEffect(() => {
    const ErrorArray = [createInventoryError, updateInventoryError]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [createInventoryError, updateInventoryError])

  useEffect(() => {
    initFilters()
  }, [])

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }


  // useEffect(() => {

  //   const warehouseDetails = async () => {
  //     const Query = await invoke(getWarehouse, {
  //       id: formik?.values?.warehouse?.id
  //     })
  //     return Query.
  //   }

  //   warehouseDetails
  //   console.log('warehouseDetails: ', warehouseDetails());

  // }, [formik.values.warehouse?.id])


  console.log("formik.values", formik.values)
  console.log("formik.errors", formik.errors)

  return (
    <div className="grid w-full mr-0" ref={scroolToTop}>
      {creatingInventory && <LoaderFullScreen />}
      {updatingInventory && <LoaderFullScreen />}
      <Toast ref={toast} />

      <div className="col-12">
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
        <div className="card flex justify-content-between align-items-center">
          <h2 className="mb-0">Inventory</h2>
          <div className="flex">
            <Button
              icon="pi pi-plus"
              className="ml-2"
              label="Add Products"
              onClick={() => {
                setProductForm(true)
              }}
            ></Button>
            <span className=" flex justify-content-center align-items-center">
              <FileUpload
                className="ml-2 inline-block "
                mode="basic"
                accept=".csv"
                customUpload
                maxFileSize={1000000}
                uploadHandler={(e) => onBasicUpload(e)}
                ref={clearUpload}
                onSelect={() => setBtnVisibility(true)}
                onBeforeSelect={() => setBtnVisibility(false)}
                onClear={() => setBtnVisibility(false)}
                chooseLabel="Import"
                chooseOptions={{
                  label: "Uplaod",
                  icon: "pi pi-upload",
                }}
              />
              <Button
                visible={btnVisibility}
                style={{ backgroundColor: "var(--red-400)", border: "var(--red-400)" }}
                icon="pi pi-file-excel                "
                className=" ml-2"
                onClick={() => {
                  clearUpload?.current.clear()
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
      <div
        className={`col-12  ${productForm
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
          }`}
      >
        <div className="card p-4">
          <form className="p-fluid" onSubmit={formik.handleSubmit}>
            <h4 className="mb-3">{productEditState ? "Update " : "Create "}Product</h4>
            <div className="formgrid grid justify-content-flex-start">
              <div className="field col-12 md:col-3 lg:col-3 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="name"
                    value={formik.values.name}
                    suggestions={productSuggestions}
                    completeMethod={searchProducts}
                    disabled={productEditState}
                    dropdown
                    forceSelection
                    field="name"
                    onChange={async (e) => {
                      // console.log(e.value)
                      let name = typeof e.value === "string" ? e.value : e.value?.name
                      let products_product_id = e.value?.product_id
                      let product_description = e.value?.description

                      await formik.setValues({
                        ...formik.values,
                        name,
                        products_product_id,
                        product_description,
                      })
                      // formik.values = { ...formik.values, vendor_city, vendor_state }
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
                <div className="p-float-label">
                  <AutoComplete
                    id="warehouse"
                    value={formik?.values?.warehouse}
                    suggestions={warehouseSuggestions}
                    completeMethod={searchWarehouse}
                    dropdown
                    forceSelection
                    field="name"
                    onChange={async (e) => {
                      formik.handleChange(e);

                      // console.log("event:", e.value)

                      const warehouse = await invoke(getWarehouse, {
                        id: e.value?.id
                      })
                      setAreaOptions(warehouse?.areas_areas_warehouseTowarehouse)

                    }}
                    aria-label="products"
                    dropdownAriaLabel="Select Product"
                    className={classNames({ "p-invalid": isFormFieldValid("warehouse") })}
                  />

                  <label
                    htmlFor="warehouse"
                    className={classNames({ "p-error": isFormFieldValid("warehouse") })}
                  >
                    Select Warehouse
                  </label>
                </div>
                {getFormErrorMessage("warehouse")}
              </div>
              <div className="field col-12 md:col-3 lg:col-3 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="area"
                    value={formik?.values?.area}
                    suggestions={areaSuggestions}
                    completeMethod={searchArea}
                    disabled={productEditState}
                    dropdown
                    forceSelection
                    field="name"
                    onChange={async (e) => {
                      formik.handleChange(e);

                      console.log("event:", e.value)



                      const area = await invoke(getArea, {
                        id: e.value?.id
                      })
                      console.log('area: ', area);
                      const _format = area?.shelves.map(ele => ({ ...ele, name: ele.number }))
                      setShelfOptions(_format)

                    }}
                    aria-label="products"
                    dropdownAriaLabel="Select Product"
                    className={classNames({ "p-invalid": isFormFieldValid("areas") })}
                  />

                  <label
                    htmlFor="areas"
                    className={classNames({ "p-error": isFormFieldValid("areas") })}
                  >
                    Select Area
                  </label>
                </div>
                {getFormErrorMessage("areas")}
              </div>
              <div className="field col-12 md:col-3 lg:col-3 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="shelf"
                    value={formik?.values?.shelf ?? "No shelfs"}
                    suggestions={shelfSuggestions}
                    completeMethod={searchShelf}
                    dropdown
                    forceSelection
                    field="name"
                    onChange={async (e) => {
                      formik.handleChange(e);
                      console.log("event:", e.value)
                      const area = await invoke(getArea, {
                        id: e.value?.id
                      })
                      console.log('area: ', area);

                    }}
                    aria-label="products"
                    dropdownAriaLabel="Select Product"
                    className={classNames({ "p-invalid": isFormFieldValid("areas") })}
                  />

                  <label
                    htmlFor="areas"
                    className={classNames({ "p-error": isFormFieldValid("areas") })}
                  >
                    Select Shelf
                  </label>
                </div>
                {getFormErrorMessage("areas")}
              </div>
              {[
                // { type: "text", label: "Price", field: "price" },
                // { type: "text", label: "Quantity", field: "quantity" },
                { type: "text", label: "Quantity", field: "quantity" },
              ].map((ele, i) => (
                <div key={i} className="field col-12 md:col-3 lg:col-3 mt-4">
                  <span className="p-float-label">
                    <InputNumber
                      id={ele.field}
                      name={ele.field}
                      value={formik.values[ele.field]}
                      // onChange={formik.handleChange}
                      onChange={(e) => formik.setFieldValue(`${ele.field}`, e.value)}
                      autoFocus
                      className={classNames({ "p-invalid": isFormFieldValid(ele.field) })}
                    />

                    <label
                      htmlFor={ele.field}
                      className={classNames({ "p-error": isFormFieldValid(ele.field) })}
                    >
                      {ele.label}
                    </label>
                  </span>
                  {getFormErrorMessage(ele.field)}
                </div>
              ))}
            </div>
            <div className="flex mt-4">
              <Button type="submit" className="mr-2" label={productEditState ? "UPDATE" : "SUBMIT"} />
              <Button
                className="p-button-secondary"
                type="button"
                label="Cancel"
                onClick={() => {
                  formik.resetForm()
                  setProductEditState(false)
                  setProductForm(false)
                  setAreaOptions([])
                  setShelfOptions([])
                  // setVendorDetails(initialVendorState)
                }}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <DataTable
            value={inventoryTableData}
            showGridlines
            // header={renderHeader}
            // scrollable
            // scrollHeight="60vh"
            stripedRows
            className="text-s datatable-responsive"
            filters={filters}
            header={header1}
            filterDisplay="menu"
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            // globalFilterFields={["products_sku"]}
            emptyMessage="No Results found."
          >
            <Column expander={true} style={{ width: "3em" }} />
            <Column
              field="product.sku"
              header="SKU"
              filter
              filterPlaceholder="Search by SKU"
            // className="text-center"
            />
            <Column
              field="product.name"
              header="Name"
              filter
              filterPlaceholder="Search by Products"
            // className="text-center"
            />
            {/* <Column
              field="price"
              header="Price"
              filter
              filterPlaceholder="Search by Price"
            // className="text-center"
            /> */}
            <Column
              field="product.product_types.type"
              header="Type"
              filter
              filterPlaceholder="Search by Type"
            // className="text-center"
            />
            {/* <Column
          field="vendor_sku"
          header="Vendor Sku"
          // className="text-center"
        /> */}
            <Column
              field="good_stock"
              header="Good-Stock"
              // className="text-center"
              body={(rowdata) => findQuantityByShelfType("Good", rowdata.shelves)}
            />
            <Column
              field="bad_stock"
              header="Bad-Stock"
              body={(rowdata) => findQuantityByShelfType("Bad", rowdata.shelves)}
            // className="text-center"
            />
            {/* <Column
              field="quantity"
              header="Total-Stock"
              // className="text-center"
            /> */}

            <Column
              field="block_stock"
              header="Block-Stock"
            // className="text-center"
            />

            <Column
              field="available_stock"
              header="Available-Stock"
            // className="text-center"
            />



            {/* <Column
              field="shelf_attributes"
              header="Shelf Attributes"
              body={(rowdata) => {
                const attributes = rowdata.shelf_attributes
                console.log(attributes, "attributes")
                return (
                  <>
                    <p>{attributes?.InventoryAlloction}</p>
                    <p>{attributes?.InventorySync}</p>
                    <p>{attributes?.SkuMixing}</p>
                    <p>{attributes?.ShelfHold}</p>
                  </>
                )
              }}
            // className="text-center"
            /> */}

            <Column
              field="size"
              header="Size"
            // className="text-center"
            />

            <Column
              field="color"
              header="Color"
            // className="text-center"
            />

            <Column
              field="brand"
              header="Brand"
            // className="text-center"
            />

            {/* <Column
              // field="vendor_gstin"
              header="Action"
              body={(rowData) => {
                // console.log("rowData: ", rowData)
                return (
                  <div>
                    <Button
                      // label="Edit"
                      icon="pi pi-pencil"
                      className="m-1"
                      onClick={async () => {
                        console.log("rowData", rowData)
                        setActiveRowData({ ...rowData })
                        setProductEditState(true)
                        setProductForm(true)
                        await formik.setValues({ ...rowData })
                        scroolToTop?.current?.scrollIntoView()
                      }}
                    />
                    <Button
                      // label="Delete"
                      disabled={true}
                      icon="pi pi-trash"
                      className="m-1"
                      onClick={async () => {
                        // console.log("rowData: ", rowData.products_sku)
                        const productSku = await rowData.products_sku
                        // console.log("productSku: ", productSku)
                        const inventoryProductId = inventory_products.filter(({ products }) => {
                          return products.products_sku === productSku
                        })
                        // console.log("inventoryProductId: ", inventoryProductId)

                        await deleteInventory_productsMutation({
                          inventory_product_id: Number(inventoryProductId[0]?.inventory_product_id),
                        })
                        await refetch()
                      }}
                    />
                  </div>
                )
              }}
            // className="text-center"
            /> */}
          </DataTable>
        </div>
      </div>
    </div>
  )
}

const Inventory_productsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Inventory_productsList />
      </Layout>
    </Suspense>
  )
}

export default Inventory_productsPage
