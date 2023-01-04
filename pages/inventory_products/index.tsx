import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
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
import { createCSVFormat, filterExistingValues, tsuccess } from "app/constants"
import { Toast } from "primereact/toast"
import ErrorCard from "components/ErrorCard"
import LoaderFullScreen from "components/LoaderFullScreen"

const ITEMS_PER_PAGE = 100

export const Inventory_productsList = () => {
  const [
    createInventory_productMutation,
    { error: createInventoryError, isLoading: creatingInventory },
  ] = useMutation(createInventory_product)
  const [
    updateInventory_productMutation,
    { error: updateInventoryError, isLoading: updatingInventory },
  ] = useMutation(updateInventory_product)
  const [deleteInventory_productsMutation] = useMutation(deleteInventory_product)
  const [createNotifications_sentMutation] = useMutation(createNotifications_sent)

  const router = useRouter()

  const page = Number(router.query.page) || 0
  const [{ inventory_products, hasMore }, { refetch }] = usePaginatedQuery(getInventory_products, {
    orderBy: { inventory_product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  // console.log("inventory_products", inventory_products)

  const [{ products }] = usePaginatedQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const productInitialState = {
    name: "",
    price: null,
    quantity: null,
    products_product_id: "",
    product_description: "",
    good_stock: null,
    bad_stock: null,
  }

  const [productForm, setProductForm] = useState<boolean>(false)
  const [productEditState, setProductEditState] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)
  const [productDetails, setProductDetails] = useState(productInitialState)
  const [activeRowData, setActiveRowData] = useState({})
  const [btnVisibility, setBtnVisibility] = useState(false)
  const [errorProducts, setErrorProducts] = useState([])

  const clearUpload = useRef<FileUpload>(null)
  const toast = useRef(null)
  const scroolToTop = useRef<HTMLDivElement>(null)
  // console.log("activeRowData", activeRowData)

  // const productsList =  products.map
  // console.log(products)

  const productsId = products.map((ele, i) => ele.product_id)
  const inventoryProductsId = inventory_products.map((ele, i) => ele.products_product_id)
  // console.log("inventoryProductsId", inventoryProductsId)
  // console.log("productsId", productsId)
  const avilableProductsID = filterExistingValues(productsId, inventoryProductsId)

  const avilableProducts = products.filter((ele, i) => avilableProductsID.includes(ele.product_id))
  // console.log("avilableProducts", avilableProducts)

  const searchProducts = (event: { query: string }) => {
    setTimeout(() => {
      let _filteredSuggestions
      if (!event.query.trim().length) {
        _filteredSuggestions = [...avilableProducts]
      } else {
        _filteredSuggestions = avilableProducts.filter((element) => {
          return element.name.toLowerCase().includes(event.query.toLowerCase())
        })
      }

      setFilteredSuggestions(_filteredSuggestions)
    }, 50)
  }
  // console.log("products: ", products)
  // console.log("inventory_products", inventory_products)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const tableInventory = inventory_products.map(
    ({ quantity, products, price, inventory_product_id, good_stock, bad_stock }) => {
      return {
        products_sku: products?.products_sku,
        name: products?.name,
        product_type: products?.product_type,
        quantity,
        price,
        inventory_product_id,
        good_stock,
        bad_stock,
      }
    }
  )

  const onBasicUpload = async (e) => {
    const csv = [] // this will contain all the data of imported csv file

    setErrorProducts([])
    let index = 2
    papa.parse(e.files[0], {
      header: true,
      skipEmptyLines: true,
      step: async ({ data }, parser) => {
        console.log(`${index}-data`, data)
        const missingKey = ["PRODUCT_ID", "PRICE", "QUANTITY", "DESCRIPTION"].find(
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
    headers: ["PRODUCT_ID", "PRICE", "QUANTITY", "DESCRIPTION"],
    name: "Inventory-Product-format.csv",
  }

  const formik = useFormik({
    initialValues: productDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required"),
      price: Yup.number().required("*Required").typeError("Must be a Number"),
      quantity: Yup.number().required("*Required").typeError("Must be a Number"),
    }),
    onSubmit: async (data) => {
      // console.log("data", data)

      const {
        name,
        price,
        quantity,
        products_product_id,
        product_description,
        good_stock,
        bad_stock,
      } = data

      if (!productEditState) {
        try {
          await createInventory_productMutation(
            {
              product_description: product_description,
              price: price,
              quantity: Number(quantity),
              products_product_id: Number(products_product_id),
              good_stock,
              bad_stock,
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
          console.log("Creatiion", error)
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
              bad_stock,
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

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  console.log("formik.values", formik.values)

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
      <div
        className={`col-12  ${
          productForm
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
                    suggestions={filteredSuggestions}
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
              {/* <div className="field col-12 md:col-3 lg:col-3 mt-4">
                <span className="p-float-label">
                  <InputNumber
                    id="price"
                    name="price"
                    value={formik.values.price}
                    // onChange={formik.handleChange}
                    onChange={(e) => formik.setValues({ ...formik.values, price: e.value })}
                    autoFocus
                    className={classNames({ "p-invalid": isFormFieldValid("price") })}
                  />
                  <label
                    htmlFor="price"
                    className={classNames({ "p-error": isFormFieldValid("price") })}
                  >
                    Price
                  </label>
                </span>
                {getFormErrorMessage("price")}
              </div> */}
              {/* <div className="field col-12 md:col-3 lg:col-3 mt-4">
                <span className="p-float-label">
                  <InputNumber
                    id="quantity"
                    name="quantity"
                    value={formik.values.quantity}
                    // onChange={formik.handleChange}
                    onChange={(e) => formik.setValues({ ...formik.values, quantity: e.value })}
                    autoFocus
                    className={classNames({ "p-invalid": isFormFieldValid("quantity") })}
                  />

                  <label
                    htmlFor="quantity"
                    className={classNames({ "p-error": isFormFieldValid("quantity") })}
                  >
                    Quantity
                  </label>
                </span>
                {getFormErrorMessage("quantity")}
              </div> */}
              {[
                { type: "text", label: "Price", field: "price" },
                { type: "text", label: "Good Stock", field: "good_stock" },
                { type: "text", label: "Bad Stock", field: "bad_stock" },
                { type: "text", label: "Total", field: "quantity" },
              ].map((ele, i) => (
                <div key={i} className="field col-12 md:col-3 lg:col-3 mt-4">
                  <span className="p-float-label">
                    <InputNumber
                      id={ele.field}
                      name={ele.field}
                      value={formik.values[ele.field]}
                      // onChange={formik.handleChange}
                      onChange={(e) => formik.setValues({ ...formik.values, [ele.field]: e.value })}
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
              <Button type="submit" className="mr-2" label={productEditState ? "UPDATE" : "ADD"} />
              <Button
                className="p-button-secondary"
                type="button"
                label="Cancel"
                onClick={() => {
                  formik.resetForm()
                  setProductEditState(false)
                  setProductForm(false)
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
            value={tableInventory}
            showGridlines
            // header={renderHeader}
            // scrollable
            // scrollHeight="60vh"
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
              header="Products"
              // className="text-center"
            />
            <Column
              field="price"
              header="Price"
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
              body={(rowdata) => rowdata.quantity - rowdata.bad_stock}
              header="Good-Stock"
              // className="text-center"
            />
            <Column
              field="bad_stock"
              header="Bad-Stock"
              // className="text-center"
            />
            <Column
              field="quantity"
              header="Total-Stock"
              // className="text-center"
            />

            <Column
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
            />
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
