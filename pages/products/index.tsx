import { Suspense, useState, useRef, useEffect } from "react"
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
import { useFormik } from "formik"
import { InputNumber } from "primereact/inputnumber"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { createCSVFormat } from "app/constants"
import ErrorCard from "components/ErrorCard"
import LoaderFullScreen from "components/LoaderFullScreen"

const ITEMS_PER_PAGE = 100

export const ProductsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ products }, { isLoading: isProductsLoading, refetch }] = useQuery(getProducts, {
    orderBy: { product_id: "asc" },
  })
  const [prefix, { isLoading }] = useQuery(getPrefix, { name: "PRODUCT" })
  const [createProductMutation, { error: productCreationError, isLoading: creatingProduct }] =
    useMutation(createProduct)
  const [updateProductMutation, { error: productUpdationError, isLoading: updatingProduct }] =
    useMutation(updateProduct)

  const intialProductDetails = {
    name: "",
    description: "",
    product_type: "",
    products_sku: "",
    product_unit: "",
  }

  const [productDetails, setProductDetails] = useState(intialProductDetails)
  const [productDialog, setProductDialog] = useState(false)
  const [productEditState, setProductEditState] = useState(false)
  const [activeRowData, setActiveRowData] = useState({})

  const [errorProducts, setErrorProducts] = useState([])

  const [btnVisibility, setBtnVisibility] = useState(false)

  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const clearUpload = useRef<FileUpload>(null)

  const onBasicUpload = async (e) => {
    let index = 2
    setErrorProducts([])
    papa.parse(e.files[0], {
      header: true,
      skipEmptyLines: true,
      step: async ({ data }, parser) => {
        const missingKey = ["NAME", "DESCRIPTION", "SKU", "TYPE", "UNIT"].find(
          (key) => !(key in data)
        )

        if (missingKey) {
          setErrorProducts([...errorProducts, { message: `Column ${missingKey} missing.` }])
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
            product_unit: data?.["UNIT"],
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

    await refetch()
  }

  const formik = useFormik({
    initialValues: productDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required"),
      description: Yup.string().required("*Required"),
      product_type: Yup.string().required("*Required"),
      products_sku: Yup.string().required("*Required"),
      product_unit: Yup.string().required("*Required"),
    }),
    onSubmit: async (data) => {
      // console.log("data", data)

      if (!productEditState) {
        try {
          const result = await createProductMutation(
            {
              ...data,
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
            }
          )
          console.log("result", result)
        } catch (error) {
          console.log("Creatiion", error)
          return
        }
      } else {
        try {
          await updateProductMutation({
            ...data,
          })
        } catch (error) {
          // console.log("Updation", error)
          return
        }
      }

      await refetch()
      setProductEditState(false)
      setProductDialog(false)
      formik.resetForm()
    },
  })
  console.log(activeRowData)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const pCsvFormatDetails = {
    headers: ["NAME", "DESCRIPTION", "SKU", "TYPE", "UNIT"],
    name: "Product-format.csv",
  }

  if (isLoading || isProductsLoading) {
    return <Loading />
  }
  const [ErrorMsgs, setErrorMsgs] = useState([])
  useEffect(() => {
    const ErrorArray = [productUpdationError, productCreationError]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [productCreationError, productUpdationError])

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  return (
    <div className="grid w-full mr-0">
      <Toast ref={toast} />
      {creatingProduct && <LoaderFullScreen />}
      {updatingProduct && <LoaderFullScreen />}
      <div ref={scrolToTop} className="col-12 ">
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
        <div className="card flex justify-content-between align-items-center">
          <h2 className="mb-0">Products</h2>
          <div className="flex">
            {/* <FileUpload
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
            /> */}
            <Button
              icon="pi pi-plus"
              label="Add Products"
              className="ml-1"
              onClick={() => {
                setProductDetails(intialProductDetails)
                setProductDialog(!productDialog)
              }}
            />
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
              onClick={() => createCSVFormat(pCsvFormatDetails)}
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
        className={`col-12 ${
          productDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <div className="card">
          <h4>{productEditState ? "Update" : "Create"} Product</h4>
          <form
            onSubmit={formik.handleSubmit}
            // onSubmit={async () => {
            //   const result = await createProductMutation(productDetails, {
            //     onSuccess: () => {
            //       setProductDialog(false)
            //     },
            //   })

            //   // try {
            //   //   const all = await createInventoryProductMutation({
            //   //     products_product_id: Number(result.product_id),
            //   //     quantity: 0,
            //   //   })
            //   //
            //   // } catch (error) {
            //   //
            //   // }
            // }}
            className="p-fluid"
          >
            <div className="formgrid grid">
              {[
                { type: "text", label: "Name", field: "name" },
                { type: "text", label: "Product SKU", field: "products_sku" },
                { type: "text", label: "Product Type", field: "product_type" },
                { type: "text", label: "Product Unit", field: "product_unit" },
                { type: "area", label: "Description", field: "description" },
              ].map((ele, i) => {
                if (ele.type === "text") {
                  return (
                    <div key={`${ele.field}${i}`} className="field col-12 lg:col-3 mt-4">
                      <span className="p-float-label">
                        <InputText
                          id={ele.field}
                          name={ele.field}
                          value={formik.values[ele.field]}
                          onChange={formik.handleChange}
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
                  )
                } else {
                  return (
                    <div key={`${ele.field}${i}`} className="field col-12 mt-4">
                      <span className="p-float-label">
                        <InputTextarea
                          id={ele.field}
                          rows={5}
                          name={ele.field}
                          value={formik.values.description}
                          onChange={formik.handleChange}
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
                  )
                }
              })}
            </div>
            <div className="flex mt-4">
              <Button type="submit" className="mr-2 " label={productEditState ? "UPDATE" : "ADD"} />
              <Button
                className="p-button-secondary"
                type="button"
                label="Cancel"
                onClick={() => {
                  formik.resetForm()
                  setProductDialog(false)
                  setProductEditState(false)
                  // setProductForm(false)
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
            <Column field="product_unit" header="Unit" />

            <Column
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      className="m-1"
                      onClick={async () => {
                        setActiveRowData(rowData)
                        setProductEditState(true)
                        setProductDialog(true)
                        await formik.setValues({
                          ...rowData,
                        })
                        scrolToTop?.current && scrolToTop?.current.scrollIntoView()
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
