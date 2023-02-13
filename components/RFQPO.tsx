import React, { useEffect, useRef, useState } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getAgreement_terms from "app/agreement_terms/queries/getAgreement_terms"
import { arrayFillCopy, createSearchFunction, tsuccess } from "app/constants"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updatePurchase_order from "app/purchase_orders/mutations/updatePurchase_order"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import getPurchase_order_products from "app/purchase_order_products/queries/getPurchase_order_products"
import getPurchase_order_statuses from "app/purchase_order_statuses/queries/getPurchase_order_statuses"
import { useFormik } from "formik"
import { AutoComplete } from "primereact/autocomplete"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Checkbox } from "primereact/checkbox"
import { Chips } from "primereact/chips"
import { Divider } from "primereact/divider"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import * as Yup from "yup"
import LoaderFullScreen from "./LoaderFullScreen"
import db from "db"
import { Chip } from "primereact/Chip"

const RFQPO = (props) => {
  const {
    vendors,
    itemList,
    products,
    purchase_orders,
    initialItemState,
    purchaseDialog,
    setPurchaseDialog,
    setItemList,
  } = props
  const [{ purchase_order_statuses: poStatusList }, { error: PO_statusError }] = useQuery(
    getPurchase_order_statuses,
    {
      orderBy: { id: "asc" },
    }
  )

  const [{ agreement_terms: poTerms }, { error: agreementTermsError }] = useQuery(
    getAgreement_terms,
    {
      where: { for: "po" },
      orderBy: { id: "asc" },
    }
  )

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
    vendor: "",
    vendor_emails: ["vj@gmail.com", "ab@gmail.com", "Mystery@tif.com", "mdatif796@gmail.com"],
  }
  const [newPOCode, setNewPOCode] = useState("")
  const [purchaseDetails, setPurchaseDetails] = useState(initialPurchaseState)

  const [poCodeChecked, setPoCodeChecked] = useState<boolean>(true)
  const [vendorSuggestions, setVendorSuggestions] = useState<any>(null)
  const [poFilteredAgreements, setPoFilteredAgreements] = useState<any>(null)
  const [fromPartySuggetions, setFromPartySuggetions] = useState<any>(null)
  const [termsSuggetions, setTermsSuggetions] = useState<any>(null)
  const [ProductsSuggestions, setProductsSuggestions] = useState<any>(null)

  const chipContainer = useRef(null)
  const [chipValues, setChipValues] = useState([])

  const createNewPOCode = async () => {
    // const poPrefix = prefixes.filter((prefix) => prefix.name === "PO")[0]?.name

    const nextPoId = purchase_orders.length + 1

    console.log("`PO#${nextPoId}`: ", `PO#${nextPoId}`)
    setNewPOCode(`PO#${nextPoId}`)
  }
  const vendorOptions = vendors.map(({ vendor, vendor_id, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      vendor_id,
    }
  })
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

    console.log("itemList", [...itemList, ...fields])

    setItemList([...itemList, ...fields])
  }
  const removeFields = (index) => {
    setItemList(itemList.filter((data, i) => index !== i))
  }

  const fromParty = [{ name: "TIF-Banaswadi" }, { name: "TIF-Rajajinagar" }, { name: "TIF-Hennur" }]

  const exampleVendor = {
    vendor_id: 1,
    vendor_code: "DA",
    vendor_email: [
      { id: 1, email: "mdatif796@gmail.com" },
      { id: 2, email: "vj@gmail.com" },
      { id: 3, email: "ab@gmail.com" },
      { id: 4, email: "Mystery@tif.com" },
    ],
    vendor_city: "Panaji",
    vendor_contact: "4562879123",
    vendor_state: "Goa",
    vendor_gstin: "GSTRIO783211111",
    vendor: "Dylan Alisson",
    address: "Rio ",
    credit_period: "411",
    lead_time: "471",
    status: 0,
  }

  // Autocomplete filter search function creation
  const searchProducts = createSearchFunction(productOptions, setProductsSuggestions)
  const searchVendor = createSearchFunction(vendorOptions, setVendorSuggestions)
  const searchAgreement = createSearchFunction(poStatusList, setPoFilteredAgreements)
  const searchFromParty = createSearchFunction(fromParty, setFromPartySuggetions)
  const searchTerms = createSearchFunction(poTerms, setTermsSuggetions)

  const formik = useFormik({
    initialValues: purchaseDetails,
    validationSchema: Yup.object().shape({
      vendor_vendor_id: Yup.string().required("*Required"),
      po_code: Yup.string().required("*Required"),
      //   po_description: Yup.string().required("*Required"),
      expiry_date: Yup.string().required("*Required"),
      expected_delivery: Yup.string().required("*Required"),
      from_party: Yup.string().required("*Required"),
      //   purchase_order_status: Yup.mixed().required("*Required"),
      vendor: Yup.string().required("*Required"),
      //   terms: Yup.mixed().required("*Required"),
      //   itemsLength: Yup.boolean().equals([true], "⚠ Please select atleast one product").required(),
    }),
    onSubmit: async (data) => {
      console.log("data:", data)

      const itemsData = itemList.filter((ele, i) => {
        return ele.products_product_id
      }).length

      if (!itemsData) {
        formik.setErrors({ itemsLength: "⚠ Please select atleast one product" })
        return
      }

      //   check for any po alredy created from this rfq
      // if created filter rfq products from po prodcts
      // else continue with po creation
      // on vendor selection filter out the rfq products and display only prodcy=ts that he will sell
      // remainig products set to previous list and xask them they want to continue or change vendor
      //  on continur => with po creation with selected products
      // on ubdo undo one stem befor vendor selection with all rfq products
      //

      // create po from rfq
      return

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
      const activePoProducts = purchase_order_products
        .filter((ele) => ele.purchase_order_po_id === activeRow?.po_id)
        .map((ele) => ele?.pop_id)

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
    },
  })
  // console.log("formik.errors", formik.errors)
  //   console.log("priorList", priorList)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const updateFormikValues = async (fields) => {
    await formik.setValues({ ...formik.values, ...fields })
  }

  useEffect(() => {
    createNewPOCode().catch((error) => console.log("while creating po code", error))
  })

  console.log("formik.values:", formik.values.vendor_emails)

  useEffect(() => {
    if (poCodeChecked) {
      updateFormikValues({ po_code: newPOCode }).catch((error) => {
        console.log("From updateFormikValues", error)
      })
    }
  }, [poCodeChecked, purchaseDialog])

  //   TO get email through ref

  //   useEffect(() => {
  //     if (chipContainer.current) {
  //       const chipElements = chipContainer.current?.querySelectorAll(".p-chip")
  //       const values = Array.from(chipElements).map((chip) => chip.textContent.trim())
  //       console.log("values: ", values)
  //     }
  //   }, [])

  console.log("formik.values", formik.values)

  return (
    <div
      className={`col-12 ${
        purchaseDialog
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
      }`}
    >
      <div className={`card`}>
        <form onSubmit={formik.handleSubmit} className="p-fluid ">
          <div className="flex justify-content-between">
            <h5>Create PO</h5>
            {/* {"poEditState" && (
              <div>
                <Button
                  disabled={false}
                  icon="pi pi-pencil"
                  className="m-1"
                  tooltip="Edit"
                  tooltipOptions={{ position: "top" }}
                  //   onClick={(e) => {
                  //     e.preventDefault()
                  //     setfieldDisable(!fieldDisable)
                  //   }}
                />
              </div>
            )} */}
          </div>
          <div className="formgrid grid">
            <div className="col-12">
              <h6>PO Details:</h6>
              <hr />
            </div>
            <div className="col-12 mt-2 flex mb-2">
              <span className="p-float-label lg:col-4 pl-0">
                <InputText
                  id="po_code"
                  name="po_code"
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
                />
                <label htmlFor="poCode">Un-check to add custom code.</label>
              </div>
            </div>
            <div className="field col-12 md:col-3 lg:col-4  mt-2 ">
              <div className="p-float-label">
                <AutoComplete
                  id="vendor_vendor_id"
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
                  minDate={new Date()}
                  // id="basic"
                  value={formik.values.expiry_date}
                  onChange={formik.handleChange}
                  className={classNames({ "p-invalid": isFormFieldValid("expiry_date") })}
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
                  value={formik.values.expected_delivery}
                  onChange={formik.handleChange}
                  className={classNames({ "p-invalid": isFormFieldValid("expected_delivery") })}
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
              <div className="p-float-label">
                <AutoComplete
                  id="terms"
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
            </div>
            <div className="field col-12  mt-2">
              <div className="mb-3">Emails</div>
              <div className="flex align-items-center flex-wrap" ref={chipContainer}>
                {formik.values.vendor_emails.map((ele, i) => (
                  <Chip
                    key={i}
                    label={ele}
                    className="mr-2 mb-2"
                    removable
                    onRemove={async (e) => {
                      const updatedChips = formik.values.vendor_emails.filter(
                        (value) => value !== ele
                      )
                      await updateFormikValues({ vendor_emails: updatedChips })
                    }}
                  />
                ))}
              </div>
            </div>
            {"showPriorList" && (
              <div className="field col-12 p-error">
                <h6>Selected Vendor doesnot sell below products</h6>
                <ul>
                  {/* {priorList
                    .filter((ele) => ele.products_product_id)
                    .map((ele, i) => (
                      <li key={i}>{`${ele.product_name}`}</li>
                    ))} */}
                  <li>Prod 1</li>
                  <li>Prod 2</li>
                  <li>Prod 3</li>
                </ul>
                <Button
                  type="button"
                  icon="pi pi-undo"
                  label="Revert"
                  className="p-button-warning p-button-sm w-auto p-button-outlined"
                  onClick={async (e) => {
                    return
                    // await updateFormikValues({ vendor: pastVendors[0]?.vendor })
                    // // console.log("prevVendor.current", prevVendor.current)
                    // const removeEmptyItems = itemList.filter((ele, i) => ele.products_product_id)
                    // const initialState = priorList.length + removeEmptyItems.length
                    // let count = initialState >= 5 ? 2 : 5 - initialState

                    // const emptyFields = arrayFillCopy(count, initialItemState)
                    // const prevList = [...priorList, ...removeEmptyItems, ...emptyFields]

                    // setItemList(prevList)
                    // setShowPriorList(false)
                  }}
                />
                <Button
                  type="button"
                  icon="pi pi-thumbs-up"
                  label="Continue"
                  className="p-button-warning p-button-sm w-auto ml-3"
                  onClick={async (e) => {
                    // setShowPriorList(false)
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

                        // setItemList(data)
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
              </div>
            ))}
            <div className="m-auto text-2xl">{getFormErrorMessage("itemsLength")}</div>
          </div>
          <Divider />
          <div className="flex justify-content-end">
            <Button type="submit" className=" mr-2" label="SUBMIT" />
            <Button
              className="mr-2 p-button-secondary align "
              style={{ maxWidth: "50%" }}
              label="CANCEL"
              onClick={(e) => {
                e.preventDefault()
                setPurchaseDialog(false)
                setItemList([initialItemState])
                formik.resetForm()
                // setPriorList([])
                // setShowPriorList(false)
              }}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default RFQPO
