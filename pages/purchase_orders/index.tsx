import { Suspense, useEffect, useRef, useState, useReducer, useCallback } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery, useQuery, invoke } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import Layout from "layouts/Layout"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import getVendors from "app/vendors/queries/getVendors"
import { Calendar } from "primereact/calendar"
import getVendor_products from "app/vendor_products/queries/getVendor_products"
import Loading from "components/loading"
import getProducts from "app/products/queries/getProducts"
import { TabView, TabPanel } from "primereact/tabview"
import ErrorCard from "components/ErrorCard"
import axios from "axios"
import { getAntiCSRFToken } from "@blitzjs/auth"
import {
  arrayFillCopy,
  calenderDateFormat,
  toDateObj,
  tError,
  dateFormat,
  iletmListArrayCreation,
  initialFilterRules,
} from "app/constants"
import { Toast } from "primereact/toast"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import CreateNewPo from "components/CreateNewPo"
import { MultiSelect } from "primereact/multiselect"
import { FilterMatchMode } from "primereact/api"
import { dateFilterTemplate } from "components/FilterTemplates"
import { Paginator } from "primereact/paginator"


const ITEMS_PER_PAGE = 250

const initialState = {
  tableRowsCount: 10,
  skipCount: 0,

};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'UPDATE_TABLE_ROWS_COUNT':
      return { ...state, tableRowsCount: payload }
    case 'UPDATE_SKIP_COUNT':
      return { ...state, skipCount: payload }
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}



export const Purchase_ordersList = () => {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { tableRowsCount, skipCount } = state
  const antiCSRFToken = getAntiCSRFToken()
  const user = useCurrentUser()
  const { id: userId, role, name, email } = user


  const page = Number(router.query.page) || 0
  const [{ purchase_orders, count: total_purchase_orders }, { error: getPoError, refetch }] = usePaginatedQuery(
    getPurchase_orders,
    {
      orderBy: { id: "desc" },
      where: {},
      skip: skipCount,
      take: tableRowsCount,
    }
  )
  console.log('purchase_orders: ', purchase_orders);

  const [{ vendors }, { error: getVenorsError }] = useQuery(getVendors, {
    orderBy: { id: "asc" },
    where: {},
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  console.log('vendors: ', vendors);

  const [{ vendor_products }, { error: getVendorProductsError }] = useQuery(
    getVendor_products,
    {
      orderBy: { id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    }
  )

  const [{ products }, { error: getProductsError }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });

  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const initialItemState = {
    quantity: "-",
    price_per_unit: "-",
    products_product_id: "",
    product_name: "",
  }

  const [itemList, setItemList] = useState([initialItemState])

  const columns = [
    {
      field: "poNumber",
      header: "Po Number",
      filter: true,
      filterPlaceholder: "Search by Number",
      body: (rowData) => <Link href={Routes.ShowPurchase_orderPage({ purchase_orderId: `${rowData.id}` })} >{rowData.poNumber}</Link>
    },
    {
      field: "description",
      header: "Description",
      filter: true,
      filterPlaceholder: "Search by Description",
    },
    {
      field: "vendors.name",
      filterField: "vendor",
      header: "Vendor",
      filter: true,
      filterPlaceholder: "Search by Vendor"
    },
    {
      field: "updatedAt",
      header: "Updated on",
      filterField: "updatedAt",
      filter: true,
      filterElement: dateFilterTemplate,
      dataType: "date",
      body: (rowData) => dateFormat(rowData.updatedAT),
    },
    {
      field: "expectedDod",
      header: "Expected Delivery",
      filterField: "expectedDod",
      dataType: "date",
      body: (rowData) => dateFormat(rowData.expectedDod),
      filter: true,
      filterElement: dateFilterTemplate
    },
    {
      field: "po_status",
      header: "Status",
      body: (rowData) => rowData.po_status?.name,
      filter: true,
      filterPlaceholder: "Search by Status"
    }
  ];

  const [selectedColumns, setSelectedColumns] = useState([])
  const [sendPoDialog, setSendPoDialog] = useState(false)
  const [activeRow, setActiveRow] = useState({})
  const [poEditState, setPoEditState] = useState(false)
  const scrollToPo = useRef<HTMLHeadingElement>(null)
  const [rfq, setRfq] = useState({ rfqNumber: "", rfqId: "" })
  const [allRfqDetails, setAllRfqDetails] = useState([]);
  const [allPODetails, setAllPODetails] = useState([]);

  const toast = useRef(null)
  const Po = useRef<CreateNewPo>(null)


  useEffect(() => {
    if (router.query.hasOwnProperty("rfqdata")) {
      const { rfqdata } = router.query;
      const parsedRfqdata = JSON.parse(rfqdata)
      const { rfq_products, rfqNumber, rfqId } = parsedRfqdata
      setRfq({ rfqNumber, rfqId })

      console.log('rfqdata: ', parsedRfqdata);
      Po?.current?.setReadOnlyForm(false)
      Po?.current?.formik.resetForm()
      const twoFields = arrayFillCopy(2, initialItemState)
      setPoEditState(false)
      setPurchaseDialog(true)
      Po?.current?.setPurchaseDetails(
        Po?.current?.initialPurchaseState)
      Po?.current?.formik.setValues({ itemsLength: true })

      const poProducts = iletmListArrayCreation(rfq_products)
      setItemList([...poProducts, ...twoFields])
    }

  }, [router.query])

  const handlePageChange = async (event) => {
    console.log(event);
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
  }

  const pagination = () => <Paginator first={skipCount} rows={tableRowsCount} totalRecords={total_purchase_orders} rowsPerPageOptions={[10, 20, 30]} onPageChange={handlePageChange} />


  const [expandedRows, setExpandedRows] = useState()

  const rowExpansionTemplate = (data) => {
    return (
      <div className="w-full">
        <TabView>
          <TabPanel header="Products Lists ">
            <div className="expandTables">
              <DataTable
                value={data.po_products}
                responsiveLayout="scroll"
                showGridlines
                // header={renderHeader}
                stripedRows
                className="text-s datatable-responsive w-full mt-5"
              // paginator
              // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
              // rows={PAGINATION_VARIABLES.rows}
              // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
              // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
              >

                {[
                  {
                    header: "Sl.No",
                    body: (rowData, { rowIndex }) => rowIndex + 1
                  }
                  ,
                  {
                    field: "vendor_products.products.sku",
                    header: "Product SKU"
                  },
                  {
                    field: "vendor_products.sku",
                    header: "Vendor SKU"
                  }, {
                    field: "vendor_products.products.name",
                    header: "Name"
                  },
                  {
                    field: "price",
                    header: "Price / Unit"
                  },
                  {
                    field: "quantity",
                    header: "Quantity"
                  }
                ]
                  .map((col, i) => (
                    <Column
                      key={i}
                      field={col?.field}
                      header={col?.header}
                      body={col?.body}
                    // style={{ padding: "0.8rem" }}

                    />))
                }

              </DataTable>
            </div>
          </TabPanel>
        </TabView>
      </div>
    )
  }

  const updateItemList = (po) => {
    const { po_products } = po
    const poProducts = po_products.map((pop) => {

      const { vendor_products: { products: { sku, name, id }, }, price } = pop
      return {
        ...pop,
        product_name: `${sku} - ${name}`,
        products_product_id: id,
        price_per_unit: price
      }
    })

    setItemList(poProducts)
  }

  const [poErrorMsgs, setPoErrorMsgs] = useState([])


  const removeErrorBox = (i) => {
    const msgArray = [...poErrorMsgs]
    msgArray.splice(i, 1)
    setPoErrorMsgs(msgArray)
  }

  const initialColumnFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    poNumber: initialFilterRules.andContains,
    description: initialFilterRules.andContains,
    vendor: initialFilterRules.orContains,
    po_status: initialFilterRules.andContains,
    from_party: initialFilterRules.andContains,
    agreement_status: initialFilterRules.andContains,
    expectedDod: initialFilterRules.dateIs,
    updatedAt: initialFilterRules.dateIs,
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

  const renderHeader = () => {
    return (
      <div className="flex">
        <div className="flex-grow-1">
          <MultiSelect
            value={selectedColumns}
            options={columns?.map(({ header, field }) => ({
              label: header,
              value: field
            }))}
            onChange={(e) => setSelectedColumns(e.value)}
            style={{ width: "20em", height: "2.6rem" }}

          />
        </div>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
            style={{ height: "2.6rem" }}

          />
        </span>
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          className="p-button-outlined ml-3"
          style={{ height: "2.4rem" }}

          onClick={clearFilter}
        />
      </div>
    )
  }
  const header1 = renderHeader()

  const refetchFuns = [refetch,]

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
          style={{ padding: "0.6rem 0.6rem" }}
        />
      ];
    return acc;
  }, []);

  console.log('allRfqDetails: ', allRfqDetails);
  console.log('allPODetails: ', allPODetails);

  useEffect(() => {
    if (allPODetails.length > 1 && allRfqDetails.length > 1) {
      if (allRfqDetails.length > allPODetails.length) alert("Not Complete")

      else if (allRfqDetails.length === allPODetails.length) alert("Complete")

    }

  }, [allPODetails, allRfqDetails])

  useEffect(() => {
    const defaultColumns = columns.filter(col => !["description"].includes(col.field)).map(col => col.field)
    setSelectedColumns(defaultColumns)
  }, [])

  return (
    <>
      <Head><title>Purchase Order</title></Head>
      {/* <Button
        icon="pi pi-plus"
        label="GET PO"
        className="py-1 px-2"
        onClick={async () => {
          const { purchase_orders } = await invoke(getPurchase_orders, {
            where: {
              rfqId: 237
            },
            include: {
              rfq: true
            }

          })
          const rfq_details = purchase_orders[0]?.rfq?.rfq_products;
          const _allPODetails = purchase_orders.reduce((accumulator, current) => {
            const { po_products } = current;
            if (po_products) {
              accumulator = accumulator.concat(po_products);
            }
            return accumulator;
          }, []);
          setAllPODetails(_allPODetails);
          setAllRfqDetails(rfq_details);


        }}

      /> */}

      <div className="grid w-full mr-0">
        <Toast ref={toast} />
        <Dialog
          header="Send PO"
          visible={sendPoDialog}
          style={{ width: "50vw" }}
          onHide={() => setSendPoDialog(false)}
        >
          <p>{`You are about to send ${activeRow?.poNumber} to ${activeRow?.vendor} `}</p>
          <div className="w-full flex justify-content-end mt-2 pl-2">
            <Button
              icon="pi pi-send"
              label="Confirm"
              onClick={async () => {
                console.log("sendmailData: ", activeRow)
                const formatedData = {
                  ...activeRow,
                  expected_delivery: toDateObj(activeRow?.expected_delivery),
                  expiry_date: toDateObj(activeRow?.expiry_date),
                }

                const bigIntToString = (key, value) => typeof value === 'bigint' ? value.toString() : value;


                const requestData = JSON.stringify(
                  {
                    data: {
                      vendor_vendor_id: activeRow?.vendors?.id,
                      // csrf: antiCSRFToken,
                    },
                    po: formatedData,
                    // po: activeRow,
                  }, bigIntToString)

                var config = {
                  method: "post",
                  url: "http://localhost:3000/api/po",
                  headers: {
                    "Content-Type": "application/json",
                    ["anti-csrf"]: antiCSRFToken,
                  },
                  data: requestData,
                }

                await axios(config)
                  .then((e) => setSendPoDialog(false))
                  .catch((error) => {
                    tError(null, `Failed to send Mail - ${error}`)
                    console.log("error: ", error)
                  })
              }}
            />
          </div>
        </Dialog>

        <div className="col-12 p-1">
          <div className="card flex justify-content-between align-items-center mb-0 px-2 py-3">
            <h4 ref={scrollToPo} className="mb-0">
              Purchase Orders
            </h4>
            <Button
              icon="pi pi-plus"
              label="Create PO"
              className="py-1 px-2"
              onClick={() => {
                Po?.current?.setReadOnlyForm(false)
                Po?.current?.formik.resetForm()
                const fiveFields = arrayFillCopy(1, initialItemState)
                setPoEditState(false)
                setPurchaseDialog(true)
                Po?.current?.setPurchaseDetails(
                  Po?.current?.initialPurchaseState)
                setItemList(fiveFields)
                Po?.current?.setPriorList([])
                Po?.current?.setShowPriorList(false)

              }}

            />
          </div>
          {poErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
        </div>

        <CreateNewPo
          products={products}
          itemList={itemList}
          setItemList={setItemList}
          activeRow={activeRow}
          setActiveRow={setActiveRow}
          poEditState={poEditState}
          toast={toast}
          purchaseDialog={purchaseDialog}
          setPurchaseDialog={setPurchaseDialog}
          vendor_products={vendor_products}
          vendors={vendors}
          initialItemState={initialItemState}
          setErrorMsgs={setPoErrorMsgs}
          refetchFuns={refetchFuns}
          setPoEditState={setPoEditState}
          ref={Po}
          setSendPoDialog={setSendPoDialog}
          rfq={rfq}
          setRfq={setRfq}
          userId={userId}
        />

        <div className="col-12">
          <div className="card">
            <DataTable
              value={purchase_orders}
              showGridlines

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
              scrollable
              scrollHeight="300px"

              filterDisplay="menu"
              footer={pagination}
              // globalFilterFields={["products_sku"]}
              emptyMessage="No Results found."
              onRowClick={async (e) => {
                console.log('row data: ', e.data);

                scrollToPo?.current?.scrollIntoView()
                setPoEditState(true)
                setActiveRow(e.data)
                updateItemList(e.data)
                setPurchaseDialog(true)
                Po.current?.setReadOnlyForm(true)
              }}
              pt={{
                table: { style: { minWidth: '50rem' } }
              }}
              pt
            >

              <Column expander={true} style={{ width: "3em", padding: "0.6rem 0.6rem" }} />
              {columnComponents}

            </DataTable>
          </div>
        </div>
      </div>
    </>
  )
}

const Purchase_ordersPage = () => {
  return (
    // <Suspense fallback={<Loading />}>
    //   <Layout>
    //     <Purchase_ordersList />
    //   </Layout>
    // </Suspense>
    <Layout>
      <Head>
        <title>Purchase Order</title>
      </Head>
      <div>
        <Suspense fallback={<Loading />}>
          <Purchase_ordersList />
        </Suspense>
      </div>
    </Layout>
  )
}
Purchase_ordersPage.authenticate = false

export default Purchase_ordersPage
