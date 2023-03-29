import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
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
import createInventory_product from "app/inventory_products/mutations/createInventory_product"
import updateInventory_product from "app/inventory_products/mutations/updateInventory_product"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import getProducts from "app/products/queries/getProducts"
import deleteInventory_product from "app/inventory_products/mutations/deleteInventory_product"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { createSearchFunction, exportExcel, initialFilterRules, tsuccess } from "app/constants"
import { Toast } from "primereact/toast"
import ErrorCard from "components/ErrorCard"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode } from "primereact/api"
import getWarehouses from "app/warehouses/queries/getWarehouses"
import getWarehouse from "app/warehouses/queries/getWarehouse"
import getArea from "app/areas/queries/getArea"
import { MultiSelect } from "primereact/multiselect"

const ITEMS_PER_PAGE = 100

export const Inventory_productsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [createInventory_productMutation, { error: createInventoryError, isLoading: creatingInventory },] = useMutation(createInventory_product)
  const [updateInventory_productMutation, { error: updateInventoryError, isLoading: updatingInventory },] = useMutation(updateInventory_product)

  const [selectedWarehouse, setSelectedWarehouse] = useState()
  const [{ inventory_products, hasMore }, { refetch }] = usePaginatedQuery(getInventory_products, {
    orderBy: { id: "asc" },
    where: {
      shelves: {
        areas: {
          warehouse: selectedWarehouse?.id ?? undefined
        }
      }
    },
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

  const productOptions = products.map(({ id: product_id, name, sku, description }) => {
    return {
      name: `${sku} - ${name}`,
      product_id,
      description,
    }
  })


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

  const initialFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "product.sku": initialFilterRules.andContains,
    "product.name": initialFilterRules.andContains,
    "product.product_types.type": initialFilterRules.andContains,

  }
  const [filters, setFilters] = useState(initialFilters)
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [warehouseSuggestions, setWarehouseSuggestions] = useState<any>(null)
  const [areaOptions, setAreaOptions] = useState<any>(null)
  const [areaSuggestions, setAreaSuggestions] = useState<any>(null)
  const [shelfOptions, setShelfOptions] = useState<any>(null)
  const [shelfSuggestions, setShelfSuggestions] = useState<any>(null)
  const [expandedRows, setExpandedRows] = useState(null)

  const toast = useRef(null)
  const scrollToTop = useRef<HTMLDivElement>(null)
  const [selectedColumns, setSelectedColumns] = useState([])
  const columns = [
    {
      field: "product.sku",
      header: "SKU",
      filter: true,
      filterPlaceholder: "Search by SKU",

    },
    {
      field: "product.name",
      header: "Name",
      filter: true,
      filterPlaceholder: "Search by Products",
    },
    {
      field: "product.product_types.type",
      header: "Type",
      filter: true,
      filterPlaceholder: "Search by Type"
    },
    {
      field: "good_stock",
      header: "Good-Stock",
      filterField: "",
      body: (rowdata) => findQuantityByShelfType("Good", rowdata.shelves)
      // filter: true,
      // filterPlaceholder: "Search by Type"
    },
    {
      field: "bad_stock",
      header: "Bad-Stock",
      body: (rowdata) => findQuantityByShelfType("Bad", rowdata.shelves)
    },
    {
      field: "block_stock",
      header: "Block-Stock",
    },
    {
      field: "available_stock",
      header: "Available-Stock",
    },
    {
      field: "size",
      header: "Size",
    },
    {
      field: "color",
      header: "Color",
    },
    {
      field: "brand",
      header: "Brand",
    }

  ];
  const clearFilter = () => {
    setFilters(initialFilters)
    setGlobalFilterValue("")
  }
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters1 = { ...filters }
    _filters1["global"].value = value

    setFilters(_filters1)
    setGlobalFilterValue(value)
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-center">
        <div className="flex-grow-1">
          <MultiSelect
            value={selectedColumns}
            options={columns?.map(({ header, field }) => ({
              label: header,
              value: field
            }))}
            onChange={(e) => setSelectedColumns(e.value)}
            style={{ width: "20em" }}
          />
        </div>

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
          className="p-button-outlined ml-3"
          onClick={clearFilter}
        />


      </div>
    )
  }
  const header1 = renderHeader()

  const rowExpansionTemplate = (data) => {
    return (
      <div className="w-full expandTable">
        <DataTable
          value={data.shelves}
          responsiveLayout="scroll"
          showGridlines
          // header={renderHeader}
          stripedRows
          className="text-s datatable-responsive"
          onRowClick={async (e) => {

            const {
              product: { name, sku, id: productId },
              quantity,
              inventoryProductId,
              areas: area,
              areas: { warehouse_areas_warehouseTowarehouse: warehouse },
              number,
              shelf_type: { name: shelfType }
            } = e.data

            await formik.setValues({
              inventoryProductId,
              name: `${name} - ${sku}`,
              quantity,
              products_product_id: productId,
              warehouse,
              area,
              shelf: { name: `${number} - ${shelfType}` }

            })
            setProductForm(true)
            setProductEditState(true)
          }}

        // paginator
        // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
        // rows={PAGINATION_VARIABLES.rows}
        // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
        // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
        >
          {[
            {
              field: "areas.warehouse_areas_warehouseTowarehouse.name", header: "Warehouse"
            },
            {
              field: "areas.name", header: "Area"
            },
            {
              field: "number", header: "Shelf",
            },
            {
              field: "shelf_type.name", header: "Shelf Type",
            },
            {
              field: "quantity", header: "Quantity"
            }
          ].map(({ field, header, body }, i) => (
            <Column
              key={i}
              field={field}
              header={header}
              body={body}
            />
          ))}

        </DataTable>
      </div >
    )
  }

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
        acc[products.sku].shelves.push({ inventoryProductId: id, quantity, product: products, ...shelves, })

      } else {
        acc[products.sku] = {
          product: products,
          shelves: [{ inventoryProductId: id, quantity, product: products, ...shelves, }],
        }
      }
      return acc;

    }, {})
  )

  const findQuantityByShelfType = (shelfType, shelves) => {
    const qty = shelves.reduce((acc, { shelf_type: { name }, quantity }) => name === shelfType ? acc + quantity : acc, 0)
    return qty
  }


  const formik = useFormik({
    initialValues: productDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required"),
      warehouse: Yup.object().required("*Required"),
      area: Yup.object().required("*Required"),
      shelf: Yup.object().required("*Required"),
      quantity: Yup.number().required("*Required").typeError("Must be a Number"),
      // good_stock: Yup.number().required("*Required").typeError("Must be a Number"),
    }),
    onSubmit: async (data) => {
      console.log("formdata", data)


      const { quantity, products_product_id, shelf, inventoryProductId } = data

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
              id: inventoryProductId,
              quantity: Number(quantity),
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

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  const columnComponents = columns.reduce((acc, curr) => {
    if (selectedColumns.includes(curr.field))
      return [
        ...acc,
        <Column
          key={curr?.field}
          field={curr?.field}
          header={curr?.header}
          body={curr?.body}
          filter={curr?.filter}
          filterPlaceholder={curr?.filterPlaceholder}
          filterField={curr?.filterField}
          filterElement={curr?.filterElement}
          dataType={curr?.dataType}
        />
      ];
    return acc;
  }, []);

  useEffect(() => {
    const defaultColumns = columns.filter(col => !["size", "color", "brand",].includes(col.field))
      .map(col => col.field)
    setSelectedColumns(defaultColumns)
  }, [])




  return (
    <>
      <Head><title>Inventory</title></Head>
      <div className="grid w-full mr-0" ref={scrollToTop}>
        {creatingInventory && <LoaderFullScreen />}
        {updatingInventory && <LoaderFullScreen />}
        <Toast ref={toast} />
        <div className="col-12">
          {!errorProducts.length &&
            ErrorMsgs.map((ele, i) => (
              <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
            ))}
          <div className="card flex ">
            <h2 className="mb-0">Inventory</h2>
            <div className="flex-grow-1 ml-3">
              <AutoComplete
                id="warehouse"
                value={selectedWarehouse}
                suggestions={warehouseSuggestions}
                completeMethod={searchWarehouse}
                disabled={productEditState}
                placeholder="All Inventory"
                dropdown
                forceSelection
                field="name"
                onChange={async (e) => {
                  setSelectedWarehouse(e.value)
                }}
                aria-label="Warehouse"
                dropdownAriaLabel="Select Warehouse"
              />
            </div>
            <Button
              icon="pi pi-plus"
              className="ml-2"
              label="Add Inventory"
              onClick={() => {
                setProductForm(true)
              }}
            ></Button>


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
                        let name = typeof e.value === "string" ? e.value : e.value?.name
                        let products_product_id = e.value?.product_id
                        let product_description = e.value?.description

                        await formik.setValues({
                          ...formik.values,
                          name,
                          products_product_id,
                          product_description,
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
                  <div className="p-float-label">
                    <AutoComplete
                      id="warehouse"
                      value={formik?.values?.warehouse}
                      suggestions={warehouseSuggestions}
                      completeMethod={searchWarehouse}
                      disabled={productEditState}
                      dropdown
                      forceSelection
                      field="name"

                      onChange={async (e) => {
                        formik.handleChange(e);
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
                        const area = await invoke(getArea, {
                          id: e.value?.id
                        })
                        const _format = area?.shelves.map(ele => ({ ...ele, name: ` ${ele.number}- ${ele.shelf_type.name}` }))
                        setShelfOptions(_format)

                      }}
                      aria-label="Areas"
                      dropdownAriaLabel="Select Area"
                      className={classNames({ "p-invalid": isFormFieldValid("area") })}
                    />

                    <label
                      htmlFor="area"
                      className={classNames({ "p-error": isFormFieldValid("area") })}
                    >
                      Select Area
                    </label>
                  </div>
                  {getFormErrorMessage("area")}
                </div>
                <div className="field col-12 md:col-3 lg:col-3 mt-4">
                  <div className="p-float-label">
                    <AutoComplete
                      id="shelf"
                      value={formik?.values?.shelf ?? "No shelfs"}
                      suggestions={shelfSuggestions}
                      completeMethod={searchShelf}
                      disabled={productEditState}
                      dropdown
                      forceSelection
                      field="name"
                      onChange={async (e) => {
                        formik.handleChange(e);
                        const area = await invoke(getArea, {
                          id: e.value?.id
                        })

                      }}
                      aria-label="Shelf"
                      dropdownAriaLabel="Select shelf"
                      className={classNames({ "p-invalid": isFormFieldValid("shelf") })}
                    />

                    <label
                      htmlFor="shelf"
                      className={classNames({ "p-error": isFormFieldValid("shelf") })}
                    >
                      Select Shelf
                    </label>
                  </div>
                  {getFormErrorMessage("shelf")}
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
              {columnComponents}
            </DataTable>
          </div>
        </div>
      </div>
    </>

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
