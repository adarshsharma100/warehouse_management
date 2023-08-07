import { Suspense, useState, useRef, useEffect } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import getPurchase_order from "app/purchase_orders/queries/getPurchase_order"
import Loading from "components/loading"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Accordion, AccordionTab } from "primereact/accordion"
import { Button } from "primereact/button"
import createGrn from "app/grns/mutations/createGrn"
import { useFormik } from "formik"
import * as Yup from "yup"
import { InputText } from "primereact/inputtext"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import getGrn_statuses from "app/grn_statuses/queries/getGrn_statuses"
import { MultiSelect } from "primereact/multiselect"
import { arrayFillCopy, calenderDateFormat, createSearchFunction, dateFormat, tError, tsuccess } from "app/constants"
import updateGrn from "app/grns/mutations/updateGrn"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { Calendar } from "primereact/calendar"
import { Toast } from "primereact/toast"
import { InputNumber } from "primereact/inputnumber"
import { Checkbox } from "primereact/checkbox"
import VendorShipment from "./components/VendorShipment"
import { InputSwitch } from "primereact/inputswitch"
import getVendor_shipments from "app/vendor_shipments/queries/getVendor_shipments"
import { Dialog } from "primereact/dialog"
import { InputTextarea } from "primereact/inputtextarea"


export const Purchase_order = () => {
  const router = useRouter()
  console.log('router: ', router);
  const purchase_orderId = useParam("purchase_orderId", "number")
  const grn_productsId = useParam("grn_productsId", "number")
  const [value, setValue] = useState("")
  const user = useCurrentUser()
  // const { id: userId, role, name, email } = user
  const { id: userId, role, name, email } = user

  const grnDetails = {
    grnNumber: '',
    invoiceNo: "",
    status,
    grnRemarks: "",
    qcComplete: "",
    invoiceDate: '',
    trackingId: '',
    eta: '',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
  }

  const toast = useRef(null)
  const [purchase_order, { refetch }] = useQuery(getPurchase_order, { id: purchase_orderId, })
  const [createGrnMutation, { error: grnCreationError }] = useMutation(createGrn)
  const [updateGrnMutation] = useMutation(updateGrn)
  const [{ grn_statuses },] = useQuery(getGrn_statuses, { orderBy: { id: "asc" }, })
  console.log('grn_statuses: ', grn_statuses);
  const [grnList, setGrnList] = useState([])
  console.log('grnList: ', grnList);
  // const [grnDetails, setGrnDetails] = useState(GrnFormDetails)
  const [active, setActive] = useState(false)
  const [grnStatuses, setGrnStatuses] = useState([])
  const [grnCodeChecked, setGrnCodeChecked] = useState(true)
  const columns = [
    { type: 'text', label: "Grn Number", field: 'grnNumber' },
    { type: 'text', label: "Invoice No", field: 'invoiceNo' },
    { type: 'text', label: "Tracking Id", field: 'trackingId' },
    { type: 'text', label: "GRN Remark", field: "grnRemarks" },

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
  const grnProductColumn = [
    { type: 'text', label: "Item SKU", field: 'po_products.vendor_products.products.sku' },
    { type: 'text', label: "Vendor SKU", field: 'po_products.vendor_products.sku' },
    { type: 'text', label: "Received Quantity", field: 'receivedQuantity' },
    {
      type: 'text',
      label: "Short Supply",
      body: (rowData) => {
        const receivedQuantity = rowData.receivedQuantity;
        const poProductQuantity = rowData.po_products.quantity;
        return poProductQuantity - receivedQuantity;
      },
    },
    { type: 'text', label: "GRN RejectedQuantity", field: 'grnRejectedQuantity' },
    { type: 'text', label: "GRN RejectionRemarks", field: 'grnRejectionRemarks' },
    { type: 'text', label: "QC RejectedQuantity", field: 'qcRejectedQuantity' },
    { type: 'text', label: "QC RejectionRemarks", field: 'qcRejectionRemarks' },
    { type: 'text', label: "Final Quantity", field: 'finalQuantity' },
    // { type: 'text', label: "Short Supply", body: (rowdata) => totalshortSupplyTillDate(po_products, rowdata?.poProduct) },

    { type: 'text', label: "Price", field: 'po_products.price' },
    // { type: 'text', label: "Po Product", field: 'poProduct' },
    // { type: 'text', label: "Grns", field: 'grn' },
    // { type: 'text', label: "Grn", field: 'grn' },
  ]
  const [productsColumn, setProductsColumn] = useState(grnProductColumn)
  const [activeGrn, setActiveGrn] = useState({})
  const [updateGrns, setUpdateGrns] = useState(false)
  const initialGrnProductState = {
    receivedQuantity: "",
    grnRejectedQuantity: 0,
    grnRejectionRemarks: '',
    poProduct: "",
    productName: "",
    shortSupply: "",
    qcComplete: 0,
    qcRejectedQuantity: "",
    qcRejectionRemarks: "",
    finalQuantity: grnList.forEach((grnItem) => {
      grnItem.grn_products.forEach((product) => {
        product.finalQuantity = product.receivedQuantity - product.grnRejectedQuantity - product.qcRejectedQuantity;
      });
    }),
  }
  const [grnProductsList, setGrnProductsList] = useState([initialGrnProductState])
  console.log('grnProductsList: ', grnProductsList);
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

  console.log('po_products: ', po_products);
  console.log('poNumber: ', poNumber);
  let approvedBy = "-";
  if (purchase_order.user) {
    const { name, } = purchase_order?.user
    let approvedBy = name
  }

  const setGrnProducts = (poProducts) => {
    const _poProducts = poProducts.map(
      ({ id, quantity, vendor_products: { products: { name, sku } } }) => ({
        receivedQuantity: quantity,
        grnRejectedQuantity: 0,
        qcComplete: 0,
        poProduct: id,
        productName: `${sku}-${name}`,
        shortSupply: "",
        grnRejectionRemarks: '',
        qcRejectedQuantity: 0,
        qcRejectionRemarks: "",
        finalQuantity: 0,
      }))
    setGrnProductsList(_poProducts)
    setItemProductsList(_poProducts)
  }
  const getPoProductQty = (poProducts, poId) => poProducts.find(ele => ele.id === poId)?.quantity

  const getReceviedGrnProductQty = (poId) => {
    const qty = grn.reduce((acc, curr) => {
      const count = curr.grn_products.find(prod => prod.poProduct === poId)?.receivedQuantity;
      return count ? acc + count : acc
    }, 0)
    return qty
  }

  const totalshortSupplyTillDate = (poProducts, poId) => {
    console.log('supply ++', getPoProductQty(poProducts, poId))
    console.log('supply ++ receved', getReceviedGrnProductQty(poId))

    return getPoProductQty(poProducts, poId) - getReceviedGrnProductQty(poId)
  }


  const onColumnToggle = (event) => {
    let productsColumn = event.value
    let orderedSelectedColumns = grnProductColumn.filter((col) =>
      productsColumn.some((sCol) => sCol.field === col.field)
    )
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
        body={col.body}
        filter
        filterPlaceholder="Search...."
      />
    )
  })



  const formik = useFormik({
    initialValues: grnDetails,
    validationSchema: Yup.object().shape({
      invoiceNo: Yup.string().required("*Required"),
      invoiceDate: Yup.date().required('*Required'),
      // eta: Yup.date().required('*Required'),
    }),
    onSubmit: async (data) => {
      console.log('data: ', data);
      const { grnNumber, invoiceNo, invoiceDate, status, grnRemarks, createdBy, trackingId, eta }: any = data

      if (updateGrns) {
        try {
          await updateGrnMutation({
            id: activeGrn?.id,
            grnNumber,
            invoiceNo,
            invoiceDate,
            // trackingId,
            // eta,
            status: status?.id,
            grn_products: {
              updateMany: grnProductsList.map(({ grnProductId, receivedQuantity, grnRejectedQuantity, qcRejectedQuantity, poProduct, }) => ({
                where: {
                  id: grnProductId
                },
                data: {
                  receivedQuantity,
                  grnRejectedQuantity,
                  // grnRejectionRemarks,
                  qcRejectedQuantity,
                  // qcRejectionRemarks,
                },
              }))
            }

          }, {
            onSuccess: async (data) => {
              toast?.current.show(tsuccess("Updated", `${data.grnNumber} is updated successfully`))
              console.log(data)
              await refetch()
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
            // trackingId,
            createdBy: userId,
            // eta,
            status: status?.id,

            vendorShipmentId: tracking?.id,
            grnRemarks,
            purchaseOrder: purchase_orderId,
            grn_products: {
              create: grnProductsList.map(({
                receivedQuantity,
                grnRejectedQuantity,
                poProduct,
                qcComplete,
                qcRejectedQuantity,
                grnRejectionRemarks,
                qcRejectionRemarks,
                // finalQuantity
              }) => ({
                receivedQuantity,
                grnRejectedQuantity,
                grnRejectionRemarks,
                poProduct,
                qcComplete,
                qcRejectedQuantity,
                qcRejectionRemarks,
                // finalQuantity
              }))
            },
          }, {
            onSuccess: async (data) => {
              toast?.current.show(tsuccess("Created", `GRN Created successfully`))
              console.log('data: ', data);
              setActive(!active)
              formik.resetForm()
              await refetch()

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

      }
    }
  })
  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }
  console.log('formik.error', formik.errors)




  const renderGrn = (grn) => {
    const { id,
      grnNumber,
      invoiceNo,
      invoiceDate,
      grnRemarks,
      // grnRejectionRemarks,
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

    const grnProduct = grn_products && grn_products.length > 0 ? grn_products[0] : null;

    // Extract the grnRejectionRemarks property from the grnProduct object.
    const grnRejectionRemarks = grnProduct ? grnProduct.grnRejectionRemarks : "";




    const invoiceAmount = grn_products?.
      reduce((acc, { po_products: { quantity, price } }) => acc + (quantity * price), 0)

    return <>
      <div className="flex flex-column justify-content-end mt-2">
        <Button
          tooltip="Edit"
          tooltipOptions={{ position: "top" }}
          className="align-self-end"
          icon='pi pi-pencil'
          onClick={async () => {
            window.scrollTo(90, 90)
            const _grnprodListFormat = grn_products.map(({ id: grnProductId, finalQuantity, receivedQuantity, grnRejectedQuantity,
              po_products: { id, vendor_products: { products: { name, sku } } } }) => ({
                receivedQuantity,
                grnRejectedQuantity,
                poProduct: id,
                grnProductId,
                productName: `${sku}-${name}`,
                shortSupply: "",
                finalQuantity,
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
            { field: "Tracking Id", value: tracking_Id },
            { field: "GRN Remark", value: grnRemarks },
            { field: "Invoice Date", value: invoiceDate },
            { field: "Created On", value: createdAt },
            { field: "Status", value: grnStatus },
            { field: " Invoice amount", value: invoiceAmount },
            { field: " Created By", value: createdBy },
            // { field: " GRN RejectionRemarks", value: grnRejectionRemarks },

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

  useEffect(() => {
    setGrnList(purchase_order?.grn)
    console.log('purchase_order?.grn: ', "purchase_order?.grn");
  }, [purchase_order])



  // GRN DATATABLES

  // const onCellEditComplete = (e) => {
  //   const { rowData, newValue, field, originalEvent: event } = e;
  //   console.log('newValue: ', newValue, rowData, field);
  //   if (['receivedQuantity', 'grnRejectedQuantity', "qcRejectedQuantity", "grnRejectionRemarks", 'qcRejectionRemarks', 'shortSupply'].includes(field)) {
  //     if (newValue?.trim().length > 0) {
  //       const intValue = parseInt(newValue, 10);


  //       rowData[field] = intValue

  //       const updatedGRNItems = grnProductsList.map((item, itemIndex) => {

  //         if (item.id === rowData.id) {
  //           return { ...item, [field]: intValue };
  //         }
  //         return item;
  //       });

  //       formik.setValues({
  //         ...formik.values,
  //         grnProductsList: updatedGRNItems,
  //       });


  //     } else {
  //       event.preventDefault();
  //     }
  //   }
  // };


  const onCellEditComplete = (e) => {
    const { rowData, newValue, field, originalEvent: event } = e;
    console.log('newValue: ', newValue, rowData, field);
    if (
      ['receivedQuantity', 'grnRejectedQuantity', 'qcRejectedQuantity', 'grnRejectionRemarks', 'qcRejectionRemarks',].includes(field)
    ) {
      if (newValue?.trim().length > 0) {
        if (field === 'grnRejectedQuantity' || field === 'qcRejectedQuantity' || field === 'receivedQuantity') {
          const intValue = parseInt(newValue, 10);
          rowData[field] = intValue;
        } else {
          // For string fields grnRejectionRemarks and qcRejectionRemarks
          rowData[field] = newValue;
        }

        const updatedGRNItems = grnProductsList.map((item) => {
          if (item.id === rowData.id) {
            return { ...item, [field]: rowData[field] };
          }
          return item;
        });

        formik.setValues({
          ...formik.values,
          grnProductsList: updatedGRNItems,
        });
      } else {
        event.preventDefault();
      }
    }
  };

  const textEditor = (options) => {

    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}

      />
    );
  };

  const grnItemColumn = [
    // { field: "shortSupply", header: 'Short Supply', body: (rowData) => rowData.po_products.quantity - rowData.receivedQuantity || "-" },
    { field: "receivedQuantity", header: 'Received Quantity', body: (rowData) => rowData.receivedQuantity || "-" },
    {
      field: "shortSupply",
      header: "Short Supply",
      body: (rowData) => {
        const shortSupply = rowData.po_products.quantity - rowData.receivedQuantity;
        return shortSupply >= 0 ? shortSupply : "-";
      },
    },
    { field: "grnRejectedQuantity", header: 'GRN Rejected Quantity', body: (rowData) => rowData.grnRejectedQuantity || "-" },
    { field: "grnRejectionRemarks", header: 'GRN Rejection Remarks', body: (rowData) => rowData.grnRejectionRemarks || "-" },
    { field: "qcRejectedQuantity", header: 'QC Rejected Quantity', body: (rowData) => rowData.qcRejectedQuantity || "-" },
    { field: "qcRejectionRemarks", header: 'QC Rejection Remarks', body: (rowData) => rowData.qcRejectionRemarks || "-" },
    { field: "finalQuantity", header: 'Final Quantity', body: (rowData) => rowData.receivedQuantity - rowData.grnRejectedQuantity - rowData.qcRejectedQuantity || "-" },
  ]

  // rowData.po_products.quantity
  const [visible, setVisible] = useState(false);
  const [activeDialog, setActiveDialog] = useState(false)
  const [checked, setChecked] = useState(false);
  console.log('activeDialog: ', activeDialog);
  const [{ vendor_shipments }] = useQuery(getVendor_shipments, {
    where: undefined,
    orderBy: undefined,
    skip: undefined,
    take: undefined
  })
  console.log('vendor_shipments: ', vendor_shipments);


  const [shipmentValue, setShipmentValue] = useState('');
  // console.log('shipmentValue: ', shipmentValue);
  const trackingIdSuggestions = vendor_shipments.map((shipment) => shipment);
  console.log('trackingIdSuggestions: ', trackingIdSuggestions);

  const [tracking, setTracking] = useState<any>(null)
  // console.log('tracking: ', tracking.id);
  const searchTracking = createSearchFunction(vendor_shipments, setTracking)

  const tracking_Id = null

  const getShipmentIdByVendorShipmentId = (vendorShipmentId) => {
    const matchedShipment = vendor_shipments.find((shipment) => shipment.id === vendorShipmentId);
    tracking_Id = matchedShipment ? matchedShipment.trackingId : "";
    console.log('tracking_Id: ', tracking_Id);
    return matchedShipment ? matchedShipment.shipmentId : ""; // You can return the shipmentId or any other relevant property
  };


  // Pull Products from PO

  const [pullProducts, setPullProducts] = useState(true)

  const handlePullProductsChange = (e) => {
    const shouldPullProducts = e.value;
    if (!shouldPullProducts) {
      setGrnProductsList([{}]);
    } else {

      setGrnProductsList([]);
    }
    setPullProducts(shouldPullProducts);
  };

  const [itemProductList, setItemProductsList] = useState([initialGrnProductState])
  const [selectItem, setSelecttItem] = useState([])
  console.log('itemProductList: ', itemProductList);
  const searchProducts = createSearchFunction(itemProductList, setSelecttItem)



  // QC Pending code
  const [selectGrnProducts, setSelectGrnProducts] = useState([])
  console.log('selectGrnProducts: ', selectGrnProducts);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const handleSelectAll = (e) => {
    if (e.checked) {
      setSelectGrnProducts([...grnProductsList]);
    } else {
      setSelectGrnProducts([]);
    }
  };

  const isAllRowsSelected = () => {
    return selectGrnProducts.length === grnProductsList.length;
  };


  useEffect(() => {
    setSelectAllChecked(isAllRowsSelected());
  }, [selectGrnProducts]);

  useEffect(() => {

    if (selectAllChecked) {
      formik.setFieldValue("status", { id: 5, name: 'QC_Complete', description: null });

    } else {
      if (selectGrnProducts.length >= 1) {
        formik.setFieldValue("status", { id: 4, name: 'QC_Pending', description: null });
      } else {
        formik.setFieldValue("status", { id: 1, name: 'Created', description: null });
      }
    }
  }, [selectAllChecked, selectGrnProducts])



  const qcHandleSubmit = async (value) => {
    if (selectAllChecked) {
      formik.setFieldValue("status", { id: 5, name: 'QC_Complete', description: null });

      const updatedProducts = grnProductsList.map(product => ({ ...product, qcComplete: 1 }));
      setGrnProductsList(updatedProducts);

    } else {
      if (selectGrnProducts.length >= 1) {
        formik.setFieldValue("status", { id: 4, name: 'QC_Pending', description: null });

        const updatedProducts = grnProductsList.map(product => ({
          ...product,
          qcComplete: selectGrnProducts.some(selectedProduct => selectedProduct.poProduct === product.poProduct) ? 1 : 0,
        }));
        setGrnProductsList(updatedProducts);


      } else {
        formik.setFieldValue("status", { id: 1, name: 'Created', description: null });
        const updatedProducts = grnProductsList.map(product => ({ ...product, qcComplete: 0 }));
        setGrnProductsList(updatedProducts);
      }
    }

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
                // { field: "Expected Delivery", value: expectedDod },
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

        {/* vendorShipment component  */}
        <VendorShipment />

        <div className="flex justify-content-end px-3 mt-4 ">
          <Button
            label="Create GRN"
            icon='pi pi-plus'
            onClick={async () => {
              setGrnProducts(po_products)
              // setActive(!active);
              setActiveDialog(true)
              setVisible(true)

              setUpdateGrns(false)
              await formik.setValues({
                ...formik.values, status: {
                  "id": 1,
                  "name": "Created",
                  "description": null
                },
              })
              setGrnCodeChecked(true)
            }} />
        </div>

        <div>
          {activeDialog &&

            <div>
              <Dialog header="Create GRN"
                visible={visible}
                style={{ width: '50vw' }}
                onHide={() => { setVisible(false); setActiveDialog(false); setShipmentValue('') }}>
                <div className="mt-4 flex gap-2 align-items-center justify-content-center">
                  <InputSwitch checked={checked} onChange={(e) => {
                    setChecked(e.value);
                    if (!e.value) {
                      setShipmentValue('');
                    }
                  }} />
                  <div className="">
                    {checked ? <p>With Shipment Data</p> : <p>Without Shipment Data</p>}
                  </div>
                </div>

                <div>
                  {checked &&
                    <div className="p-float-label mt-5">
                      <AutoComplete
                        value={shipmentValue}
                        suggestions={trackingIdSuggestions.map((ele) => ele.trackingId)}
                        completeMethod={searchTracking}
                        onChange={(e) => {
                          if (checked) {
                            const selectedTracking = vendor_shipments.find(
                              (shipment) => shipment.trackingId === e.value
                            );
                            setTracking(selectedTracking);
                            setShipmentValue(e.value);
                            formik.setFieldValue('trackingId', e.value);
                          } else {
                            formik.handleChange(e);
                          }
                        }}
                        dropdown
                      />
                      <label
                        htmlFor="purchase_order_status"
                        className={classNames({ "p-error": isFormFieldValid("purchase_order_status") })}
                      >
                        Shipment ID
                      </label>
                    </div>
                  }
                  {/* 
                  <div className="p-float-label mt-5">
                    <AutoComplete
                      value={shipmentValue}
                      suggestions={trackingIdSuggestions.map((ele) => ele.trackingId)}
                      completeMethod={searchTracking}
                      onChange={(e) => {
                        const selectedTracking = vendor_shipments.find(
                          (shipment) => shipment.trackingId === e.value
                        );
                        setTracking(selectedTracking);
                        setShipmentValue(e.value);
                        formik.setFieldValue('trackingId', e.value);
                        formik.handleChange(e);

                      }}
                      dropdown
                    />
                    <label
                      htmlFor="purchase_order_status"
                      className={classNames({ "p-error": isFormFieldValid("purchase_order_status") })}
                    >
                      Shipment ID
                    </label>
                  </div> */}
                </div>
                <div>
                  <Button
                    className="mt-5"
                    label="Submit"
                    onClick={() => {
                      setActive(true);
                      setVisible(false);
                      if (!checked) {
                        formik.setValues({
                          ...formik.values,
                          "trackingId": formik.values['trackingId']
                        })
                        // formik.setValues('trackingId', formik.values['trackingId']); // Update formik state with the current value of trackingId
                      }
                    }}

                  />
                </div>
              </Dialog>
            </div>

          }

          {active &&
            <div className="m-3 p-4 card">
              <div>
                <h3 className="mb-0">{updateGrns ? "Update" : "Create"} GRN</h3>
              </div>

              <form className="p-fluid" onSubmit={formik.handleSubmit}>
                <div className="flex justify-content-center">
                  <div className="flex gap-2">
                    <div>Status:</div>
                    <div>{formik.values.status?.name}</div>
                  </div>
                </div>

                <div className="formgrid grid ">
                  <div className="field col-12 lg:col-3 mt-5">
                    <div className="field">
                      <span className="p-float-label ">
                        <InputText
                          id="grnNumber"
                          name="grnNumber"
                          value={grnCodeChecked ? "Auto Generated" : formik.values.grnNumber}
                          onChange={formik.handleChange}
                          disabled={grnCodeChecked}
                          autoFocus
                          className={classNames({ "p-invalid": isFormFieldValid("grnNumber") })}
                        />
                        <label
                          htmlFor="grnNumber"
                          className={classNames({ "p-error": isFormFieldValid("grnNumber") })}
                        >
                          GRN Code
                        </label>
                      </span>
                      {getFormErrorMessage("grnNumber")}
                      <div className="field-checkbox ">
                        <Checkbox
                          // style={{ width: "0.1rem", height: "0rem" }}
                          onChange={(e) => setGrnCodeChecked(e.checked)}
                          checked={grnCodeChecked}
                        />
                        <label
                          // htmlFor="binary"
                          className="text-sm	"
                        >
                          Un-check to add custom code.
                        </label>
                      </div>
                    </div>


                  </div>
                  {[
                    // { type: 'text', label: "Grn Number", field: 'grnNumber' },
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


                  {/* <div className="field col-12 lg:col-3 mt-2">
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

                  </div> */}


                  {/* <div className="field col-12 lg:col-3 mt-2">
                    <div className="p-float-label">
                      <Calendar
                        minDate={new Date()}
                        id="eta"
                        value={formik.values.eta}
                        onChange={formik.handleChange}
                        className={classNames({ "p-invalid": isFormFieldValid("eta") })}
                        dateFormat={calenderDateFormat()}
                      />
                      <label
                        htmlFor="eta"
                        className={classNames({ "p-error": isFormFieldValid("eta") })}
                      >
                        Expected Delivery
                      </label>
                    </div>
                    {getFormErrorMessage("eta")}
                  </div> */}


                  <div className="field col-12 lg:col-3 mt-5">
                    <div className="p-float-label">
                      <Calendar
                        // minDate={new Date()}
                        maxDate={new Date()}
                        id="invoiceDate"
                        value={formik?.values?.invoiceDate}
                        onChange={formik.handleChange}
                        className={classNames({ "p-invalid": isFormFieldValid("invoiceDate") })}
                        // dateFormat={calenderDateFormat()}
                        dateFormat="dd/mm/yy"
                      />
                      <label
                        htmlFor="invoiceDate"
                        className={classNames({ "p-error": isFormFieldValid("invoiceDate") })}
                      >
                        Invoice Date
                      </label>
                    </div>
                    {getFormErrorMessage("invoiceDate")}
                  </div>




                  <div className="mt-3 w-full">
                    <div className="p-float-label">
                      <InputTextarea
                        // placeholder="Grn Remark"
                        className="p-3  mt-2"
                        name="grnRemarks"
                        value={formik.values.grnRemarks}
                        onChange={formik.handleChange}

                      />
                      <label>
                        GrnRemarks
                      </label>
                    </div>
                  </div>

                  {/* <div className="col-12 mt-3 mb-2 ">
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
                          <label className="mr-2">GRN Rejected Quantity</label>
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
                          <label className="mr-2">QC Rejected Quantity</label>
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
                  ))}  */}

                  <div className="col-12 mt-3">
                    <h6>GRN Products</h6>
                    <div className="card flex align-items-center gap-2 ">
                      <div>
                        <InputSwitch checked={pullProducts} onChange={handlePullProductsChange} />
                      </div>
                      <div>Pull Products from PO</div>
                    </div>
                    <DataTable
                      value={grnProductsList}
                      showGridlines
                      stripedRows
                      editMode="cell"
                      // selectionMode={grnProductsList.length === 1 ? 'single' : null}
                      selectionMode='multiple'
                      selection={selectGrnProducts}
                      onSelectionChange={(e) => setSelectGrnProducts(e.value)}

                    >
                      <Column
                        header='ID'
                        className="reduce-column"
                        body={(ele, { rowIndex }) => (
                          <div key={rowIndex} className=" ">
                            <span className="bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center">{rowIndex + 1}</span>
                          </div>
                        )}
                      />
                      {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column> */}
                      <Column
                        selectionMode="multiple"
                        headerStyle={{ width: '3rem' }}
                        checked={isAllRowsSelected()}
                        onChange={(e) => handleSelectAll(e)}
                      // header={() => (
                      //   <Checkbox
                      //     checked={selectAllChecked}
                      //     onChange={(e) => handleSelectAll(e)}
                      //   />
                      // )}
                      />
                      <Column
                        header='Products'
                        body={(ele, { rowIndex }) => {
                          return (
                            <div className="">
                              {pullProducts ? (
                                <AutoComplete
                                  id="name"
                                  name="productName"
                                  value={ele.productName}
                                  dropdown
                                  onChange={async (e) => {
                                    // const selectedProduct = e.value;
                                    // handleProductSelect(selectedProduct);
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
                              ) : (
                                <AutoComplete
                                  id="name"
                                  name="productName"
                                  value={ele.productName}
                                  suggestions={itemProductList.map((ele) => ele.productName)}
                                  dropdown
                                  onChange={(e) => {
                                    // Handle product selection when pullProducts is false
                                  }}
                                  aria-label="products"
                                  dropdownAriaLabel="Select Product =="
                                />
                              )}

                            </div>
                          )
                        }}
                      />

                      {grnItemColumn.map((i) => {
                        return (
                          <Column
                            key={i.field}
                            field={i.field}
                            header={i.header}
                            body={i.body}
                            editor={
                              i.field === 'receivedQuantity' ||
                                i.field === 'grnRejectedQuantity' ||
                                i.field === 'qcRejectedQuantity' ||
                                i.field === 'grnRejectionRemarks' ||
                                i.field === 'qcRejectionRemarks' ?
                                textEditor : null
                            }
                            onCellEditComplete={
                              i.field === 'receivedQuantity' ||
                                i.field === 'grnRejectedQuantity' ||
                                i.field === 'qcRejectedQuantity' ||
                                i.field === 'grnRejectionRemarks' ||
                                i.field === 'qcRejectionRemarks' ?
                                onCellEditComplete : null
                            }
                          />
                        )
                      })}


                      {grnProductsList?.length > 1 && (
                        <Column
                          header='Remove'
                          className="reduce-column"
                          body={(ele, { rowIndex }) => {
                            return (
                              <span className="">

                                {grnProductsList.length > 1 && (
                                  <Button
                                    type="button"
                                    icon='pi pi-times'
                                    className="p-button-secondary"
                                    onClick={() => {
                                      removeFields(rowIndex);
                                    }}
                                  />
                                )}
                              </span>
                            );
                          }}
                        />
                      )}





                    </DataTable>
                  </div>

                </div>

                <div className="flex justify-content-between gap-5 mt-4">
                  {selectAllChecked ? "" : <Button type="submit" onClick={() => qcHandleSubmit(value)} label="Submit for QC" />}
                  <Button type="submit"
                    label={selectAllChecked ? "Mark as QC Completed" : "SUBMIT"}
                    onClick={() => qcHandleSubmit(value)}
                  />

                  <Button type="submit"
                    label="CANCEL"
                    onClick={() => {
                      setActive(!active); setUpdateGrns(false);
                      formik.resetForm()
                      setGrnProductsList([initialGrnProductState])

                    }}
                    className="p-button-secondary flex-grow-0" />
                </div>


              </form>
            </div>}
        </div>




        {grnList?.length > 0 &&
          <Accordion className="m-3">
            {grnList?.map((grn, index) => {
              console.log('grn: ', grn);
              const shipmentId = getShipmentIdByVendorShipmentId(grn.vendorShipmentId);
              
              console.log('shipmentId: ++', shipmentId);
              const headerText = `${grn.grnNumber} -  Shipment-${shipmentId} -  Status-`;

              const shouldShowButton = grn.grn_status.id === 5 || grn.grn_status.name === 'QC_Complete';
              console.log('shouldShowButton: ', shouldShowButton);

              const accordionHeader = (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>GrnID-{grn.grnNumber}-</div>
                  <div>-Shipment-{shipmentId}--</div>
                  <div>Status-{grn.grn_status.name}</div>
                  <div className="flex gap-2">
                    <div>
                      {shouldShowButton && (
                        <div className="flex justify-content-end">
                          <Button icon="pi pi-plus" label="Create PutAway" />
                        </div>
                      )}
                    </div>
                    <div>
                      {/* {renderGrn(grn)} */}
                    </div>
                  </div>
                </div >
              );
              return (
                <AccordionTab
                  // header={headerText}
                  header={accordionHeader}
                  key={index}
                >
                  {/* {shouldShowButton && (
                    <div className="flex justify-content-end">
                      <Button icon="pi pi-plus" label="Create PutAway" />
                    </div>
                  )} */}
                  {renderGrn(grn)}
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
