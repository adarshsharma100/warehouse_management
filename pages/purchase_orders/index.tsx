import { Suspense, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import Layout from "layouts/Layout"
import { Column } from "primereact/column"
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
import { undefined } from "zod"
import createManyPurchase_order_product from "app/purchase_order_products/mutations/createManyPurchase_order_product"
import deletePurchase_order from "app/purchase_orders/mutations/deletePurchase_order"
import deletePurchase_order_product from "app/purchase_order_products/mutations/deletePurchase_order_product"
import getRfq_products from "app/rfq_products/queries/getRfq_products"

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
  const [createPurchaseOrderMutation] = useMutation(createPurchase_order)
  const [createManyPurchaseOrderProductsMutation] = useMutation(createManyPurchase_order_product)
  const [deletePurchase_orderMutation] = useMutation(deletePurchase_order)
  const [deletePurchase_orderParoductMutation] = useMutation(deletePurchase_order_product)
  console.log("rfqs: ", rfqs)
  console.log("vendor_products: ", vendor_products)
  console.log("vendors: ", vendors)
  console.log("purchase_order_products: ", purchase_order_products)
  console.log("purchase_orders: ", purchase_orders)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [activeProducts, setActiveProducts] = useState([])
  const [productOptions, setProductOptions] = useState([])
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
    },
  ])
  const [purchaseDetails, setPurchaseDetails] = useState({
    vendor_vendor_id: "",
    po_code: "",
    po_name: "",
    expiry_date: "",
    expected_delivery: "",
    from_party: "",
    agreement: "",
    rfq_id: "",
  })

  const rfqOptions = rfqs.map(({ id, rfq_name, rfq_code }) => {
    return { name: `${rfq_code}:${rfq_name}`, value: id }
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
  console.log("tablePurchaseOrders: ", tablePurchaseOrders)
  const tableProducts = purchase_order_products.map((ele) => {
    return {
      ...ele,
      product_name: ele?.vendor_products?.products.name,
      product_sku: ele?.vendor_products?.products.products_sku,
    }
  })

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
    console.log("many", e)
    let data = [...itemList]
    e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)
    console.log("many ", data)
    setItemList(data)
  }

  return (
    <div>
      <Dialog
        header="Product List"
        visible={productDialog}
        style={{ width: "60vw" }}
        // footer={renderFooter}
        onHide={() => setProductDialog(false)}
      >
        <DataTable
          value={activeProducts}
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
          <Column
            field="pop_id"
            header="ID"
            // className="text-center"
          />
          <Column
            field="product_sku"
            header="Product SKU"
            // className="text-center"
          />
          <Column
            field="product_name"
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
      </Dialog>

      <Dialog
        header="Create PO "
        visible={purchaseDialog}
        style={{ width: "80vw" }}
        // footer={renderFooter}
        onHide={() => setPurchaseDialog(false)}
      >
        <form
          onSubmit={
            // async
            () => {
              console.log("purchase details", purchaseDetails)
              // const rfc = await createRFQMutation({ ...rfqDetails })
              // console.log(" rfc:132 ", rfc)
              // const many = itemList.map((ele) => {
              //   return {
              //     rfq_id: rfc.id,
              //     price_per_unit: Number(ele.price_per_unit),
              //     products_product_id: Number(ele.products_product_id),
              //     quantity: Number(ele.quantity),
              //   }
              // })
              // console.log("many: ", many)
              // try {
              //   await createRFQProductMutation(many)
              // } catch (error: any) {
              //   console.log("error: ", error)
              // }
              // await refetch()
            }
          }
          className="p-fluid"
        >
          <div className="flex justify-content-between mt-2 mb-2 pt-4">
            <Dropdown
              className="mr-2 w-28rem"
              // name="products_product_id"
              // disabled={editState}
              optionLabel="name"
              value={purchaseDetails.vendor_vendor_id}
              options={vendorOptions}
              onChange={(e) => {
                setPurchaseDetails({ ...purchaseDetails, vendor_vendor_id: e.value })
                const productOptionsList = vendor_products
                  .filter(({ vp_id }) => {
                    return vp_id === e.value
                  })
                  .map(({ vp_id, products }) => {
                    return { name: products.name, value: vp_id }
                  })
                setProductOptions(productOptionsList)
              }}
              placeholder="Select Vendor"
            />
            {/* <Dropdown
              className="mr-2 w-16rem"
              // name="products_product_id"
              // disabled={editState}
              optionLabel="name"
              value={purchaseDetails.rfq_id}
              options={rfqOptions}
              onChange={(e) => {
                const all = rfq_products.filter(({rfq_id}) => {
                  return rfq_id==e.value
                }).map re
                setPurchaseDetails({ ...purchaseDetails, rfq_id: e.value })
              }}
              placeholder="Select RFQ to prefill values"
            /> */}

            <div className="p-float-label">
              <InputText
                name=""
                className="mr-2 w-22rem"
                value={purchaseDetails.po_code}
                onChange={(e) =>
                  setPurchaseDetails({ ...purchaseDetails, po_code: e.target.value })
                }
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                PO Code
              </label>
            </div>
            <div className="p-float-label">
              <InputText
                className="mr-2 w-22rem"
                value={purchaseDetails.po_name}
                onChange={(e) =>
                  setPurchaseDetails({ ...purchaseDetails, po_name: e.target.value })
                }
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                PO Name
              </label>
            </div>
          </div>
          <div className="flex justify-content-between mt-2 mb-2 pt-4">
            <div className="p-float-label">
              <Calendar
                className="mr-2 w-16rem"
                id="basic"
                value={purchaseDetails.expiry_date}
                onChange={(e) =>
                  setPurchaseDetails({
                    ...purchaseDetails,
                    expiry_date: e.value,
                  })
                }
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                Expiry Date
              </label>
            </div>
            <div className="p-float-label">
              <Calendar
                className="mr-2 w-16rem"
                id="basic"
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
            <div className="p-float-label">
              <InputText
                className="mr-2 w-16rem"
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
            <div className="p-float-label">
              <InputText
                className="mr-2 w-16rem"
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
          <div>Select Items</div>
          <hr />

          {itemList.map((ele, i) => {
            return (
              <div key={i} className="flex justify-content-between mt-2 pt-4">
                <Dropdown
                  className="mr-2 w-20rem"
                  name="vendor_products_vp_id"
                  // disabled={editState}
                  optionLabel="name"
                  value={ele?.vendor_products_vp_id}
                  options={productOptions}
                  onChange={(e) => handleFormChange(e, i)}
                  placeholder="Select  Product"
                />
                <div className="p-label ">
                  <label className="mr-2">Price per unit</label>
                  <InputNumber
                    name="price_per_unit"
                    className="mr-2 w-20rem"
                    onChange={(e) => handleFormChange(e, i)}
                  />
                </div>
                <div className="p-label ">
                  <label className="mr-2">Quantity</label>
                  <InputNumber
                    name="quantity"
                    value={Number(ele.quantity)}
                    className="mr-2 w-20rem"
                    // onChange={(e) => handleFormChange(e, i)}
                    onChange={(e) => handleFormChange(e, i)}
                  />
                </div>
                <Button
                  type="button"
                  disabled={itemList.length <= 1}
                  icon="pi pi-minus"
                  className="m-2 p-button-rounded "
                  onClick={() => removeFields(i)}
                />
              </div>
            )
          })}

          <div className="flex justify-content-end">
            <Button
              type="button"
              icon="pi pi-plus"
              className="m-2 p-button-rounded "
              onClick={addFields}
            />
          </div>
          <div className="flex justify-content-end">
            <Button
              type="button"
              className="col-3 mr-2 mt-2"
              label="CREATE"
              onClick={async () => {
                console.log("purchase details", purchaseDetails)

                const purchaseOrder = await createPurchaseOrderMutation({
                  vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                  po_code: purchaseDetails.po_code,
                  po_name: purchaseDetails.po_name,
                  expiry_date: new Date(purchaseDetails.expiry_date),
                  expected_delivery: new Date(purchaseDetails.expected_delivery),
                  from_party: purchaseDetails.from_party,
                  agreement: purchaseDetails.agreement,
                  rfq_id: Number(purchaseDetails.rfq_id) ?? undefined,
                })
                console.log("purchaseOrder: ", purchaseOrder)
                const many = itemList.map((ele) => {
                  const product_id = vendor_products.filter((item) => {
                    return Number(ele.vendor_products_vp_id) === Number(item.vp_id)
                  })[0].products_product_id
                  console.log("many", ele)
                  return {
                    purchase_order_po_id: purchaseOrder?.po_id ?? "",
                    // purchase_order_po_id: 1,
                    purchase_order_purchase_order_status_pos_id: 1,
                    purchase_order_vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                    vendor_products_vp_id: Number(ele.vendor_products_vp_id),
                    vendor_products_vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                    vendor_products_products_product_id: Number(product_id),
                    quantity: Number(ele.quantity),
                    price_per_unit: Number(ele.price_per_unit),
                    received_quantity: 0,
                  }
                })
                console.log("many: ", many)
                try {
                  const result = await createManyPurchaseOrderProductsMutation(many)
                  console.log("error: ", result)
                } catch (error: any) {
                  console.log("error: ", error)
                }
                await refetch()
              }}
            />
          </div>
        </form>
      </Dialog>
      <h2>Purchase Orders</h2>
      <div className="flex justify-content-end mb-2 ">
        <Button
          icon="pi pi-plus"
          label="Create PO"
          onClick={() => setPurchaseDialog(true)}
        ></Button>
      </div>
      <DataTable
        value={tablePurchaseOrders}
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
        <Column
          field="po_id"
          header="ID"
          // className="text-center"
        />
        <Column
          field="po_name"
          header="Name"
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
          // className="text-center"
        />
        <Column
          // field="vendor_gstin"
          header="Action"
          body={(rowData) => {
            return (
              <div>
                {/* <Button
                  // label="Edit"
                  icon="pi pi-pencil"
                  className="m-1"
                  // onClick={() => {
                  //   setActiveVendor(true)
                  //   setVendorDetails({ ...rowData })
                  //   setVendorDialog(true)
                  // }}
                /> */}
                <Button
                  label="Delete"
                  icon="pi pi-trash "
                  className="mb-1 w-8rem"
                  onClick={async () => {
                    await deletePurchase_orderParoductMutation({
                      purchase_order_po_id: rowData.po_id,
                    })
                    await deletePurchase_orderMutation({ po_id: rowData.po_id })
                    await refetch()
                  }}
                />
                <Button
                  label=" Products"
                  icon="pi pi-external-link"
                  className="w-8rem"
                  onClick={() => {
                    const active = tableProducts.filter(({ purchase_order_po_id }) => {
                      return purchase_order_po_id === rowData.po_id
                    })
                    console.log("active: ", active)
                    setActiveProducts(active)
                    setProductDialog(true)
                  }}
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
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <Purchase_ordersList />
      </Layout>
    </Suspense>
  )
}

export default Purchase_ordersPage
