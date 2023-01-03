import { useMutation, useQuery } from "@blitzjs/rpc"
import { arrayFillCopy, createSearchFunction, tsuccess } from "app/constants"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updatePurchase_order from "app/purchase_orders/mutations/updatePurchase_order"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import getPurchase_order_products from "app/purchase_order_products/queries/getPurchase_order_products"
import { useFormik } from "formik"
import moment from "moment"
import { AutoComplete } from "primereact/autocomplete"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Checkbox } from "primereact/checkbox"
import { Divider } from "primereact/divider"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import React, { useEffect, useRef, useState } from "react"
import * as Yup from "yup"

const CreateNewPo = (props) => {
  const {
    purchaseDetails,
    itemList,
    setItemList,
    activeRow,
    poEditState,
    toast,
    purchaseDialog,
    setPurchaseDialog,
    vendor_products,
    vendors,
    products,
    initialItemState,
    scrollToTop,
    setPoErrorMsgs,
  } = props

  const [{ prefixes }, { error: getPrefixesError }] = useQuery(getPrefixes, {
    orderBy: { id: "asc" },
  })
  const [{ purchase_orders }, { error: getPoError, refetch }] = useQuery(getPurchase_orders, {
    orderBy: { po_id: "asc" },
  })
  const [{ purchase_order_products }, { error: getPoProductsError, refetch: refetchPoProducts }] =
    useQuery(getPurchase_order_products, {
      orderBy: { pop_id: "asc" },
    })

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

  const [filterProductOptions, setFilterProductOptions] = useState([])
  const [vendorSuggestions, setVendorSuggestions] = useState<any>(null)
  const [ProductsSuggestions, setProductsSuggestions] = useState<any>(null)

  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)

  const agreementStatusEnum = ["Approved", "Waiting For Approval"]
  const agreementStatusOptions = agreementStatusEnum.map((ele) => ({
    name: ele,
  }))

  const prevVendor = useRef()
  const createNewPOCode = () => {
    const poPrefix = prefixes.filter((prefix) => prefix.name === "PO")[0]?.name
    const nextPoId = purchase_orders.length + 1
    setNewPOCode(`${poPrefix}#${nextPoId}`)
  }
  const productOptions = products.map(({ product_id, name, vendor_products, Price }) => {
    return {
      name,
      product_id,
      vendorID: vendor_products.map((ele) => ele.vendor_vendor_id),
      Price,
    }
  })
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
  useEffect(() => {
    createNewPOCode()
  })

  useEffect(() => {
    if (poEditState) {
      updatePoValues().catch((error) => {
        console.log("While setting po values", error)
      })
    }
  }, [poEditState])

  const updatePoValues = async () => {
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
      agreement: po_status.replaceAll("_", " "),
      rfq_id,
      itemsLength: true,
    })
  }

  const searchProducts = createSearchFunction(filterProductOptions, setProductsSuggestions)
  const searchVendor = createSearchFunction(vendorOptions, setVendorSuggestions)
  const searchAgreement = createSearchFunction(agreementStatusOptions, setFilteredSuggestions)

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
        scrollToTop?.current?.scrollIntoView()
        return
      }
      console.log("data", data)
      // console.log("purchaseDetails", purchaseDetails)
      // console.log("activeRow", activeRow)
      // console.log("itemList", itemList)
      console.log("poEditState", poEditState)

      const removeEmptyItems = itemList.filter((ele, i) => ele.products_product_id)

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
                toast?.current.show(tsuccess("Updated", `${po_code} is upadted successfully`))
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
  // console.log("formik.errors", formik.errors)
  console.log("priorList", priorList)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  useEffect(() => {
    // saving previous Vendors
    const slicedArray = pastVendors.slice(-1)
    setPastVendors([
      ...slicedArray,
      { vendor: formik.values.vendor, vendor_id: formik.values.vendor_vendor_id },
    ])

    const vendorID = formik.values.vendor_vendor_id
    const filterProducts = productOptions.filter((ele) => ele.vendorID.includes(Number(vendorID)))
    console.log("filterProducts", filterProducts)

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

      console.log("priorValues", priorValues.length)

      setPriorList([...priorValues])
      //   const itemlistIds = itemList.map((ele) => ele.products_product_id)
      //   const valuesIds = values.map((ele) => ele.products_product_id)
      const initialState = values?.length
      let count = initialState >= 5 ? 1 : 5 - values?.length

      const emptyFields = arrayFillCopy(count, initialItemState)

      setItemList([...values, ...emptyFields])
    }
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

  //   console.log("formik.errors", formik.errors)

  return (
    <div
      className={`col-12 ${
        purchaseDialog
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
      }`}
    >
      <div className={`card`}>
        <form onSubmit={formik.handleSubmit} on className="p-fluid ">
          <h5>Create PO</h5>
          <div className="formgrid grid">
            <div className="col-12">
              <h6>PO Details:</h6>
              <hr />
            </div>

            <div className="field col-12 md:col-3 lg:col-4  mt-2 ">
              <div className="p-float-label">
                <AutoComplete
                  id="vendor_vendor_id"
                  // disabled={editState}
                  value={formik.values.vendor}
                  dropdown
                  forceSelection
                  suggestions={vendorSuggestions}
                  completeMethod={searchVendor}
                  field="name"
                  onChange={async (e) => {
                    // console.log("name", e.value)

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
                  value={formik.values.agreement}
                  suggestions={filteredSuggestions}
                  completeMethod={searchAgreement}
                  dropdown
                  field="name"
                  // onChange={(e) => {
                  //   let agreement = typeof e.value === "string" ? e.value : e.value.name
                  //   // console.log("agreement", agreement)
                  //   setPurchaseDetails({ ...purchaseDetails, agreement })
                  // }}
                  onChange={async (e) => {
                    let agreement = typeof e.value === "string" ? e.value : e.value.name

                    await formik.setValues({
                      ...formik.values,
                      agreement,
                    })
                  }}
                  aria-label="agreementStatusOptions"
                  dropdownAriaLabel="Select Agreement"
                  className={classNames({ "p-invalid": isFormFieldValid("agreement") })}
                />

                <label
                  htmlFor="agreement"
                  className={classNames({ "p-error": isFormFieldValid("agreement") })}
                >
                  Agreement
                </label>
              </div>
              {getFormErrorMessage("agreement")}
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <InputText
                  id="from_party"
                  value={formik.values.from_party}
                  onChange={formik.handleChange}
                  className={classNames({ "p-invalid": isFormFieldValid("from_party") })}
                  autoFocus
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
                  label="Revert"
                  className="p-button-warning p-button-sm w-auto p-button-outlined"
                  onClick={async (e) => {
                    await updateFormValues({ vendor: pastVendors[0]?.vendor })
                    console.log("prevVendor.current", prevVendor.current)
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
                {/* <span>{` Prev Vendor: - ${pastVendors[0]?.vendor}`}</span> */}
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
                      forceSelection
                      dropdown
                      field="name"
                      onChange={async (e) => {
                        console.log("event understand", e)
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
          <div className="flex ">
            <Button type="submit" className=" mr-2" label={poEditState ? "UPDATE" : "ADD"} />
            <Button
              className="mr-2 p-button-secondary"
              label="Cancel"
              onClick={(e) => {
                e.preventDefault()
                setPurchaseDialog(false)
                setItemList([initialItemState])

                formik.resetForm()
                setShowPriorList(false)
              }}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateNewPo
