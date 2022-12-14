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
import getPrefixes from "app/prefixes/queries/getPrefixes.ts"

const ITEMS_PER_PAGE = 100

export const Purchase_ordersList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ purchase_orders, hasMore }, { refetch }] = usePaginatedQuery(getPurchase_orders, {
    orderBy: { po_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ purchase_order_products }] = usePaginatedQuery(getPurchase_order_products, {
    orderBy: { pop_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ vendors }] = usePaginatedQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ vendor_products }] = usePaginatedQuery(getVendor_products, {
    orderBy: { vp_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ rfqs }] = usePaginatedQuery(getRfqs, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ rfq_products }] = usePaginatedQuery(getRfq_products, {
    orderBy: { rfq_products_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ products }] = useQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [{ prefixes }] = useQuery(getPrefixes, {
    orderBy: { id: "asc" },
  })
  const [createPurchaseOrderMutation] = useMutation(createPurchase_order)
  const [updatePurchaseOrderMutation] = useMutation(updatePurchase_order)

  const [createManyPurchaseOrderProductsMutation] = useMutation(createManyPurchase_order_product)
  const [deletePurchase_orderMutation] = useMutation(deletePurchase_order)
  const [deletePurchase_orderParoductMutation] = useMutation(deletePurchase_order_product)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [activeProducts, setActiveProducts] = useState([])
  const [filterProductOptions, setFilterProductOptions] = useState([])
  const [itemList, setItemList] = useState([
    {
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
    },
  ])
  const [purchaseDetails, setPurchaseDetails] = useState({
    vendor_vendor_id: "",
    po_code: "",
    po_description: "",
    expiry_date: "",
    expected_delivery: "",
    from_party: "",
    agreement: "",
    rfq_id: "",
  })
  // console.log(purchaseDetails)
  const [activeRow, setActiveRow] = useState({})
  const [poEditState, setPoEditState] = useState(false)

  const menu = useRef<Menu>(null)

  const rfqOptions = rfqs.map(({ id, rfq_description, rfq_code }) => {
    return { name: `${rfq_code}:${rfq_description}`, value: id }
  })
  const vendorOptions = vendors.map(({ vendor, vendor_id, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      value: vendor_id,
    }
  })

  const tablePurchaseOrders = purchase_orders.map((ele) => {
    return {
      ...ele,
      approved_on: moment(ele.approved_on).format("DD-MM-YYYY, HH:MM"),
      created_at: moment(ele.created_at).format("DD-MM-YYYY, HH:MM"),
      expected_delivery: moment(new Date(ele.expected_delivery)).format("DD-MM-YYYY"),
      expiry_date: moment(new Date(ele.expiry_date)).format("DD-MM-YYYY"),
      updated_on: moment(ele.updated_on).format("DD-MM-YYYY, HH:MM"),
      po_status: ele.purchase_order_status.pos_name,
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
    console.log("index12123: ", itemList)
    // console.log("index12123 ", index)
    // let data = [...itemList]
    // const data2 = data.splice(index, 1)
    // console.log("index12123: ", itemList)
    // setItemList(data2)
    setItemList(itemList.filter((data, i) => index !== i))
  }

  const handleFormChange = (e: any, i: number) => {
    // console.log("many", e)
    let data = [...itemList]
    // e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)

    if (e.target) {
      data[i][e.target.name] = e.value
      data[i].vendor_products_vp_id = findProductVpID(i)
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
          command: () => {
            setPoEditState(true)
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
            const active = tableProducts.filter(
              (ele) => activeRow.po_id === ele.purchase_order_po_id
            )

            setItemList(active)
            setPurchaseDialog(true)
          },
        },
        {
          label: "View Products",
          icon: "pi pi-external-link",
          command: () => {
            const active = tableProducts.filter(({ purchase_order_po_id }) => {
              return purchase_order_po_id === activeRow.po_id
            })
            console.log("active: ", active)
            setActiveProducts(active)
            setProductDialog(true)
          },
        },
        {
          label: "Update Status",
          icon: "pi pi-chevron-circle-up",
          command: () => {},
        },
        {
          label: "Generate Gatepass",
          icon: "pi pi-file",
          command: () => {},
        },
        {
          label: "Generate GRN",
          icon: "pi pi-file",
          command: () => {},
        },
        {
          label: "Set as Recurrent",
          icon: "pi pi-replay",
          command: () => {},
        },
        {
          label: "Approve",
          icon: "pi pi-check-circle",
          command: () => {},
        },
      ],
    },
  ]
  const productOptions = products.map(({ product_id, name, vendor_products }) => {
    return {
      name,
      value: product_id,
      vendorID: vendor_products.map((ele) => ele.vendor_vendor_id),
    }
  })

  const [expandedRows, setExpandedRows] = useState(null)

  const findProductVpID = (i) => {
    const currentVendor = Number(purchaseDetails.vendor_vendor_id)
    const vendorProducts = vendor_products.filter((item) => item.vendor_vendor_id === currentVendor)
    const vpId = vendorProducts.filter(
      (ele) => ele.products_product_id === Number(itemList[i]?.products_product_id)
    )[0]?.vp_id

    return vpId
  }

  const rowExpansionTemplate = (data) => {
    return (
      <div className="w-full">
        <h3>Products List:</h3>
        <DataTable
          value={data.purchase_order_products}
          responsiveLayout="scroll"
          showGridlines
          // header={renderHeader}
          stripedRows
          className="text-s datatable-responsive w-full"
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
    )
  }

  useEffect(() => {
    const vendorID = purchaseDetails.vendor_vendor_id
    const filterProducts = productOptions.filter((ele) => ele.vendorID.includes(Number(vendorID)))
    setFilterProductOptions(filterProducts)
  }, [purchaseDetails])

  return (
    <div>
      <h4>Purchase Orders</h4>
      <div className="flex justify-content-end mb-2 ">
        <Button
          icon="pi pi-plus"
          label="Create PO"
          onClick={() => {
            setPoEditState(false)
            setPurchaseDialog(!purchaseDialog)
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
            setItemList([
              {
                purchase_order_po_id: "",
                purchase_order_purchase_order_status_pos_id: 1,
                purchase_order_vendor_vendor_id: "",
                vendor_products_vp_id: "",
                vendor_products_vendor_vendor_id: "",
                vendor_products_products_product_id: "",
                quantity: "",
                price_per_unit: "",
                received_quantity: 0,
              },
            ])
            setFilterProductOptions([])
          }}
        ></Button>
      </div>
      <div
        className={`card ${
          purchaseDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <form
          onSubmit={
            // async
            () => {
              console.log("purchase details", purchaseDetails)
            }
          }
          className="p-fluid"
        >
          <h5>Create PO</h5>
          <div className="formgrid grid">
            <div className="col-12">
              <h6>PO Details:</h6>
              <hr />
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <Dropdown
                // className="mr-2 w-22rem"
                value={purchaseDetails.vendor_vendor_id}
                options={vendorOptions}
                onChange={(e) => {
                  setPurchaseDetails({
                    ...purchaseDetails,
                    vendor_vendor_id: e.target.value,
                  })
                }}
                optionLabel="name"
                filter
                showClear
                filterBy="name"
                placeholder="Select Vendor"
                // valueTemplate={selectedCountryTemplate}
                // itemTemplate={countryOptionTemplate}
              />
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <span className="p-float-label">
                <InputText
                  id="po_code"
                  name=""
                  // className="mr-2 w-22rem"
                  value={purchaseDetails.po_code}
                  onChange={(e) =>
                    setPurchaseDetails({ ...purchaseDetails, po_code: e.target.value })
                  }
                />
                <label htmlFor="po_code">PO Code</label>
              </span>
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <span className="p-float-label">
                <InputText
                  id="po_description"
                  // className="mr-2 w-22rem"
                  value={purchaseDetails.po_description}
                  onChange={(e) =>
                    setPurchaseDetails({ ...purchaseDetails, po_description: e.target.value })
                  }
                />
                <label htmlFor="po_description">PO Description</label>
              </span>
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <Calendar
                  id="expiry_date"
                  minDate={new Date()}
                  // className="mr-2 w-22rem"
                  // id="basic"
                  value={purchaseDetails.expiry_date}
                  onChange={(e) =>
                    setPurchaseDetails({
                      ...purchaseDetails,
                      expiry_date: e.value,
                    })
                  }
                />
                <label htmlFor="expiry_date">Expiry Date</label>
              </div>
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <Calendar
                  minDate={new Date()}
                  // className="mr-2 w-22rem"
                  // id="basic"
                  value={purchaseDetails.expected_delivery}
                  onChange={(e) =>
                    setPurchaseDetails({
                      ...purchaseDetails,
                      expected_delivery: e.value,
                    })
                  }
                />
                <label
                // htmlFor={ele.field}
                // className={classNames({ "p-error": isFormFieldValid("name") })}
                >
                  Expected Delivery
                </label>
              </div>
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <InputText
                  // className="mr-2 w-22rem"
                  value={purchaseDetails.agreement}
                  onChange={(e) =>
                    setPurchaseDetails({ ...purchaseDetails, agreement: e.target.value })
                  }
                />
                <label
                // htmlFor={ele.field}
                // className={classNames({ "p-error": isFormFieldValid("name") })}
                >
                  Agreement
                </label>
              </div>
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <InputText
                  // className="mr-2 w-22rem"
                  value={purchaseDetails.from_party}
                  onChange={(e) =>
                    setPurchaseDetails({ ...purchaseDetails, from_party: e.target.value })
                  }
                />
                <label
                // htmlFor={ele.field}
                // className={classNames({ "p-error": isFormFieldValid("name") })}
                >
                  From Party
                </label>
              </div>
            </div>
            <div className="col-12 mt-3 mb-3 ">
              <h6>Select Products</h6>
              <hr />
            </div>
            {itemList.map((ele, i) => (
              <>
                <div key={`PO-product-${i}`} className="field col-12 lg:col-7 mt-2">
                  <Dropdown
                    // className="mr-2 w-20rem"
                    name="products_product_id"
                    // disabled={editState}
                    filter
                    showClear
                    filterBy="name"
                    placeholder="Select a Product"
                    optionLabel="name"
                    value={ele?.products_product_id}
                    options={filterProductOptions}
                    onChange={(e) => {
                      handleFormChange(e, i)
                      const productPrice = products.filter((item) => item.product_id === e.value)[0]
                        ?.Price
                      let data = [...itemList]
                      e.target
                        ? (data[i].price_per_unit = productPrice)
                        : (data[i].price_per_unit = 0)
                      setItemList(data)
                      // console.log(findProductVpID(i))
                    }}
                  />
                </div>

                <div className="field col-12 lg:col-2 mt-2">
                  <span className="p-float-label ">
                    <InputNumber
                      name="price_per_unit"
                      // className="mr-2 w-20rem"
                      value={Number(ele.price_per_unit)}
                      onChange={(e) => handleFormChange(e, i)}
                    />
                    <label>Price per unit</label>
                  </span>
                </div>
                <div className="field col-12 lg:col-2 mt-2">
                  <span className="p-float-label ">
                    <InputNumber
                      name="quantity"
                      value={Number(ele.quantity)}
                      // className="mr-2 w-20rem"
                      onChange={(e) => handleFormChange(e, i)}
                    />
                    <label className="mr-2">Quantity</label>
                  </span>
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

                {/* <Button
                  type="button"
                  disabled={itemList.length <= 1}
                  icon="pi pi-minus"
                  className="m-2 p-button-rounded "
                  onClick={() => removeFields(i)}
                /> */}
              </>
            ))}
          </div>
          <Divider />
          <div className="flex mt-">
            <Button
              type="button"
              className=" mr-2"
              label="ADD"
              onClick={async (e) => {
                console.log("purchaseDetails", purchaseDetails)
                console.log("activeRow", activeRow)
                console.log("itemList", itemList)
                const data = purchase_order_products
                  .filter((ele) => ele.purchase_order_po_id === activeRow.po_id)
                  .map((ele) => ele.pop_id)
                console.log("data", data)
                // const existingProductsPopIDs = [...itemList.map((ele) => ele.pop_id)]
                const newProductsPopIDs = itemList.map((ele) => ele.pop_id)
                // console.log(existingProductsPopIDs)
                const newProducts = itemList.filter((ele) => !ele.pop_id)
                const existingProducts = itemList.filter((ele) => ele.pop_id)
                const deletelist = data.filter((item) => {
                  const array = itemList.map((ele) => ele.pop_id)
                  return !array.includes(item)
                })
                if (poEditState) {
                  // updatePurchaseOrderMutation

                  try {
                    const update = await updatePurchaseOrderMutation({
                      po_id: activeRow.po_id,
                      ...purchaseDetails,
                      purchase_order_products: {
                        create: newProducts.map((ele) => ({
                          quantity: Number(ele.quantity),
                          price_per_unit: Number(ele.price_per_unit),
                          received_quantity: 0,
                          vendor_products: {
                            connect: {
                              vp_id: Number(ele.vendor_products_vp_id),
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
                    })

                    console.log(update)
                  } catch (error) {
                    console.log(error)
                  }
                } else {
                  try {
                    const purchaseOrder = await createPurchaseOrderMutation({
                      vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                      po_code: purchaseDetails.po_code,
                      po_description: purchaseDetails.po_description,
                      expiry_date: new Date(purchaseDetails.expiry_date),
                      expected_delivery: new Date(purchaseDetails.expected_delivery),
                      from_party: purchaseDetails.from_party,
                      agreement: purchaseDetails.agreement,
                      // rfq_id: Number(purchaseDetails.rfq_id) ?? undefined,
                      purchase_order_products: {
                        create: itemList.map((ele) => ({
                          quantity: Number(ele.quantity),
                          price_per_unit: Number(ele.price_per_unit),
                          received_quantity: 0,
                          vendor_products: {
                            connect: {
                              vp_id: Number(ele.vendor_products_vp_id),
                            },
                          },
                        })),
                      },
                    })
                    setPurchaseDialog(!purchaseDialog)
                    console.log("purchaseOrder: ", purchaseOrder)
                  } catch (error) {
                    console.log("error: ", error)
                  }
                }

                // const many = itemList.map((ele) => {
                //   const product_id = vendor_products.filter((item) => {
                //     return Number(ele.vendor_products_vp_id) === Number(item.vp_id)
                //   })[0].products_product_id
                //   console.log("many", ele)
                //   return {
                //     purchase_order_po_id: purchaseOrder?.po_id ?? "",
                //     // purchase_order_po_id: 1,
                //     purchase_order_purchase_order_status_pos_id: 1,
                //     purchase_order_vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                //     vendor_products_vp_id: Number(ele.vendor_products_vp_id),
                //     vendor_products_vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                //     vendor_products_products_product_id: Number(product_id),
                //     quantity: Number(ele.quantity),
                //     price_per_unit: Number(ele.price_per_unit),
                //     received_quantity: 0,
                //   }
                // })
                // console.log("many: ", many)
                // try {
                //   const result = await createManyPurchaseOrderProductsMutation(many)
                //   console.log("error: ", result)
                // } catch (error: any) {
                //   console.log("error: ", error)
                // }
                await refetch()
                setPurchaseDialog(!purchaseDialog)
              }}
            />
            <Button
              className="mr-2 p-button-secondary"
              label="Cancel"
              onClick={(e) => {
                e.preventDefault()
                setPurchaseDialog(!purchaseDialog)
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
                setItemList([
                  {
                    purchase_order_po_id: "",
                    purchase_order_purchase_order_status_pos_id: 1,
                    purchase_order_vendor_vendor_id: "",
                    vendor_products_vp_id: "",
                    vendor_products_vendor_vendor_id: "",
                    vendor_products_products_product_id: "",
                    quantity: "",
                    price_per_unit: "",
                    received_quantity: 0,
                  },
                ])
              }}
            />
          </div>
        </form>
      </div>
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
      >
        {/* <Column
            field="po_id"
            header="ID"
            // className="text-center"
          /> */}
        <Column field="details" header="See More Details" expander={true} />
        <Column field="po_id" header="ID" body={({ po_id }) => `${prefixes[2].prefix}-${po_id}`} />

        <Column
          field="po_description"
          header="Description"
          // className="text-center"
        />
        <Column
          field="po_code"
          header="Code"
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
          // className="text-center"
        />
        <Column
          field="po_status"
          header="Status"
          // className="text-center"
        />
        {/* <Column
          field="ordered_qty"
          header="Ordered Quantity"
          // className="text-center"
        />
        <Column
          field="received_qty"
          header="Recieved Quantity"
          // className="text-center"
        />

        <Column
          field="total"
          header="Total Value"
          // className="text-center"
        /> */}
        <Column
          field="updated_on"
          header="Updated on"
          // className="text-center"
        />
        <Column
          field="from_party"
          header="From Party"
          // className="text-center"
        />
        <Column
          field="expiry_date"
          header="Expiry Date"
          // className="text-center"
        />
        <Column
          field="expected_delivery"
          header="Expected Delivery"
          // className="text-center"
        />
        <Column
          field="agreement"
          header="Agreement"
          className="overflow-hidden"
          style={{ width: "10px" }}
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
