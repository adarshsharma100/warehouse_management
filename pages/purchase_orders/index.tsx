import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import Layout from "layouts/Layout"
import { Column } from "primereact/column"
import { Divider } from "primereact/divider"
import { DataTable } from "primereact/datatable"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import moment from "moment"
import getPurchase_order_products from "app/purchase_order_products/queries/getPurchase_order_products"
import getVendors from "app/vendors/queries/getVendors"
import { Calendar } from "primereact/calendar"
import getVendor_products from "app/vendor_products/queries/getVendor_products"
import getRfqs from "app/rfqs/queries/getRfqs"
import getGrns from "app/grns/queries/getGrns"
import createPurchase_order_product from "app/purchase_order_products/mutations/createPurchase_order_product"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updatePurchase_order from "app/purchase_orders/mutations/updatePurchase_order"
import { date, number, undefined } from "zod"
import createManyPurchase_order_product from "app/purchase_order_products/mutations/createManyPurchase_order_product"
import deletePurchase_order from "app/purchase_orders/mutations/deletePurchase_order"
import deletePurchase_order_product from "app/purchase_order_products/mutations/deletePurchase_order_product"
import getRfq_products from "app/rfq_products/queries/getRfq_products"
import Loading from "components/loading"
import { Menu } from "primereact/menu"
import getProducts from "app/products/queries/getProducts"
import { ProductsList } from "pages/products"
import { Chips } from "primereact/chips"
import { Vendor } from "pages/vendors/[vendorId]"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import { TabView, TabPanel } from "primereact/tabview"
import Grn from "components/Grn"
import LoaderFullScreen from "components/LoaderFullScreen"
import ErrorCard from "components/ErrorCard"
import createGrn from "app/grns/mutations/createGrn"
import { Checkbox } from "primereact/checkbox"
import axios from "axios"
import { AutoComplete } from "primereact/autocomplete"
import { getAntiCSRFToken } from "@blitzjs/auth"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { arrayFillCopy, createSearchFunction, filterExistingValues, tsuccess } from "app/constants"
import { Toast } from "primereact/toast"
import Invoice from "components/Invoice"
import createNotifications from "app/notifications_sents/mutations/createNotifications_sent"
import { useSession } from "@blitzjs/auth"
import { Ctx } from "blitz"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import CreateNewPo from "components/CreateNewPo"
import { FilterMatchMode, FilterOperator } from "primereact/api"

const ITEMS_PER_PAGE = 250

export const Purchase_ordersList = () => {
  const router = useRouter()
  const antiCSRFToken = getAntiCSRFToken()
  const user = useCurrentUser()
  const { id, role, name, email } = user

  const page = Number(router.query.page) || 0
  const [{ purchase_orders, hasMore }, { error: getPoError, refetch }] = usePaginatedQuery(
    getPurchase_orders,
    {
      orderBy: { po_id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    }
  )

  const [{ purchase_order_products }, { error: getPoProductsError, refetch: refetchPoProducts }] =
    usePaginatedQuery(getPurchase_order_products, {
      orderBy: { pop_id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    })
  const [{ vendors }, { error: getVenorsError }] = usePaginatedQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ vendor_products }, { error: getVendorProductsError }] = usePaginatedQuery(
    getVendor_products,
    {
      orderBy: { vp_id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    }
  )
  const [{ rfqs }, { error: getRfqError }] = usePaginatedQuery(getRfqs, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ rfq_products }, { error: getRfqProductsError }] = usePaginatedQuery(getRfq_products, {
    orderBy: { rfq_products_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ products }, { error: getProductsError }] = useQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ grns }, { error: getGrnsError, refetch: refetchGrn }] = useQuery(getGrns, {
    orderBy: { grn_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [{ prefixes }, { error: getPrefixesError }] = useQuery(getPrefixes, {
    orderBy: { id: "asc" },
  })
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
    quantity: "",
    price_per_unit: "",
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
    agreement: "",
    rfq_id: "",
    itemsLength: false,
  }

  const [purchaseDetails, setPurchaseDetails] = useState(initialPurchaseState)
  const [sendPoDialog, setSendPoDialog] = useState(false)
  const [activeRow, setActiveRow] = useState({})
  const [poEditState, setPoEditState] = useState(false)
  const scrollToPo = useRef<HTMLHeadingElement>(null)
  const poError = [updatingMutationError, creatingMutationError]
  const [vendorSuggestions, setVendorSuggestions] = useState<any>(null)

  // const [isLoading, setIsLoading] = useState(false)

  const menu = useRef<Menu>(null)
  const toast = useRef(null)

  const rfqOptions = rfqs.map(({ id, rfq_description, rfq_code }) => {
    return { name: `${rfq_code}:${rfq_description}`, value: id }
  })
  const vendorOptions = vendors.map(({ vendor, vendor_id, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      vendor_id,
    }
  })
  // console.log("filterProductOptions", filterProductOptions)
  // console.log("products", products)
  const [ProductsSuggestions, setProductsSuggestions] = useState<any>(null)
  const searchProducts = createSearchFunction(filterProductOptions, setProductsSuggestions)
  const searchVendor = createSearchFunction(vendorOptions, setVendorSuggestions)
  const [fetchGrn, setFetchGrn] = useState(false)

  useEffect(() => {
    if (fetchGrn) {
      triggerRefetch(refetchGrn).catch((error) => setPoErrorMsgs([...poErrorMsgs, ...[error]]))
      setFetchGrn(false)
    }
  }, [fetchGrn])

  const triggerRefetch = async (refetchGrn) => {
    return await refetchGrn()
  }

  const tablePurchaseOrders = purchase_orders.map((ele) => {
    return {
      ...ele,
      approved_on: moment(ele.approved_on).format("DD-MM-YYYY, HH:MM"),
      created_at: moment(ele.created_at).format("DD-MM-YYYY, HH:MM"),
      // expected_delivery: moment(new Date(ele.expected_delivery)).format("DD-MM-YYYY"),
      // expiry_date: moment(new Date(ele.expiry_date)).format("DD-MM-YYYY"),
      // updated_on: moment(ele.updated_on).format("DD-MM-YYYY, HH:MM"),
      // po_status: ele.purchase_order_status.pos_name,
      vendor: ele.vendor.vendor,
    }
  })
  const tableProducts = purchase_order_products.map((ele) => {
    return {
      ...ele,
      product_name: ele?.vendor_products?.products.name,
      product_sku: ele?.vendor_products?.products.products_sku,
      products_product_id: ele?.vendor_products.products?.product_id,
    }
  })
  // console.log("tableProducts", tableProducts)

  const addFields = () => {
    let newfield = {
      purchase_order_po_id: "",
      purchase_order_purchase_order_status_pos_id: 1,
      purchase_order_vendor_vendor_id: "",
      vendor_products_vp_id: "",
      vendor_products_vendor_vendor_id: "",
      vendor_products_products_product_id: "",
      quantity: "",
      price_per_unit: "",
      received_quantity: 0,
    }

    setItemList([...itemList, newfield])
  }
  const removeFields = (index) => {
    setItemList(itemList.filter((data, i) => index !== i))
  }

  const handleFormChange = (e: any, i: number) => {
    // console.log("many", e)
    let data = [...itemList]
    // e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)

    if (e.target) {
      data[i][e.target.name] = e.value
      // data[i].vendor_products_vp_id = findProductVpID(i)
    } else {
      data[i][e.originalEvent.target.name] = e.value
    }

    // console.log("many ", data)
    setItemList(data)
  }
  const items = [
    {
      label: "Options",
      items: [
        // {
        //   label: "Delete",
        //   icon: "pi pi-trash",
        //   command: async () => {
        //     await deletePurchase_orderParoductMutation({
        //       purchase_order_po_id: activeRow.po_id,
        //     })
        //     await deletePurchase_orderMutation({ po_id: activeRow.po_id })
        //     await refetch()
        //   },
        // },
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: async () => {
            scrollToPo?.current?.scrollIntoView()
            setPoCodeChecked(true)
            setPoEditState(true)
            console.log(activeRow)

            const {
              vendor,
              vendor_vendor_id,
              po_code,
              po_description,
              expiry_date,
              expected_delivery,
              from_party,
              agreement,
              rfq_id,
              po_status,
            } = activeRow

            const expiry = moment(expiry_date, "DD-MM-YYYY").toDate()
            const expected = moment(expected_delivery, "DD-MM-YYYY").toDate()
            await formik.setValues({
              vendor,
              vendor_vendor_id,
              po_code,
              po_description,
              expiry_date: expiry,
              expected_delivery: expected,
              from_party,
              agreement: po_status?.replaceAll("_", " "),
              rfq_id,
              itemsLength: true,
            })

            const active = tableProducts
              .filter((ele) => activeRow.po_id === ele.purchase_order_po_id)
              .map((ele) => ({ ...ele, product_name: `${ele.product_sku} - ${ele.product_name}` }))

            console.log("active", active)

            setItemList(active)
            setActivePO()
            setPurchaseDialog(true)
          },
        },
        {
          label: "Send mail",
          icon: "pi pi-send",
          command: () => {
            setSendPoDialog(true)
            setActivePO()
          },
        },
        {
          label: "More info",
          icon: "pi pi-info-circle",
          command: () => (window.location.href = `/purchase_orders/${activeRow.po_id}`),
        },
        // {
        //   label: "View Products",
        //   icon: "pi pi-external-link",
        //   command: () => {
        //     const active = tableProducts.filter(({ purchase_order_po_id }) => {
        //       return purchase_order_po_id === activeRow.po_id
        //     })
        //     console.log("active: ", active)
        //     setActiveProducts(active)
        //     setProductDialog(true)
        //   },
        // },
        // {
        //   label: "Update Status",
        //   icon: "pi pi-chevron-circle-up",
        //   command: () => {},
        // },
        // {
        //   label: "Generate Gatepass",
        //   icon: "pi pi-file",
        //   command: () => {},
        // },
        // {
        //   label: "Generate GRN",
        //   icon: "pi pi-file",
        //   command: () => {},
        // },
        // {
        //   label: "Set as Recurrent",
        //   icon: "pi pi-replay",
        //   command: () => {},
        // },
        // {
        //   label: "Approve",
        //   icon: "pi pi-check-circle",
        //   command: () => {},
        // },
      ],
    },
  ]
  const productOptions = products.map(({ product_id, name, vendor_products, Price }) => {
    return {
      name,
      product_id,
      vendorID: vendor_products.map((ele) => ele.vendor_vendor_id),
      Price,
    }
  })

  const [expandedRows, setExpandedRows] = useState()

  const findProductVpID = (i, list) => {
    const currentVendor = Number(formik.values.vendor_vendor_id)
    const vendorProducts = vendor_products.filter((item) => item.vendor_vendor_id === currentVendor)
    const vpId = vendorProducts.filter(
      (ele) => ele.products_product_id === Number(list[i]?.products_product_id)
    )[0]?.vp_id

    return vpId
  }

  const rowExpansionTemplate = (data) => {
    // console.log(data)
    const rowGrnId = data.grn_grn_id
    const currentGrn = grns?.filter((ele) => ele.grn_id === rowGrnId)[0]
    return (
      <div className="w-full">
        <TabView>
          <TabPanel header="Products Lists ">
            <div className="expandTables">
              <DataTable
                value={data.purchase_order_products}
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
                  field="pop_id"
                  header="ID"
                  // className="text-center"
                />
                <Column
                  field="vendor_products.products.products_sku"
                  header="Product SKU"
                  // className="text-center"
                />

                <Column
                  field="vendor_products.products.name"
                  header="Name"
                  // className="text-center"
                />
                <Column
                  field="price_per_unit"
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
          <TabPanel header="  Invoice">
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
          </TabPanel>
        </TabView>
      </div>
    )
  }

  const setActivePO = () => {
    const expiry = new Date(activeRow.expiry_date)
    const expected = new Date(activeRow.expected_delivery)

    const {
      vendor_vendor_id,
      po_code,
      po_description,
      expiry_date,
      expected_delivery,
      from_party,
      agreement,
      rfq_id,
    } = activeRow

    setPurchaseDetails({
      vendor_vendor_id: vendor_vendor_id,
      po_code: po_code,
      po_description: po_description,
      expiry_date: moment(expiry_date, "DD-MM-YYYY").toDate(),
      expected_delivery: moment(expected_delivery, "DD-MM-YYYY").toDate(),
      from_party: from_party,
      agreement: agreement,
      rfq_id: rfq_id,
    })
    const active = tableProducts
      .filter((ele) => activeRow.po_id === ele.purchase_order_po_id)
      .map((ele) => ({ ...ele, product_name: `${ele.product_sku} - ${ele.product_name}` }))

    setItemList(active)
  }

  const [poErrorMsgs, setPoErrorMsgs] = useState([])

  useEffect(() => {
    const ErrorArray = [
      updatingMutationError,
      creatingMutationError,
      getGrnsError,
      getPoError,
      getPoProductsError,
      getVenorsError,
      getVendorProductsError,
      getRfqError,
      getProductsError,
      getPrefixesError,
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
    getGrnsError,
    getPoError,
    getPoProductsError,
    getVenorsError,
    getVendorProductsError,
    getRfqError,
    getProductsError,
    getPrefixesError,
    grnCreationError,
  ])

  const allowExpansion = (rowData) => {
    // return rowData.orders.length > 0;
    return true
  }

  const removeErrorBox = (i) => {
    const msgArray = [...poErrorMsgs]
    msgArray.splice(i, 1)
    setPoErrorMsgs(msgArray)
  }
  const [newPOCode, setNewPOCode] = useState("")
  const [poCodeChecked, setPoCodeChecked] = useState<boolean>(true)
  const createNewPOCode = () => {
    const poPrefix = prefixes.filter((prefix) => prefix.name === "PO")[0].name
    const nextPoId = purchase_orders.length + 1
    setNewPOCode(`${poPrefix}#${nextPoId}`)
  }

  const agreementStatusEnum = ["Approved", "Waiting For Approval"]
  const agreementStatusOptions = agreementStatusEnum.map((ele) => ({
    name: ele,
  }))

  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)

  const [filters, setFilters] = useState(null)
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

      po_code: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      po_description: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      po_status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      from_party: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      agreement_status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      expected_delivery: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      updated_on: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    })
    setGlobalFilterValue("")
  }

  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="dd/mm/yy"
        placeholder="dd/mm/yyyy"
        mask="99/99/9999"
      />
    )
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
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
      </div>
    )
  }
  const header1 = renderHeader()

  const searchAgreement = (event: { query: string }) => {
    setTimeout(() => {
      let _filteredSuggestions
      if (!event.query.trim().length) {
        _filteredSuggestions = [...agreementStatusOptions]
      } else {
        _filteredSuggestions = agreementStatusOptions.filter((agreement) => {
          return agreement.name.toLowerCase().startsWith(event.query.toLowerCase())
        })
      }

      setFilteredSuggestions(_filteredSuggestions)
    }, 50)
  }

  const formik = useFormik({
    initialValues: purchaseDetails,
    validationSchema: Yup.object().shape({
      vendor_vendor_id: Yup.string().required("*Required"),
      po_code: Yup.string().required("*Required"),
      po_description: Yup.string().required("*Required"),
      expiry_date: Yup.string().required("*Required"),
      expected_delivery: Yup.string().required("*Required"),
      from_party: Yup.string().required("*Required"),
      agreement: Yup.string().required("*Required"),
      vendor: Yup.string().required("*Required"),
      itemsLength: Yup.boolean().equals([true], "⚠ Please select atleast one product").required(),
    }),
    onSubmit: async (data) => {
      const itemsData = itemList.filter((ele, i) => {
        return ele.products_product_id
      }).length

      if (!itemsData) {
        formik.setErrors({ itemsLength: "⚠ Please select atleast one product" })
        return
      }
      console.log("data", data)
      // console.log("purchaseDetails", purchaseDetails)
      // console.log("activeRow", activeRow)
      // console.log("itemList", itemList)
      console.log("poEditState", poEditState)

      const removeEmptyItems = itemList.filter((ele, i) => ele.products_product_id)
      console.log(removeEmptyItems)

      const {
        vendor_vendor_id,
        po_code,
        expiry_date,
        expected_delivery,
        po_description,
        from_party,
        agreement,
      } = data
      const activePoProducts = purchase_order_products
        .filter((ele) => ele.purchase_order_po_id === activeRow.po_id)
        .map((ele) => ele.pop_id)

      // const existingProductsPopIDs = [...itemList.map((ele) => ele.pop_id)]
      const newProductsPopIDs = itemList.map((ele) => ele.pop_id)
      // console.log(existingProductsPopIDs)
      const newProducts = itemList.filter((ele) => !ele.pop_id)
      const existingProducts = itemList.filter((ele) => ele.pop_id)
      const deletelist = activePoProducts.filter((item) => {
        const array = itemList.map((ele) => ele.pop_id)
        return !array.includes(item)
      })
      if (poEditState) {
        console.log("itemList", itemList)
        // updatePurchaseOrderMutation
        try {
          const update = await updatePurchaseOrderMutation(
            {
              vendor_vendor_id: activeRow?.vendor_vendor_id,
              po_id: activeRow?.po_id,
              agreement: agreement.replaceAll(" ", "_"),
              po_description,
              from_party,
              expiry_date: new Date(expiry_date),
              expected_delivery: new Date(expected_delivery),
              purchase_order_products: {
                create: newProducts.map((ele, i) => ({
                  quantity: Number(ele.quantity),
                  price_per_unit: Number(ele.price_per_unit),
                  received_quantity: 0,
                  vendor_products: {
                    connect: {
                      vp_id: Number(findProductVpID(i, newProducts)),
                    },
                  },
                })),
                updateMany: existingProducts.map((ele) => ({
                  where: {
                    pop_id: ele.pop_id,
                  },
                  data: {
                    price_per_unit: Number(ele.price_per_unit),
                    quantity: Number(ele.quantity),
                  },
                })),
                deleteMany: {
                  pop_id: {
                    in: deletelist,
                  },
                },
              },
            },
            {
              onSuccess: async (data) => {
                toast?.current.show(tsuccess("Updated", `${po_code} is updated successfully`))
                await createNotificationsMutations({
                  user_id: id,
                  user_name: name,
                  user_email: email,
                  mutations: `${data?.po_code} is Updated`,
                  created_at: new Date().toString(),
                })
              },
            }
          )
          console.log("Update log", update)
          setPurchaseDialog(false)
          formik.resetForm()
        } catch (error) {
          console.log("updation error , ", error)
        }
      } else {
        try {
          const purchaseOrder = await createPurchaseOrderMutation(
            {
              vendor_vendor_id: Number(vendor_vendor_id),
              po_code,
              po_description,
              expiry_date: new Date(expiry_date),
              expected_delivery: new Date(expected_delivery),
              from_party,
              agreement_status: agreement.replaceAll(" ", "_"),
              purchase_order_products: {
                create: removeEmptyItems.map((ele, i) => ({
                  quantity: Number(ele.quantity),
                  price_per_unit: Number(ele.price_per_unit),
                  received_quantity: 0,
                  vendor_products: {
                    connect: {
                      vp_id: Number(findProductVpID(i, removeEmptyItems)),
                    },
                  },
                })),
              },
            },
            {
              onSuccess: async (data) => {
                toast?.current.show(tsuccess(null, "PO Created Successfully"))
                await createNotificationsMutations({
                  user_id: id,
                  user_name: name,
                  user_email: email,
                  mutations: `${data?.po_code} is Created`,
                  created_at: new Date().toString(),
                })
              },
            }
          )
          // setPurchaseDialog(!purchaseDialog)
          console.log("purchaseOrder: ", purchaseOrder)
          setPurchaseDialog(false)
          formik.resetForm()
        } catch (error) {
          console.log("error: ", error)
        }
      }

      await refetch()
      await refetchPoProducts()
    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }
  useEffect(() => {
    const vendorID = formik.values.vendor_vendor_id
    const filterProducts = productOptions.filter((ele) => ele.vendorID.includes(Number(vendorID)))
    setFilterProductOptions(filterProducts)
    if (!poEditState) {
      // const itemListIds = itemList.map((ele) => ele.product_id)
      const vendorProductsIds = filterProducts.map((ele) => ele.product_id)

      const values = itemList.filter((ele, i) =>
        vendorProductsIds.includes(ele.products_product_id)
      )

      const initialState = values?.length || 5
      let count = initialState >= 5 ? 5 : 5 - values.length

      const emptyFields = arrayFillCopy(count, initialItemState)

      // let filteredItemList = itemList.filter(
      //   (ele) => ele.vendor_products_vendor_vendor_id === vendorID
      // )
      setItemList([...values, ...emptyFields])
    }
  }, [formik?.values.vendor_vendor_id])

  // console.log("itemList", itemList.length)
  useEffect(() => {
    if (poCodeChecked && purchaseDialog && !poEditState) {
      updateFormValues({ po_code: newPOCode })
        // .then((res) => console.log("newCode", res))
        .catch((error) => {
          console.log("From updateFormValues", error)
        })
    }
  }, [poCodeChecked, purchaseDialog])

  const updateFormValues = async (fields) => {
    await formik.setValues({ ...formik.values, ...fields })
  }
  const refetchFuns = [refetch, refetchPoProducts]

  useEffect(() => {
    createNewPOCode()
  })
  useEffect(() => {
    initFilters()
  }, [])

  return (
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
        <p>{`You are about to send ${activeRow?.po_code} to ${activeRow?.vendor}`}</p>
        <div className="w-full flex justify-content-end mt-2 pl-2">
          <Button
            icon="pi pi-send"
            label="Confirm"
            onClick={async () => {
              const formatedData = {
                ...activeRow,
                expected_delivery: moment(activeRow?.expected_delivery, "DD-MM-YYYY").toDate(),
                expiry_date: moment(activeRow?.expiry_date, "DD-MM-YYYY").toDate(),
              }
              // console.log("antiCSRFToken", antiCSRFToken)

              const requestData = JSON.stringify({
                data: {
                  vendor_vendor_id: activeRow?.vendor_vendor_id,
                  // csrf: antiCSRFToken,
                },
                po: formatedData,
              })
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
                .then(setSendPoDialog(false))
                // .then(function (response) {})
                .catch(function (error) {})
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
              // const fiveFields = new Array(5).fill(initialItemState)
              // const deepCopy = fiveFields.map((ele, i) => ({ ...ele }))
              const fiveFields = arrayFillCopy(5, initialItemState)
              // console.log(fiveFields)
              setPoCodeChecked(true)
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
            }}
          ></Button>
        </div>
        {poErrorMsgs.map((ele, i) => (
          <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
        ))}
      </div>

      <CreateNewPo
        products={products}
        purchaseDetails={purchaseDetails}
        itemList={itemList}
        setItemList={setItemList}
        purchase_order_products={purchase_order_products}
        activeRow={activeRow}
        poEditState={poEditState}
        toast={toast}
        purchaseDialog={purchaseDialog}
        setPurchaseDialog={setPurchaseDialog}
        vendor_products={vendor_products}
        vendors={vendors}
        initialItemState={initialItemState}
        setErrorMsgs={setPoErrorMsgs}
        refetchFuns={refetchFuns}
      />
      <div className="col-12">
        <div className="card">
          <DataTable
            value={tablePurchaseOrders}
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
          >
            <Column
              field="details"
              header="Details"
              expander={true}
              // className="overflow-hidden"
              style={{ width: "10px" }}
            />
            {/* <Column field="po_id" header="ID" body={({ po_id }) => `${prefixes[2].prefix}-${po_id}`} /> */}
            <Column
              field="po_code"
              header="Code"
              filter
              filterPlaceholder="Search by Code"
              // className="text-center"
            />

            <Column
              field="po_description"
              header="Description"
              className="overflow-hidden"
              filter
              filterPlaceholder="Search by Description"
              // className="text-center"
            />

            <Column
              field="po_type"
              header="Type"
              // className="text-center"
            />
            <Column
              field="vendor"
              header="Vendor"
              className="overflow-hidden"
              filter
              filterPlaceholder="Search by Vendor"
              // className="text-center"
            />

            <Column
              // field="updated_on"
              filterField="updated_on"
              header="Updated on"
              dataType="date"
              body={(rowData) => moment(new Date(rowData.updated_on)).format("DD-MM-YYYY, HH:MM")}
              filter
              filterElement={dateFilterTemplate}
              // className="text-center"
            />

            <Column
              // field="expected_delivery"
              header="Expected Delivery"
              filterField="expected_delivery"
              dataType="date"
              body={(rowData) =>
                moment(new Date(rowData.expected_delivery)).format("DD-MM-YYYY, HH:MM")
              }
              filter
              filterElement={dateFilterTemplate}
              // className="text-center"
            />
            <Column
              field="from_party"
              header="From Party"
              className="overflow-hidden"
              filter
              filterPlaceholder="Search by Party"
              // className="text-center"
            />
            <Column
              field="agreement_status"
              header="Agreement"
              className="overflow-hidden"
              body={(rowdata) => rowdata.agreement_status?.replaceAll("_", " ")}
              filter
              filterPlaceholder="Search by Agreement"
              // style={{ width: "10px" }}
              // className="text-center"
            />
            <Column
              // field="vendor_gstin"
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Menu model={items} popup ref={menu} id="popup_menu" />
                    <Button
                      // label="Show"
                      icon="pi pi-ellipsis-v"
                      onClick={(event) => {
                        setActiveRow(rowData)
                        menu.current.toggle(event)
                      }}
                      aria-controls="popup_menu"
                      aria-haspopup
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

const Purchase_ordersPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Purchase_ordersList />
      </Layout>
    </Suspense>
  )
}

export default Purchase_ordersPage
