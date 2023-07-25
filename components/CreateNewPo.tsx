import { useMutation, useQuery, invoke } from "@blitzjs/rpc"
import {
  arrayFillCopy,
  calenderDateFormat,
  createSearchFunction,
  tError,
  tsuccess,
  tWarn,
} from "app/constants"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import getPo_statuses from "app/po_statuses/queries/getPo_statuses"
import getWarehouses from "app/warehouses/queries/getWarehouses"
import getPo_terms from "app/po_terms/queries/getPo_terms"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updatePurchase_order from "app/purchase_orders/mutations/updatePurchase_order"
import updateRfq from "app/rfqs/mutations/updateRfq"
import { useFormik } from "formik"
import { useRouter } from "next/router"
import { AutoComplete } from "primereact/autocomplete"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Checkbox } from "primereact/checkbox"
import { Chip } from "primereact/chip"
import { Divider } from "primereact/divider"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { classNames } from "primereact/utils"
import React, { startTransition, useEffect, useRef, useState } from "react"
import * as Yup from "yup"
import LoaderFullScreen from "./LoaderFullScreen"

const CreateNewPo = React.forwardRef((props, ref) => {
  const {
    products,
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
    initialItemState,
    setErrorMsgs,
    refetchFuns,
    setSendPoDialog,
    rfq,
    setRfq,
    userId
  } = props

  const initialPurchaseState = {
    vendor_vendor_id: "",
    po_code: "",
    po_description: "",
    expiry_date: "",
    expected_delivery: "",
    from_party: null,
    terms: "",
    rfq_id: "",
    itemsLength: false,
    purchase_order_status: "",
    vendor_Emails: [],
    agreement: "",
    piNumber: "",
    piDate: ""
  }

  const [{ po_statuses }, { error: PO_statusError }] = useQuery(
    getPo_statuses,
    {
      orderBy: { id: "asc" },
    }
  )
  const [{ po_terms: poTerms }, { error: PO_TermsError }] = useQuery(
    getPo_terms,
    {
      orderBy: { id: "asc" },
    }
  )


  const [purchaseDetails, setPurchaseDetails] = useState(initialPurchaseState)
  const [fromPartyQuery, setFromPartyQuery] = useState('');

  const [{ warehouses }] = useQuery(getWarehouses,

    {
      orderBy: { id: "asc" },
      where: { name: { contains: fromPartyQuery ?? undefined } },
      take: undefined,
      skip: undefined
    }
  )

  console.log('warehouses: ', warehouses);

  const [createPurchaseOrderMutation, { isLoading: creatingPO, error: creatingMutationError }] =
    useMutation(createPurchase_order)
  const [updatePurchaseOrderMutation, { isLoading: UpdatingPO, error: updatingMutationError }] =
    useMutation(updatePurchase_order)
  const [updateRFQMutation, { isLoading: updatingRfq, error: updateRFQMutationError }] =
    useMutation(updateRfq)

  const user = useCurrentUser()
  const { id, role, name, email } = user

  const [poCodeChecked, setPoCodeChecked] = useState<boolean>(true)
  const [priorList, setPriorList] = useState([])
  const [showPriorList, setShowPriorList] = useState(false)
  const [pastVendors, setPastVendors] = useState([])
  const [readOnlyForm, setReadOnlyForm] = useState(true)
  const [amendingPO, setAmendingPO] = useState(false)
  const [allRfqDetails, setAllRfqDetails] = useState([]);
  const [allPODetails, setAllPODetails] = useState([]);
  React.useImperativeHandle(ref, () => ({
    setReadOnlyForm,
    formik,
    setPurchaseDetails,
    initialPurchaseState,
    setPriorList,
    setShowPriorList,
  }))

  const [filterProductOptions, setFilterProductOptions] = useState<any>(null)
  const [vendorSuggestions, setVendorSuggestions] = useState<any>(null)
  const [ProductsSuggestions, setProductsSuggestions] = useState<any>(null)
  console.log('ProductsSuggestions: ', ProductsSuggestions);
  const [poStatuses, setPoStatuses] = useState<any>(null)
  const [fromPartySuggetions, setFromPartySuggetions] = useState<any>(null)
  const [termsSuggetions, setTermsSuggetions] = useState<any>(null)
  const agreementTermsEnum = ["Approved", "Waiting For Approval"]
  const [poValue, setPoValue] = useState("")
  // const fromParty = [{ name: "TIF-Banaswadi" }, { name: "TIF-Rajajinagar" }, { name: "TIF-Hennur" }]

  const productOptions = products.map(({ id, name, vendor_products, costPrice, sku }) => {
    return {
      name: `${sku} - ${name}`,
      product_id: id,
      vendorID: vendor_products.map(({ vendor }) => vendor),
      Price: costPrice
    }
  })
  const vendorOptions = vendors.map(({ name, id, code }) => {
    return {
      name: ` ${code}: ${name}`,
      vendor_id: id
    }
  })
  const fromPartyOptions = warehouses.map(({ name, id }) => {
    return {
      name,
      id
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
    let newfield = itemList

    const fields = arrayFillCopy(2, newfield)

    setItemList([...itemList, ...fields])
  }
  const removeFields = (index) => {
    setItemList(itemList.filter((data, i) => index !== i))
  }

  useEffect(() => {
    const ErrorArray = [updatingMutationError, creatingMutationError,]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [updatingMutationError, creatingMutationError,])

  useEffect(() => {
    setPoCodeChecked(true)
  }, [])

  useEffect(() => {
    if (rfq.rfqId) {
      updateFormValues({ itemsLength: true, }).catch((error) => {
        console.log("While setting po values from rfq", error)
      })
        ;
    }
  }, [rfq])


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
      description,
      expiryDate,
      expectedDod,
      vendors,
      poNumber,
      agreement,
      po_status,
      piNumber,
      piDate,
      po_terms,
      po_products
    } = activeRow

    await formik.setValues({
      vendor: ` ${vendors.code}: ${vendors.name}`,
      vendor_vendor_id: vendor,
      po_code: poNumber,
      po_description: description,
      expiry_date: expiryDate,
      expected_delivery: expectedDod,
      agreement,
      itemsLength: true,
      purchase_order_status: po_status,
      terms: po_terms,
      piNumber,
      piDate,

    })
  }

  console.log("fromPartyOptions", fromPartyOptions);

  const searchProducts = createSearchFunction(filterProductOptions, setProductsSuggestions)
  const searchVendor = createSearchFunction(vendorOptions, setVendorSuggestions)
  const searchPoStatuses = createSearchFunction(po_statuses, setPoStatuses)
  const searchFromParty = createSearchFunction(fromPartyOptions, setFromPartySuggetions)
  const searchTerms = createSearchFunction(poTerms, setTermsSuggetions)
  const router = useRouter()
  const findProductVpID = (i, list) => {
    const currentVendor = Number(formik.values.vendor_vendor_id)
    const vendorProducts = vendor_products.filter((prod) => prod.vendor
      === currentVendor)
    const vpId = vendorProducts.filter(
      (ele) => ele.product
        === Number(list[i]?.products_product_id)
    )[0].id
    return Number(vpId)
  }

  const formik = useFormik({
    initialValues: purchaseDetails,
    validationSchema: Yup.object().shape({
      vendor_vendor_id: Yup.string().required("*Required"),
      expiry_date: Yup.string().required("*Required"),
      expected_delivery: Yup.string().required("*Required"),
      vendor: Yup.string().required("*Required"),
      terms: Yup.mixed().required("*Required"),
      itemsLength: Yup.boolean().equals([true], "⚠ Please select atleast one product").required(),
    }),
    onSubmit: async (data) => {
      console.log('qqq ', data);
      const productList = itemList.filter((ele, i) => ele.products_product_id)
      const vendorEmailIds = data?.vendor_Emails?.map(({ id }) => ({ email: id }))


      const {
        vendor_vendor_id,
        po_code,
        expiry_date,
        expected_delivery,
        po_description,
        from_party,
        terms,
        agreement,
        purchase_order_status,
        piNumber,
        piDate,
        amendedFrom,
      } = data

      console.log("data", data);

      const newProducts = productList.filter((ele) => !ele.id)
      const existingProducts = productList.filter((ele) => ele.id)

      const activePoProductsIds = activeRow?.po_products?.
        map(({ id }) => id)

      const deletelist = activePoProductsIds?.filter((item) => {
        const array = productList.map((ele) => ele.id)
        return !array.includes(item)
      })


      if (poEditState) {
        try {
          const updates = await updatePurchaseOrderMutation(
            {
              id: activeRow?.id,
              poNumber: po_code,
              agreement,
              description: po_description,
              expectedDod: expected_delivery,
              expiryDate: expiry_date,
              piNumber: piNumber || null,
              piDate: piDate || null,
              status: purchase_order_status.id,
              po_term: terms.id,
              warehouses: {
                connect: {
                  id: from_party?.id
                }
              },
              po_products: {
                create: newProducts.map((ele, i) => ({
                  quantity: Number(ele.quantity),
                  price: Number(ele.price_per_unit),
                  vendor_products: {
                    connect: {
                      id: findProductVpID(i, newProducts),
                    },
                  },
                })),
                updateMany: existingProducts.map((ele) => ({
                  where: {
                    id: ele.id,
                  },
                  data: {
                    price: Number(ele.price_per_unit),
                    quantity: Number(ele.quantity),
                  },
                })),
                deleteMany: {
                  id: {
                    in: deletelist,
                  },
                },
              },

            },
            {
              onSuccess: async (data) => {
                toast?.current.show(tsuccess("Updated", `${po_code} is updated successfully`))

                if (data.status === 3) {
                  await updatePurchaseOrderMutation({
                    id: activeRow?.id,
                    approvedBy: userId
                  }, {
                    onSuccess: () => {
                      setPurchaseDialog(false)
                      formik.resetForm()
                    }
                  })
                }
              },
            }
          )
          setPurchaseDialog(false)
          formik.resetForm()
        } catch (error) {
          console.log("updation error , ", error)
        }
      } else {
        try {

          const purchaseOrder = await createPurchaseOrderMutation(
            {
              poNumber: po_code,
              agreement,
              description: po_description,
              expectedDod: expected_delivery,
              expiryDate: expiry_date,
              piNumber: piNumber || null,
              piDate: piDate || null,
              rfq: rfq.rfqId ? {
                connect: rfq.rfqId && {
                  id: rfq.rfqId
                }
              } : undefined,
              purchase_orders: {
                connect: amendedFrom && {
                  id: Number(amendedFrom) || null
                }
              },
              vendors: {
                connect: {
                  id: vendor_vendor_id,
                }
              },
              po_status: {
                connect: {
                  id: purchase_order_status?.id ?? 1
                }
              },
              po_terms: {
                connect: {
                  id: terms.id
                }
              },
              po_products: {
                create: productList.map(({ quantity, price_per_unit }, i) => ({
                  quantity: quantity,
                  price: price_per_unit,
                  vendor_products: {
                    connect: {
                      id: findProductVpID(i, productList),
                    },
                  },
                })),
              },

              po_sentto: {
                create: vendorEmailIds
              },
              warehouse: {
                connect: {
                  id: from_party?.id
                }
              }
            },
            {
              onSuccess: async (data) => {
                console.log('data: ', data);
                const productIds = itemList.map(data => data.products_product_id).filter(data => data)

                setShowPriorList(false)
                setPriorList([])
                setAmendingPO(false)
                if (data.rfqId !== null || data.rfqId !== undefined) {
                  const { purchase_orders } = await invoke(getPurchase_orders, {
                    where: {
                      rfqId: data.rfqId
                    },
                    include: {
                      rfq: true
                    }

                  })
                  const rfq_details = purchase_orders[0]?.rfq?.rfq_products;
                  console.log('allrfq_details: ', rfq_details);
                  const _allPODetails = purchase_orders.reduce((accumulator, current) => {

                    const { po_products } = current;
                    if (po_products) {
                      accumulator = accumulator.concat(po_products);
                    }
                    return accumulator;
                  }, []);
                  console.log('all_allPODetails: ', _allPODetails);
                  if (rfq_details?.length === _allPODetails.length) {
                    // alert("Completed")
                    await updateRFQMutation(
                      {
                        id: data?.rfqId,
                        status: "Completed",
                      },
                      {
                        onSuccess: async (data) => {
                          const rfqNumber = data?.rfqNumber
                          const status = data?.status

                          toast?.current.show(
                            tsuccess("Updated", `${rfqNumber} is now ${status}`))
                          // await refetch()


                        },
                      }
                    )
                  }
                  setAllPODetails(_allPODetails);
                  setAllRfqDetails(rfq_details);

                }

                toast?.current.show(tsuccess(null, "PO Created Successfully"))
                if (router.query.hasOwnProperty("rfqdata")) {
                  const { rfqdata } = router.query;
                  const parsedRfqdata = JSON.parse(rfqdata)
                  const newProducts = parsedRfqdata.rfq_products.filter(data => !productIds.includes(data.product))
                  router.replace({
                    pathname: '/purchase_orders',
                    query: newProducts.length ? {
                      rfqdata: JSON.stringify({
                        ...parsedRfqdata,
                        rfq_products: newProducts
                      })
                    } : {},
                  }).catch(console.log("While removing Query from URL"))
                }

              },
            }
          )
          setPurchaseDialog(false)
          formik.resetForm()
          setPriorList([])
          setShowPriorList(false)
          setRfq({ rfqNumber: "", rfqId: "" })
        } catch (error) {
          console.log("error: ", error)
        }
      }
      refetchFuns?.forEach(async (ele) => await ele())


    },
  })



  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }
  // onVendor Change

  const getAllBranchesEmails = branches => branches?.reduce((acc, curr) => {
    const currentBrnachEmails = curr?.addresses?.emails_emails_addressesToaddresses
    if (currentBrnachEmails.length) {
      const emailsList = currentBrnachEmails.map(({ email, id }) => ({ email, id }))
      acc = [...acc, ...emailsList]
    }

    return acc

  }, [])

  //Error while setting PO Values
  useEffect(() => {


    const _poValue = itemList.reduce(
      (acc, { quantity, price_per_unit }) => {

        if (typeof quantity === 'number' && typeof price_per_unit === 'number') {

          acc += Number(quantity) * Number(price_per_unit)
        }
        return acc
      }, 0)

    setPoValue(_poValue)
  }, [itemList])




  useEffect(() => {
    const selectedVendorId = formik.values?.vendor_vendor_id
    const selectedVendor = vendors
      .find((vendor) => vendor?.id === selectedVendorId)


    const allBranchesEmails = getAllBranchesEmails(selectedVendor?.vendor_branches)

    updateFormValues({ vendor_Emails: allBranchesEmails }).catch((error) =>
      console.log("formikValuesError", error)
    )

    // saving previous Vendors
    const slicedArray = pastVendors.slice(-1)
    setPastVendors([
      ...slicedArray,
      { vendor: formik.values.vendor, vendor_id: formik.values.vendor_vendor_id },
    ])

    const vendorID = formik.values.vendor_vendor_id
    const _productOptions = productOptions;
    console.log('productOptions: ', productOptions);
    const filterProducts = _productOptions.filter((ele) => ele.vendorID.includes(Number(vendorID)))
    console.log('filterProducts: ', filterProducts);


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

      setPriorList([...priorValues])
      //   const itemlistIds = itemList.map((ele) => ele.products_product_id)
      //   const valuesIds = values.map((ele) => ele.products_product_id)
      const initialState = values?.length
      let count = initialState >= 5 ? 1 : 5 - values?.length

      // const emptyFields = arrayFillCopy(count, initialItemState)
      const emptyFields = arrayFillCopy(1, initialItemState)

      setItemList([...values, ...emptyFields])
    }

  }, [formik?.values.vendor_vendor_id])

  const updateFormValues = async (fields) => {
    await formik.setValues({ ...formik.values, ...fields })
  }


  // console.log("filterProductOptions", filterProductOptions);
  // console.log("formik.value", formik.values);
  console.log("all products", products);
  console.log("po statuses", po_statuses);
  console.log("active row", activeRow)

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
        <form onSubmit={formik.handleSubmit} className="p-fluid ">
          <div className="flex justify-content-between">
            {/* <h5>{`${poEditState ? "Update" : "Create"} PO`}</h5> */}
            <h5 className="col-3">{`${readOnlyForm ? "PO-Details" : poEditState ? "UPDATE-PO" : "CREATE-PO"}`}</h5>
            <div className="col-3">
              <span>Status: </span>
              <span>{!poEditState ? po_statuses[0]?.name : null}</span>
              <span>{activeRow && activeRow?.po_status?.name}</span>
            </div>
            {poEditState && (
              <div className="col-6 flex justify-content-end">
                {activeRow?.po_status?.name !== 'Approved' && <Button
                  disabled={false}
                  icon="pi pi-pencil"
                  className="m-1"
                  tooltip="Edit-PO"
                  tooltipOptions={{ position: "top" }}
                  onClick={(e) => {
                    e.preventDefault()

                    const activePOStatus = activeRow?.po_status?.name

                    if (activePOStatus === "Approved") {
                      toast?.current.show(tWarn(null, "PO already Approved Cannot Edit"))
                      // toast?.current.show(tsuccess(null, "Cannot change Status already Approved"))
                    } else {
                      setReadOnlyForm(!readOnlyForm)
                    }
                  }}
                />}

                {["Approved", "Amended"].includes(activeRow?.po_status?.name) && <Button
                  disabled={false}
                  icon="pi pi-send"
                  className="m-1"
                  tooltip="Send Mail"
                  tooltipOptions={{ position: "top" }}
                  onClick={(e) => {
                    e.preventDefault()
                    const activePOStatus = activeRow?.po_status?.name

                    if (!["Approved", "Amended"].includes(activePOStatus)) {
                      toast?.current.show(tWarn(null, "Can only  send mail if PO is Approved "))

                    } else {
                      setActiveRow({ ...activeRow, ...formik.values })
                      setSendPoDialog(true)
                    }
                  }}
                />}

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
                    await updateFormValues({ po_code: "", amendedFrom: activeRow.id })

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
            <div className="col-12 mt-2 lg:col-8 grid mb-2">
              <span className="p-float-label lg:col-6 pl-0">
                <InputText
                  id="po_code"
                  name=""
                  // className="mr-2 w-22rem"
                  value={poCodeChecked && !poEditState ? "Auto Generated" : formik.values.po_code}
                  onChange={formik.handleChange}
                  disabled={poCodeChecked}
                  className={classNames({ "p-invalid": isFormFieldValid("po_code") })}
                />
                <label
                  htmlFor="po_code"
                  className={classNames({ "p-error": isFormFieldValid("po_code") })}
                >
                  PO Number
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
            <div className="field col-12 md:col-3 lg:col-4  mt-2 ml-3">
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
            {/* Rendering date components by array */}
            {[
              { field: "expiry_date", label: "Expiry Date", },
              { field: "expected_delivery", label: "Expected Delivery", },
              { field: "piDate", label: "PI Date", }

            ].map(({ field, label }, i) => (
              <div className="field col-12 lg:col-4 mt-2" key={i}>
                <div className="p-float-label">
                  <Calendar
                    id={field}
                    disabled={readOnlyForm}
                    minDate={new Date()}
                    value={formik.values[field]}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": isFormFieldValid(field) })}
                    dateFormat={calenderDateFormat()}
                  />
                  <label
                    htmlFor={label}
                    className={classNames({ "p-error": isFormFieldValid(field) })}
                  >
                    {label}
                  </label>
                </div>
                {getFormErrorMessage(field)}
              </div>
            ))}


            {[
              { field: "po_description", label: "PO Description" },
              { field: "agreement", label: "Agreement" },
              { field: "piNumber", label: "Pi Number" },
            ].map(({ field, label }, i) => (
              <div className="field col-12 lg:col-4 mt-2" key={i}>
                <span className="p-float-label">
                  <InputText
                    id={field}
                    disabled={readOnlyForm}
                    value={formik.values[field]}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": isFormFieldValid(field) })}
                    autoFocus
                  />
                  <label
                    htmlFor={field}
                    className={classNames({ "p-error": isFormFieldValid(field) })}
                  >
                    {label}
                  </label>
                </span>
                {getFormErrorMessage(field)}
              </div>
            ))}
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <AutoComplete
                  id="purchase_order_status"
                  disabled={readOnlyForm}
                  value={formik?.values?.purchase_order_status?.name}
                  suggestions={poStatuses}
                  completeMethod={searchPoStatuses}
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
                  PO Terms
                </label>
              </div>
              {getFormErrorMessage("terms")}
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
                    let from_party = typeof e.value === "string" ? e.value : e.value
                    startTransition(() => {
                      setFromPartyQuery(from_party.name)
                    })

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
                  id="po_value"
                  disabled={readOnlyForm}
                  value={poValue ?? "-"}
                  // onChange={formik.handleChange}
                  className={classNames({ "p-invalid": isFormFieldValid("po_value") })}
                  autoFocus
                />
                <label
                  htmlFor="po_value"
                  className={classNames({ "p-error": isFormFieldValid("po_value") })}
                >
                  PO Value
                </label>
              </span>
              {getFormErrorMessage("po_value")}
            </div>
            {showPriorList && <div className="field col-12 lg:col-4 mt-2">
              <span className="p-float-label">
                <InputText
                  id="rfq_number"
                  disabled={true}
                  value={rfq?.rfqNumber ?? "-"}
                  autoFocus
                />
                <label
                  htmlFor="rfq_number"

                >
                  RFQ Number
                </label>
              </span>

            </div>}
            {/* {amendingPO && (
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
            )} */}
            <div className="field col-12  mt-2">
              <div className="mb-3">Emails</div>
              <div className="flex align-items-center flex-wrap">
                {formik?.values?.vendor_Emails?.map(({ email }, i) => (
                  <Chip
                    key={i}
                    label={email}
                    className="mr-2 mb-2"
                    removable={!readOnlyForm}
                    onRemove={async (e) => {

                      const updatedChips = formik.values.vendor_Emails
                        .filter(({ email: mail }) => mail !== email)

                      await updateFormValues({ vendor_Emails: updatedChips })
                    }}
                  />
                ))}
              </div>
            </div>

            {showPriorList && (
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
                  label="Select"
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
                  label="Continue without adding"
                  className="p-button-warning p-button-sm w-auto ml-3"
                  onClick={async (e) => {
                    setShowPriorList(false)
                  }}
                />

              </div>
            )}
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
                      className="new-po-select-dropdown"
                      id="name"
                      name="name"
                      value={ele.product_name}
                      suggestions={ProductsSuggestions?.length === 0 ? productOptions : ProductsSuggestions}
                      completeMethod={searchProducts}
                      //   forceSelection //
                      dropdown
                      // style={{ width: '100px' }}
                      field="name"
                      onChange={async (e) => {
                        let product_id = typeof e.value === "string" ? "" : e.value?.product_id
                        let name = typeof e.value === "string" ? e.value : e.value?.name
                        let price_per_unit = typeof e.value === "string" ? e.value : e.value?.Price
                        const existingIndex = itemList.findIndex((item) => item.product_name === name);
                        let data = [...itemList]
                        console.log('data: ', data);

                        data[i].product_name = name
                        data[i].products_product_id = product_id
                        data[i].price_per_unit = price_per_unit
                        data[i].quantity = ""

                        let itemsLength = !e.value?.name ? false : true
                        await formik.setValues({ ...formik.values, itemsLength })
                        const _filteredData = data.filter((eachData) => eachData.product_name)

                        setItemList([..._filteredData, {
                          product_name: "",
                          products_product_id: "",
                          price_per_unit: undefined,
                          quantity: ""
                        }])
                        // console.log("Data", data);


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
                      value={ele.price_per_unit}
                      onChange={(e) => handleFormChange(e, i)}
                    />
                    <label htmlFor="price_per_unit">Price per unit</label>
                  </span>
                </div>
                <div className="field col-12 lg:col-2 mt-2">
                  <span className="p-float-label ">
                    <InputNumber
                      name="quantity"
                      disabled={readOnlyForm}
                      value={ele.quantity}
                      // className="mr-2 w-20rem"
                      onChange={(e) => handleFormChange(e, i)}
                      required={ele?.product_name}
                    />
                    <label className="mr-2" htmlFor="quantity">Quantity</label>
                  </span>
                </div>
                <div className="field col-6 lg:col-1 mt-2">
                  <span >
                    {/* {i === itemList.length - 1 && (
                      <Button type="button" label="+" onClick={addFields} />
                    )} */}
                    {/* {itemList.length > 1 && ( */}
                    <Button
                      type="button"
                      icon="pi pi-times"
                      style={{ fontSize: "0.3rem" }}
                      disabled={itemList.length === 1 ? true : false}
                      className="p-button-secondary"
                      onClick={(e) => {
                        removeFields(i)
                      }}
                    />
                    {/* )} */}
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
                router.replace({
                  pathname: "/purchase_orders"
                }).catch(err => console.log(err))
              }}
            />
          </div>
        </form>
      </div>
    </div>
  )
})

export default CreateNewPo

