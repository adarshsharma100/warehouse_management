import { Suspense, useState, useRef, useEffect } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
// import Layout from "app/core/layouts/Layout"
import getPurchase_order from "app/purchase_orders/queries/getPurchase_order"
import deletePurchase_order from "app/purchase_orders/mutations/deletePurchase_order"
import Loading from "components/loading"
import Layout from "layouts/Layout"
import getGrns from "app/grns/queries/getGrns"
import moment from "moment"
import getVendors from "app/vendors/queries/getVendors"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Accordion, AccordionTab } from "primereact/accordion"
import { TabPanel, TabView } from "primereact/tabview"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import Invoice from "components/Invoice"
import { Button } from "primereact/button"
import Grn from "components/Grn"
import createGrn from "app/grns/mutations/createGrn"
import CreateGrn_status from "app/grn_statuses/mutations/createGrn_status"
import { InputTextarea } from "primereact/inputtextarea"
import { useFormik } from "formik"
import * as Yup from "yup"
import { InputText } from "primereact/inputtext"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import getGrn_statuses from "app/grn_statuses/queries/getGrn_statuses"
import get_Grns from 'app/grns/queries/getGrns'
import { MultiSelect } from "primereact/multiselect"
import { arrayFillCopy, calenderDateFormat, createSearchFunction, dateFormat, tError, tsuccess } from "app/constants"
import updateGrn from "app/grns/mutations/updateGrn"
import getGrn_products from "app/grn_products/queries/getGrn_products"
import getGrn_product from "app/grn_products/queries/getGrn_product"
import { check } from "prettier"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { Calendar } from "primereact/calendar"
import { Toast } from "primereact/toast"
import { InputNumber } from "primereact/inputnumber"


export const Purchase_order = () => {
  const router = useRouter()
  console.log('router: ', router);
  const purchase_orderId = useParam("purchase_orderId", "number")
  const grn_productsId = useParam("grn_productsId", "number")
  const [value, setValue] = useState("")
  const user = useCurrentUser()
  const { id: userId, role, name, email } = user

  const GrnFormDetails = {
    grnNumber: '',
    invoiceNo: "",
    status,
    invoiceDate: '',
    trackingId: '',
    eta: '',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  }
  const toast = useRef(null)
  const [purchase_order, { refetch }] = useQuery(getPurchase_order, { id: purchase_orderId, })
  console.log('purchase_order: ', purchase_order);
  const [createGrnMutation, { error: grnCreationError }] = useMutation(createGrn)
  const [updateGrnMutation] = useMutation(updateGrn)
  const [{ grn_statuses },] = useQuery(getGrn_statuses, { orderBy: { id: "asc" }, })
  const [grnList, setGrnList] = useState(purchase_order?.grn)
  const [grnDetails, setGrnDetails] = useState(GrnFormDetails)
  const [active, setActive] = useState(false)
  // const [values, setValues] = useState('');
  // const [status, setStatus] = useState()
  // const [items, setItems] = useState([]);
  const [grnStatuses, setGrnStatuses] = useState([])
  const columns = [
    { type: 'text', label: "Grn Number", field: 'grnNumber' },
    { type: 'text', label: "Invoice No", field: 'invoiceNo' },
    { type: 'text', label: "Tracking Id", field: 'trackingId' },
    { type: 'text', label: "Status", field: 'status' },
    {
      label: "Created At",
      body: (rowData) => <div>{dateFormat(rowData.createdAt)}</div>,
    },
    {
      label: "Update At",
      body: (rowData) => <div>{dateFormat(rowData.updatedAt)}</div>,
    },
    {
      label: "ETA",
      body: (rowData) => <div>{dateFormat(rowData.eta)}</div>,
    },
    {
      label: "Invoice Date",
      body: (rowData) => <div>{dateFormat(rowData.invoiceDate)}</div>,
    },
    {
      label: "Created By",
      body: (rowData) => <div>{dateFormat(rowData.createdBy)}</div>,
    },


  ]
  const [selectedColumns, setSelectedColumns] = useState(columns)
  const grnProductColumn = [
    { type: 'text', label: "Item SKU", field: 'po_products.vendor_products.products.sku' },
    { type: 'text', label: "Vendor SKU", field: 'po_products.vendor_products.sku' },
    { type: 'text', label: "Received Quantity", field: 'receivedQuantity' },
    { type: 'text', label: "Rejected Quantity", field: 'rejectedQuantity' },
    { type: 'text', label: "Short Supply", body: (rowdata) => totalshortSupplyTillDate(po_products, rowdata?.poProduct) - rowdata?.receivedQuantity },
    { type: 'text', label: "Price", field: 'po_products.price' },
    // { type: 'text', label: "Po Product", field: 'poProduct' },
    // { type: 'text', label: "Grns", field: 'grn' },
    // { type: 'text', label: "Grn", field: 'grn' },
  ]
  const [productsColumn, setProductsColumn] = useState(grnProductColumn)
  // const [activeRowData, setActiveRowData] = useState({})
  const [activeGrn, setActiveGrn] = useState({})
  console.log('activeGrn: ', activeGrn);
  // const [edit, setEdit] = useState(false)
  const [updateGrns, setUpdateGrns] = useState(false)
  const initialgrnProductState = {
    receivedQuantity: "",
    rejectedQuantity: 0,
    poProduct: "",
    productName: "",
    shortSupply: "",
  }
  const [grnProductsList, setGrnProductsList] = useState([initialgrnProductState])
  const [inputs, setInputs] = useState([{ value: '' }]);
  const searchStatuses = createSearchFunction(grn_statuses, setGrnStatuses)



  const {
    id: poId,
    poNumber,
    agreement,
    description,
    expectedDod,
    rejectedReason,
    expiryDate,
    approvedOn,
    createdAT,
    updatedAT,
    rfq,
    vendor,
    // status,
    po_term,
    amendedFrom,
    piNumber,
    piDate,
    grn,
    po_products,
    po_status: {
      name: poStatus
    },
    po_terms: {
      name: poTerm
    },
    // user: { name: approvedBy } = { name: "-" }
  } = purchase_order

  let approvedBy = "-";
  if (purchase_order.user) {
    const { name, } = purchase_order?.user

    let approvedBy = name
  }

  const setGrnProducts = (poProducts) => {
    const _poProducts = poProducts.map(
      ({ id, quantity, vendor_products: { products: { name, sku } } }) => ({
        receivedQuantity: quantity,
        rejectedQuantity: 0,
        poProduct: id,
        productName: `${sku}-${name}`,
        shortSupply: "",
      }))
    setGrnProductsList(_poProducts)
  }
  const getPoProductQty = (poProducts, poId) => poProducts.find(ele => ele.id === poId).quantity
  const getReceviedGrnProductQty = (poId) => {
    const qty = grn.reduce((acc, curr) => {
      const test = curr.grn_products.find(prod => prod.poProduct === poId)?.receivedQuantity;
      return test ? acc + test : acc
    }, 0)
    return qty
  }

  const totalshortSupplyTillDate = (poProducts, poId) => {
    return getPoProductQty(poProducts, poId) - getReceviedGrnProductQty(poId)
  }

  const test = totalshortSupplyTillDate(po_products, 9)
  console.log('test: ', test);




  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(inputs.map(input => input.value));
  };

  const onColumnToggle = (event) => {
    let productsColumn = event.value
    let orderedSelectedColumns = grnProductColumn.filter((col) =>
      productsColumn.some((sCol) => sCol.field === col.field)
    )
    // setSelectedColumns(orderedSelectedColumns)
    setProductsColumn(orderedSelectedColumns)
  }

  const handleFormChange = (e: any, i: number) => {
    let data = [...grnProductsList]
    if (e.target) {
      data[i][e.target.name] = e.value
    } else {
      data[i][e.originalEvent.target.name] = e.value
    }
    setGrnProductsList(data)
  }
  const addFields = () => {
    let newfield = {

    }

    const fields = arrayFillCopy(2, newfield)

    setGrnProductsList([...grnProductsList, ...fields])
  }
  const removeFields = (index) => {
    setGrnProductsList(grnProductsList.filter((data, i) => index !== i))
  }

  const newGrnNumber = () => `GRN#${moment().format("ssSS")}`


  const header = (
    <div style={{ textAlign: "left" }}>
      <MultiSelect
        value={productsColumn}
        options={columns}
        optionLabel="header"
        onChange={onColumnToggle}
        style={{ width: "20em" }}
      />
    </div>
  )

  const columnComponents = productsColumn.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.label}
        filter
        filterPlaceholder="Search...."
        body={col.body}
      />
    )
  })



  const formik = useFormik({
    initialValues: grnDetails,
    validationSchema: Yup.object().shape({
      invoiceNo: Yup.string().required("*Required"),
      grnNumber: Yup.string().required('*Required')
    }),
    onSubmit: async (data) => {
      console.log('data: ', data);
      console.log("inputValue", inputs)

      const { grnNumber, invoiceNo, invoiceDate, status, createdBy, trackingId, eta }: any = data



      if (updateGrns) {
        try {
          await updateGrnMutation({
            id: activeGrn?.id,
            grnNumber,
            invoiceNo,
            invoiceDate,
            trackingId,
            eta,
            status: status?.id,
            grn_products: {
              updateMany: grnProductsList.map(({ grnProductId, receivedQuantity, rejectedQuantity, poProduct, }) => ({
                where: {
                  id: grnProductId
                },
                data: {
                  receivedQuantity,
                  rejectedQuantity
                },
              }))
            }

          }, {
            onSuccess: (data) => {
              toast?.current.show(tsuccess("Updated", `${data.grnNumber} is updated successfully`))
              console.log(data)
            },
            onError: (error) => {
              toast?.current.show(tError("Error", `${error} `))
              console.log('error: ', error);
            }
          }
          )
          setActive(false)
          formik.resetForm()
          setGrnProductsList([])
        } catch (error) {
          console.log('error: ', error);
        }
      }
      else {
        try {
          await createGrnMutation({
            grnNumber,
            invoiceNo,
            invoiceDate,
            trackingId,
            createdBy: userId,
            eta,
            status: status?.id,
            purchaseOrder: purchase_orderId,
            grn_products: {
              create: grnProductsList.map(({
                receivedQuantity,
                rejectedQuantity,
                poProduct,
              }) => ({
                receivedQuantity,
                rejectedQuantity,
                poProduct,
              }))
            },
          }, {
            onSuccess: async (data) => {
              toast?.current.show(tsuccess("Created", `${data.grnNumber} is updated successfully`))
              console.log('data: ', data);
              setActive(!active)
              formik.resetForm()

            },
            onError: (error) => {
              toast?.current.show(tError("Error", `${error} `))
              console.log('error: ', error);
            }
          }
          )
        } catch (error) {
          console.log('error: ', error);
        }
        await refetch()
      }



    }
  })
  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }




  const renderGrn = (grn) => {
    const { id,
      grnNumber,
      invoiceNo,
      invoiceDate,
      trackingId,
      eta,
      createdAt,
      updatedAt,
      status,
      purchaseOrder,
      grn_products,
      user: {
        name: createdBy
      },
      grn_status,
      grn_status: {
        name: grnStatus
      } } = grn


    const invoiceAmount = grn_products?.
      reduce((acc, { po_products: { quantity, price } }) => acc + (quantity * price), 0)




    return <>
      <div className="flex flex-column justify-content-end">
        <Button
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
          className="align-self-end"
          icon='pi pi-pencil'
          onClick={async () => {
            window.scrollTo(90, 90)
            const _grnprodListFormat = grn_products.map(({ id: grnProductId, receivedQuantity, rejectedQuantity,
              po_products: { id, vendor_products: { products: { name, sku } } } }) => ({
                receivedQuantity,
                rejectedQuantity,
                poProduct: id,
                grnProductId,
                productName: `${sku}-${name}`,
                shortSupply: "",
              }))
            setGrnProductsList(_grnprodListFormat)
            setActiveGrn(grn)
            setActive(true);
            setUpdateGrns(true)
            await formik.setValues({ ...grn, status: grn_status })
          }} />
        <div className="formgrid grid mt-3 card " style={{ backgroundColor: "#05101e" }}>
          {[
            { field: "GRN", value: grnNumber },
            { field: "Invoice", value: invoiceNo },
            { field: "Tracking Id", value: trackingId },
            { field: "Invoice Date", value: invoiceDate },
            { field: "Created On", value: createdAt },
            { field: "ETA", value: eta },
            { field: "Status", value: grnStatus },
            { field: " Invoice amount", value: invoiceAmount },
            { field: " Created By", value: createdBy },
          ].map(({ field, value }, i) =>
            <div className=" field col-12 lg:col-4 md:col-3 flex gap-3" key={i}>
              <p className="mb-1 fb-50">
                <strong>{field}  : </strong>
              </p>
              <p>{typeof value === "object" ? dateFormat(value) : value}</p>
            </div>)}
        </div>
      </div>


    </>


  }

  return (
    <>
      <Head>
        <title>{poNumber}</title>
      </Head>

      <div>
        <Toast ref={toast} />
        <h1>{poNumber}</h1>
        <div className="lg:flex m-3 p-1 card">
          <section className="lg:w-3 p-3 m-2 border-1 border-round border-primary">
            <h3 className="text-center">Details</h3>
            <div className="flex flex-column justify-content-center text-lg">
              {[
                { field: "poNumber", value: poNumber },
                { field: "Description", value: description },
                { field: "Expected Delivery", value: expectedDod },
                { field: "Expiry Date", value: expiryDate },
                { field: "Agreement", value: agreement || `-` },
                { field: "Term", value: poTerm || `-` },
                { field: "Status", value: poStatus || `-` },
                { field: "Approved By", value: approvedBy || `-` },
              ].map((ele, i) => (
                <div className="grid align-items-center py-2" key={i}>
                  <p className="flex-1 m-0">{ele.field}</p>
                  <span>: &nbsp; </span>
                  <p className="flex-1">
                    {typeof ele.value === "string"
                      ? ele.value
                      : dateFormat(ele.value)}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="flex-1 p-3 m-2 border-1 border-round border-primary  ">
            <h3 className="text-center">Products</h3>
            <div className="">
              <DataTable
                value={po_products}
                responsiveLayout="scroll"
                showGridlines
                stripedRows
                className="text-s datatable-responsive w-full mt-5"
              // paginator
              // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
              // rows={PAGINATION_VARIABLES.rows}
              // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
              // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
              >
                <Column
                  header="Sl.No"
                  body={(rowData, { rowIndex }) => rowIndex + 1}
                  style={{ width: "3em" }}
                />
                <Column
                  field="vendor_products.products.sku"
                  header="Product SKU"
                // className="text-center"
                />

                <Column
                  field="vendor_products.products.name"
                  header="Name"
                // className="text-center"
                />
                <Column
                  field="price"
                  header="Price / Unit"
                // className="text-center"
                />
                <Column
                  field="quantity"
                  header="Quantity"
                // className="text-center"
                />
              </DataTable>
            </div>
          </section>
        </div>
        <div className="flex justify-content-end px-3 mt-4 ">
          <Button
            label="Create GRN"
            icon='pi pi-plus'
            onClick={async () => {
              setGrnProducts(po_products)
              setActive(!active);
              setUpdateGrns(false)
              await formik.setValues({
                ...formik.values, status: {
                  "id": 1,
                  "name": "Created",
                  "description": null
                },
                grnNumber: newGrnNumber()
              })
            }} />
        </div>

        <div>
          {active &&
            <div className="m-3 p-4 card">
              <div>
                <h3 className="mb-0">{updateGrns ? "Update" : "Create"} GRN</h3>
              </div>

              <form className="p-fluid" onSubmit={formik.handleSubmit}>

                <div className="formgrid grid ">
                  {[
                    { type: 'text', label: "Grn Number", field: 'grnNumber' },
                    { type: 'text', label: "Invoice No", field: 'invoiceNo' },
                    // { type: 'text', label: "Invoice Date", field: 'invoiceDate' },
                    { type: 'text', label: "Tracking Id", field: 'trackingId' },
                    // { type: 'text', label: "ETA", field: 'eta' },,
                  ].map((ele, i) => {
                    return (
                      <div key={`create-${ele.field}-${i}`}
                        className="field col-12 lg:col-3 mt-2">
                        <span className="p-float-label mt-4">
                          <InputText
                            id={ele.field}
                            name={ele.field}
                            value={formik.values[ele.field]}
                            onChange={formik.handleChange}
                            autoFocus
                            className={classNames({ "p-invalid ": isFormFieldValid(ele.field) })}
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
                  })
                  }
                  <div className="field col-12 lg:col-3 mt-2">
                    <div className="p-float-label mt-4">
                      <AutoComplete
                        value={formik?.values?.status}
                        suggestions={grnStatuses}
                        field="name"
                        completeMethod={searchStatuses}
                        onChange={async (e) => {
                          console.log('status ', e.value);
                          await formik.setFieldValue("status", e.value)
                        }}
                        dropdown
                      />
                      <label
                      // htmlFor=""
                      // className={classNames({ "p-error": isFormFieldValid("") })}
                      >
                        GRN Status
                      </label>
                    </div>
                    {/* {getFormErrorMessage("")} */}
                  </div>
                  <div className="field col-12 lg:col-3 mt-2">
                    <div className="p-float-label">
                      <Calendar
                        minDate={new Date()}
                        id="eta"
                        value={formik.values.eta}
                        onChange={formik.handleChange}
                        // className={classNames({ "p-invalid": isFormFieldValid("eta") })}
                        dateFormat={calenderDateFormat()}
                      />
                      <label
                        htmlFor="eta"
                      // className={classNames({ "p-error": isFormFieldValid("eta") })}
                      >
                        Expected Delivery
                      </label>
                    </div>
                    {getFormErrorMessage("eta")}
                  </div>
                  <div className="field col-12 lg:col-3 mt-2">
                    <div className="p-float-label">
                      <Calendar
                        minDate={new Date()}
                        id="invoiceDate"
                        value={formik?.values?.invoiceDate}
                        onChange={formik.handleChange}
                        // className={classNames({ "p-invalid": isFormFieldValid("invoiceDate") })}
                        dateFormat={calenderDateFormat()}
                      />
                      <label
                        htmlFor="invoiceDate"
                      // className={classNames({ "p-error": isFormFieldValid("invoiceDate") })}
                      >
                        Invoice Date
                      </label>
                    </div>
                    {getFormErrorMessage("invoiceDate")}
                  </div>
                  <div className="col-12 mt-3 mb-2 ">
                    <h6>GRN Products</h6>
                    <hr />
                  </div>


                  {grnProductsList.map((ele, i) => (
                    <div key={`PO-product-${i} `} className="field grid col-12  mt-2">
                      <div className="field col-12 lg:col-5 mt-2">
                        <div className="p-float-label">
                          <AutoComplete
                            id="name"
                            name="name"
                            value={ele.productName}
                            // suggestions={ProductsSuggestions}
                            // completeMethod={searchProducts}
                            //   forceSelection //
                            dropdown
                            field="name"
                            onChange={async (e) => {
                              // console.log("event understand", e.value)
                              // let product_id = typeof e.value === "string" ? "" : e.value?.product_id
                              // let name = typeof e.value === "string" ? e.value : e.value?.name
                              // let price_per_unit = typeof e.value === "string" ? e.value : e.value?.Price
                              // let data = [...itemList]

                              // data[i].product_name = name
                              // data[i].products_product_id = product_id
                              // data[i].price_per_unit = price_per_unit
                              // data[i].quantity = ""

                              // let itemsLength = !e.value?.name ? false : true
                              // await formik.setValues({ ...formik.values, itemsLength })

                              // setItemList(data)
                            }}
                            aria-label="products"
                            dropdownAriaLabel="Select Product"
                          //   className={classNames({ "p-invalid": isFormFieldValid("name") })}
                          />

                          <label
                            htmlFor="name"
                          //   className={classNames({ "p-error": isFormFieldValid("name") })}
                          >
                            Select Product
                          </label>
                        </div>
                      </div>


                      <div className="field col-12 lg:col-2 mt-2">
                        <span className="p-float-label ">
                          <InputNumber
                            name="receivedQuantity"
                            value={ele.receivedQuantity || "-"}
                            onChange={(e) => {
                              handleFormChange(e, i)

                              let _grnProductsList = [...grnProductsList]
                              _grnProductsList[i].shortSupply = totalshortSupplyTillDate(po_products, ele.poProduct) - e.value
                            }}
                            required={ele?.productName}
                          />
                          <label className="mr-2">Received Quantity</label>
                        </span>
                      </div>
                      <div className="field col-12 lg:col-2 mt-2">
                        <span className="p-float-label ">
                          <InputNumber
                            name="rejectedQuantity"
                            value={ele.rejectedQuantity || "-"}
                            onChange={(e) => {
                              handleFormChange(e, i)
                            }}
                          />
                          <label className="mr-2">Rejected Quantity</label>
                        </span>
                      </div>
                      {!updateGrns && <div className="field col-12 lg:col-2 mt-2">
                        <span className="p-float-label ">
                          <InputNumber
                            name="shortSupply"
                            value={ele.shortSupply || "-"}
                          />
                          <label className="mr-2">Short Supply</label>
                        </span>
                      </div>}
                      <div className="field col-6 lg:col-1 mt-2">
                        <span className="p-buttonset">
                          {i === grnProductsList.length - 1 && (
                            <Button type="button" label="+" onClick={addFields} />
                          )}
                          {grnProductsList.length > 1 && (
                            <Button
                              type="button"
                              label="-"
                              className="p-button-secondary"
                              onClick={(e) => {
                                removeFields(i)
                              }}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  ))}

                </div>

                <div className="flex justify-content-between gap-5 mt-4">
                  <Button type="submit" label={updateGrns ? "UPDATE" : "SUBMIT"} />
                  <Button type="submit"
                    label="CANCEL"
                    onClick={() => {
                      setActive(!active); setUpdateGrns(false);
                      formik.resetForm()
                      setGrnProductsList([initialgrnProductState])
                    }}
                    className="p-button-secondary flex-grow-0" />
                </div>


              </form>
            </div>}
        </div>




        {grnList.length > 0 &&
          <Accordion className="m-3">
            {grnList.map((i, index) => {
              return (
                <AccordionTab header={i.grnNumber} key={index}>
                  {renderGrn(i)}
                  <DataTable
                    editMode="cell"
                    value={purchase_order.grn[index].grn_products}
                    responsiveLayout="scroll"
                    showGridlines
                    className="text-s datatable-responsive"
                    filterDisplay="menu"
                    emptyMessage="No Results found."
                  >
                    {columnComponents}
                  </DataTable>
                </AccordionTab>
              )
            })}
          </Accordion>}

      </div>
    </>
  )
}

const ShowPurchase_orderPage = () => {
  return (


    <Suspense fallback={<Loading />}>
      <Layout>
        <Purchase_order />
      </Layout>
    </Suspense>

  )
}


export default ShowPurchase_orderPage



// const samplePOData = {
//   "id": 7,
//   "poNumber": "PO#6234",
//   "agreement": "sxcd",
//   "description": "sdada",
//   "expectedDod": "2023-03-23T18:30:00.000Z",
//   "rejectedReason": null,
//   "expiryDate": "2023-03-23T18:30:00.000Z",
//   "approvedOn": null,
//   "createdAT": "2023-03-05T09:13:45.000Z",
//   "updatedAT": "2023-03-05T09:13:45.000Z",
//   "rfq": null,
//   "vendor": 2,
//   "status": 3,
//   "po_term": 2,
//   "approvedBy": 9,
//   "amendedFrom": null,
//   "piNumber": null,
//   "piDate": null,
//   "grn": [
//       {
//           "id": 37,
//           "grnNumber": "GRN#1462",
//           "invoiceNo": "1425",
//           "invoiceDate": "2023-03-27T18:30:00.000Z",
//           "trackingId": "14265839",
//           "eta": "2023-03-30T18:30:00.000Z",
//           "createdAt": "2023-03-09T12:12:34.000Z",
//           "updatedAt": "2023-03-09T12:12:34.000Z",
//           "status": 1,
//           "createdBy": 9,
//           "purchaseOrder": 7,
//           "grn_products": [
//               {
//                   "id": 58,
//                   "receivedQuantity": 23,
//                   "rejectedQuantity": 0,
//                   "poProduct": 6,
//                   "grn": 37,
//                   "po_products": {
//                       "id": 6,
//                       "quantity": 23,
//                       "price": 999,
//                       "vendorProduct": 13,
//                       "purchaseOrder": 7,
//                       "vendor_products": {
//                           "id": 13,
//                           "sku": "VWX-0004",
//                           "priority": 1,
//                           "status": "Active",
//                           "product": 25,
//                           "vendor": 2,
//                           "products": {
//                               "id": 25,
//                               "name": "Smart TV",
//                               "sku": "TIFTV015",
//                               "description": "Wi-Fi enabled 4K UHD smart TV with voice control",
//                               "length": null,
//                               "width": null,
//                               "height": null,
//                               "weight": null,
//                               "color": null,
//                               "hsnCode": null,
//                               "imageUrl": null,
//                               "createdAT": "2023-03-05T07:55:58.000Z",
//                               "updatedAT": "2023-03-05T07:55:58.000Z",
//                               "customDuty": null,
//                               "gstTaxTypeCode": null,
//                               "taxCalcType": null,
//                               "status": "Active",
//                               "category": null,
//                               "brand": null,
//                               "costPrice": 999,
//                               "type": 0
//                           }
//                       }
//                   }
//               },
//               {
//                   "id": 59,
//                   "receivedQuantity": 33,
//                   "rejectedQuantity": 0,
//                   "poProduct": 7,
//                   "grn": 37,
//                   "po_products": {
//                       "id": 7,
//                       "quantity": 33,
//                       "price": 69,
//                       "vendorProduct": 3,
//                       "purchaseOrder": 7,
//                       "vendor_products": {
//                           "id": 3,
//                           "sku": "ABC-9012",
//                           "priority": 3,
//                           "status": "Active",
//                           "product": 54,
//                           "vendor": 2,
//                           "products": {
//                               "id": 54,
//                               "name": "Book",
//                               "sku": "TIFC029",
//                               "description": "",
//                               "length": 0,
//                               "width": 0,
//                               "height": 0,
//                               "weight": 0,
//                               "color": "",
//                               "hsnCode": "",
//                               "imageUrl": "https://loremflickr.com/320/240/device?random=48",
//                               "createdAT": null,
//                               "updatedAT": null,
//                               "customDuty": null,
//                               "gstTaxTypeCode": null,
//                               "taxCalcType": null,
//                               "status": "Active",
//                               "category": null,
//                               "brand": null,
//                               "costPrice": 69,
//                               "type": 0
//                           }
//                       }
//                   }
//               },
//               {
//                   "id": 60,
//                   "receivedQuantity": 12,
//                   "rejectedQuantity": 0,
//                   "poProduct": 8,
//                   "grn": 37,
//                   "po_products": {
//                       "id": 8,
//                       "quantity": 12,
//                       "price": 999,
//                       "vendorProduct": 13,
//                       "purchaseOrder": 7,
//                       "vendor_products": {
//                           "id": 13,
//                           "sku": "VWX-0004",
//                           "priority": 1,
//                           "status": "Active",
//                           "product": 25,
//                           "vendor": 2,
//                           "products": {
//                               "id": 25,
//                               "name": "Smart TV",
//                               "sku": "TIFTV015",
//                               "description": "Wi-Fi enabled 4K UHD smart TV with voice control",
//                               "length": null,
//                               "width": null,
//                               "height": null,
//                               "weight": null,
//                               "color": null,
//                               "hsnCode": null,
//                               "imageUrl": null,
//                               "createdAT": "2023-03-05T07:55:58.000Z",
//                               "updatedAT": "2023-03-05T07:55:58.000Z",
//                               "customDuty": null,
//                               "gstTaxTypeCode": null,
//                               "taxCalcType": null,
//                               "status": "Active",
//                               "category": null,
//                               "brand": null,
//                               "costPrice": 999,
//                               "type": 0
//                           }
//                       }
//                   }
//               }
//           ],
//           "user": {
//               "id": 9,
//               "createdAt": "2023-03-03T07:47:50.458Z",
//               "updatedAt": "2023-03-03T07:47:50.458Z",
//               "name": "Varun",
//               "email": "varunram.66@gmail.com",
//               "hashedPassword": "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJE1JeEk1YXl6ZldOSGhOMFIwNm91b3ckRE40MEZaMVZ6TWxhcWNGRVFRTloxTGYrUHY0U1pWdTFaMHpNYWszVk9BNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
//               "role": "USER"
//           },
//           "grn_status": {
//               "id": 1,
//               "name": "Created",
//               "description": null
//           }
//       },
//       {
//           "id": 41,
//           "grnNumber": "test",
//           "invoiceNo": "123456",
//           "invoiceDate": "2023-03-14T18:30:00.000Z",
//           "trackingId": "156478",
//           "eta": "2023-03-10T01:09:16.000Z",
//           "createdAt": "2023-03-10T01:12:04.000Z",
//           "updatedAt": "2023-03-10T01:12:04.000Z",
//           "status": 1,
//           "createdBy": 9,
//           "purchaseOrder": 7,
//           "grn_products": [
//               {
//                   "id": 78,
//                   "receivedQuantity": 10,
//                   "rejectedQuantity": 0,
//                   "poProduct": 6,
//                   "grn": 41,
//                   "po_products": {
//                       "id": 6,
//                       "quantity": 23,
//                       "price": 999,
//                       "vendorProduct": 13,
//                       "purchaseOrder": 7,
//                       "vendor_products": {
//                           "id": 13,
//                           "sku": "VWX-0004",
//                           "priority": 1,
//                           "status": "Active",
//                           "product": 25,
//                           "vendor": 2,
//                           "products": {
//                               "id": 25,
//                               "name": "Smart TV",
//                               "sku": "TIFTV015",
//                               "description": "Wi-Fi enabled 4K UHD smart TV with voice control",
//                               "length": null,
//                               "width": null,
//                               "height": null,
//                               "weight": null,
//                               "color": null,
//                               "hsnCode": null,
//                               "imageUrl": null,
//                               "createdAT": "2023-03-05T07:55:58.000Z",
//                               "updatedAT": "2023-03-05T07:55:58.000Z",
//                               "customDuty": null,
//                               "gstTaxTypeCode": null,
//                               "taxCalcType": null,
//                               "status": "Active",
//                               "category": null,
//                               "brand": null,
//                               "costPrice": 999,
//                               "type": 0
//                           }
//                       }
//                   }
//               },
//               {
//                   "id": 79,
//                   "receivedQuantity": 13,
//                   "rejectedQuantity": 0,
//                   "poProduct": 7,
//                   "grn": 41,
//                   "po_products": {
//                       "id": 7,
//                       "quantity": 33,
//                       "price": 69,
//                       "vendorProduct": 3,
//                       "purchaseOrder": 7,
//                       "vendor_products": {
//                           "id": 3,
//                           "sku": "ABC-9012",
//                           "priority": 3,
//                           "status": "Active",
//                           "product": 54,
//                           "vendor": 2,
//                           "products": {
//                               "id": 54,
//                               "name": "Book",
//                               "sku": "TIFC029",
//                               "description": "",
//                               "length": 0,
//                               "width": 0,
//                               "height": 0,
//                               "weight": 0,
//                               "color": "",
//                               "hsnCode": "",
//                               "imageUrl": "https://loremflickr.com/320/240/device?random=48",
//                               "createdAT": null,
//                               "updatedAT": null,
//                               "customDuty": null,
//                               "gstTaxTypeCode": null,
//                               "taxCalcType": null,
//                               "status": "Active",
//                               "category": null,
//                               "brand": null,
//                               "costPrice": 69,
//                               "type": 0
//                           }
//                       }
//                   }
//               },
//               {
//                   "id": 80,
//                   "receivedQuantity": 57,
//                   "rejectedQuantity": 0,
//                   "poProduct": 10,
//                   "grn": 41,
//                   "po_products": {
//                       "id": 10,
//                       "quantity": 211,
//                       "price": 99,
//                       "vendorProduct": 10,
//                       "purchaseOrder": 7,
//                       "vendor_products": {
//                           "id": 10,
//                           "sku": "MNO-0001",
//                           "priority": 1,
//                           "status": "Active",
//                           "product": 20,
//                           "vendor": 2,
//                           "products": {
//                               "id": 20,
//                               "name": "Smart CO Detector",
//                               "sku": "TIFCD010",
//                               "description": "Wi-Fi enabled CO detector with alerts to mobile devices",
//                               "length": null,
//                               "width": null,
//                               "height": null,
//                               "weight": null,
//                               "color": null,
//                               "hsnCode": null,
//                               "imageUrl": null,
//                               "createdAT": "2023-03-05T07:55:58.000Z",
//                               "updatedAT": "2023-03-05T07:55:58.000Z",
//                               "customDuty": null,
//                               "gstTaxTypeCode": null,
//                               "taxCalcType": null,
//                               "status": "Active",
//                               "category": null,
//                               "brand": null,
//                               "costPrice": 99,
//                               "type": 0
//                           }
//                       }
//                   }
//               }
//           ],
//           "user": {
//               "id": 9,
//               "createdAt": "2023-03-03T07:47:50.458Z",
//               "updatedAt": "2023-03-03T07:47:50.458Z",
//               "name": "Varun",
//               "email": "varunram.66@gmail.com",
//               "hashedPassword": "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJE1JeEk1YXl6ZldOSGhOMFIwNm91b3ckRE40MEZaMVZ6TWxhcWNGRVFRTloxTGYrUHY0U1pWdTFaMHpNYWszVk9BNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
//               "role": "USER"
//           },
//           "grn_status": {
//               "id": 1,
//               "name": "Created",
//               "description": null
//           }
//       }
//   ],
//   "po_products": [
//       {
//           "id": 6,
//           "quantity": 23,
//           "price": 999,
//           "vendorProduct": 13,
//           "purchaseOrder": 7,
//           "vendor_products": {
//               "id": 13,
//               "sku": "VWX-0004",
//               "priority": 1,
//               "status": "Active",
//               "product": 25,
//               "vendor": 2,
//               "products": {
//                   "id": 25,
//                   "name": "Smart TV",
//                   "sku": "TIFTV015",
//                   "description": "Wi-Fi enabled 4K UHD smart TV with voice control",
//                   "length": null,
//                   "width": null,
//                   "height": null,
//                   "weight": null,
//                   "color": null,
//                   "hsnCode": null,
//                   "imageUrl": null,
//                   "createdAT": "2023-03-05T07:55:58.000Z",
//                   "updatedAT": "2023-03-05T07:55:58.000Z",
//                   "customDuty": null,
//                   "gstTaxTypeCode": null,
//                   "taxCalcType": null,
//                   "status": "Active",
//                   "category": null,
//                   "brand": null,
//                   "costPrice": 999,
//                   "type": 0
//               }
//           }
//       },
//       {
//           "id": 7,
//           "quantity": 33,
//           "price": 69,
//           "vendorProduct": 3,
//           "purchaseOrder": 7,
//           "vendor_products": {
//               "id": 3,
//               "sku": "ABC-9012",
//               "priority": 3,
//               "status": "Active",
//               "product": 54,
//               "vendor": 2,
//               "products": {
//                   "id": 54,
//                   "name": "Book",
//                   "sku": "TIFC029",
//                   "description": "",
//                   "length": 0,
//                   "width": 0,
//                   "height": 0,
//                   "weight": 0,
//                   "color": "",
//                   "hsnCode": "",
//                   "imageUrl": "https://loremflickr.com/320/240/device?random=48",
//                   "createdAT": null,
//                   "updatedAT": null,
//                   "customDuty": null,
//                   "gstTaxTypeCode": null,
//                   "taxCalcType": null,
//                   "status": "Active",
//                   "category": null,
//                   "brand": null,
//                   "costPrice": 69,
//                   "type": 0
//               }
//           }
//       },
//       {
//           "id": 8,
//           "quantity": 12,
//           "price": 999,
//           "vendorProduct": 13,
//           "purchaseOrder": 7,
//           "vendor_products": {
//               "id": 13,
//               "sku": "VWX-0004",
//               "priority": 1,
//               "status": "Active",
//               "product": 25,
//               "vendor": 2,
//               "products": {
//                   "id": 25,
//                   "name": "Smart TV",
//                   "sku": "TIFTV015",
//                   "description": "Wi-Fi enabled 4K UHD smart TV with voice control",
//                   "length": null,
//                   "width": null,
//                   "height": null,
//                   "weight": null,
//                   "color": null,
//                   "hsnCode": null,
//                   "imageUrl": null,
//                   "createdAT": "2023-03-05T07:55:58.000Z",
//                   "updatedAT": "2023-03-05T07:55:58.000Z",
//                   "customDuty": null,
//                   "gstTaxTypeCode": null,
//                   "taxCalcType": null,
//                   "status": "Active",
//                   "category": null,
//                   "brand": null,
//                   "costPrice": 999,
//                   "type": 0
//               }
//           }
//       },
//       {
//           "id": 9,
//           "quantity": 123,
//           "price": 699,
//           "vendorProduct": 14,
//           "purchaseOrder": 7,
//           "vendor_products": {
//               "id": 14,
//               "sku": "ZZZ-9999",
//               "priority": 1,
//               "status": "Active",
//               "product": 28,
//               "vendor": 2,
//               "products": {
//                   "id": 28,
//                   "name": "Smart Water Heater",
//                   "sku": "TIFWH018",
//                   "description": "Wi-Fi enabled water heater with temperature control",
//                   "length": null,
//                   "width": null,
//                   "height": null,
//                   "weight": null,
//                   "color": null,
//                   "hsnCode": null,
//                   "imageUrl": null,
//                   "createdAT": "2023-03-05T07:55:58.000Z",
//                   "updatedAT": "2023-03-05T07:55:58.000Z",
//                   "customDuty": null,
//                   "gstTaxTypeCode": null,
//                   "taxCalcType": null,
//                   "status": "Active",
//                   "category": null,
//                   "brand": null,
//                   "costPrice": 699,
//                   "type": 0
//               }
//           }
//       },
//       {
//           "id": 10,
//           "quantity": 211,
//           "price": 99,
//           "vendorProduct": 10,
//           "purchaseOrder": 7,
//           "vendor_products": {
//               "id": 10,
//               "sku": "MNO-0001",
//               "priority": 1,
//               "status": "Active",
//               "product": 20,
//               "vendor": 2,
//               "products": {
//                   "id": 20,
//                   "name": "Smart CO Detector",
//                   "sku": "TIFCD010",
//                   "description": "Wi-Fi enabled CO detector with alerts to mobile devices",
//                   "length": null,
//                   "width": null,
//                   "height": null,
//                   "weight": null,
//                   "color": null,
//                   "hsnCode": null,
//                   "imageUrl": null,
//                   "createdAT": "2023-03-05T07:55:58.000Z",
//                   "updatedAT": "2023-03-05T07:55:58.000Z",
//                   "customDuty": null,
//                   "gstTaxTypeCode": null,
//                   "taxCalcType": null,
//                   "status": "Active",
//                   "category": null,
//                   "brand": null,
//                   "costPrice": 99,
//                   "type": 0
//               }
//           }
//       }
//   ],
//   "po_status": {
//       "id": 3,
//       "name": "Approved",
//       "description": "The PO has been approved to be placed with/em"
//   },
//   "po_terms": {
//       "id": 2,
//       "name": "Net-30",
//       "description": "Net-30"
//   },
//   "user": {
//       "id": 9,
//       "createdAt": "2023-03-03T07:47:50.458Z",
//       "updatedAt": "2023-03-03T07:47:50.458Z",
//       "name": "Varun",
//       "email": "varunram.66@gmail.com",
//       "hashedPassword": "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJE1JeEk1YXl6ZldOSGhOMFIwNm91b3ckRE40MEZaMVZ6TWxhcWNGRVFRTloxTGYrUHY0U1pWdTFaMHpNYWszVk9BNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
//       "role": "USER"
//   }
// }