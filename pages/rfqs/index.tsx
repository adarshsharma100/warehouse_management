import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { InputNumber } from "primereact/inputnumber"
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
import { Menu } from "primereact/menu"
import { InputTextarea } from "primereact/inputtextarea"
import { mail } from "../../helperFunctions/mail"
import { Chips } from "primereact/chips"
import axios from "axios"
const ITEMS_PER_PAGE = 100

export const RfqsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ rfqs, hasMore }, { refetch }] = usePaginatedQuery(getRfqs, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ products }] = usePaginatedQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ rfq_products }] = usePaginatedQuery(getRfq_products, {
    orderBy: { rfq_products_id: "asc" },
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
  console.log("vendor_products: ", vendor_products)
  console.log("rfq_products: ", rfq_products)
  // console.log("rfqs: ", rfqs)
  console.log("vendors: ", vendors)
  console.log("active2: ", vendor_products)
  const [sendDialog, setSendDialog] = useState(false)
  const [createRFQMutation] = useMutation(createRfq)
  const [updateRFQMutation] = useMutation(updateRfq)
  const [createRFQProductMutation] = useMutation(createManyRfq_products)
  const [deleteRFQProductMutation] = useMutation(deleteRfq_product)
  const [deleteRFQMutation] = useMutation(deleteRfq)
  const [createManyPurchaseOrderProductsMutation] = useMutation(createManyPurchase_order_product)
  // const [updateManyRfqProductsMutation] = useMutation(updateManyRfq_products)
  const [updateRfqProductMutation] = useMutation(updateRfq_product)
  const [createPurchaseOrderMutation] = useMutation(createPurchase_order)
  const productOptions = products.map(({ product_id, name }) => {
    return { name, value: product_id }
  })
  const menu = useRef<Menu>(null)
  // console.log("rfqs: ", rfqs)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [rfqDialog, setRfqDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const [purchaseProductOption, setPurchaseProductOption] = useState([])
  const [vendorChangeState, setVendorChangeState] = useState(false)
  const [rfqDetails, setRfqDetails] = useState({
    rfq_code: "",
    rfq_description: "",
    expected_dod: "",
  })
  const [rfqEditState, setRfqEditState] = useState(false)
  const [activeRfqId, setActiveRfqId] = useState("")
  const [productItemList, setProductItemList] = useState([
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
      product_name: "",
      vendor_unit_: "",
      product_id: "",
    },
  ])
  const [itemList, setItemList] = useState([
    { products_product_id: "", quantity: "", price_per_unit: "" },
  ])
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

    setProductItemList(activeProductsdetails)
  }, [vendorChangeState])

  console.log("tableRfqProducts: ", tableRfqProducts)
  const tableRFQ = rfqs.map((ele) => {
    return {
      ...ele,
      created_at: moment(ele.created_at).format("DD-MM-YYYY, HH:MM"),
      updated_at: moment(ele.updated_at).format("DD-MM-YYYY, HH:MM"),
      // name: ele.products.name,
    }
  })
  const options = vendors.map(({ vendor, vendor_id, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      value: vendor_id,
    }
  })
  const rfqOptions = rfqs.map(({ rfq_code, rfq_description, id }) => {
    return {
      name: `${rfq_code}: ${rfq_description}`,
      value: id,
    }
  })
  console.log("rfqOptions: ", rfqOptions)
  const [vendorOptions, setVendorOptions] = useState(options)
  const addFields = () => {
    let newfield = { products_product_id: "", quantity: "", price_per_unit: "" }

    setItemList([...itemList, newfield])
  }
  const removeFields = (index) => {
    // console.log("index12123: ", itemList)
    // console.log("index12123 ", index)
    // let data = [...itemList]
    // data.splice(parseInt(index), 1)
    // console.log("index12123: ", itemList)
    // setItemList(data)
    setItemList(itemList.filter((data, i) => index !== i))
  }
  const addFieldsPurchase = () => {
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
      product_name: "",
      vendor_unit_: "",
      product_id: "",
    }

    setProductItemList([...productItemList, newfield])
  }
  const removeFieldsPurchase = (index) => {
    console.log("index12123: ", itemList)
    console.log("index12123 ", index)
    let data = [...productItemList]
    const data2 = data.splice(index, 1)
    console.log("index12123: ", itemList)
    setProductItemList(data2)
  }
  const handleFormChange = (e: any, i: number) => {
    let data = [...itemList]
    e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)
    setItemList(data)
  }
  const handleProductFormChange = (e: any, i: number) => {
    let data = [...productItemList]
    e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)
    setProductItemList(data)
  }
  // {
  //     "id": 1,
  //     "created_at": "2022-09-30T10:14:46.000Z",
  //     "updated_at": "2022-09-30T10:14:46.000Z",
  //     "expected_dod": 4,
  //     "products_product_id": 1,
  //     "products_inventory_products_inventory_product_id": 1,
  //     "quantity": 50,
  //     "price_per_unit": "400"
  // }
  const items = [
    {
      label: "Options",
      items: [
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: () => {
            setRfqEditState(true)
            setRfqDetails({
              rfq_code: activeRow.rfq_code,
              rfq_description: activeRow.rfq_description,
              expected_dod: activeRow.expected_dod,
              id: activeRow.id,
            })
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
            console.log("active: ", active)
            // setActiveRfq(active)
            setRfqDialog(true)
            // setActiveVendor(true)
            // setVendorDetails({ ...rowData })
            // setVendorDialog(true)
          },
        },
        {
          label: "Delete",
          icon: "pi pi-trash",
          command: async () => {
            // await deleteRFQProductMutation({ rfq_id: activeRow.id })
            // await deleteRFQMutation({ id: activeRow.id })
            // await refetch()
          },
        },
        {
          label: "View Products",
          icon: "pi pi-external-link",
          command: () => {
            const active = tableRfqProducts.filter(({ rfq_id }) => {
              return rfq_id === activeRow.id
            })
            //  console.log("active: ", active)
            setActiveRfq(active)
            setProductDialog(true)
          },
        },
        {
          label: "Create PO",
          icon: "pi pi-plus",
          command: () => {
            const active = tableRfqProducts.filter(({ rfq_id }) => {
              return rfq_id === activeRow.id
            })
            const activeProducts = active.map(({ products }) => {
              return products.product_id
            })
            const activeVendors = vendors
              .filter(({ vendor_products }) => {
                const products = vendor_products.map(({ products_product_id }) => {
                  return products_product_id
                })
                console.log("products:421 ", products)
                return activeProducts.every((ele) => {
                  return products.includes(ele)
                })
                // return products.every((ele) => {
                //   return activeProducts.includes(ele)
                // })
              })
              .map(({ vendor, vendor_id }) => {
                return { name: vendor, value: vendor_id }
              })
            console.log("products:421 ", activeProducts)
            const activeProductsdetails = vendor_products

              .filter(({ products, vendor }) => {
                return (
                  activeProducts.includes(products.product_id) &&
                  vendor.vendor_id == activeVendors[0]?.value
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

            // TDO take quantity from rfq
            const activeProductsOptions = activeProductsdetails.map((ele) => {
              return { name: ele.product_name, value: ele.product_id }
            })

            console.log("active: ", active)
            console.log("activeVendors: ", activeVendors)
            console.log("activeProductsdetails: ", activeProductsdetails)
            setPurchaseProductOption(activeProductsOptions)
            setVendorOptions(activeVendors)
            setActiveRfq(active)
            setActiveRfqId(activeRow.id)
            setProductItemList(activeProductsdetails)
            // setActiveRow(rowData)
            setPurchaseDialog(true)
          },
        },
        {
          label: "Send Quotation",
          icon: "pi pi-send",
          command: () => {
            setSendDialog(true)
          },
        },
      ],
    },
  ]

  return (
    <div>
      <Dialog
        header="Send Quotaions"
        visible={sendDialog}
        style={{ width: "50vw" }}
        // footer={renderFooter("displayBasic")}
        onHide={() => setSendDialog(false)}
      >
        <div className="p-float-label mt-5">
          {/* <InputText
            // name=""
            className="mr-2 w-full"
            value={purchaseDetails.po_code}
            onChange={(e) => setPurchaseDetails({ ...purchaseDetails, po_code: e.target.value })}
          /> */}
          <Chips
            className="mr-2 w-full"
            value={mailDetails.to}
            onChange={(e) => setMailDetails({ ...mailDetails, to: e.value })}
          />

          <label
          // htmlFor={ele.field}
          // className={classNames({ "p-error": isFormFieldValid("name") })}
          >
            To
          </label>
        </div>
        <div className="p-float-label mt-5">
          <InputText
            // name=""
            className="mr-2 w-full"
            value={mailDetails.subject}
            onChange={(e) => setMailDetails({ ...mailDetails, subject: e.target.value })}
          />
          <label
          // htmlFor={ele.field}
          // className={classNames({ "p-error": isFormFieldValid("name") })}
          >
            Subject
          </label>
        </div>
        <div className="p-float-label mt-5">
          <InputTextarea
            // name=""
            rows={15}
            className="mr-2 w-full"
            value={mailDetails.message}
            onChange={(e) => setMailDetails({ ...mailDetails, message: e.target.value })}
          />
          <label
          // htmlFor={ele.field}
          // className={classNames({ "p-error": isFormFieldValid("name") })}
          >
            Message
          </label>
        </div>
        <div className="w-full flex justify-content-end mt-2 pl-2">
          <Button
            icon="pi pi-send"
            label="Send"
            onClick={() => {
              const data = JSON.stringify({
                to: JSON.stringify(mailDetails.to),
                subject: mailDetails.subject,
                message: mailDetails.message,
              })

              var config = {
                method: "post",
                url: "http://localhost:3000/api/rfq",
                headers: {
                  "Content-Type": "application/json",
                  // Cookie:
                  //   "industrial-poc_sAnonymousSessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJibGl0empzIjp7ImlzQW5vbnltb3VzIjp0cnVlLCJoYW5kbGUiOiJqckZqQ2MwblE5UEVvYV92d25teEs3WGU0bjRoeDhySTphand0IiwicHVibGljRGF0YSI6eyJ1c2VySWQiOm51bGx9LCJhbnRpQ1NSRlRva2VuIjoiZGRWaTNNU1M3WE1GLWlBS1E5YTFJRmtkWnJMdThfWlUifSwiaWF0IjoxNjY0NzcyNTk2LCJhdWQiOiJibGl0empzIiwiaXNzIjoiYmxpdHpqcyIsInN1YiI6ImFub255bW91cyJ9.tn2TauSX_KSb4BbavfsXnOkn_m1fe_x0UCx8woCYZdk; industrial-poc_sAntiCsrfToken=ddVi3MSS7XMF-iAKQ9a1IFkdZrLu8_ZU; industrial-poc_sPublicDataToken=eyJ1c2VySWQiOm51bGx9",
                },
                data: data,
              }

              axios(config)
                .then(function (response) {
                  console.log(JSON.stringify(response.data))
                })
                .catch(function (error) {
                  console.log(error)
                })
              // mail(
              //   "care@robocraze.com",
              //   mailDetails.to,
              //   mailDetails.subject,
              //   mailDetails.message,
              //   null,
              //   null,
              //   null
              // )
            }}
          />
        </div>
      </Dialog>
      <Dialog
        header="Create PO "
        visible={purchaseDialog}
        style={{ width: "80vw" }}
        // footer={renderFooter}
        onHide={() => {
          setActiveRfq([])
          setPurchaseProductOption([])
          setProductItemList([])
          setPurchaseDialog(false)
          setPurchaseDetails({
            vendor_vendor_id: "",
            po_code: "",
            po_description: "",
            expiry_date: "",
            expected_delivery: "",
            from_party: "",
            agreement: "",
            rfq_id: null,
          })
        }}
      >
        <form
          onSubmit={async () => {
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
          }}
          className="p-fluid"
        >
          <div className="flex justify-content-between mt-2 mb-2 pt-4">
            <Dropdown
              className="mr-2 w-16rem"
              name="products_product_id"
              // disabled={editState}
              optionLabel="name"
              value={purchaseDetails.vendor_vendor_id}
              options={vendorOptions}
              onChange={(e) => {
                setPurchaseDetails({ ...purchaseDetails, vendor_vendor_id: e.value })
                setVendorChangeState(!vendorChangeState)
              }}
              placeholder="Select Vendor"
            />
            <Dropdown
              className="mr-2 w-16rem"
              // name="products_product_id"
              disabled={true}
              optionLabel="name"
              value={purchaseDetails.rfq_id ?? activeRfqId}
              options={rfqOptions}
              onChange={(e) => setPurchaseDetails({ ...purchaseDetails, rfq_id: e.value })}
              // onChange={(e) => handleFormChange(e, i)}
              placeholder="Select RFQ to prefill values"
            />
            <div className="p-float-label">
              <InputText
                // name=""
                className="mr-2 w-16rem"
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
                className="mr-2 w-16rem"
                value={purchaseDetails.po_description}
                onChange={(e) =>
                  setPurchaseDetails({ ...purchaseDetails, po_description: e.target.value })
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
          {vendorOptions.length > 0 ? (
            productItemList.map((ele, i) => {
              return (
                <div key={i} className="flex justify-content-between align-items-center mt-2 pt-4">
                  <Dropdown
                    className="mr-2 w-20rem"
                    name="products_product_id"
                    // disabled={editState}
                    filter
                    showClear
                    filterBy="name"
                    placeholder="Select a Product"
                    optionLabel="name"
                    value={ele.product_id}
                    options={purchaseProductOption}
                    onChange={(e) => handleProductFormChange(e, i)}
                  />
                  <div className="flex-column ">
                    <div className="p-label ">
                      <label className="mr-2">Price per unit</label>
                      <InputNumber
                        name="price_per_unit"
                        className="mr-2 w-20rem"
                        onChange={(e) => handleProductFormChange(e, i)}
                      />
                    </div>
                    <div className="flex justify-content-around">
                      {purchaseDetails?.vendor_vendor_id && (
                        <span className="p-error">
                          vendor price:{ele?.vendor_unit_price ?? "-"}
                        </span>
                      )}
                      <span className="p-error">
                        Target price:
                        {activeRfq.filter(({ products }) => {
                          return Number(products.product_id) === Number(ele.product_id)
                        })[0]?.price_per_unit ?? "-"}
                      </span>
                    </div>
                  </div>
                  <div className="p-label ">
                    <label className="mr-2">Quantity</label>
                    <InputNumber
                      name="quantity"
                      className="mr-2 w-20rem"
                      value={
                        activeRfq.filter(({ products }) => {
                          return Number(products.product_id) === Number(ele.product_id)
                        })[0]?.quantity ?? ""
                      }
                      onChange={(e) => handleProductFormChange(e, i)}
                      // onChange={(e) => handleFormChange(e, i)}
                    />
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex justify-content-center">
              <div className="p-error">No vendor matches RFQ product List</div>
            </div>
          )}
          {/* <div className="flex justify-content-end">
            <Button
              type="button"
              icon="pi pi-minus"
              disabled={productItemList.length < 1}
              className="m-2 p-button-rounded "
              onClick={removeFieldsPurchase}
            />

            <Button
              type="button"
              icon="pi pi-plus"
              className="m-2 p-button-rounded "
              onClick={addFieldsPurchase}
            />
          </div> */}
          <div className="flex justify-content-end mt-2">
            <Button
              type="button"
              className="col-3 mr-2 mt-2"
              label="CREATE"
              onClick={async () => {
                const purchaseOrder = await createPurchaseOrderMutation({
                  vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                  po_code: purchaseDetails.po_code,
                  po_description: purchaseDetails.po_description,
                  expiry_date: new Date(purchaseDetails.expiry_date),
                  expected_delivery: new Date(purchaseDetails.expected_delivery),
                  from_party: purchaseDetails.from_party,
                  agreement: purchaseDetails.agreement,
                  rfq_id: Number(activeRfqId) ?? undefined,
                })
                console.log("purchaseOrder: ", purchaseOrder)
                console.log("productItemList: ", productItemList)
                const list = productItemList.map((ele) => {
                  return {
                    purchase_order_po_id: purchaseOrder?.po_id ?? "",
                    // purchase_order_po_id: 8,
                    purchase_order_purchase_order_status_pos_id: 1,
                    purchase_order_vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                    vendor_products_vp_id: Number(ele.vendor_products_vp_id),
                    vendor_products_vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                    vendor_products_products_product_id: Number(ele.product_id),
                    quantity: Number(ele.quantity),
                    price_per_unit: Number(ele.price_per_unit),
                    received_quantity: 0,
                  }
                })
                try {
                  const result = await createManyPurchaseOrderProductsMutation(list)
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

      <Dialog
        header="Product List"
        visible={productDialog}
        style={{ width: "60vw" }}
        // footer={renderFooter}
        onHide={() => setProductDialog(false)}
      >
        <DataTable
          value={activeRfq}
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
            field="rfq_products_id"
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
        header="Create RFQ"
        visible={rfqDialog}
        style={{ width: "60vw" }}
        // footer={renderFooter}
        onHide={() => setRfqDialog(false)}
      >
        <form
          onSubmit={async () => {
            if (rfqEditState) {
              await updateRFQMutation({ ...rfqDetails })
              try {
                itemList.forEach(async (ele) => {
                  await updateRfqProductMutation({
                    rfq_id: Number(rfqDetails.id),
                    price_per_unit: Number(ele.price_per_unit),
                    products_product_id: Number(ele.products_product_id),
                    quantity: Number(ele.quantity),
                    rfq_products_id: Number(ele.rfq_products_id),
                  })
                })
              } catch (error: any) {
                console.log("error: ", error)
              }
            } else {
              const rfc = await createRFQMutation({ ...rfqDetails })
              // console.log(" rfc:132 ", rfc)

              const many = itemList.map((ele) => {
                return {
                  rfq_id: rfc.id,
                  price_per_unit: Number(ele.price_per_unit),
                  products_product_id: Number(ele.products_product_id),
                  quantity: Number(ele.quantity),
                }
              })
              console.log("many: ", many)
              try {
                const result = await createRFQProductMutation(many)
                console.log("error: ", result)
              } catch (error: any) {
                console.log("error: ", error)
              }
            }

            await refetch()
          }}
          className="p-fluid"
        >
          <div className="flex justify-content-between mt-2 mb-2 pt-4">
            <div className="p-float-label">
              <InputText
                name=""
                className="mr-2 w-15rem"
                value={rfqDetails.rfq_code}
                onChange={(e) => setRfqDetails({ ...rfqDetails, rfq_code: e.target.value })}
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                RFQ Code
              </label>
            </div>

            <div className="p-float-label">
              <InputText
                className="mr-2 w-15rem"
                value={rfqDetails.rfq_description}
                onChange={(e) => setRfqDetails({ ...rfqDetails, rfq_description: e.target.value })}
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                RFQ Description
              </label>
            </div>
            <div className="p-float-label">
              <InputText
                className="mr-2 w-15rem"
                value={rfqDetails.expected_dod}
                onChange={(e) => setRfqDetails({ ...rfqDetails, expected_dod: e.target.value })}
              />
              <label
              // htmlFor={ele.field}
              // className={classNames({ "p-error": isFormFieldValid("name") })}
              >
                Delivery time
              </label>
            </div>
          </div>
          <div>Select Items</div>
          <hr />
          {itemList.map((ele, i) => {
            return (
              <div key={i} className="flex justify-content-between align-items-center mt-2 pt-4">
                <Dropdown
                  className="mr-2 w-15rem"
                  name="products_product_id"
                  filter
                  showClear
                  filterBy="name"
                  placeholder="Select a Product"
                  // disabled={editState}
                  optionLabel="name"
                  value={ele.products_product_id}
                  options={productOptions}
                  onChange={(e) => handleFormChange(e, i)}
                />
                <div className="p-label ">
                  <label
                    className="mr-2"
                    // htmlFor={ele.field}
                    // className={classNames({ "p-error": isFormFieldValid("name") })}
                  >
                    Price per unit
                  </label>
                  <InputNumber
                    name="price_per_unit"
                    value={Number(ele.price_per_unit)}
                    className="mr-2 w-12rem"
                    onChange={(e) => handleFormChange(e, i)}
                  />
                </div>
                <div className="p-label ">
                  <label
                    className="mr-2"
                    // htmlFor={ele.field}
                    // className={classNames({ "p-error": isFormFieldValid("name") })}
                  >
                    Quantity
                  </label>
                  <InputNumber
                    name="quantity"
                    value={Number(ele.quantity)}
                    className="mr-2 w-12rem"
                    onChange={(e) => handleFormChange(e, i)}
                    // onChange={(e) => handleFormChange(e, i)}
                  />
                </div>
                <Button
                  type="button"
                  disabled={itemList.length <= 1}
                  icon="pi pi-minus"
                  className="m-2 p-button-rounded "
                  onClick={() => removeFields(i)}
                  // onClick={}
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
              type="submit"
              onClick={async () => {
                // const many =
                // console.log("many: ", many)
                // try {
                //   const error = await updateManyRfqProductsMutation(many)
                //   console.log("error: ", error)
                // } catch (error: any) {
                //   console.log("error: ", error)
                // }
              }}
              className="col-3 mr-2 mt-2"
              label={rfqEditState ? "UPDATE" : "CREATE"}
            />
          </div>
        </form>
      </Dialog>
      <h4>Request for Quotations</h4>
      <div className="flex justify-content-end mb-2 ">
        <Button
          icon="pi pi-plus"
          label="Create RFQ"
          onClick={() => {
            setRfqEditState(false)
            setRfqDetails({ rfq_code: "", rfq_description: "", expected_dod: "" })
            setItemList([{ products_product_id: "", quantity: "", price_per_unit: "" }])
            setRfqDialog(true)
          }}
        ></Button>
      </div>
      <DataTable
        value={tableRFQ}
        scrollable
        scrollHeight="60vh"
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
          field="id"
          header="ID"
          // className="text-center"
        />
        <Column
          field="rfq_code"
          header="Code"
          // className="text-center"
        />
        <Column
          field="rfq_description"
          header="Description"
          // className="text-center"
        />
        <Column
          field="expected_dod"
          header="Delivery days"

          // className="text-center"
        />

        <Column
          field="created_at"
          header="Created at"
          // className="text-center"
        />
        {/* <Column
          field="updated_at"
          header="Updated at"
          // className="text-center"
        /> */}
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

const RfqsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <RfqsList />
      </Layout>
    </Suspense>
  )
}

export default RfqsPage
