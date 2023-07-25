import { Suspense, useEffect, useRef, useState, useReducer, startTransition, useCallback } from "react"
import Head from "next/head"
import { useMutation, usePaginatedQuery, useQuery, invoke } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { InputNumber } from "primereact/inputnumber"
import getRfqs from "app/rfqs/queries/getRfqs"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import getProducts from "app/products/queries/getProducts"
import createRfq from "app/rfqs/mutations/createRfq"
import { Calendar } from "primereact/calendar"
import updateRfq from "app/rfqs/mutations/updateRfq"
import { Menu } from "primereact/menu"
import { Chip } from "primereact/chip"
import axios from "axios"
import Loading from "components/loading"
import LoaderFullScreen from "components/LoaderFullScreen"
import ErrorCard from "components/ErrorCard"
import { MultiSelect } from "primereact/multiselect"
import { Checkbox } from "primereact/checkbox"
import { AutoComplete } from "primereact/autocomplete"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import {
  arrayFillCopy,
  dateFormat,
  createSearchFunction,
  filterExistingValues,
  tsuccess,
  calenderDateFormat,
  tError,
  tWarn,
  getRemainingPoProducts,
  initialFilterRules
} from "app/constants"
import { Toast } from "primereact/toast"
import { getAntiCSRFToken } from "@blitzjs/auth"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import getEmails from "app/emails/queries/getEmails"
import getRfq from "app/rfqs/queries/getRfq"
import { constants } from "zlib"
import { dateFilterTemplate } from "components/FilterTemplates"
import { Paginator } from "primereact/paginator"
import { L, e } from "@blitzjs/auth/dist/index-c7aa9db2"
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { TreeTable } from 'primereact/treetable';

const ITEMS_PER_PAGE = 100

const initialState = {
  tableRowsCount: 10,
  skipCount: 0,
  emailNameSearchQuery: ""

};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'UPDATE_EMAIL_NAME_SEARCH_STATE':
      return { ...state, [payload.key]: payload.value }
    case 'UPDATE_TABLE_ROWS_COUNT':
      return { ...state, tableRowsCount: payload }
    case 'UPDATE_SKIP_COUNT':
      return { ...state, skipCount: payload }
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}

const vendorMap = {}

export const RfqsList = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { skipCount, tableRowsCount, emailNameSearchQuery } = state;


  const antiCSRFToken = getAntiCSRFToken()
  const user = useCurrentUser()
  const { id, role, name, email } = user

  const page = Number(router.query.page) || 0

  const [{ rfqs, count: rfqsCount }, { error: rfqError, refetch }] = useQuery(getRfqs, {
    orderBy: { id: "desc" },
    where: {},
    skip: skipCount,
    take: tableRowsCount

  })

  console.log("rfqs", rfqs);
  const [{ emails },] = useQuery(getEmails, {
    orderBy: { id: "asc" },
    where: {
      OR: [
        {
          addresses_emails_addressesToaddresses: {
            vendor_branches: {
              every: {
                vendors: {
                  name: {
                    contains: emailNameSearchQuery ?? undefined
                  }
                }
              }
            }
          }
        },
        { email: { contains: emailNameSearchQuery ?? undefined } }
      ]

    }
  })

  console.log('emails123: ', emails);
  console.log('emailNameSearchQuery: ', emailNameSearchQuery);



  const [{ purchase_orders }, { error: getPoError }] = useQuery(getPurchase_orders, {
    orderBy: { id: "desc" }, // Do not change the order this will affect on LatestPO function
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [{ products }, { error: productsError }] = usePaginatedQuery(getProducts, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [selectedRfqs, setSelectedRfqs] = useState(null);
  const [sendDialog, setSendDialog] = useState(false)
  const [filteredSelectedProductID, setFilteredSelectedProductID] = useState([]);
  const [createRFQMutation, { isLoading: creatingRfq, error: createRFQMutationError }] =
    useMutation(createRfq)
  const [updateRFQMutation, { isLoading: updatingRfq, error: updateRFQMutationError }] =
    useMutation(updateRfq)

  const productOptions = products.filter(({ id }) => {
    if (!filteredSelectedProductID.includes(id)) {
      return true
    } else {
      return false
    }
  }).map(
    ({ id, name, sku, vendor_products, costPrice }) => {
      return {
        name: `${sku} - ${name}`,
        id,
        // vendorID: vendor_products?.map((ele) => ele.vendor_vendor_id),
        costPrice
      }
    }
  )

  console.log("filteredSelectedProductID", filteredSelectedProductID);
  const [productsSuggestions, setProductsSuggestions] = useState<any>(null)
  const searchProducts = createSearchFunction(productOptions, setProductsSuggestions)
  const menu = useRef<Menu>(null)
  const toast = useRef(null)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [rfqDialog, setRfqDialog] = useState(false)
  const [isInclude, setIsInclude] = useState(false)
  const [amendingRfq, setAmendingRfq] = useState(false)
  const initialRfqState = {
    rfqNumber: "",
    rfq_description: "",
    expectedDod: "",
    rfq_email: null,
    itemsLength: false,
    agreement: "",
    id: "",
    status: "Created",
    ammendedFrom: null,
    ammendedRFQNumberCount: 0
  }
  const [rfqDetails, setRfqDetails] = useState(initialRfqState)
  const [rfqEditState, setRfqEditState] = useState(false)
  const [readOnlyForm, setReadOnlyForm] = useState(true)

  console.log('readOnlyForm: ', readOnlyForm);
  const [duplicateRFQForm, setDuplicateRFQForm] = useState(false)
  const [totalTargetPrice, setTotalTargetPrice] = useState(0)
  const [productDiscount, setProductDiscount] = useState(null)
  const [selectedVendorsWithEmails, setSelectedVendorsWithEmails] = useState([])

  const [checkAmmendedFrom, setCheckAmmendedFrom] = useState([])

  const initialItemList = {
    product_id: "",
    quantity: "",
    costPrice: "",
    product_name: "",
    last_po_price: "-",
    last_purchase_quantity: "",
    last_vendor: "",

    avg_price: "-",
  }

  const [itemList, setItemList] = useState([
    {
      ...initialItemList,
    },
  ])


  const [activeRow, setActiveRow] = useState({})
  const [expandedRows, setExpandedRows] = useState(null)
  const [currentRfqitemsID, setCurrentRfqitemsID] = useState([])
  const [rfqErrorMsgs, setRfqErrorMsgs] = useState([])
  const [RFQCodechecked, setRFQCodeChecked] = useState<boolean>(true)
  console.log('RFQCodechecked: ', RFQCodechecked);

  const scrollToRfq = useRef<HTMLHeadingElement>(null)
  const [rfqStatusSuggestions, setrfqStatusSuggestions] = useState<any>(null)
  const [mailSent, setMailSent] = useState(false)
  console.log('mailSent: ', mailSent);
  const rfqStatus = ["Created", "Processing", "Completed", "Sent", "Cancelled", "Force Completed"]
    .map((term) => ({ name: term, value: term }))
  const searchStatus = createSearchFunction(rfqStatus, setrfqStatusSuggestions)


  const columns = [
    {
      field: "rfqNumber",
      header: "RFQ No.",
      filter: true,
      filterPlaceholder: "Search by Code",
    },
    {
      field: "description",
      header: "Description",
      filter: true,
      filterPlaceholder: "Search by Description",
    },
    {
      field: "createdAt",
      header: "Created at",
      filterField: "createdAt",
      filter: true,
      filterElement: dateFilterTemplate,
      dataType: "date",
      body: (rowData) => dateFormat(rowData.createdAt),
    },
    {
      field: "updatedAt",
      header: "updatedAt",
      filterField: "Updated at",
      filter: true,
      filterElement: dateFilterTemplate,
      dataType: "date",
      body: (rowData) => dateFormat(rowData.createdAt),
    },
    {
      field: "status",
      header: "Status",
      filter: true,
      filterPlaceholder: "Search by status"
    },
    {
      field: "agreement",
      header: "Agreement",
      filter: true,
      filterPlaceholder: "Search by Agreement",
    },
    {
      field: "rfq.rfqNumber",
      header: "Amended From",
      filter: true,
      filterPlaceholder: "Search by Code",
    }

  ]
  const [selectedColumns, setSelectedColumns] = useState([])

  const LatestPO = (poList, num) => {
    // get all the po
    // serach the po from last for selected product and get the price

    const lastProductPrice = poList.find((ele) =>
      ele.po_products.find((ele) => ele.vendor_products.products.id === num)
    )
    console.log('lastProductPrice: ', lastProductPrice);

    const purchaseQuantity = lastProductPrice?.po_products?.find(
      (ele) => ele.vendor_products.products.id === num
    ).quantity
    const vendor = lastProductPrice?.vendors?.name
    const poId = lastProductPrice?.id
    const productPrice = lastProductPrice?.po_products?.find(
      (ele) => ele.vendor_products.products.id === num
    ).price

    const data = {
      poId,
      vendor: vendor ?? "NA",
      productPrice: productPrice ?? "NA",
      purchaseQuantity: purchaseQuantity ?? "NA"
    }


    return data
  }

  const optionsForVendorEmails = emails.map(({ id, email, addresses_emails_addressesToaddresses }) => {
    const { vendor_branches } = addresses_emails_addressesToaddresses;

    return {
      name: `${vendor_branches[0]?.vendors?.name ? vendor_branches[0].vendors.name : ''}-${email}`,
      value: id,
      // email

    }
  })

  const findEmailId = (mail) => {
    const ID = emails?.find(({ email }) => mail === email)?.id
    return ID
  }
  const [vendorEmailSuggestions, setVendorEmailSuggestions] = useState<any>(null)
  const initialColumnFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    rfqNumber: initialFilterRules.andContains,
    description: initialFilterRules.andContains,
    updatedAt: initialFilterRules.dateIs,
    createdAt: initialFilterRules.dateIs,
    active: initialFilterRules.andContains,
    agreement: initialFilterRules.andContains,
    status: initialFilterRules.andContains,
  }
  const [filters, setFilters] = useState(initialColumnFilters)
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const clearFilter = () => {
    setFilters(initialColumnFilters)
    setGlobalFilterValue("")
  }
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters1 = { ...filters }
    _filters1["global"].value = value

    setFilters(_filters1)
    setGlobalFilterValue(value)
  }


  const findPO = (rfqId, num) => {

    const _rfq = rfqs.find(rfq => rfq.id === rfqId)
    console.log('_rfq: ', _rfq);

    const po = _rfq?.purchase_orders?.find(po => po.po_products.find(({ vendor_products: { product } }) => product === num))


    return po
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
          dataType={curr?.dataType}
          filterElement={curr?.filterElement}
        />
      ];
    return acc;
  }, []);

  // useEffect(() => {
  //   const defaultColumns = columns.filter(col => !["updatedAt", "rfq.rfqNumber"].includes(col.field)).map(col => col.field)
  //   setSelectedColumns(defaultColumns)
  // }, [])


  console.log("selectedColumns", selectedVendorsWithEmails);

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <div>
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
        <div className="flex">
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
      </div>
    )
  }
  const header1 = renderHeader()

  // const handleAddItemListChange = () => {
  //   arrayFillCopy
  // }

  const removeFields = (index) => {
    setItemList(itemList.filter((data, i) => index !== i))
  }

  const handleFormChange = (e: any, i: number) => {
    let data = [...itemList];
    console.log('data: ', data);

    let totalValue;
    e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)
    setItemList(data)

  }

  const rowExpansionTemplate = (data) => {
    console.log('data: ', data);

    const group = data.rfq_sentto.reduce((acc, curr) => {

      const vendorName = curr?.emails?.addresses_emails_addressesToaddresses?.vendor_branches[0]?.vendors.name
      console.log('group vendorName: ', vendorName);
      if (acc[vendorName]) {
        console.log('group if: ');
        acc[vendorName] = [...acc[vendorName], curr.emails]
      } else {
        console.log('group else: ');
        return {
          ...acc,
          [vendorName]: [curr.emails]
        }
      }
      return acc
    }, {})
    const vendorNameWithEmailsArray = Object.entries(group)



    return (
      <div className="w-full expandTable">

        {data.rfq_sentto.length > 0 ? <h3>Sent To:</h3> : null}
        <div className="flex flex-column ">
          {vendorNameWithEmailsArray?.map((eachMail, index) => {
            return (
              <div className="flex flex-row col-5" key={index}>

                <span className="col-4">{eachMail[0]}</span>
                <div className="flex flex-row p-1">
                  {eachMail[1]?.map((eachEmail) => {
                    return (
                      <Chip className="p-2 ml-1" label={eachEmail.email} key={eachEmail} />
                    )
                  }
                  )}
                </div>

                {/* <Chip className="p-1  mb-2 w-20rem col-6"
                  template={
                    <div className="flex flex-column  p-2">
                      {eachMail[1]?.map((eachEmail) => {
                        return (
                          <div key={eachEmail}>{eachEmail.email}</div>
                        )
                      })}

                    </div>
                  }


                /> */}
              </div>
            )
          })}
        </div>




        {/* {data.rfq_sentto.map(({ emails: { email } }, i) => <Chip className="mr-3" key={i} label={email} />)} */}
        <h3>Products List:</h3>
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

          {[
            {
              field: "products.imageUrl", header: "Image",
              body: (rowdata) => <img src={rowdata?.products?.imageUrl} alt="Product Image" height="100" width="100" />,
            },
            { field: "products.sku", header: "Product SKU" },
            {
              field: "",
              header: "PO",
              body: (rowData) => {
                console.log('rowData: ', rowData);
                const _po = findPO(rowData?.rfq, rowData?.product)
                return <a href={`/purchase_orders/${_po?.poNumber}`} > {_po?.poNumber ?? "N/A"}</a>
              },
            },
            { field: "products.name", header: "Name", },
            { field: "price", header: "Target Price / Unit", },
            { field: "quantity", header: "Quantity", },

          ].map((ele, i) => (
            <Column key={i}
              field={ele?.field}
              header={ele?.header}
              body={ele?.body}
            />
          ))}
        </DataTable>
      </div >
    )
  }

  const formik = useFormik({
    initialValues: rfqDetails,
    validationSchema: Yup.object().shape({
      expectedDod: Yup.mixed().required("*Required"),
      itemsLength: Yup.boolean().equals([true], "⚠ Please select atleast one product").required(),
    }),
    onSubmit: async (data) => {
      console.log('formdata: ', data);

      const selectedProducts = itemList.filter((prod) => prod?.product_id)

      if (selectedProducts.length === 0) {
        const msg = {
          message: "You should at least select 1 product from the select products List ",
        }
        setRfqErrorMsgs([...rfqErrorMsgs, msg])
        return
      }
      const { rfqNumber, rfq_description, rfq_email, expectedDod, agreement, status } = data

      const sentoEmails = rfq_email?.length
        ? rfq_email?.map((mail, i) => ({
          emails: {
            connect: {
              id: mail?.value ?? findEmailId(mail),


            }
          }
        }))
        : undefined

      if (rfqEditState) {
        const newProductList = itemList.filter((item) => !item.rfq_products_id)
        const removemail = { ...rfqDetails }
        const delProductList = currentRfqitemsID.filter(
          (x) => !itemList.map(({ rfq_products_id }) => rfq_products_id).includes(x)
        )
        delete removemail.rfq_email

        try {
          const updatRfqStatus = updateRFQMutation({
            id: activeRow.id,
            rfqNumber,
            description: rfq_description,
            expectedDod,
            agreement,
            status,
            rfq_products: {
              create: newProductList.map((ele) => ({
                price: Number(ele.costPrice),
                quantity: Number(ele.quantity),
                products: {
                  connect: {
                    id: Number(ele.product_id),
                  },
                },
              })),
              updateMany: itemList.map((ele) => ({
                where: {
                  id: ele.rfq_products_id,
                },
                data: {
                  price: Number(ele.costPrice),
                  quantity: Number(ele.quantity),
                },
              })),
              deleteMany: {
                id: {
                  in: delProductList,
                },
              },
            },
          }, {
            onSuccess: async (data) => {
              const rfqNumber = data?.rfqNumber
              toast?.current.show(
                tsuccess("Updated", `${rfqNumber} is now updated successfully`),

              )
              setActiveRow({})
              await refetch()
              setRfqDialog(false)
              formik.resetForm()
              setMailSent(false)
            },
            onError: (data) => {
              const rfqNumber = data?.rfqNumber
              toast?.current.show(
                tError("Updated", `${rfqNumber} Could not Update`),
              )
            },
          })
        } catch (error) {

        }
      } else {
        try {

          const newRfqData = await createRFQMutation(
            {
              rfqNumber,
              description: rfq_description,
              expectedDod,
              status,
              agreement,
              rfq_products: {
                create: selectedProducts.map((ele) => ({
                  price: Number(ele.costPrice),
                  quantity: Number(ele.quantity),
                  products: {
                    connect: {
                      id: Number(ele.product_id),
                    },
                  },
                })),
              },
              rfq_sentto: {

                create: sentoEmails

              },
              ammendedFrom: activeRow?.id
            },
            {
              onSuccess: async (data) => {
                const rfqNumber = data?.rfqNumber
                toast?.current?.show(tsuccess(null, `${rfqNumber} created successfully.`))
                await refetch()
                setRfqDialog(false)
                formik.resetForm()
                setActiveRow({})
                setMailSent(false)
                setAmendingRfq(false)
              },
            }
          )
        } catch (error) {
          console.log("rfq_CreationError :", error)
        }
      }

    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const emailsuggestions = createSearchFunction(optionsForVendorEmails, setVendorEmailSuggestions)

  const removeErrorBox = (i) => {
    const msgArray = [...rfqErrorMsgs]
    msgArray.splice(i, 1)
    setRfqErrorMsgs(msgArray)
  }

  const handlePageChange = async (event) => {

    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
  }

  const handleUpdateDiscountItemListClick = () => {
    if (productDiscount) {
      console.log("Product discount useEffect is working");
      const discount = productDiscount / 100;
      let totalValue = 0;

      const updatedItemList = itemList.map((eachList) => {
        const { costPrice, quantity, last_po_price } = eachList;
        if (!isNaN(costPrice) && !isNaN(quantity) && quantity !== "") {
          const discountedPrice = last_po_price * (1 - discount);
          totalValue += costPrice * quantity;
          return { ...eachList, costPrice: discountedPrice.toFixed(2) };
        }
        return eachList;
      });

      setItemList(updatedItemList);
      setTotalTargetPrice(totalValue);

    }

  }


  const pagination = () => <Paginator first={skipCount} rows={tableRowsCount} totalRecords={rfqsCount} rowsPerPageOptions={[10, 20, 30]} onPageChange={handlePageChange} />

  const handleCheckIncludeProductName = useCallback((name, index) => {
    console.log("index", index);
    if (productsSuggestions !== null) {
      const _isInclude = productsSuggestions.map(item => item.name).includes(name)
      setIsInclude(_isInclude)
    }
  }, [productsSuggestions])

  useEffect(() => {
    const defaultColumns = columns.filter(col => !["updatedAt", "rfq.rfqNumber"].includes(col.field)).map(col => col.field)
    setSelectedColumns(defaultColumns)
  }, [])

  useEffect(() => {
    const currentItemsIds = itemList.map(({ rfq_products_id }) => rfq_products_id)
    setCurrentRfqitemsID([...currentItemsIds])
  }, [rfqDialog])

  console.log("itemList", itemList);

  useEffect(() => {
    const ErrorArray = [
      updateRFQMutationError,
      createRFQMutationError,
      rfqError,
      productsError,
    ]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setRfqErrorMsgs(msg)
  }, [
    updateRFQMutationError,
    createRFQMutationError,
    rfqError,
    productsError,

  ])

  useEffect(() => {
    let _totalValue = 0;
    const itemListTotal = itemList.map((eachList) => {
      const { costPrice, quantity } = eachList;

      console.log("quantity", quantity);
      console.log("totalValue", _totalValue)
      if (!isNaN(costPrice) && !isNaN(quantity)) {
        _totalValue = _totalValue + (costPrice * quantity)
      }

    })
    setTotalTargetPrice(_totalValue)

  }, [itemList])

  console.log("productDiscount", productDiscount);



  useEffect(() => {
    if (isInclude) {
      let newfield = initialItemList
      setItemList([...itemList, newfield])
      setIsInclude(false)
    }

  }, [initialItemList, isInclude, itemList])

  console.log("formik values", formik.values);




  // RFQ ITEMS DATATABLE 
  const onCellEditComplete = (e) => {
    const { rowData, newValue, field, originalEvent: event } = e;
    console.log('newValue: ', newValue, rowData, field);
    if (['costPrice', 'quantity'].includes(field)) {
      if (newValue?.trim().length > 0) {
        rowData[field] = newValue

        const updatedOrderItems = itemList.map((item, itemIndex) => {

          if (item.id === rowData.id) {
            return { ...item, [field]: newValue };
          }
          return item;
        });

        formik.setValues({
          ...formik.values,
          itemList: updatedOrderItems,
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



  const rfqItemColumn = [
    { field: "costPrice", header: 'Target price(excluding GST)', body: (rowData) => rowData.costPrice || "-" },
    { field: "quantity", header: 'Quantity', body: (rowData) => rowData.quantity || "-" },
    { field: "last_po_price", header: 'Last PO Price', body: (rowData) => rowData.last_po_price || "-" },
    { field: "last_purchase_quantity", header: 'Last PO Quantity', body: (rowData) => rowData.last_purchase_quantity || "-" },
    { field: "last_vendor", header: 'Last Vendor', body: (rowData) => rowData.last_vendor || "-" },
  ]

 

  const footerGroup = (
    <ColumnGroup>
        <Row>
            <Column footer={`Total: ${totalTargetPrice}`} colSpan={3} footerStyle={{ textAlign: 'right' }}/>
        </Row>
    </ColumnGroup>
);

  return (
    <>
      <Head>
        <title>RFQ</title>
      </Head>
      <div ref={scrollToRfq} className="grid w-full mr-0">
        <Toast ref={toast} />
        {(updatingRfq || creatingRfq) && <LoaderFullScreen />}
        <Dialog
          header="Send Quotation"
          visible={sendDialog}
          style={{ width: "50vw" }}
          onHide={() => setSendDialog(false)}
        >

          <span className="p-float-label w-full">
            <h2>Emails</h2>
            <AutoComplete
              style={{ minWidth: "33%", height: "auto" }}
              value={rfqDetails.rfq_email}
              suggestions={vendorEmailSuggestions}
              completeMethod={emailsuggestions}
              field="name"
              multiple
              onChange={(e) => setRfqDetails({ ...rfqDetails, rfq_email: e.value })}
              aria-label="Vendor-Emails"
              dropdownAriaLabel="Select Email"

            />
            <label htmlFor="autocomplete">Emails</label>
          </span>

          <div className="w-full flex justify-content-end mt-2 pl-2">
            <Button
              icon="pi pi-send"
              label="Send"
              onClick={async () => {

                const existingEmails = activeRow?.rfq_sentto.map(({ emails: { email } }) => (email))
                const selectedEmails = rfqDetails?.rfq_email.map((email) => email.name)
                const newMails = filterExistingValues(selectedEmails, existingEmails)

                const sentoEmails = newMails?.length
                  ? newMails?.map((mail, i) => ({
                    emails: {
                      connect: {
                        id: mail?.value ?? findEmailId(mail)
                      }
                    }
                  }))
                  : undefined

                const update = await updateRFQMutation({
                  id: activeRow.id,
                  rfq_sentto: {
                    create: sentoEmails
                  },
                })


                const uniquerfq = rfqs.find((ele) => ele.id === activeRow.id)

                console.log(' rfqDetails?.rfq_email: ', rfqDetails?.rfq_email);
                const groupedEmails = Object.values(
                  rfqDetails?.rfq_email?.reduce((acc, cur) => {
                    const address = cur.addresses
                    if (!acc[address]) {
                      acc[address] = []
                    }
                    acc[address].push(cur.name)
                    return acc
                  }, {})
                )
                for (const i of groupedEmails) {
                  const requestData = JSON.stringify({
                    rfq: uniquerfq,
                    emailGroup: i
                  })

                  var config = {
                    method: "post",
                    url: "http://localhost:3000/api/rfq",
                    headers: {
                      "Content-Type": "application/json",
                      ["anti-csrf"]: antiCSRFToken,
                    },
                    data: requestData,
                  }

                  await axios(config)
                    .then(setSendDialog(false))
                    .catch((error) => console.log(error?.response?.data))

                }
              }}
            />
          </div>
        </Dialog>
        <div className="col-12">
          <div className="card flex justify-content-between align-items-center mb-2">
            <h4 className="mb-0">Request for Quotations</h4>
            <div className="flex justify-content-end align-items-center">
              <Button
                icon="pi pi-plus"
                label="Create RFQ"
                onClick={async () => {
                  setRfqEditState(false)
                  await formik.setValues({ ...initialRfqState })
                  const initialFields = arrayFillCopy(1, initialItemList)
                  setItemList(initialFields)
                  setRfqDialog(true)
                  setRFQCodeChecked(true)
                  setReadOnlyForm(false)
                }}
              ></Button>

            </div>
          </div>
          {rfqErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
        </div>
        <div
          className={`col-12 ${rfqDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
            } `}
        >
          <div className={` card `}>
            <form className="p-fluid" onSubmit={formik.handleSubmit}>
              <div className="flex justify-content-between col-12 p-2 mb-3">
                <div className="flex justify-content-between align-items-center col-7 mt-0 p-0">
                  <h5 className=" m-0 col-5 p-0">
                    {`${readOnlyForm ? `${formik.values.rfqNumber}` : rfqEditState
                      ? `Update - ${formik.values.rfqNumber} ` : amendingRfq
                        ? "Amend- RFQ" : "Create - RFQ"}`
                    }
                  </h5>
                  <div className="flex justify-content-center align-items-center col-7 p-0 ml-3">
                    <h5 className="mr-2 m-0">

                      Status :
                    </h5>

                    {/* {(formik.values.status !== "Processing" && formik.values.status !== "Sent") ? */}
                    <h5 style={{ fontWeight: "bold" }} className="m-0">{formik.values.status}</h5>
                    {/* <AutoComplete
                        id="status"
                        // disabled={fieldDisable}
                        value={formik.values?.status}
                        suggestions={rfqStatusSuggestions}
                        completeMethod={searchStatus}
                        // disabled={formik.values.status === "Processing" || formik.values.status === "Sent" ? false : true}
                        dropdown
                        field="name"
                        onChange={async (e) => {
                          let status = typeof e.value === "string" ? e.value : e.value.name

                          await formik.setValues({
                            ...formik.values,
                            status
                          })
                        }}
                        aria-label="Agreement Terms"
                        dropdownAriaLabel="Agreement Terms"
                      // className={formik.values.status === "Processing" || formik.values.status === "Sent" ? "" : "highlight-status-disabled"}

                      />} */}



                    {/* {getFormErrorMessage("status")} */}
                  </div>
                </div>

                {readOnlyForm && (
                  <div className="flex justify-content-end align-items-center col-5 p-0">
                    {formik.values.status === "Created" && <Button
                      // label="Edit"
                      icon="pi pi-pencil"
                      className="m-1"
                      onClick={async (e) => {
                        e.preventDefault()
                        setReadOnlyForm(false)
                        // setRfqEditState(true)
                        // setRFQCodeChecked(false)
                        setMailSent(false)
                      }}
                      tooltip="Edit Form"
                      tooltipOptions={{ position: "top" }}
                    />}
                    <Button
                      // label="Edit"
                      icon="pi pi-plus"
                      className="m-1"
                      onClick={async (e) => {
                        e.preventDefault()
                        try {
                          const rfqDetails = await invoke(getRfq, {
                            id: activeRow?.id

                          })
                          const productsToPo = getRemainingPoProducts(rfqDetails)
                          if (productsToPo.length) {
                            const { id, rfqNumber } = activeRow
                            const rfqdata = {
                              rfqId: id,
                              rfqNumber,
                              rfq_products: productsToPo
                            }

                            await router.push({
                              pathname: "/purchase_orders",
                              query: { rfqdata: JSON.stringify(rfqdata) },
                            });

                          } else {
                            toast?.current.show(tWarn(null, "All the products of this rfq has PO"))

                            if (activeRow.status === "Created") {
                              await updateRFQMutation(
                                {
                                  id: activeRow?.id,
                                  status: "Completed",
                                },
                                {
                                  onSuccess: async (data) => {
                                    const rfqNumber = data?.rfqNumber
                                    const status = data?.status

                                    toast?.current.show(
                                      tsuccess("Updated", `${rfqNumber} is now ${status}`))
                                    await refetch()


                                  },
                                }
                              )
                            }
                          }
                        } catch (error) {
                          alert(error)
                          console.log('error: ', error);

                        }
                      }}
                      tooltip="Create PO"
                      tooltipOptions={{ position: "top" }}
                    />
                    {formik.values.status === "Created" || formik.values.status === "Sent" ?
                      <Button
                        icon="bi bi-x-octagon"
                        className="m-1"
                        tooltip="Cancel"
                        tooltipOptions={{ position: "top" }}
                        onClick={async (e) => {
                          e.preventDefault()
                          // e.stopPropagation()
                          try {
                            await updateRFQMutation(
                              {
                                id: formik.values.id,
                                status: "Cancelled"
                              },
                              {
                                onSuccess: async (data) => {
                                  const rfqNumber = data?.rfqNumber
                                  const status = data?.status

                                  toast?.current.show(
                                    tsuccess("Updated", `${rfqNumber} is now ${status}`))
                                  await refetch()
                                  setRfqDialog(false)

                                },
                              }
                            )

                          } catch (error) {
                            console.log('error: ', error);
                          }

                        }}
                      /> : null
                    }
                    {formik.values.status === "Processing" &&
                      <Button
                        icon="bi bi-check2-square"
                        className="m-1"
                        tooltip="Force Complete"
                        tooltipOptions={{ position: "top" }}
                        onClick={async (e) => {
                          e.preventDefault()
                          // e.stopPropagation()
                          try {
                            await updateRFQMutation(
                              {
                                id: formik.values.id,
                                status: "Force_Completed"
                              },
                              {
                                onSuccess: async (data) => {
                                  const rfqNumber = data?.rfqNumber
                                  const status = data?.status

                                  toast?.current.show(
                                    tsuccess("Updated", `${rfqNumber} is now ${status}`))
                                  await refetch()
                                  setRfqDialog(false)

                                },
                              }
                            )

                          } catch (error) {
                            console.log('error: ', error);
                          }

                        }}

                      />
                    }
                    <Button
                      // label="Edit"
                      icon="pi pi-send"
                      className="m-1"
                      onClick={async (e) => {
                        e.preventDefault()
                        setSendDialog(true)
                        setRfqDetails({ ...rfqDetails, rfq_email: [] })
                      }}
                      tooltip="Send RFQ"
                      tooltipOptions={{ position: "top" }}
                    />
                    {checkAmmendedFrom.length === 0 && formik.values.status !== "Created" && <Button
                      icon="bi bi-file-text"
                      className="m-1"
                      tooltip="Amend RFQ"
                      tooltipOptions={{ position: "top" }}
                      onClick={async (e) => {
                        const { ammendedRFQNumberCount, rfqNumber, ammendedFrom } = formik.values;
                        let _ammendedRFQNumberCount;
                        let _rfqNumber;


                        if (rfqNumber.includes("_")) {
                          _rfqNumber = rfqNumber.split('_');
                          _ammendedRFQNumberCount = Number(_rfqNumber.slice(-1)) + 1;
                          await formik.setFieldValue("rfqNumber", `${_rfqNumber[0]}_${_ammendedRFQNumberCount}`)
                        } else {
                          if (ammendedFrom === null && ammendedRFQNumberCount === 0) {
                            _ammendedRFQNumberCount = ammendedRFQNumberCount + 1;
                          } else {
                            if (ammendedFrom !== null && ammendedRFQNumberCount === 0) {
                              _ammendedRFQNumberCount = ammendedRFQNumberCount + 2
                            }
                          }
                          await formik.setFieldValue("rfqNumber", `${rfqNumber}_${_ammendedRFQNumberCount}`)
                        }
                        await formik.setFieldValue("ammendedRFQNumberCount", _ammendedRFQNumberCount);
                        e.preventDefault()
                        setAmendingRfq(true)
                        setRfqEditState(false)
                        setReadOnlyForm(false)
                        setMailSent(false)
                      }}
                    />}
                    {formik.values.status !== "Created" && <Button
                      // label="Edit"
                      icon="pi pi-copy"
                      className="m-1"
                      onClick={async (e) => {
                        e.preventDefault()
                        setRfqDialog(true)
                        setRFQCodeChecked(true)
                        setReadOnlyForm(false)
                        // setRfqEditState(true)
                        setDuplicateRFQForm(true)
                        setMailSent(false)
                        await formik.setFieldValue("rfqNumber", "")
                        console.log("Click formik", formik.values)

                      }}
                      tooltip="Duplicate RFQ"
                      tooltipOptions={{ position: "top" }}
                    />}

                  </div>
                )}
              </div>
              <div className="formgrid grid p-4">
                <div className="col-12">
                </div>
                <div className="col-12 lg:col-4 ">
                  <div className="field">
                    <span className="p-float-label ">
                      <InputText
                        id="rfqNumber"
                        name="rfqNumber"
                        value={formik.values.rfqNumber}
                        // value={RFQCodechecked ? "Auto Generated" : formik.values.rfqNumber}
                        onChange={formik.handleChange}
                        disabled={RFQCodechecked}
                        autoFocus
                        className={classNames({ "p-invalid": isFormFieldValid("rfqNumber") })}
                      />
                      <label
                        htmlFor="rfqNumber"
                        className={classNames({ "p-error": isFormFieldValid("rfqNumber") })}
                      >
                        RFQ Code
                      </label>
                    </span>
                    {getFormErrorMessage("rfqNumber")}

                    <div className="field-checkbox mb-5 mt-2">
                      <Checkbox
                        // style={{ width: "0.1rem", height: "0rem" }}
                        onChange={(e) => setRFQCodeChecked(e.checked)}
                        checked={RFQCodechecked}
                        disabled={rfqEditState}
                      />
                      <label

                        className="text-sm	"
                      >
                        Un-check to add custom code.
                      </label>
                    </div>
                  </div>


                </div>
                <div className="col-12 lg:col-4">
                  <div className="field">
                    <span className="p-float-label">
                      <InputText
                        id="rfq_description"
                        name="rfq_description"
                        value={formik.values.rfq_description}
                        disabled={readOnlyForm || mailSent}
                        onChange={formik.handleChange}
                        className={classNames({ "p-invalid": isFormFieldValid("rfq_description") })}
                        autoFocus
                      />
                      <label
                        htmlFor="rfq_description"
                        className={classNames({ "p-error": isFormFieldValid("rfq_description") })}
                      >
                        RFQ Description
                      </label>
                    </span>
                    {getFormErrorMessage("rfq_description")}
                  </div>
                </div>
                <div className="col-12 lg:col-4">
                  <div className="field">
                    <span className="p-float-label">
                      <Calendar
                        id="expectedDod"
                        minDate={new Date()}
                        value={formik.values.expectedDod}
                        dateFormat={calenderDateFormat()}
                        disabled={readOnlyForm || mailSent}
                        onChange={async (e) => {
                          await formik.setValues({
                            ...formik.values,
                            expectedDod: e.value,
                          })
                        }}
                        className={classNames({ "p-invalid": isFormFieldValid("expectedDod") })}
                      />
                      <label
                        style={{ zIndex: 10 }}
                        htmlFor="expectedDod"
                        className={classNames({ "p-error": isFormFieldValid("expectedDod") })}
                      >
                        Expected Delivery
                      </label>
                    </span>
                    {getFormErrorMessage("expectedDod")}
                  </div>
                </div>

                {/* <div className="col-12 lg:col-4">
                  <div className="field">
                    <div className="p-float-label">
                      <AutoComplete
                        id="status"
                        // disabled={fieldDisable}
                        value={formik.values?.status}
                        suggestions={rfqStatusSuggestions}
                        completeMethod={searchStatus}
                        disabled
                        dropdown
                        field="name"
                        onChange={async (e) => {
                          let status = typeof e.value === "string" ? e.value : e.value.name

                          await formik.setValues({
                            ...formik.values,
                            status
                          })
                        }}
                        aria-label="Agreement Terms"
                        dropdownAriaLabel="Agreement Terms"
                        className={classNames({ "p-invalid": isFormFieldValid("status") })}
                      />

                      <label
                        htmlFor="status"
                        className={classNames({ "p-error": isFormFieldValid("status") })}
                      >
                        Status
                      </label>
                    </div>
                    {getFormErrorMessage("status")}
                  </div>
                </div> */}

                <div className="col-12 lg:col-4">
                  <div className="field">
                    <span className="p-float-label">
                      <InputText
                        id="agreement"
                        name="agreement"
                        value={formik.values.agreement}
                        disabled={readOnlyForm || mailSent}
                        onChange={formik.handleChange}
                        className={classNames({ "p-invalid": isFormFieldValid("agreement") })}
                        autoFocus
                      />
                      <label
                        htmlFor="agreement"
                        className={classNames({ "p-error": isFormFieldValid("agreement") })}
                      >
                        Terms
                      </label>
                    </span>
                    {getFormErrorMessage("agreement")}
                  </div>
                </div>

                {!duplicateRFQForm && <div className="col-12">
                  <h6 className="mb-4">Send To Emails:</h6>

                </div>}
                {!duplicateRFQForm && <span className="p-float-label w-full">
                  <AutoComplete
                    // className="w-4"
                    style={{ minWidth: "33%" }}
                    value={formik.values.rfq_email}
                    suggestions={vendorEmailSuggestions}
                    completeMethod={emailsuggestions}
                    disabled={readOnlyForm || mailSent}
                    field="name"
                    multiple
                    onChange={async (e) => {
                      console.log("e.value", e.value);

                      await formik.setValues({ ...formik.values, rfq_email: e.value })
                      startTransition(() => {
                        dispatch({ type: "UPDATE_EMAIL_NAME_SEARCH_STATE", payload: { key: "emailNameSearchQuery", value: e.value.name }, })
                      });
                    }}
                    aria-label="Vendor-Emails"
                    dropdownAriaLabel="Select Email"
                  />
                  {/* <label htmlFor="autocomplete">Emails</label> */}
                </span>}

                {/* <div className="col-12 flex justify-content-end mt-3">

                  <span className="p-float-label ">
                    <InputNumber
                      value={productDiscount}
                      onChange={(event) => setProductDiscount(event.value)}
                      suffix="%"
                      min={1}
                      max={100}
                      // style={{ width: "60%" }}
                      disabled={itemList.length === 1}
                    />
                    <label htmlFor="productDiscount">
                      Discount
                    </label>
                  </span>

                  <span>
                    <Button
                      type="button"
                      label="Apply"
                      style={{ fontSize: "0.8rem", padding: "0.2rem" }}
                      className="p-button-secondary ml-2 mt-2"
                      disabled={itemList.length === 1}
                      onClick={handleUpdateDiscountItemListClick}

                    />
                  </span>
                </div>
                <div className="col-12 mt-3">
                  <h6>Select Products:</h6>
                </div>
                {itemList.map((ele, i) => (
                  <>
                    <div className="col-12 grid mt-1" key={`RFQ-product-${i}`}>
                      <div className="col-12 lg:col-4">
                        <div className="field">
                          <div className="p-float-label">
                            <AutoComplete
                              id="name"
                              name="name"
                              value={ele.product_name}
                              suggestions={productsSuggestions}
                              completeMethod={searchProducts}
                              disabled={readOnlyForm || mailSent}
                              //   forceSelection //
                              dropdown
                              field="name"
                              onChange={async (e) => {
                                let product_id = typeof e.value === "string" ? "" : e.value?.id
                                let name = typeof e.value === "string" ? e.value : e.value?.name
                                let data = [...itemList]
                                const _filteredSelectedProductID = [...filteredSelectedProductID, product_id]
                                setFilteredSelectedProductID(_filteredSelectedProductID)

                                const lastPo = LatestPO(purchase_orders, product_id)

                                data[i].product_name = name
                                data[i].product_id = product_id
                                data[i].quantity = lastPo.purchaseQuantity
                                data[i].costPrice = lastPo.productPrice
                                data[i].last_po_price = lastPo.productPrice
                                data[i].last_vendor = lastPo.vendor
                                data[i].last_purchase_quantity = lastPo.purchaseQuantity

                                let itemsLength = !e.value?.name ? false : true
                                await formik.setValues({ ...formik.values, itemsLength })

                                console.log('data: ', data);

                                const filter = data?.filter(e => e?.product_name)
                                setItemList([...filter, initialItemList]);




                              }}
                              aria-label="products"
                              dropdownAriaLabel="Select Product"

                            />


                          </div>
                        </div>
                      </div>

                      <div className="col-12 lg:col-2">
                        <div className="field">
                          <span className="p-float-label ">
                            <InputNumber
                              id={`product-prixe-${i}`}
                              name="costPrice"
                              value={Number(ele.costPrice)}
                              disabled={readOnlyForm || mailSent}
                              onChange={(e) => handleFormChange(e, i)}

                            />
                            <label>
                              Target price(excluding GST)
                            </label>
                          </span>
                        </div>

                      </div>
                      <div className="col-12 lg:col-1">
                        <div className="field">
                          <span className="p-float-label">
                            <InputNumber
                              id={`product-qty-${i}`}
                              name="quantity"
                              disabled={readOnlyForm || mailSent}
                              value={Number(ele.quantity)}
                              onChange={(e) => handleFormChange(e, i)}

                            />
                            <label

                            >
                              Quantity
                            </label>
                          </span>
                        </div>

                      </div>
                      <div className="col-12 lg:col-1">
                        <div className="field">
                          <span className="p-float-label">
                            <InputText
                              id="last_po_price"
                              name="last_po_price"
                              disabled
                              value={ele.last_po_price}

                            />
                            <label>

                              Last PO Price
                            </label>
                          </span>
                        </div>

                      </div>
                      <div className="col-12 lg:col-1">
                        <div className="field">
                          <span className="p-float-label">
                            <InputText
                              id="last_purchase_quantity"
                              name="last_purchase_quantity"
                              disabled
                              value={Number(ele.last_purchase_quantity)}

                            />
                            <label>
                              Last PO Quantity
                            </label>
                          </span>
                        </div>
                      </div>

                      <div className="col-12 lg:col-2">
                        <div className="field">
                          <span className="p-float-label">
                            <InputText
                              id="last_vendor"
                              name="last_vendor"
                              value={ele.last_vendor}
                              disabled
                              onChange={(e) => handleFormChange(e, i)}
                            />
                            <label
                            >
                              Last Vendor
                            </label>
                          </span>
                        </div>
                       
                      </div>
                      <div className="field col-6 lg:col-1">
                      
                        {!readOnlyForm && <span >

                          <Button
                            type="button"
                            icon="pi pi-times"
                            style={{ fontSize: "0.8rem" }}
                            className="p-button-secondary"
                            disabled={itemList.length === 1 ? true : false}
                            onClick={(e) => {
                              removeFields(i)
                            }}
                          />
                         
                        </span>}
                       
                      </div>
                    </div>
                  </>
                ))}

                <div className="col-12 grid">
                  <div className="col-12 lg:col-4" />
                  <div className="col-12 lg:col-1 mt-1">
                    Total Value:
                  </div>
                  <div className="col-12 lg:col-2">
                    <InputNumber value={totalTargetPrice} disabled />
                  </div>
                </div> */}


                {/* Datatable  */}
                <div className="col-12 flex justify-content-end mt-5">

                  <span className="p-float-label ">
                    <InputNumber
                      value={productDiscount}
                      onChange={(event) => setProductDiscount(event.value)}
                      suffix="%"
                      min={1}
                      max={100}
                    // style={{ width: "60%" }}
                    // disabled={itemList.length === 1}
                    />
                    <label htmlFor="productDiscount">
                      Discount
                    </label>
                  </span>

                  <span>
                    <Button
                      type="button"
                      label="Apply"
                      // style={{ fontSize: "0.8rem", padding: "0.2rem" }}
                      style={{ height: '32px' }}
                      className="p-button-secondary ml-2 mt-1"
                      disabled={itemList.length === 1}
                      onClick={handleUpdateDiscountItemListClick}

                    />
                  </span>
                </div>

                <div className="col-12 mt-4">
                  <h3>RFQ Items</h3>

                  <DataTable
                    value={itemList}
                    showGridlines
                    stripedRows
                    editMode="cell"
                    footerColumnGroup={footerGroup}
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

                    <Column
                      header='Product'
                      label='name'
                      body={(ele, { rowIndex }) => {
                        console.log('rowIndex: ', rowIndex);
                        return (
                          <div className="">
                            <AutoComplete
                              id="name"
                              name="name"
                              value={ele.product_name}
                              suggestions={productsSuggestions}
                              completeMethod={searchProducts}
                              disabled={readOnlyForm || mailSent}
                              dropdown
                              field="name"
                              onChange={async (e) => {
                                let product_id = typeof e.value === "string" ? "" : e.value?.id
                                let name = typeof e.value === "string" ? e.value : e.value?.name
                                let data = [...itemList]
                                console.log('data ++: ', data);

                                const _filteredSelectedProductID = [...filteredSelectedProductID, product_id]
                                console.log('_filteredSelectedProductID: ', _filteredSelectedProductID);
                                setFilteredSelectedProductID(_filteredSelectedProductID)

                                const lastPo = LatestPO(purchase_orders, product_id)

                                data[rowIndex].product_name = name
                                data[rowIndex].product_id = product_id
                                data[rowIndex].quantity = lastPo.purchaseQuantity
                                data[rowIndex].costPrice = lastPo.productPrice
                                data[rowIndex].last_po_price = lastPo.productPrice
                                data[rowIndex].last_vendor = lastPo.vendor
                                data[rowIndex].last_purchase_quantity = lastPo.purchaseQuantity

                                let itemsLength = !e.value?.name ? false : true
                                console.log('itemsLength: ', itemsLength);
                                await formik.setValues({ ...formik.values, itemsLength })

                                console.log('data: ', data);

                                const filter = data?.filter(e => e?.product_name)
                                setItemList([...filter, initialItemList]);
                                console.log('filter:+++ ', filter);

                              }}
                              aria-label="products"
                              dropdownAriaLabel="Select Product"
                            />
                          </div>
                        )

                      }}
                    />

                    {rfqItemColumn.map((i) => {
                      return (
                        <Column
                          key={i.field}
                          field={i.field}
                          header={i.header}
                          body={i.body}
                          editor={i.field === 'costPrice' || i.field === 'quantity' ? textEditor : null}
                          onCellEditComplete={i.field === 'costPrice' || i.field === 'quantity' ? onCellEditComplete : null}

                        />
                      )
                    })}

                    <Column
                      header="Remove"
                      className="reduce-column"
                      body={(ele, { rowIndex }) => {
                        return (
                          <div className="field col-6 lg:col-1">
                            {!readOnlyForm && <span >
                              <Button
                                type="button"
                                icon="pi pi-times"
                                // style={{ fontSize: "0.8rem" }}
                                style={{ height: '35px' }}
                                className="p-button-secondary"
                                disabled={itemList.length === 1 ? true : false}
                                onClick={(e) => {
                                  removeFields(rowIndex)
                                }}
                              />
                            </span>}
                          </div>
                        )
                      }}
                    />

                  </DataTable>
                  {/* <div className="col-12">
                    <div className="col-12 flex justify-content-end mt-5">

                      <span className="p-float-label ">
                        <InputNumber value={totalTargetPrice} disabled />
                        <label htmlFor="productDiscount">
                          Total Value:
                        </label>
                      </span>

                    </div>

                  </div> */}

                </div>






                <div className="m-auto text-2xl">{getFormErrorMessage("itemsLength")}</div>
              </div>

              <div className="flex mx-4 justify-content-end ">
                {!readOnlyForm && (
                  <Button
                    type="submit"
                    className="mr-2"
                    label={rfqEditState ? "UPDATE" : "SUBMIT"}
                    onClick={async (e) => { }}
                  />
                )}
                <Button
                  className="mr-2 p-button-secondary"
                  style={{ maxWidth: "50%" }}
                  label="CANCEL"
                  onClick={(e) => {
                    e.preventDefault()
                    setRfqDialog(false)
                    setRfqEditState(false)
                    setMailSent(false)
                    setRfqDetails({
                      rfqNumber: "",
                      rfq_description: "",
                      expectedDod: "",
                      rfq_email: [],
                    })
                    const fiveFields = arrayFillCopy(1, initialItemList)
                    setItemList(fiveFields)
                    setAmendingRfq(false)


                    formik.resetForm()
                  }}
                />
              </div>
            </form>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <DataTable
              value={rfqs}
              // scrollable
              // scrollHeight="60vh"
              showGridlines
              footer={pagination}
              // header={renderHeader}
              stripedRows
              className="text-s datatable-responsive"
              // paginator
              // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
              // rows={PAGINATION_VARIABLES.rows}
              // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
              // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
              expandedRows={expandedRows}
              onRowToggle={(e) => setExpandedRows(e.data)}
              rowExpansionTemplate={rowExpansionTemplate}
              filters={filters}
              header={header1}
              scrollable={true}
              scrollHeight="300px"
              headerStyle={{ position: 'sticky', top: '0' }}
              filterDisplay="menu"
              emptyMessage="No Results found."
              onRowClick={async (e) => {
                console.log('rowdata: ', e.data);
                const rfqSenttoExists = Boolean(e.data.rfq_sentto.length)
                const { rfqs, } = await invoke(getRfqs, {
                  where: {
                    ammendedFrom: e.data.id
                  }
                })
                setCheckAmmendedFrom(rfqs);

                setMailSent(rfqSenttoExists)

                scrollToRfq?.current?.scrollIntoView()
                window.scroll(100, 100)
                setActiveRow(e.data)
                const rfqProducts = e.data.rfq_products
                let active = rfqProducts.map(
                  ({ id: rfq_products_id, products: { id: product_id, sku, name }, quantity, price, }) => {
                    return {
                      product_id,
                      quantity: quantity,
                      costPrice: price,
                      rfq_products_id,
                      product_name: `${sku} - ${name}`,
                    }
                  }
                )
                setItemList(active)
                const { rfqNumber, description: rfq_description, expectedDod, id, agreement, status, ammendedFrom } = e.data

                // const _expectedDod = moment(expectedDod).toDate()
                const sentToEmails = e.data.rfq_sentto.map(({ emails: { email } }) => email)


                await formik.setValues({

                  rfqNumber: rfqNumber,
                  rfq_description,
                  id,
                  itemsLength: true,
                  agreement,
                  rfq_email: sentToEmails,
                  expectedDod,
                  status,
                  ammendedFrom,
                  ammendedRFQNumberCount: 0

                })

                setRfqDialog(true)
                setReadOnlyForm(true)
              }}
              selectionMode='checkbox'
              selection={selectedRfqs}
              onSelectionChange={(e) => setSelectedRfqs(e.value)}
            // tableStyle={{ minWidth: '50rem' }}
            >
              {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} /> */}
              <Column expander={true} style={{ width: "3em" }} />
              {columnComponents}
            </DataTable>
          </div>
        </div >
      </div >
    </>
  )
}

const RfqsPage = () => {
  return (
    // <Suspense fallback={<Loading />}>
    //   <Layout>
    //     <RfqsList />
    //   </Layout>
    // </Suspense>
    <Layout>
      <Head>
        <title>Rfqs</title>
      </Head>
      <div>
        <Suspense fallback={<Loading />}>
          <RfqsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default RfqsPage
