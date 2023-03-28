import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
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
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updatePurchase_order from "app/purchase_orders/mutations/updatePurchase_order"
import createManyPurchase_order_product from "app/purchase_order_products/mutations/createManyPurchase_order_product"
import deletePurchase_order from "app/purchase_orders/mutations/deletePurchase_order"
import deletePurchase_order_product from "app/purchase_order_products/mutations/deletePurchase_order_product"
import Loading from "components/loading"
import { Menu } from "primereact/menu"
import getProducts from "app/products/queries/getProducts"
import { TabView, TabPanel } from "primereact/tabview"
import LoaderFullScreen from "components/LoaderFullScreen"
import ErrorCard from "components/ErrorCard"
import createGrn from "app/grns/mutations/createGrn"
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
import createNotifications from "app/notifications_sents/mutations/createNotifications_sent"
import { FilterMatchMode } from "primereact/api"

const ITEMS_PER_PAGE = 250

export const Purchase_ordersList = () => {
  const router = useRouter()
  const antiCSRFToken = getAntiCSRFToken()
  const user = useCurrentUser()
  const { id: userId, role, name, email } = user


  const page = Number(router.query.page) || 0
  const [{ purchase_orders, hasMore }, { error: getPoError, refetch }] = usePaginatedQuery(
    getPurchase_orders,
    {
      orderBy: { id: "desc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    }
  )
  console.log('purchase_orders: ', purchase_orders);



  const [{ vendors }, { error: getVenorsError }] = useQuery(getVendors, {
    orderBy: { id: "asc" },
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



  const [createPurchaseOrderMutation, { isLoading: creatingPO, error: creatingMutationError }] =
    useMutation(createPurchase_order)
  const [updatePurchaseOrderMutation, { isLoading: UpdatingPO, error: updatingMutationError }] =
    useMutation(updatePurchase_order)
  const [createGrnMutation, { error: grnCreationError }] = useMutation(createGrn)
  const [createNotificationsMutations, { error: notificationCreationError }] =
    useMutation(createNotifications)

  const [createManyPurchaseOrderProductsMutation] = useMutation(createManyPurchase_order_product)
  const [deletePurchase_orderMutation] = useMutation(deletePurchase_order)
  const [deletePurchase_orderParoductMutation] = useMutation(deletePurchase_order_product)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [activeProducts, setActiveProducts] = useState([])
  const [filterProductOptions, setFilterProductOptions] = useState([])
  const initialItemState = {
    purchase_order_po_id: "",
    purchase_order_purchase_order_status_pos_id: 1,
    purchase_order_vendor_vendor_id: "",
    vendor_products_vp_id: "",
    vendor_products_vendor_vendor_id: "",
    vendor_products_products_product_id: "",
    quantity: "-",
    price_per_unit: "-",
    received_quantity: 0,
    products_product_id: "",
    product_name: "",
  }

  const [itemList, setItemList] = useState([initialItemState])
  const initialPurchaseState = {
    vendor_vendor_id: "",
    po_code: "",
    po_description: "",
    expiry_date: "",
    expected_delivery: "",
    from_party: "",
    terms: "",
    rfq_id: "",
    itemsLength: false,
    purchase_order_status: "",
    vendor_Emails: [],
    agreement: "",
    piNumber: "",
    piDate: ""
  }

  function dateFilterTemplate(options) {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat={calenderDateFormat()}
        placeholder={calenderDateFormat()}
        mask="99/99/9999"
      />
    )
  }
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

  const [purchaseDetails, setPurchaseDetails] = useState(initialPurchaseState)
  const [sendPoDialog, setSendPoDialog] = useState(false)
  const [activeRow, setActiveRow] = useState({})
  const [poEditState, setPoEditState] = useState(false)
  const scrollToPo = useRef<HTMLHeadingElement>(null)
  const poError = [updatingMutationError, creatingMutationError]
  const [rfq, setRfq] = useState({ rfqNumber: "", rfqId: "" })

  // const [isLoading, setIsLoading] = useState(false)

  const menu = useRef<Menu>(null)
  const toast = useRef(null)
  const Po = useRef<CreateNewPo>(null)

  // const rfqOptions = rfqs.map(({ id, rfq_description, rfq_code }) => {
  //   return { name: `${rfq_code}:${rfq_description}`, value: id }
  // })

  // console.log("filterProductOptions", filterProductOptions)
  // console.log("products", products)
  const [ProductsSuggestions, setProductsSuggestions] = useState<any>(null)


  const [fetchGrn, setFetchGrn] = useState(false)

  useEffect(() => {
    if (fetchGrn) {
      triggerRefetch(refetchGrn).catch((error) => setPoErrorMsgs([...poErrorMsgs, ...[error]]))
      setFetchGrn(false)
    }
  }, [fetchGrn])




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
      setPurchaseDetails(initialPurchaseState)
      Po?.current?.formik.setValues({ itemsLength: true })




      const poProducts = iletmListArrayCreation(rfq_products)


      setItemList([...poProducts, ...twoFields])


    }

  }, [router.query])


  const triggerRefetch = async (refetchGrn) => {
    return await refetchGrn()
  }




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
                  field="vendor_products.sku"
                  header="Vendor SKU"
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
          </TabPanel>
          {/* <TabPanel header="  Invoice">
            <Invoice
              currentGrn={currentGrn}
              prefixes={prefixes}
              poDetails={data}
              refetch={refetchGrn}
              setFetchGrn={setFetchGrn}
            />
          </TabPanel>
          <TabPanel header="GRN">
            {!currentGrn && (
              <div className="flex justify-content-center pt-3 flex-column">
                <p className="m-auto mb-3 text-xl">
                  GRN not yet created for this PO yet, you can create it using below button.
                </p>
                <Button
                  className="m-auto mb-3"
                  icon="pi pi-plus"
                  label="Create GRN"
                  onClick={async () => {
                    try {
                      const newgrn = await createGrnMutation({
                        grn_batch_code: `GRN-4-${data.po_code}`,
                        purchase_order: {
                          connect: {
                            po_id: data.po_id,
                          },
                        },
                      })
                    } catch (error) {
                      console.log("createGrnMutation", error)
                    }
                    await refetch()
                    await refetchGrn()
                    console.log("refeatched")
                  }}
                ></Button>
              </div>
            )}
            {currentGrn && (
              <Grn
                currentGrn={currentGrn}
                prefixes={prefixes}
                poDetails={data}
                refetch={refetchGrn}
              />
            )}
          </TabPanel> */}
        </TabView>
      </div>
    )
  }

  const updateItemList = (po) => {
    const { po_products } = po
    console.log('po_products: ', po_products);
    // console.log("activeRow: ", activeRow)
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

  useEffect(() => {
    const ErrorArray = [
      updatingMutationError,
      creatingMutationError,



      grnCreationError,
    ]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setPoErrorMsgs(msg)
  }, [
    updatingMutationError,
    creatingMutationError,



    grnCreationError,
  ])

  console.log('itemList:1456 ', itemList);

  const removeErrorBox = (i) => {
    const msgArray = [...poErrorMsgs]
    msgArray.splice(i, 1)
    setPoErrorMsgs(msgArray)
  }
  console.log('activeRow: ', activeRow);
  const initialColumnFilters = {
    global: initialFilterRules.global,
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
      <div className="flex ">
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

  const refetchFuns = [refetch,]



  const columnComponents = columns.reduce((acc, curr) => {
    if (selectedColumns.includes(curr.field))
      return [
        ...acc,
        <Column
          key={curr.field}
          field={curr.field}
          header={curr.header}
          body={curr.body}
          filter={curr.filter}
          filterPlaceholder={curr.filterPlaceholder}
          filterField={curr?.filterField}
          filterElement={curr?.filterElement}

        />
      ];
    return acc;
  }, []);

  useEffect(() => {
    const defaultColumns = columns.filter(col => !["description"].includes(col.field)).map(col => col.field)
    setSelectedColumns(defaultColumns)
  }, [])

  return (
    <>
      <Head><title>Purchase Order</title></Head>

      <div className="grid w-full mr-0">
        <Toast ref={toast} />
        {creatingPO && <LoaderFullScreen />}
        {UpdatingPO && <LoaderFullScreen />}
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

        <div className="col-12">
          <div className="card flex justify-content-between align-items-center">
            <h4 ref={scrollToPo} className="mb-0">
              Purchase Orders
            </h4>
            <Button
              icon="pi pi-plus"
              label="Create PO"
              onClick={() => {
                Po?.current?.setReadOnlyForm(false)
                const fiveFields = arrayFillCopy(5, initialItemState)
                setPoEditState(false)
                setPurchaseDialog(true)
                setPurchaseDetails({
                  vendor_vendor_id: "",
                  po_code: "",
                  po_description: "",
                  expiry_date: "",
                  expected_delivery: "",
                  from_party: "",
                  agreement: "",
                  rfq_id: "",
                })
                setItemList(fiveFields)
                setFilterProductOptions([])
                Po?.current?.formik.resetForm()
              }}
            ></Button>
          </div>
          {poErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
        </div>

        <CreateNewPo
          products={products}
          purchase_orders={purchase_orders}
          purchaseDetails={purchaseDetails}
          itemList={itemList}
          setItemList={setItemList}
          // purchase_order_products={purchase_order_products}
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
          scrollToPo={scrollToPo}
          setPoEditState={setPoEditState}
          ref={Po}
          setSendPoDialog={setSendPoDialog}
          rfq={rfq}
          setRfq={setRfq}
          initialPurchaseState={initialPurchaseState}
          setPurchaseDetails={setPurchaseDetails}
          userId={userId}
        />

        <div className="col-12">
          <div className="card">
            <DataTable
              value={purchase_orders}
              showGridlines
              scrollable
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
              filterDisplay="menu"
              // globalFilterFields={["products_sku"]}
              emptyMessage="No Results found."
              onRowClick={async (e) => {
                scrollToPo?.current?.scrollIntoView()
                setPoEditState(true)
                setActiveRow(e.data)
                updateItemList(e.data)
                setPurchaseDialog(true)
                Po.current?.setReadOnlyForm(true)
              }}
            >

              <Column expander={true} style={{ width: "3em" }} />
              {columnComponents}

              <Column
                field="updatedAt"
                header="Updated on"
                filterField="updatedAt"
                filter
                filterElement={dateFilterTemplate}
                dataType="date"
                body={(rowData) => dateFormat(rowData.updatedAT)}
              />



            </DataTable>
          </div>
        </div>
      </div>
    </>
  )
}

const Purchase_ordersPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Purchase_ordersList />
      </Layout>
    </Suspense>
  )
}
Purchase_ordersPage.authenticate = false

export default Purchase_ordersPage
