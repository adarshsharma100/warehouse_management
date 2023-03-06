import { useMutation, useQuery } from "@blitzjs/rpc"
import getAgreement_terms from "app/agreement_terms/queries/getAgreement_terms"
import {
  arrayFillCopy,
  calenderDateFormat,
  createSearchFunction,
  tError,
  tsuccess,
  tWarn,
  toDateObj,
} from "app/constants"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updatePurchase_order from "app/purchase_orders/mutations/updatePurchase_order"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import getPurchase_order_products from "app/purchase_order_products/queries/getPurchase_order_products"
import getPurchase_order_statuses from "app/purchase_order_statuses/queries/getPurchase_order_statuses"
import { useFormik } from "formik"
import moment from "moment"
import { AutoComplete } from "primereact/autocomplete"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Checkbox } from "primereact/checkbox"
// import { Chips } from "primereact/Chips"
import { Chips } from "primereact/chips"
import { Divider } from "primereact/divider"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { classNames } from "primereact/utils"
import React, { useEffect, useRef, useState } from "react"
import { FALSE } from "sass"
import * as Yup from "yup"
import LoaderFullScreen from "./LoaderFullScreen"

const CreateNewPo = React.forwardRef((props, ref) => {
  const {
    purchaseDetails,
    itemList,
    setItemList,
    activeRow,
    setActiveRow,
    poEditState,
    setPoEditState,
    toast,
    purchaseDialog,
    setPurchaseDialog,
    vendor_products,
    vendors,
    products,
    initialItemState,
    setErrorMsgs,
    refetchFuns,
    rfqCode,
    scrollToPo,
    editForm,
    purchase_orders,
    setSendPoDialog,
  } = props

  // const [{ prefixes }, { error: getPrefixesError }] = useQuery(getPrefixes, {
  //   orderBy: { id: "asc" },
  // })
  // const [{ purchase_orders }, { error: getPoError }] = useQuery(getPurchase_orders, {
  //   orderBy: { po_id: "asc" },
  // })
  // const [{ purchase_order_products }, { error: getPoProductsError }] = useQuery(
  //   getPurchase_order_products,
  //   {
  //     orderBy: { pop_id: "asc" },
  //   }
  // )
  // const [{ agreement_terms: poTerms }, { error: agreementTermsError }] = useQuery(
  //   getAgreement_terms,
  //   {
  //     where: { for: "po" },
  //     orderBy: { id: "asc" },
  //   }
  // )
  // const [{ purchase_order_statuses: poStatusList }, { error: PO_statusError }] = useQuery(
  //   getPurchase_order_statuses,
  //   {
  //     orderBy: { id: "asc" },
  //   }
  // )
  const poStatusList = [
    {
      "id": 1,
      "name": "Created ",
      "description": "The PO has been successfully created."
    },
    {
      "id": 2,
      "name": "Waiting for approval",
      "description": "The PO is sent for approval and waiting to be"
    },
    {
      "id": 3,
      "name": "Approved",
      "description": "The PO has been approved to be placed with/em"
    },
    {
      "id": 4,
      "name": "Completed ",
      "description": "All the items in the Purchase Order have been"
    },
    {
      "id": 5,
      "name": "Cancelled ",
      "description": " All items in the PO have been cancelled befo"
    },
    {
      "id": 6,
      "name": "Rejected ",
      "description": "The PO has been rejected."
    },
    {
      "id": 7,
      "name": "Amended",
      "description": "The PO has been updated/edited after being ap"
    },
    {
      "id": 8,
      "name": "In-transit",
      "description": null
    },
    {
      "id": 9,
      "name": "Partially Fulfilled",
      "description": null
    }
  ]

  const poTerms = [
    {
      "id": 1,
      "name": "Net-07",
      "description": "Net-07",
      "for": "po"
    },
    {
      "id": 2,
      "name": "Net-30",
      "description": "Net-30",
      "for": "po"
    },
    {
      "id": 3,
      "name": "100% Advance",
      "description": "100% Advance",
      "for": "po"
    },
    {
      "id": 4,
      "name": "Net-50",
      "description": "Net-50",
      "for": "po"
    },
    {
      "id": 5,
      "name": "Net-45",
      "description": "Net-45",
      "for": "po"
    },
    {
      "id": 6,
      "name": "50% Advance",
      "description": "50% Advance",
      "for": "po"
    },
    {
      "id": 7,
      "name": "Bought Against",
      "description": "Bought Against",
      "for": "po"
    },
    {
      "id": 8,
      "name": "Delivery",
      "description": "Delivery",
      "for": "po"
    },
    {
      "id": 9,
      "name": "RFQ-terms",
      "description": "RFQ-terms",
      "for": "rfq"
    },
    {
      "id": 10,
      "name": "High and Critical",
      "description": "High and Critical",
      "for": "rfq"
    },
    {
      "id": 11,
      "name": "Priority",
      "description": "Priority",
      "for": "rfq"
    },
    {
      "id": 12,
      "name": "Quotation Validity",
      "description": "Quotation Validity",
      "for": "rfq"
    }
  ]

  const prefixes = [
    {
      "id": 1,
      "name": "PRODUCT",
      "prefix": "PROD"
    },
    {
      "id": 2,
      "name": "RFQ",
      "prefix": "RFQ"
    },
    {
      "id": 3,
      "name": "PO",
      "prefix": "PO"
    },
    {
      "id": 4,
      "name": "GRN",
      "prefix": "GRN"
    }
  ]

  // console.log("activeRow form po component", activeRow)

  const [createPurchaseOrderMutation, { isLoading: creatingPO, error: creatingMutationError }] =
    useMutation(createPurchase_order)
  const [updatePurchaseOrderMutation, { isLoading: UpdatingPO, error: updatingMutationError }] =
    useMutation(updatePurchase_order)
  const [createNotificationsMutations, { error: notificationCreationError }] =
    useMutation(createNotifications_sent)
  const user = useCurrentUser()
  const { id, role, name, email } = user

  const [newPOCode, setNewPOCode] = useState("")
  const [poCodeChecked, setPoCodeChecked] = useState<boolean>(true)
  const [priorList, setPriorList] = useState([])
  const [showPriorList, setShowPriorList] = useState(false)
  const [pastVendors, setPastVendors] = useState([])
  const [readOnlyForm, setReadOnlyForm] = useState(true)
  const [amendingPO, setAmendingPO] = useState(false)
  React.useImperativeHandle(ref, () => ({
    setReadOnlyForm,
    formik,
  }))

  const [filterProductOptions, setFilterProductOptions] = useState<any>(null)
  const [vendorSuggestions, setVendorSuggestions] = useState<any>(null)
  const [ProductsSuggestions, setProductsSuggestions] = useState<any>(null)

  const [poFilteredAgreements, setPoFilteredAgreements] = useState<any>(null)
  const [fromPartySuggetions, setFromPartySuggetions] = useState<any>(null)
  const [termsSuggetions, setTermsSuggetions] = useState<any>(null)

  const agreementTermsEnum = ["Approved", "Waiting For Approval"]
  const agreementTermsOptions = agreementTermsEnum.map((ele) => ({
    name: ele,
  }))

  // console.log(purchase_orders[0])

  const fromParty = [{ name: "TIF-Banaswadi" }, { name: "TIF-Rajajinagar" }, { name: "TIF-Hennur" }]
  const terms = [
    { name: "Net-0df7" },
    { name: "Net-30ff" },
    { name: "Net-4ff5" },
    { name: "Net-5ff0" },
    { name: "100% Adfvance" },
    { name: "50% Advaffnce" },
    { name: "Bought Agfainst" },
    { name: "Bought Agaffinst" },
    { name: "Delivery" },
  ]

  const prevVendor = useRef()
  const createNewPOCode = () => {
    const poPrefix = prefixes.filter((prefix) => prefix.name === "PO")[0]?.name
    const nextPoId = purchase_orders.length + 1
    setNewPOCode(`${poPrefix}#${nextPoId}`)
  }
  const productOptions = products.map(
    ({ product_id, name, vendor_products, Price, products_sku }) => {
      return {
        name: `${products_sku} - ${name}`,
        product_id,
        vendorID: vendor_products.map((ele) => ele.vendor_vendor_id),
        Price,
      }
    }
  )
  const vendorOptions = vendors.map(({ vendor, vendor_id, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      vendor_id,
    }
  })
  const handleFormChange = (e: any, i: number) => {
    let data = [...itemList]
    if (e.target) {
      data[i][e.target.name] = e.value
    } else {
      data[i][e.originalEvent.target.name] = e.value
    }
    setItemList(data)
  }
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

    const fields = arrayFillCopy(2, newfield)

    setItemList([...itemList, ...fields])
  }
  const removeFields = (index) => {
    setItemList(itemList.filter((data, i) => index !== i))
  }

  // useEffect(() => {
  //   const ErrorArray = [updatingMutationError, creatingMutationError, getPoProductsError]

  //   const msg = []

  //   for (let err of ErrorArray) {
  //     if (err) {
  //       msg.push(err)
  //     }
  //   }
  //   setErrorMsgs(msg)
  // }, [updatingMutationError, creatingMutationError, getPoProductsError])

  useEffect(() => {
    createNewPOCode()
  })

  useEffect(() => {
    if (poEditState) {
      updatePoValues().catch((error) => {
        console.log("While setting po values", error)
      })
    }
  }, [poEditState, activeRow])

  const updatePoValues = async () => {
    const {
      vendor,
      vendor_vendor_id,
      po_code,
      po_description,
      expiry_date,
      expected_delivery,
      from_party,
      agreement_terms,
      agreement,
      rfq_id,
      purchase_order_status,
      purchase_order_terms: terms,
    } = activeRow

    const expiry = toDateObj(expiry_date)
    const expected = toDateObj(expected_delivery)
    await formik.setValues({
      vendor,
      vendor_vendor_id,
      po_code,
      po_description,
      expiry_date: expiry,
      expected_delivery: expected,
      from_party,
      // agreement: agreement_terms?.replaceAll("_", " "),
      rfq_id,
      itemsLength: true,
      purchase_order_status,
      terms,
    })
  }

  const searchProducts = createSearchFunction(filterProductOptions, setProductsSuggestions)
  const searchVendor = createSearchFunction(vendorOptions, setVendorSuggestions)
  const searchAgreement = createSearchFunction(poStatusList, setPoFilteredAgreements)
  const searchFromParty = createSearchFunction(fromParty, setFromPartySuggetions)
  const searchTerms = createSearchFunction(poTerms, setTermsSuggetions)

  const findProductVpID = (i, list) => {
    const currentVendor = Number(formik.values.vendor_vendor_id)
    const vendorProducts = vendor_products.filter((item) => item.vendor_vendor_id === currentVendor)
    const vpId = vendorProducts.filter(
      (ele) => ele.products_product_id === Number(list[i]?.products_product_id)
    )[0]?.vp_id

    return vpId
  }

  const formik = useFormik({
    initialValues: purchaseDetails,
    validationSchema: Yup.object().shape({
      vendor_vendor_id: Yup.string().required("*Required"),
      po_code: Yup.string().required("*Required"),
      // po_description: Yup.string().required("*Required"),
      expiry_date: Yup.string().required("*Required"),
      expected_delivery: Yup.string().required("*Required"),
      from_party: Yup.string().required("*Required"),
      // purchase_order_status: Yup.mixed().required("*Required"),
      vendor: Yup.string().required("*Required"),
      // terms: Yup.mixed().required("*Required"),
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

      const productList = itemList.filter((ele, i) => ele.products_product_id)

      console.log("PO Form:", { ...data, productList })

      setAmendingPO(false)
      return

      console.log("data", data)

      const removeEmptyItems = itemList.filter((ele, i) => ele.products_product_id)
      console.log("removeEmptyItems: ", removeEmptyItems)

      const {
        vendor_vendor_id,
        po_code,
        expiry_date,
        expected_delivery,
        po_description,
        from_party,
        terms,
        purchase_order_status,
      } = data
      // const activePoProducts = purchase_order_products
      //   .filter((ele) => ele.purchase_order_po_id === activeRow?.po_id)
      //   .map((ele) => ele?.pop_id)

      // const existingProductsPopIDs = [...itemList.map((ele) => ele.pop_id)]
      const newProductsPopIDs = itemList.map((ele) => ele.pop_id)
      // console.log(existingProductsPopIDs)
      const newProducts = itemList.filter((ele) => !ele.pop_id)
      const existingProducts = itemList.filter((ele) => ele.pop_id)
      // const deletelist = activePoProducts.filter((item) => {
      //   const array = itemList.map((ele) => ele.pop_id)
      //   return !array.includes(item)
      // })

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
                    // in: deletelist,
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
          console.log("purchaseDetails", purchaseDetails)
          console.log("itemList", itemList)
          const purchaseOrder = await createPurchaseOrderMutation(
            {
              vendor_vendor_id: Number(vendor_vendor_id),
              po_code,
              po_description,
              expiry_date: new Date(expiry_date),
              expected_delivery: new Date(expected_delivery),
              from_party,
              agreement_terms_id: Number(terms?.id),
              purchase_order_status_id: Number(purchase_order_status?.id),
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
                setPriorList([])
                setShowPriorList(false)
              },
            }
          )
          console.log("purchaseOrder: ", purchaseOrder)
          setPurchaseDialog(false)
          formik.resetForm()
        } catch (error) {
          console.log("error: ", error)
        }
      }

      refetchFuns?.forEach(async (ele) => await ele())

      // await refetch()
      // await refetchPoProducts()
    },
  })
  // console.log("formik.errors", formik.errors)
  // console.log("priorList", priorList)
  console.log("formik.values", formik.values)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }
  // onVendor Change
  useEffect(() => {
    const selectedVendor = formik.values?.vendor_vendor_id
    console.log("selectedVendor: ", selectedVendor)

    const selectedVendorEmails = vendors
      .filter((vendor) => vendor.vendor_id === selectedVendor)[0]
      ?.vendor_email?.map((email) => email)
    // console.log("formik.values - emails: ", selectedVendorEmails)

    updateFormValues({ vendor_Emails: selectedVendorEmails }).catch((error) =>
      console.log("formikvalueserror", error)
    )

    // saving previous Vendors
    const slicedArray = pastVendors.slice(-1)
    setPastVendors([
      ...slicedArray,
      { vendor: formik.values.vendor, vendor_id: formik.values.vendor_vendor_id },
    ])

    const vendorID = formik.values.vendor_vendor_id
    const filterProducts = productOptions.filter((ele) => ele.vendorID.includes(Number(vendorID)))
    // console.log("filterProducts", filterProducts)

    setFilterProductOptions(filterProducts)
    if (!poEditState) {
      // const itemListIds = itemList.map((ele) => ele.product_id)
      const vendorProductsIds = filterProducts.map((ele) => ele.product_id)

      const values = itemList.filter((ele, i) =>
        vendorProductsIds.includes(ele.products_product_id)
      )
      const priorValues = itemList.filter(
        (ele, i) => !vendorProductsIds.includes(ele.products_product_id) && ele.products_product_id
      )
      priorValues.length ? setShowPriorList(true) : setShowPriorList(false)
      //setShowPriorList(priorValues.length > 0)

      // console.log("priorValues", priorValues.length)

      setPriorList([...priorValues])
      //   const itemlistIds = itemList.map((ele) => ele.products_product_id)
      //   const valuesIds = values.map((ele) => ele.products_product_id)
      const initialState = values?.length
      let count = initialState >= 5 ? 1 : 5 - values?.length

      const emptyFields = arrayFillCopy(count, initialItemState)

      setItemList([...values, ...emptyFields])
    }

    // if (rfQCode) {
    // }
  }, [formik?.values.vendor_vendor_id])

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

  return (
    <div
      className={`col-12 ${purchaseDialog
        ? "visible scalein animation-duration-200"
        : "hidden scaleout animation-duration-200"
        }`}
    >
      {creatingPO && <LoaderFullScreen />}
      {UpdatingPO && <LoaderFullScreen />}
      <div className={`card`}>
        <form onSubmit={formik.handleSubmit} on className="p-fluid ">
          <div className="flex justify-content-between">
            {/* <h5>{`${poEditState ? "Update" : "Create"} PO`}</h5> */}
            <h5>{`${readOnlyForm ? "PO-Details" : poEditState ? "UPDATE-PO" : "CREATE-PO"}`}</h5>
            {poEditState && (
              <div>
                <Button
                  disabled={false}
                  icon="pi pi-pencil"
                  className="m-1"
                  tooltip="Edit-PO"
                  tooltipOptions={{ position: "top" }}
                  onClick={(e) => {
                    e.preventDefault()

                    const activePOStatus = activeRow.purchase_order_status.name

                    if (activePOStatus === "Approved") {
                      toast?.current.show(tWarn(null, "PO already Approved Cannot Edit"))
                      // toast?.current.show(tsuccess(null, "Cannot change Status already Approved"))
                    } else {
                      setReadOnlyForm(!readOnlyForm)
                    }
                  }}
                />
                <Button
                  disabled={false}
                  icon="pi pi-send"
                  className="m-1"
                  tooltip="Send Mail"
                  tooltipOptions={{ position: "top" }}
                  onClick={(e) => {
                    e.preventDefault()
                    const activePOStatus = activeRow.purchase_order_status?.name
                    console.log("activePOStatus: ", activePOStatus)

                    if (!["Approved", "Amended"].includes(activePOStatus)) {
                      toast?.current.show(tWarn(null, "Can only  send mail if PO is Approved "))
                      // toast?.current.show(tsuccess(null, "Cannot change Status already Approved"))
                    } else {
                      setActiveRow({ ...activeRow, ...formik.values })
                      setSendPoDialog(true)
                    }
                  }}
                />
                <Button
                  icon="bi bi-file-text"
                  className="m-1"
                  tooltip="Amend PO"
                  tooltipOptions={{ position: "top" }}
                  onClick={async (e) => {
                    e.preventDefault()
                    setAmendingPO(true)
                    setPoEditState(false)
                    setReadOnlyForm(false)
                    await updateFormValues({ po_code: newPOCode, amendedFrom: activeRow.po_code })
                  }}
                />
                <Button
                  icon="pi pi-info-circle"
                  className="m-1"
                  tooltip="Amend PO"
                  tooltipOptions={{ position: "top" }}
                  onClick={async (e) => {
                    e.preventDefault()
                    window.location.href = `/purchase_orders/${activeRow.po_id}`
                  }}
                />
              </div>
            )}
          </div>
          <div className="formgrid grid">
            <div className="col-12">
              {/* <h6>PO Details:</h6> */}
              <hr />
            </div>
            <div className="col-12 mt-2 flex mb-2">
              <span className="p-float-label lg:col-4 pl-0">
                <InputText
                  id="po_code"
                  name=""
                  // className="mr-2 w-22rem"
                  value={formik.values.po_code}
                  onChange={formik.handleChange}
                  disabled={poCodeChecked}
                  className={classNames({ "p-invalid": isFormFieldValid("po_code") })}
                />
                <label
                  htmlFor="po_code"
                  className={classNames({ "p-error": isFormFieldValid("po_code") })}
                >
                  PO Code
                </label>
              </span>
              {getFormErrorMessage("po_code")}
              <div className="field-checkbox mt-3">
                <Checkbox
                  id="poCode"
                  onChange={(e) => setPoCodeChecked(e.checked)}
                  checked={poCodeChecked}
                  disabled={poEditState}
                />
                <label htmlFor="poCode">Un-check to add custom code.</label>
              </div>
            </div>
            <div className="field col-12 md:col-3 lg:col-4  mt-2 ">
              <div className="p-float-label">
                <AutoComplete
                  id="vendor_vendor_id"
                  // disabled={editState}
                  disabled={readOnlyForm}
                  value={formik.values.vendor}
                  dropdown
                  forceSelection
                  suggestions={vendorSuggestions}
                  completeMethod={searchVendor}
                  field="name"
                  onChange={async (e) => {
                    let vendor_vendor_id =
                      typeof e.value === "string" ? e.value : e.value?.vendor_id
                    let vendor = typeof e.value === "string" ? e.value : e.value?.name

                    await formik.setValues({
                      ...formik.values,
                      vendor_vendor_id,
                      vendor,
                    })
                  }}
                  aria-label="products"
                  dropdownAriaLabel="Select Product"
                  className={classNames({ "p-invalid": isFormFieldValid("vendor_vendor_id") })}
                />

                <label
                  htmlFor="vendor_vendor_id"
                  className={classNames({ "p-error": isFormFieldValid("vendor_vendor_id") })}
                >
                  Select Vendor
                </label>
              </div>
              {getFormErrorMessage("vendor_vendor_id")}
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <span className="p-float-label">
                <InputText
                  id="po_description"
                  disabled={readOnlyForm}
                  value={formik.values.po_description}
                  onChange={formik.handleChange}
                  className={classNames({ "p-invalid": isFormFieldValid("po_description") })}
                  autoFocus
                />
                <label
                  htmlFor="po_description"
                  className={classNames({ "p-error": isFormFieldValid("po_description") })}
                >
                  PO Description
                </label>
              </span>
              {getFormErrorMessage("po_description")}
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <Calendar
                  id="expiry_date"
                  disabled={readOnlyForm}
                  minDate={new Date()}
                  // id="basic"
                  value={formik.values.expiry_date}
                  onChange={formik.handleChange}
                  className={classNames({ "p-invalid": isFormFieldValid("expiry_date") })}
                  dateFormat={calenderDateFormat()}
                />
                <label
                  htmlFor="expiry_date"
                  className={classNames({ "p-error": isFormFieldValid("expiry_date") })}
                >
                  Expiry Date
                </label>
              </div>
              {getFormErrorMessage("expiry_date")}
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <Calendar
                  minDate={new Date()}
                  // className="mr-2 w-22rem"
                  id="expected_delivery"
                  disabled={readOnlyForm}
                  value={formik.values.expected_delivery}
                  onChange={formik.handleChange}
                  className={classNames({ "p-invalid": isFormFieldValid("expected_delivery") })}
                  dateFormat={calenderDateFormat()}
                />
                <label
                  htmlFor="expected_delivery"
                  className={classNames({ "p-error": isFormFieldValid("expected_delivery") })}
                >
                  Expected Delivery
                </label>
              </div>
              {getFormErrorMessage("expected_delivery")}
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <AutoComplete
                  id="purchase_order_status"
                  disabled={readOnlyForm}
                  value={formik?.values?.purchase_order_status?.name}
                  suggestions={poFilteredAgreements}
                  completeMethod={searchAgreement}
                  // forceSelection
                  dropdown
                  field="name"
                  onChange={async (e) => {
                    let purchase_order_status = typeof e.value === "string" ? e.value : e.value

                    await formik.setValues({
                      ...formik.values,
                      purchase_order_status,
                    })
                  }}
                  aria-label="Po Status"
                  dropdownAriaLabel="Po Status"
                  className={classNames({ "p-invalid": isFormFieldValid("purchase_order_status") })}
                />

                <label
                  htmlFor="purchase_order_status"
                  className={classNames({ "p-error": isFormFieldValid("purchase_order_status") })}
                >
                  PO Status
                </label>
              </div>
              {getFormErrorMessage("purchase_order_status")}
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <AutoComplete
                  id="from_party"
                  disabled={readOnlyForm}
                  value={formik.values.from_party}
                  suggestions={fromPartySuggetions}
                  completeMethod={searchFromParty}
                  dropdown
                  field="name"
                  onChange={async (e) => {
                    let from_party = typeof e.value === "string" ? e.value : e.value.name

                    await formik.setValues({
                      ...formik.values,
                      from_party,
                    })
                  }}
                  aria-label="FromParty Options"
                  dropdownAriaLabel="FromParty Options"
                  className={classNames({ "p-invalid": isFormFieldValid("from_party") })}
                />

                <label
                  htmlFor="from_party"
                  className={classNames({ "p-error": isFormFieldValid("from_party") })}
                >
                  From Party
                </label>
              </div>
              {getFormErrorMessage("from_party")}
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <span className="p-float-label">
                <InputText
                  id="terms"
                  disabled={readOnlyForm}
                  value={formik.values.terms}
                  onChange={formik.handleChange}
                  className={classNames({ "p-invalid": isFormFieldValid("terms") })}
                  autoFocus
                />
                <label
                  htmlFor="terms"
                  className={classNames({ "p-error": isFormFieldValid("terms") })}
                >
                  PO Terms
                </label>
              </span>
              {getFormErrorMessage("terms")}
            </div>
            {amendingPO && (
              <div className="field col-12 mt-2">
                <span className="p-float-label">
                  <InputTextarea
                    id="ammendedNotes"
                    disabled={readOnlyForm}
                    value={formik.values.ammendedNotes}
                    onChange={formik.handleChange}
                    // className={classNames({ "p-invalid": isFormFieldValid("ammendedNotes") })}
                    rows={3}
                  // cols={10}
                  />
                  <label
                    htmlFor="ammendedNotes"
                    className={classNames({ "p-error": isFormFieldValid("ammendedNotes") })}
                  >
                    Amendments Notes
                  </label>
                </span>
                {getFormErrorMessage("ammendedNotes")}
              </div>
            )}

            {/* PO_Terms Autocomplete component */}
            {/* <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <AutoComplete
                  id="terms"
                  disabled={readOnlyForm}
                  value={formik?.values?.terms?.name}
                  suggestions={termsSuggetions}
                  completeMethod={searchTerms}
                  dropdown
                  field="name"
                  onChange={async (e) => {
                    let terms = typeof e.value === "string" ? e.value : e.value

                    await formik.setValues({
                      ...formik.values,
                      terms,
                    })
                  }}
                  aria-label="PO Terms"
                  dropdownAriaLabel="PO Terms"
                  className={classNames({ "p-invalid": isFormFieldValid("terms") })}
                />

                <label
                  htmlFor="terms"
                  className={classNames({ "p-error": isFormFieldValid("terms") })}
                >
                  Terms
                </label>
              </div>
              {getFormErrorMessage("terms")}
            </div> */}
            <div className="field col-12  mt-2">
              <div className="mb-3">Emails</div>
              <div className="flex align-items-center flex-wrap">
                {formik?.values?.vendor_Emails?.map((email, i) => (
                  <Chips
                    key={i}
                    label={email}
                    className="mr-2 mb-2"
                    removable={!readOnlyForm}
                    onRemove={async (e) => {
                      const updatedChips = formik.values.vendor_Emails.filter(
                        (mail) => mail !== email
                      )
                      await updateFormValues({ vendor_Emails: updatedChips })
                    }}
                  />
                ))}
              </div>
            </div>
            {/* {showPriorList && (
              <div className="field col-12 p-error">
                <h6>Selected Vendor doesnot sell below products</h6>
                <ul>
                  {priorList
                    .filter((ele) => ele.products_product_id)
                    .map((ele, i) => (
                      <li key={i}>{`${ele.product_name}`}</li>
                    ))}
                </ul>
                <Button
                  type="button"
                  icon="pi pi-undo"
                  label="Revert"
                  className="p-button-warning p-button-sm w-auto p-button-outlined"
                  onClick={async (e) => {
                    await updateFormValues({ vendor: pastVendors[0]?.vendor })
                    // console.log("prevVendor.current", prevVendor.current)
                    const removeEmptyItems = itemList.filter((ele, i) => ele.products_product_id)
                    const initialState = priorList.length + removeEmptyItems.length
                    let count = initialState >= 5 ? 2 : 5 - initialState

                    const emptyFields = arrayFillCopy(count, initialItemState)
                    const prevList = [...priorList, ...removeEmptyItems, ...emptyFields]

                    setItemList(prevList)
                    setShowPriorList(false)
                  }}
                />
                <Button
                  type="button"
                  icon="pi pi-thumbs-up"
                  label="Continue"
                  className="p-button-warning p-button-sm w-auto ml-3"
                  onClick={async (e) => {
                    setShowPriorList(false)
                  }}
                />
                
              </div>
            )} */}
            <div className="col-12 mt-3 mb-3 ">
              <h6>Select Products</h6>
              <hr />
            </div>
            {itemList.map((ele, i) => (
              <div key={`PO-product-${i} `} className="field grid col-12  mt-2">
                <div className="field col-12 lg:col-7 mt-2">
                  <div className="p-float-label">
                    <AutoComplete
                      disabled={readOnlyForm}
                      id="name"
                      name="name"
                      value={ele.product_name}
                      suggestions={ProductsSuggestions}
                      completeMethod={searchProducts}
                      //   forceSelection //
                      dropdown
                      field="name"
                      onChange={async (e) => {
                        console.log("event understand", e.value)
                        let product_id = typeof e.value === "string" ? "" : e.value?.product_id
                        let name = typeof e.value === "string" ? e.value : e.value?.name
                        let price_per_unit = typeof e.value === "string" ? e.value : e.value?.Price
                        let data = [...itemList]

                        data[i].product_name = name
                        data[i].products_product_id = product_id
                        data[i].price_per_unit = price_per_unit

                        // if (!e.value.name) {
                        //   await formik.setValues({ ...formik.values, itemsLength: false })
                        // } else {
                        //   await formik.setValues({ ...formik.values, itemsLength: true })
                        // }
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

                <div className="field col-12 lg:col-2 mt-2">
                  <span className="p-float-label ">
                    <InputNumber
                      name="price_per_unit"
                      disabled={readOnlyForm}
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
                      disabled={readOnlyForm}
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
              </div>
            ))}
            <div className="m-auto text-2xl">{getFormErrorMessage("itemsLength")}</div>
          </div>
          <Divider />
          <div className="flex justify-content-end">
            {!readOnlyForm && (
              <Button type="submit" className=" mr-2" label={poEditState ? "UPDATE" : "SUBMIT"} />
            )}
            <Button
              className="mr-2 p-button-secondary align "
              style={{ maxWidth: "50%" }}
              label="CANCEL"
              onClick={(e) => {
                e.preventDefault()
                setPurchaseDialog(false)
                setItemList([initialItemState])
                formik.resetForm()
                setPriorList([])
                setShowPriorList(false)
                setAmendingPO(false)
              }}
            />
          </div>
        </form>
      </div>
    </div>
  )
})

export default CreateNewPo

// activeRow data Example

// const activeRowData ={
//   "po_id": 111,
//   "po_type": "sss",
//   "updated_on": "2022-11-15T11:46:48.081Z",
//   "approved_on": "Invalid date",
//   "created_at": "15-11-2022, 17:11",
//   "from_party": "TIF Labs",
//   "expiry_date": "2022-11-22T18:30:00.000Z",
//   "expected_delivery": "2022-11-24T18:30:00.000Z",
//   "agreement": "Approved",
//   "po_description": "Sensor Bundle",
//   "po_code": "PO#111",
//   "rfq_id": 18,
//   "grn_grn_id": 28,
//   "note": null,
//   "agreement_terms_id": 1,
//   "purchase_order_terms": "Net-45",
//   "purchase_order_status_id": 1,
//   "vendor_vendor_id": 3,
//   "vendor": "Thomas Edison",
//   "purchase_order_products": [
//       {
//           "pop_id": 14,
//           "vendor_products_vp_id": 8,
//           "vendor_products_vendor_vendor_id": 3,
//           "vendor_products_products_product_id": 7,
//           "quantity": 89,
//           "price_per_unit": 85,
//           "received_quantity": 0,
//           "purchase_order_po_id": 8,
//           "purchase_order_vendor_vendor_id": 3,
//           "vendor_products": {
//               "vp_id": 8,
//               "unit_price": 45,
//               "vendor_vendor_id": 3,
//               "products_product_id": 7,
//               "enabled": 1,
//               "priority": 2,
//               "vendor_sku": "TE107",
//               "products": {
//                   "product_id": 7,
//                   "name": "Heat Flame Sensor",
//                   "description": "description heat",
//                   "product_type": "Sensors",
//                   "products_sku": "TIF007",
//                   "Price": 56,
//                   "product_unit": null
//               }
//           }
//       },
//       {
//           "pop_id": 155,
//           "vendor_products_vp_id": 20,
//           "vendor_products_vendor_vendor_id": 3,
//           "vendor_products_products_product_id": 5,
//           "quantity": 7,
//           "price_per_unit": 56,
//           "received_quantity": 0,
//           "purchase_order_po_id": 8,
//           "purchase_order_vendor_vendor_id": 3,
//           "vendor_products": {
//               "vp_id": 20,
//               "unit_price": 120,
//               "vendor_vendor_id": 3,
//               "products_product_id": 5,
//               "enabled": 1,
//               "priority": 1,
//               "vendor_sku": "TE105",
//               "products": {
//                   "product_id": 5,
//                   "name": "MQ-135 gas sensor Module",
//                   "description": "description 135",
//                   "product_type": "Sensors",
//                   "products_sku": "TIF005",
//                   "Price": 56,
//                   "product_unit": null
//               }
//           }
//       },
//       {
//           "pop_id": 156,
//           "vendor_products_vp_id": 83,
//           "vendor_products_vendor_vendor_id": 3,
//           "vendor_products_products_product_id": 4,
//           "quantity": 47,
//           "price_per_unit": 42,
//           "received_quantity": 0,
//           "purchase_order_po_id": 8,
//           "purchase_order_vendor_vendor_id": 3,
//           "vendor_products": {
//               "vp_id": 83,
//               "unit_price": 0,
//               "vendor_vendor_id": 3,
//               "products_product_id": 4,
//               "enabled": 1,
//               "priority": 1,
//               "vendor_sku": "TE104",
//               "products": {
//                   "product_id": 4,
//                   "name": "E18-D80NK Infrared Sensor Module",
//                   "description": "description",
//                   "product_type": "Sensors",
//                   "products_sku": "TIF004",
//                   "Price": 42,
//                   "product_unit": null
//               }
//           }
//       },
//       {
//           "pop_id": 157,
//           "vendor_products_vp_id": 5,
//           "vendor_products_vendor_vendor_id": 3,
//           "vendor_products_products_product_id": 3,
//           "quantity": 14,
//           "price_per_unit": 24,
//           "received_quantity": 0,
//           "purchase_order_po_id": 8,
//           "purchase_order_vendor_vendor_id": 3,
//           "vendor_products": {
//               "vp_id": 5,
//               "unit_price": 50,
//               "vendor_vendor_id": 3,
//               "products_product_id": 3,
//               "enabled": 1,
//               "priority": 4,
//               "vendor_sku": "TE103",
//               "products": {
//                   "product_id": 3,
//                   "name": "Waterproof Ultrasonic Sensor",
//                   "description": "water-desp",
//                   "product_type": "Sensors",
//                   "products_sku": "TIF003",
//                   "Price": 24,
//                   "product_unit": "combo"
//               }
//           }
//       }
//   ],
//   "purchase_order_status": {
//       "id": 1,
//       "name": "Created ",
//       "description": "The PO has been successfully created."
//   }
// }
