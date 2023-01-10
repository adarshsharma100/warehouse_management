import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { InputNumber } from "primereact/inputnumber"
import { Divider } from "primereact/divider"
import getRfqs from "app/rfqs/queries/getRfqs"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import moment from "moment"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import getProducts from "app/products/queries/getProducts"
import createRfq from "app/rfqs/mutations/createRfq"
import getRfq_products from "app/rfq_products/queries/getRfq_products"
import createRfq_product from "app/rfq_products/mutations/createRfq_product"
import createManyRfq_products from "app/rfq_products/mutations/createManyRfq_products"
import deleteRfq_product from "app/rfq_products/mutations/deleteRfq_product"
import deleteRfq from "app/rfqs/mutations/deleteRfq"
import getVendors from "app/vendors/queries/getVendors"
import getVendor_products from "app/vendor_products/queries/getVendor_products"

import { Calendar } from "primereact/calendar"
import createManyPurchase_order_product from "app/purchase_order_products/mutations/createManyPurchase_order_product"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updateRfq from "app/rfqs/mutations/updateRfq"
import updateManyRfq_products from "app/rfq_products/mutations/updateManyRfq_products"
import updateRfq_product from "app/rfq_products/mutations/updateRfq_product"
import { RfqForm } from "app/rfqs/components/RfqForm"
import { Menu } from "primereact/menu"
import { InputTextarea } from "primereact/inputtextarea"
import { mail } from "../../helperFunctions/mail"
import { Chips } from "primereact/chips"
import axios from "axios"
import Loading from "components/loading"
import LoaderFullScreen from "components/LoaderFullScreen"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import ErrorCard from "components/ErrorCard"
import { MultiSelect } from "primereact/multiselect"
import { Checkbox } from "primereact/checkbox"
import { AutoComplete } from "primereact/autocomplete"
import sendEmail from "helperFunctions/rfqMail"
import CreatePo from "components/CreatePo"
import getRfq_senttos from "app/rfq_senttos/queries/getRfq_senttos"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { createSearchFunction, filterExistingValues, tsuccess } from "app/constants"
import getMutation_admin_mail from "app/mutation_admin_mails/queries/getMutation_admin_mail"
import { Toast } from "primereact/toast"
import ScannedProducts from "components/ScannedProducts"
import { getAntiCSRFToken } from "@blitzjs/auth"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { date } from "zod"
import CreateNewPo from "components/CreateNewPo"
import { FilterMatchMode, FilterOperator } from "primereact/api"

const ITEMS_PER_PAGE = 100

export const RfqsList = () => {
  const router = useRouter()
  const antiCSRFToken = getAntiCSRFToken()
  const user = useCurrentUser()
  const { id, role, name, email } = user

  const page = Number(router.query.page) || 0
  // const [{ rfqs, hasMore }, { refetch }] = usePaginatedQuery(getRfqs, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })
  const [{ rfqs }, { error: rfqError, refetch }] = useQuery(getRfqs, {
    orderBy: { id: "asc" },
  })

  const [{ products }, { error: productsError }] = usePaginatedQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  // const [{ rfq_products }, { refetch: fetchRfqProducts }] = usePaginatedQuery(getRfq_products, {
  //   orderBy: { rfq_products_id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })
  const [{ rfq_products }, { refetch: fetchRfqProducts, error: getRfq_productsError }] = useQuery(
    getRfq_products,
    {
      orderBy: { rfq_products_id: "asc" },
      skip: 0,
      take: ITEMS_PER_PAGE,
    }
  )
  const [{ vendors }, { error: getVendorsError }] = usePaginatedQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ vendor_products }, { error: getVendorsProductsError }] = usePaginatedQuery(
    getVendor_products,
    {
      orderBy: { vp_id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    }
  )

  const [{ prefixes }, { error: getPrefixesError }] = useQuery(getPrefixes, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ rfq_senttos }, { error: getRfq_senttosError }] = useQuery(getRfq_senttos, {
    orderBy: { id: "asc" },
  })
  // console.log(rfq_senttos)
  const [sendDialog, setSendDialog] = useState(false)
  const [createRFQMutation, { isLoading: creatingRfq, error: createRFQMutationError }] =
    useMutation(createRfq)
  const [updateRFQMutation, { isLoading: updatingRfq, error: updateRFQMutationError }] =
    useMutation(updateRfq)
  const [createNotificationsMutations] = useMutation(createNotifications_sent)
  const [createRFQProductMutation] = useMutation(createManyRfq_products)
  const [deleteRFQProductMutation] = useMutation(deleteRfq_product)
  const [deleteRFQMutation] = useMutation(deleteRfq)
  const [createManyPurchaseOrderProductsMutation] = useMutation(createManyPurchase_order_product)
  // const [updateManyRfqProductsMutation] = useMutation(updateManyRfq_products)
  const [updateRfqProductMutation] = useMutation(updateRfq_product)
  const [createPurchaseOrderMutation] = useMutation(createPurchase_order)
  const productOptions = products.map(
    ({ product_id, name, products_sku, vendor_products, Price }) => {
      return {
        name: `${products_sku} - ${name}`,
        product_id,
        vendorID: vendor_products.map((ele) => ele.vendor_vendor_id),
        Price,
      }
    }
  )
  const [productsSuggestions, setProductsSuggestions] = useState<any>(null)
  const searchProducts = createSearchFunction(productOptions, setProductsSuggestions)
  const menu = useRef<Menu>(null)
  const toast = useRef(null)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [rfqDialog, setRfqDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const [purchaseProductOption, setPurchaseProductOption] = useState([])
  const [vendorChangeState, setVendorChangeState] = useState(false)
  const [newRFQCode, setNewRFQCode] = useState("")
  const initialRfqState = {
    rfq_code: newRFQCode,
    rfq_description: "",
    expected_dod: "",
    rfq_email: null,
    itemsLength: false,
  }
  const [rfqDetails, setRfqDetails] = useState(initialRfqState)
  const [rfqEditState, setRfqEditState] = useState(false)
  const [activeRfqId, setActiveRfqId] = useState("")
  // const [productItemList, setProductItemList] = useState([
  //   {
  //     purchase_order_po_id: "",
  //     purchase_order_purchase_order_status_pos_id: 1,
  //     purchase_order_vendor_vendor_id: "",
  //     vendor_products_vp_id: "",
  //     vendor_products_vendor_vendor_id: "",
  //     vendor_products_products_product_id: "",
  //     quantity: "",
  //     price_per_unit: "",
  //     received_quantity: 0,
  //     product_name: "",
  //     vendor_unit_: "",
  //     product_id: "",
  //   },
  // ])

  const [itemList, setItemList] = useState([
    { products_product_id: "", quantity: "", price_per_unit: "", product_name: "" },
  ])
  const initialPoItemState = {
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
  const [poItemList, setPoItemList] = useState([initialPoItemState])

  const [activeRfq, setActiveRfq] = useState([])
  const [purchaseDetails, setPurchaseDetails] = useState({
    vendor_vendor_id: "",
    po_code: "",
    po_description: "",
    expiry_date: "",
    expected_delivery: "",
    from_party: "",
    agreement: "",
    rfq_id: null,
  })
  const [activeRow, setActiveRow] = useState({})

  const [mailDetails, setMailDetails] = useState({
    to: [],
    subject: "",
    message: "",
  })
  const [expandedRows, setExpandedRows] = useState(null)
  const [currentRfqitemsID, setCurrentRfqitemsID] = useState([])
  const [rfqErrorMsgs, setRfqErrorMsgs] = useState([])
  const [RFQCodechecked, setRFQCodeChecked] = useState<boolean>(true)
  const [scanner, setScanner] = useState<boolean>(false)
  const scrollToRfq = useRef<HTMLHeadingElement>(null)

  const tableRfqProducts = rfq_products.map((ele) => {
    return {
      ...ele,
      product_name: ele.products.name,
      product_sku: ele.products.products_sku,
    }
  })

  useEffect(() => {
    const active = tableRfqProducts.filter(({ rfq_id }) => {
      return Number(rfq_id) === Number(activeRfqId)
    })
    const activeProducts = active.map(({ products }) => {
      return products.product_id
    })

    const activeProductsdetails = vendor_products

      .filter(({ products, vendor }) => {
        return (
          activeProducts.includes(products.product_id) &&
          Number(vendor.vendor_id) === Number(purchaseDetails.vendor_vendor_id)
        )
      })
      .map((ele) => {
        return {
          purchase_order_po_id: "",
          purchase_order_purchase_order_status_pos_id: 1,
          purchase_order_vendor_vendor_id: ele.vendor.vendor_id,
          vendor_products_vp_id: ele.vp_id,
          vendor_products_vendor_vendor_id: ele.vendor.vendor_id,
          vendor_products_products_product_id: ele.products.product_id,
          quantity: "",
          price_per_unit: ele.unit_price,
          received_quantity: 0,
          product_name: ele.products.name,
          vendor_unit_price: ele.unit_price,
          product_id: ele.products.product_id,
        }
      })

    // setProductItemList(activeProductsdetails)
  }, [vendorChangeState])

  const tableRFQ = rfqs.map((ele) => {
    // console.log(ele.created_at)
    return {
      ...ele,
      // created_at: moment(ele.createdAt).format("DD-MM-YYYY, HH:MM"),
      // updated_at: moment(ele.updatedAt).format("DD-MM-YYYY, HH:MM"),
      // name: ele.products.name,
    }
  })

  const options = vendors.map(({ vendor, vendor_id, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      value: vendor_id,
    }
  })
  const optionsForVendorEmails = vendors.map(({ vendor, vendor_email, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      value: vendor_email,
    }
  })
  const rfqOptions = rfqs.map(({ rfq_code, rfq_description, id }) => {
    return {
      name: `${rfq_code}: ${rfq_description}`,
      value: id,
    }
  })

  const createNewRFQCode = () => {
    const rfqPrefix = prefixes?.filter((prefix) => prefix.name === "RFQ")[0].name
    const nextRfqId = rfqs.length + 1
    setNewRFQCode(`${rfqPrefix}#${nextRfqId}`)
  }

  const [vendorOptions, setVendorOptions] = useState(options)
  const [vendorEmailOptions, setVendorEmailOptions] = useState(optionsForVendorEmails)
  const [vendorEmailSuggestions, setVendorEmailSuggestions] = useState<any>(null)

  const [filters, setFilters] = useState({})
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

      rfq_code: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      rfq_description: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      updatedAt: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      createdAt: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      active: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
    })
    setGlobalFilterValue("")
  }

  const statuses = ["1", "0"]

  const statusFilterTemplate = (options) => {
    // console.log(options)
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={statusItemTemplate}
        placeholder="Select a Status"
        className="p-column-filter"
        showClear
      />
    )
  }
  const statusItemTemplate = (option) => {
    return (
      <span className={`badge status-${option === "1" ? "active" : "inactive"}`}>
        {option === "1" ? "Active" : "Inactive"}
      </span>
    )
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

  const addFields = () => {
    let newfield = { products_product_id: "", quantity: "", price_per_unit: "" }

    setItemList([...itemList, newfield])
  }
  const removeFields = (index) => {
    setItemList(itemList.filter((data, i) => index !== i))
  }
  const [itemsList, setItemsList] = useState<any>(null)
  // const addFieldsPurchase = () => {
  //   let newfield = {
  //     purchase_order_po_id: "",
  //     purchase_order_purchase_order_status_pos_id: 1,
  //     purchase_order_vendor_vendor_id: "",
  //     vendor_products_vp_id: "",
  //     vendor_products_vendor_vendor_id: "",
  //     vendor_products_products_product_id: "",
  //     quantity: "",
  //     price_per_unit: "",
  //     received_quantity: 0,
  //     product_name: "",
  //     vendor_unit_: "",
  //     product_id: "",
  //   }

  //   setProductItemList([...productItemList, newfield])
  // }
  // const removeFieldsPurchase = (index) => {
  //   let data = [...productItemList]
  //   const data2 = data.splice(index, 1)

  //   setProductItemList(data2)
  // }
  const handleFormChange = (e: any, i: number) => {
    let data = [...itemList]
    e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)
    setItemList(data)
  }

  // console.log("tableRfqProducts", tableRfqProducts[0])

  const setRfqItemList = () => {
    const active = tableRfqProducts
      .filter(({ rfq_id }) => {
        return rfq_id === activeRow.id
      })
      .map(({ products, quantity, price_per_unit, rfq_products_id }) => {
        return {
          products_product_id: products.product_id,
          quantity: quantity,
          price_per_unit: price_per_unit,
          rfq_products_id,
        }
      })
    setItemList(active)
  }
  const setPoItems = () => {
    const active = tableRfqProducts
      .filter(({ rfq_id }) => {
        return rfq_id === activeRow.id
      })
      .map(({ products, quantity, price_per_unit, rfq_products_id, product_name }) => {
        return {
          ...initialPoItemState,
          products_product_id: products.product_id,
          quantity,
          price_per_unit,
          rfq_products_id,
          product_name,
        }
      })
    setPoItemList(active)
  }

  // console.log("formik.errors",)

  const items = [
    {
      label: "Options",
      items: [
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: async () => {
            const expected_dod = new Date(activeRow.expected_dod)
            setRfqEditState(true)
            await formik.setValues({
              rfq_code: activeRow.rfq_code,
              rfq_description: activeRow.rfq_description,
              expected_dod,
              id: activeRow.id,
              itemsLength: true,
            })
            // setRfqDetails({
            //   rfq_code: activeRow.rfq_code,
            //   rfq_description: activeRow.rfq_description,
            //   expected_dod: activeRow.expected_dod,
            //   id: activeRow.id,
            // })
            const active = tableRfqProducts
              .filter(({ rfq_id }) => {
                return rfq_id === activeRow.id
              })
              .map(({ products, quantity, price_per_unit, rfq_products_id }) => {
                return {
                  products_product_id: products.product_id,
                  quantity: quantity,
                  price_per_unit: price_per_unit,
                  rfq_products_id,
                }
              })
            console.log("tableRfqProducts", tableRfqProducts)
            console.log("active item list", active)
            setItemList(active)
            setRfqDialog(true)
            scrollToRfq.current?.scrollIntoView()
          },
        },
        // {
        //   label: "Delete",
        //   icon: "pi pi-trash",
        //   command: async () => {
        //     // await deleteRFQProductMutation({ rfq_id: activeRow.id })
        //     // await deleteRFQMutation({ id: activeRow.id })
        //     // await refetch()
        //   },
        // },
        // {
        //   label: "View Products",
        //   icon: "pi pi-external-link",
        //   command: () => {
        //     const active = tableRfqProducts.filter(({ rfq_id }) => {
        //       return rfq_id === activeRow.id
        //     })
        //     //
        //     setActiveRfq(active)
        //     setProductDialog(true)
        //   },
        // },
        {
          label: "Create PO",
          icon: "pi pi-plus",
          command: () => {
            setPoItems()
            setRfqItemList()
            scrollToRfq?.current?.scrollIntoView()
            setPurchaseDialog(true)
          },
        },
        {
          label: "Send RFQ",
          icon: "pi pi-send",
          command: () => {
            setSendDialog(true)
            setRfqDetails({ ...rfqDetails, rfq_email: [] })
          },
        },
        {
          label: "Update-Status",
          icon: "pi pi-refresh",
          command: async (e) => {
            const active = activeRow.active === 0 ? 1 : 0
            await updateRFQMutation(
              {
                id: activeRow.id,
                active,
              },
              {
                onSuccess: async (data) => {
                  const rfq_code = data?.rfq_code
                  const status = active ? "Active" : "Inactive"

                  toast?.current.show(
                    tsuccess("Updated", `${rfq_code} is now ${status}`),
                    await createNotificationsMutations({
                      user_id: id,
                      user_name: name,
                      user_email: email,
                      mutations: `${rfq_code} is now ${status}`,
                      created_at: new Date().toString(),
                    })
                  )
                },
              }
            )
            await refetch()
          },
        },
      ],
    },
  ]
  // console.log("poItemList", poItemList)
  const rowExpansionTemplate = (data) => {
    return (
      <div className="w-full expandTable">
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
          <Column field="rfq_products_id" header="ID" style={{ paddingTop: "0.5rem" }} />
          <Column
            field="products.products_sku"
            header="Product SKU"
            // className="text-center"
          />

          <Column
            field="products.name"
            header="Name"
            // className="text-center"
          />
          <Column
            field="price_per_unit"
            header="Target Price / Unit"
            // className="text-center"
          />
          <Column
            field="quantity"
            header="Quantity"
            // className="text-center"
          />
        </DataTable>
      </div>
    )
  }

  const formik = useFormik({
    initialValues: rfqDetails,
    validationSchema: Yup.object().shape({
      rfq_code: Yup.string().required("*Required"),
      rfq_description: Yup.string().required("*Required"),
      expected_dod: Yup.mixed().required("*Required"),
      itemsLength: Yup.boolean().equals([true], "⚠ Please select atleast one product").required(),
    }),
    onSubmit: async (data) => {
      // console.log("data", data)
      // console.log("activeRow", activeRow)
      const { rfq_code, rfq_description, rfq_email, expected_dod } = data
      const dateToString = expected_dod.toString()
      const sentoEmails = rfq_email?.length
        ? rfq_email?.map((item, i) => ({ email: item.value }))
        : undefined

      if (rfqEditState) {
        // const currentProducts = [...itemList.map(({ rfq_products_id }) => rfq_products_id)]
        const newProductList = itemList.filter((item) => !item.rfq_products_id)
        const removemail = { ...rfqDetails }
        const delProductList = currentRfqitemsID.filter(
          (x) => !itemList.map(({ rfq_products_id }) => rfq_products_id).includes(x)
        )
        delete removemail.rfq_email
        const update = await updateRFQMutation(
          {
            id: activeRow.id,
            rfq_code,
            rfq_description,
            expected_dod,
            active: 1,
            rfq_products: {
              create: newProductList.map((ele) => ({
                price_per_unit: Number(ele.price_per_unit),
                quantity: Number(ele.quantity),
                products: {
                  connect: {
                    product_id: Number(ele.products_product_id),
                  },
                },
              })),
              updateMany: itemList.map((ele) => ({
                where: {
                  rfq_products_id: ele.rfq_products_id,
                },
                data: {
                  price_per_unit: Number(ele.price_per_unit),
                  quantity: Number(ele.quantity),
                },
              })),
              deleteMany: {
                rfq_products_id: {
                  in: delProductList,
                },
              },
            },
            rfq_sentto: {
              create: sentoEmails,
            },
          },
          {
            onSuccess: async (data) => {
              const rfq_code = data?.rfq_code

              toast?.current.show(
                tsuccess("Updated", `${rfq_code} is now updated sucessfully`),
                await createNotificationsMutations({
                  user_id: id,
                  user_name: name,
                  user_email: email,
                  mutations: `${rfq_code} is Updated`,
                  created_at: new Date().toString(),
                })
              )
            },
          }
        )
        console.log(data)
        setRfqDialog(false)
        formik.resetForm()
      } else {
        const removeEmptyItems = itemList.filter((prod) => prod?.products_product_id)

        if (removeEmptyItems.length === 0) {
          const msg = {
            message: "You should at least select 1 product from the select products List ",
          }
          setRfqErrorMsgs([...rfqErrorMsgs, msg])
          return
        }
        try {
          const newRfqData = await createRFQMutation(
            {
              ...data,
              expected_dod: dateToString,
              active: 1,
              rfq_products: {
                create: removeEmptyItems.map((ele) => ({
                  price_per_unit: Number(ele.price_per_unit),
                  quantity: Number(ele.quantity),
                  products: {
                    connect: {
                      product_id: Number(ele.products_product_id),
                    },
                  },
                })),
              },
              rfq_sentto: {
                create: sentoEmails,
              },
            },
            {
              onSuccess: async (data) => {
                const rfq_code = data?.rfq_code
                toast?.current?.show(tsuccess(null, `${rfq_code} created successfully.`))
                await createNotificationsMutations({
                  user_id: id,
                  user_name: name,
                  user_email: email,
                  mutations: `${rfq_code} is Created`,
                  created_at: new Date().toString(),
                })
              },
            }
          )
          setRfqDialog(false)
          formik.resetForm()
        } catch (error) {
          console.log(error)
        }
      }
      await refetch()
      await fetchRfqProducts()
    },
  })
  // console.log(formik.values)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const emailsuggestions = createSearchFunction(optionsForVendorEmails, setVendorEmailSuggestions)

  useEffect(() => {
    const currentItemsIds = itemList.map(({ rfq_products_id }) => rfq_products_id)
    setCurrentRfqitemsID([...currentItemsIds])
  }, [rfqDialog])

  useEffect(() => {
    //to rerender from while working with item list
    ;(async () => {
      await formik.setValues({ ...formik.values })
    })()
      // .then((res) => console.log(res))
      .catch((error) => console.log(error))
  }, [itemList, rfqDialog])

  useEffect(() => {
    const ErrorArray = [
      updateRFQMutationError,
      createRFQMutationError,
      rfqError,
      productsError,
      getRfq_senttosError,
      getPrefixesError,
      getVendorsProductsError,
      getVendorsError,
      getRfq_productsError,
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
    getRfq_senttosError,
    getPrefixesError,
    getVendorsProductsError,
    getVendorsError,
    getRfq_productsError,
  ])

  const allowExpansion = (rowData) => {
    // return rowData.orders.length > 0;
    return true
  }

  const removeErrorBox = (i) => {
    const msgArray = [...rfqErrorMsgs]
    msgArray.splice(i, 1)
    setRfqErrorMsgs(msgArray)
  }
  useEffect(() => {
    if (RFQCodechecked && rfqDialog) {
      updateFormValues()
        // .then((res) => console.log("newCode", res))
        .catch((error) => {
          console.log("From updateFormValues", error)
        })
    }
  }, [RFQCodechecked, scanner])

  const updateFormValues = async () => {
    await formik.setValues({ ...formik.values, rfq_code: newRFQCode })
  }

  // useEffect(() => {
  //   // RFQCodechecked
  //   //   ? setRfqDetails({
  //   //       ...rfqDetails,
  //   //       rfq_code: newRFQCode,
  //   //     })
  //   //   : null
  // }, [RFQCodechecked])

  useEffect(() => {
    createNewRFQCode()
  })

  useEffect(() => {
    initFilters()
  }, [])

  // console.log("values", typeof new Date())

  // console.log("newcode", newRFQCode)

  return (
    <div ref={scrollToRfq} className="grid w-full mr-0">
      <Toast ref={toast} />
      {(updatingRfq || creatingRfq) && <LoaderFullScreen />}

      <Dialog
        header="Send Quotation"
        visible={sendDialog}
        style={{ width: "50vw" }}
        onHide={() => setSendDialog(false)}
      >
        <MultiSelect
          style={{ minWidth: "33%" }}
          value={rfqDetails.rfq_email}
          options={vendorEmailOptions}
          onChange={(e) => setRfqDetails({ ...rfqDetails, rfq_email: e.value })}
          optionLabel="name"
          placeholder="Select a Vendor"
          display="chip"
        />

        <div className="w-full flex justify-content-end mt-2 pl-2">
          <Button
            icon="pi pi-send"
            label="Send"
            onClick={async () => {
              const existingEmails = rfq_senttos
                .filter((item) => item.rfq_id === activeRow.id)
                .map((item) => item.email)

              const newEmails = rfqDetails?.rfq_email

              const mails = filterExistingValues(newEmails, existingEmails)

              const update = await updateRFQMutation({
                id: activeRow.id,

                rfq_sentto: {
                  create: mails?.length ? mails?.map((email) => ({ email })) : undefined,
                },
              })

              const uniquerfq = rfqs.find((ele) => ele.id === activeRow.id)

              // const data = JSON.stringify({
              //   to: "varunram.66@gmail.com",
              //   subject: "mailDetails.subject123",
              //   message: "mailDetails.message",
              // })

              // var config = {
              //   method: "post",
              //   url: "http://localhost:3000/api/rfq",
              //   headers: {
              //     "Content-Type": "application/json",
              //   },
              //   data: data,
              // }

              const requestData = JSON.stringify({
                data: {
                  rfq_sentto: {
                    create: rfqDetails?.rfq_email.length
                      ? rfqDetails?.rfq_email?.map((item, i) => ({ email: item }))
                      : undefined,
                  },
                },
                rfq: uniquerfq,
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
              // .then(function (response) {})
              // .catch(function (error) {})
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
                // const itemListWithEmptyList = Array(5).fill({
                //   products_product_id: "",
                //   quantity: "",
                //   price_per_unit: "",
                // })
                setRfqEditState(false)

                // setRfqDetails({
                //   rfq_code: newRFQCode,
                //   rfq_description: "",
                //   expected_dod: "",
                //   rfq_email: "",
                // })

                await formik.setValues({ ...initialRfqState })
                setItemList([
                  { products_product_id: "", quantity: "", price_per_unit: "" },
                  { products_product_id: "", quantity: "", price_per_unit: "" },
                  { products_product_id: "", quantity: "", price_per_unit: "" },
                  { products_product_id: "", quantity: "", price_per_unit: "" },
                  { products_product_id: "", quantity: "", price_per_unit: "" },
                ])
                setRfqDialog(true)
                setRFQCodeChecked(true)
              }}
            ></Button>
            <Button
              className="ml-2"
              icon="pi pi-qrcode"
              label="Scan Mode"
              onClick={(e) => {
                setScanner(!scanner)
              }}
            ></Button>
          </div>
        </div>
        {rfqErrorMsgs.map((ele, i) => (
          <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
        ))}
      </div>

      <div
        className={`col-12 ${
          rfqDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        } `}
      >
        <div className={` card `}>
          <form className="p-fluid" onSubmit={formik.handleSubmit}>
            <h5 className="mb-3">Create RFQ</h5>
            <div className="formgrid grid p-4">
              <div className="col-12">
                <h6>RFQ Details:</h6>
              </div>
              <div className="field col-12 lg:col-4 mt-2 ">
                <span className="p-float-label ">
                  <InputText
                    id="rfq_code"
                    name="rfq_code"
                    value={formik.values.rfq_code}
                    onChange={formik.handleChange}
                    disabled={RFQCodechecked}
                    autoFocus
                    className={classNames({ "p-invalid": isFormFieldValid("rfq_code") })}
                  />
                  <label
                    htmlFor="rfq_code"
                    className={classNames({ "p-error": isFormFieldValid("rfq_code") })}
                  >
                    RFQ Code
                  </label>
                </span>
                {getFormErrorMessage("rfq_code")}

                <div className="field-checkbox my-2">
                  <Checkbox
                    // style={{ width: "0.1rem", height: "0rem" }}
                    onChange={(e) => setRFQCodeChecked(e.checked)}
                    checked={RFQCodechecked}
                    disabled={rfqEditState}
                  />
                  <label
                    // htmlFor="binary"
                    className="text-sm	"
                  >
                    Un-check to add custom code.
                  </label>
                </div>
              </div>
              <div className="field col-12 lg:col-4 my-2">
                <span className="p-float-label">
                  <InputText
                    id="rfq_description"
                    name="rfq_description"
                    value={formik.values.rfq_description}
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
              <div className="field col-12 lg:col-4 mt-2 ">
                <span className="p-float-label">
                  <Calendar
                    id="expected_dod"
                    minDate={new Date()}
                    // // value={(rfqDetails.expected_dod)}
                    // onChange={(e) =>
                    //   setRfqDetails({ ...rfqDetails, expected_dod: e.target.value?.toString() })
                    value={formik.values.expected_dod}
                    onChange={async (e) => {
                      await formik.setValues({
                        ...formik.values,
                        expected_dod: e.value,
                      })
                    }}
                    className={classNames({ "p-invalid": isFormFieldValid("expected_dod") })}
                  />
                  <label
                    style={{ zIndex: 10 }}
                    htmlFor="expected_dod"
                    className={classNames({ "p-error": isFormFieldValid("expected_dod") })}
                  >
                    Expected Delivery
                  </label>
                </span>
                {getFormErrorMessage("expected_dod")}
              </div>

              <div className="col-12">
                <h6 className="mb-4">Send To Emails:</h6>
              </div>

              {/* <MultiSelect
                style={{ minWidth: "33%" }}
                value={rfqDetails.rfq_email}
                options={vendorEmailOptions}
                onChange={(e) => setRfqDetails({ ...rfqDetails, rfq_email: e.value })}
                optionLabel="name"
                placeholder="Select a Vendor"
                display="chip"
              /> */}

              <span className="p-float-label w-full">
                <AutoComplete
                  // className="w-4"
                  style={{ minWidth: "33%" }}
                  value={formik.values.rfq_email}
                  suggestions={vendorEmailSuggestions}
                  completeMethod={emailsuggestions}
                  field="name"
                  multiple
                  onChange={async (e) => {
                    await formik.setValues({ ...formik.values, rfq_email: e.value })
                  }}
                  aria-label="Vendor-Emails"
                  dropdownAriaLabel="Select Email"
                />
                <label htmlFor="autocomplete">Emails</label>
              </span>

              <div className="col-12 mt-5">
                <h6>Select Products:</h6>
              </div>
              {itemList.map((ele, i) => (
                <>
                  <div className="col-12 grid mt-1" key={`RFQ-product-${i}`}>
                    <div className="field col-12 lg:col-7 mt-2">
                      <div className="p-float-label">
                        <AutoComplete
                          id="name"
                          name="name"
                          value={ele.product_name}
                          suggestions={productsSuggestions}
                          completeMethod={searchProducts}
                          //   forceSelection //
                          dropdown
                          field="name"
                          onChange={async (e) => {
                            console.log("event understand", e.value)
                            let product_id = typeof e.value === "string" ? "" : e.value?.product_id
                            let name = typeof e.value === "string" ? e.value : e.value?.name
                            let price_per_unit = typeof e.value === "string" ? 0 : e.value?.Price
                            let data = [...itemList]

                            data[i].product_name = name
                            data[i].products_product_id = product_id
                            data[i].price_per_unit = price_per_unit

                            let itemsLength = !e.value?.name ? false : true
                            await formik.setValues({ ...formik.values, itemsLength })

                            setItemList(data)
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
                    {/* <div className="field col-12 lg:col-7 mt-2">
                      <Dropdown
                        name="products_product_id"
                        // disabled={editState}
                        optionLabel="name"
                        filter
                        showClear
                        filterBy="name"
                        value={ele.products_product_id}
                        options={productOptions}
                        onChange={async (e) => {
                          await handleFormChange(e, i)
                          const productPrice = products.filter(
                            (item) => item.product_id === e.value
                          )[0]?.Price
                          let data = [...itemList]
                          e.target
                            ? (data[i].price_per_unit = productPrice)
                            : (data[i].price_per_unit = 0)
                          setItemList(data)
                          if (i === 0) {
                            const itemsLength = e.value ? true : false
                            await formik.setValues({ ...formik.values, itemsLength })
                          }
                        }}
                        placeholder="Select Product"
                      />
                    </div> */}
                    <div className="field col-12 lg:col-2 mt-2">
                      <span className="p-float-label">
                        <InputNumber
                          id={`product-prixe-${i}`}
                          name="price_per_unit"
                          value={Number(ele.price_per_unit)}
                          onChange={(e) => handleFormChange(e, i)}
                          // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                        />
                        <label
                        // className={classNames({ "p-error": isFormFieldValid("name") })}
                        >
                          Target price per unit
                        </label>
                      </span>
                      {/* {getFormErrorMessage("name")} */}
                    </div>
                    <div className="field col-12 lg:col-2 mt-2">
                      <span className="p-float-label">
                        <InputNumber
                          id={`product-qty-${i}`}
                          name="quantity"
                          value={Number(ele.quantity)}
                          onChange={(e) => handleFormChange(e, i)}
                          // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                        />
                        <label
                        // className={classNames({ "p-error": isFormFieldValid("name") })}
                        >
                          Quantity
                        </label>
                      </span>
                      {/* {getFormErrorMessage("name")} */}
                    </div>
                    <div className="field col-6 lg:col-1 mt-2">
                      <span className="p-buttonset">
                        {i === itemList.length - 1 && (
                          <Button type="button" label="+" onClick={addFields} />
                        )}
                        {itemList.length > 1 && (
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
                </>
              ))}
              <div className="m-auto text-2xl">{getFormErrorMessage("itemsLength")}</div>
            </div>

            <div className="flex mx-4 ">
              <Button
                type="submit"
                className="mr-2"
                label={rfqEditState ? "UPDATE" : "ADD"}
                onClick={async (e) => {}}
              />
              <Button
                className="mr-2 p-button-secondary"
                label="Cancel"
                onClick={(e) => {
                  e.preventDefault()
                  setRfqDialog(false)
                  setRfqEditState(false)
                  setRfqDetails({
                    rfq_code: "",
                    rfq_description: "",
                    expected_dod: "",
                    rfq_email: [],
                  })

                  formik.resetForm()
                }}
              />
            </div>
          </form>
        </div>
      </div>
      <ScannedProducts
        products={products}
        scanner={scanner}
        setScanner={setScanner}
        setItemList={setItemList}
        setRfqDialog={setRfqDialog}
        newRFQCode={newRFQCode}
        setRfqDetails={setRfqDetails}
        rfqDetails={rfqDetails}
      />

      <CreateNewPo
        products={products}
        purchaseDialog={purchaseDialog}
        setPurchaseDialog={setPurchaseDialog}
        vendor_products={vendor_products}
        toast={toast}
        vendors={vendors}
        purchaseDetails={purchaseDetails}
        itemList={poItemList}
        setItemList={setPoItemList}
        initialItemState={initialPoItemState}
        setErrorMsgs={setRfqErrorMsgs}
        rfQCode={newRFQCode}
        // activeRow={activeRow}
        // poEditState={poEditState}
      />
      {/* <CreatePo
        rfqData={activeRow}
        productOptions={productOptions}
        removeFields={removeFields}
        vendor_products={vendor_products}
        products={products}
        purchaseDialog={purchaseDialog}
        setPurchaseDialog={setPurchaseDialog}
        prefixes={prefixes}
      /> */}
      <div className="col-12">
        <div className="card">
          <DataTable
            value={tableRFQ}
            // scrollable
            // scrollHeight="60vh"
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
            filterDisplay="menu"
            emptyMessage="No Results found."
          >
            <Column expander={allowExpansion} style={{ width: "3em" }} />
            {/* <Column
          field="id"
          header="ID"
          body={({ id }) => `${prefixes[1].prefix}-${id}`}
          // className="text-center"
        /> */}
            <Column
              field="rfq_code"
              header="Code"
              filter
              filterPlaceholder="Search by Code"
              // className="text-center"
            />
            <Column
              field="rfq_description"
              header="Description"
              filter
              filterPlaceholder="Search by Description"
              // className="text-center"
            />
            {/* <Column
              field="expected_dod"
              header="Delivery date"
              body={(tableRFQ) => new Date(tableRFQ.expected_dod).toLocaleDateString()}

              // className="text-center"
            /> */}

            <Column
              header="Created at"
              filterField="createdAt"
              dataType="date"
              body={(rowData) => moment(new Date(rowData.createdAt)).format("DD-MM-YYYY, HH:MM")}
              filter
              filterElement={dateFilterTemplate}

              // className="text-center"
            />
            <Column
              header="Updated at"
              filterField="updatedAt"
              dataType="date"
              body={(rowData) => moment(new Date(rowData.updatedAt)).format("DD-MM-YYYY, HH:MM")}
              filter
              filterElement={dateFilterTemplate}

              // className="text-center"
            />
            <Column
              field="active"
              header="Status"
              body={(rowData) => {
                return (
                  <span className={`badge status-${rowData.active ? "active" : "inactive"}`}>
                    {rowData.active ? "Active" : "Inactive"}
                  </span>
                )
              }}
              filter
              filterElement={statusFilterTemplate}
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
                        // console.log("event", event)
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

const RfqsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <RfqsList />
      </Layout>
    </Suspense>
  )
}

export default RfqsPage
