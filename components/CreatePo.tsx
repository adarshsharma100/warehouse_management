import { useMutation, useQuery } from "@blitzjs/rpc"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import getVendors from "app/vendors/queries/getVendors"
import { AutoComplete } from "primereact/autocomplete"
import { Button } from "primereact/button"
import { Calendar } from "primereact/calendar"
import { Checkbox } from "primereact/checkbox"
import { Divider } from "primereact/divider"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import React, { useEffect, useState } from "react"

const CreatePo = (props) => {
  const {
    productOptions,
    vendor_products,
    products,
    purchaseDialog,
    setPurchaseDialog,
    rfqData,
    prefixes,
  } = props

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
  }
  const [itemList, setItemList] = useState([initialItemState])
  const [{ vendors }, { error: getVenorsError }] = useQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
  })

  const vendorOptions = vendors.map(({ vendor, vendor_id, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      value: vendor_id,
    }
  })
  const [{ purchase_orders }, { error: getPoError, refetch }] = useQuery(getPurchase_orders, {
    orderBy: { po_id: "asc" },
  })
  const [createPurchaseOrderMutation, { isLoading: creatingPO, error: creatingMutationError }] =
    useMutation(createPurchase_order)

  const initialPurchaseDetails = {
    vendor_vendor_id: "",
    po_code: "",
    po_description: "",
    expiry_date: "",
    expected_delivery: "",
    from_party: "",
    agreement: "",
    rfq_id: "",
  }

  const [purchaseDetails, setPurchaseDetails] = useState(initialPurchaseDetails)

  const [filterProductOptions, setFilterProductOptions] = useState([])

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

  useEffect(() => {
    poCodeChecked
      ? setPurchaseDetails({
          ...purchaseDetails,
          po_code: newPOCode,
        })
      : null
  }, [poCodeChecked, newPOCode])

  useEffect(() => {
    createNewPOCode()
  })

  useEffect(() => {
    const vendorID = purchaseDetails.vendor_vendor_id
    const filterProducts = productOptions.filter((ele) => ele.vendorID.includes(Number(vendorID)))
    setFilterProductOptions(filterProducts)

    const vendorProductList = filterProducts.map((ele) => ele.value)

    if (purchaseDetails.vendor_vendor_id) {
      const vendorProductFilter = itemList.filter((ele) => {
        return vendorProductList.includes(Number(ele.products_product_id))
      })
      setItemList(vendorProductFilter)
    } else {
      setInitialProductsList()
    }
  }, [purchaseDetails])

  const setInitialProductsList = () => {
    const rfqProducts = rfqData.rfq_products
    const newProducts = rfqProducts?.map((ele, i) => ({
      ...initialItemState,

      quantity: ele.quantity,
      price_per_unit: ele.price_per_unit,
      products_product_id: ele.products_product_id,
    }))
    setItemList(newProducts)
  }
  useEffect(() => {
    setInitialProductsList()
    setPurchaseDetails({
      ...purchaseDetails,
      rfq_id: rfqData.id,
      po_code: newPOCode,
    })
  }, [rfqData])
  useEffect(() => {
    setPurchaseDetails({
      ...initialPurchaseDetails,
      rfq_id: rfqData.id,
      po_code: newPOCode,
    })
  }, [purchaseDialog])

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
  }
  const findProductVpID = (i) => {
    const currentVendor = Number(purchaseDetails.vendor_vendor_id)
    const vendorProducts = vendor_products.filter((item) => item.vendor_vendor_id === currentVendor)
    const vpId = vendorProducts.filter(
      (ele) => ele.products_product_id === Number(itemList[i]?.products_product_id)
    )[0]?.vp_id

    return vpId
  }
  const addFields = () => {
    // let newfield = {
    //   purchase_order_po_id: "",
    //   purchase_order_purchase_order_status_pos_id: 1,
    //   purchase_order_vendor_vendor_id: "",
    //   vendor_products_vp_id: "",
    //   vendor_products_vendor_vendor_id: "",
    //   vendor_products_products_product_id: "",
    //   quantity: "",
    //   price_per_unit: "",
    //   received_quantity: 0,
    // }

    setItemList([...itemList, initialItemState])
  }

  const removeFields = (index) => {
    setItemList(itemList.filter((data, i) => index !== i))
  }
  //   console.log("rfqProducts", rfqProducts)

  return (
    <div
      className={`col-12 ${
        purchaseDialog
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
      }`}
    >
      <div className={`card p-4 `}>
        <form className="p-fluid ">
          <h5>Create PO</h5>
          <div className="formgrid grid">
            <div className="col-12">
              <h6>PO Details:</h6>
              <hr />
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <Dropdown
                value={purchaseDetails?.vendor_vendor_id}
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
              {/* <div className="p-float-label">
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
            </div> */}
              <div className="p-float-label">
                <AutoComplete
                  value={purchaseDetails.agreement}
                  suggestions={filteredSuggestions}
                  completeMethod={searchAgreement}
                  field="name"
                  onChange={(e) => {
                    console.log(typeof e.value)
                    let agreement = typeof e.value === typeof "s" ? e.value : e.value.name
                    console.log("agreement", agreement)
                    setPurchaseDetails({ ...purchaseDetails, agreement })
                  }}
                  aria-label="agreementStatusOptions"
                  dropdownAriaLabel="Select Agreement"
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
                  disabled={poCodeChecked}
                />
                <label htmlFor="po_code">PO Code</label>
              </span>
              <div className="field-checkbox mt-3">
                <Checkbox
                  id="poCode"
                  onChange={(e) => setPoCodeChecked(e.checked)}
                  checked={poCodeChecked}
                />
                <label htmlFor="poCode">Un-check to add custom code.</label>
              </div>
            </div>
            <div className="field col-12 lg:col-4 mt-2">
              <div className="p-float-label">
                <InputText
                  // className="mr-2 w-22rem"
                  value={purchaseDetails.rfq_id}
                  disabled
                />
                <label
                // htmlFor={ele.field}
                // className={classNames({ "p-error": isFormFieldValid("name") })}
                >
                  RFQ ID
                </label>
              </div>
            </div>
            <div className="col-12 mt-3 mb-3 ">
              <h6>Select Products</h6>
              <hr />
            </div>

            {itemList?.map((ele, i) => (
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
                    //   options={filterProductOptions}
                    options={
                      purchaseDetails.vendor_vendor_id ? filterProductOptions : productOptions
                    }
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
              </>
            ))}
          </div>
          <Divider />
          <div className="flex ">
            <Button
              type="button"
              className=" mr-2"
              //   label={poEditState ? "UPDATE" : "ADD"}
              label={"ADD"}
              onClick={async (e) => {
                //   console.log("purchaseDetails", purchaseDetails)
                //   console.log("activeRow", activeRow)
                //   console.log("itemList", itemList)
                //   const data = purchase_order_products
                //     .filter((ele) => ele.purchase_order_po_id === activeRow.po_id)
                //     .map((ele) => ele.pop_id)
                //   console.log("data", data)
                //   // const existingProductsPopIDs = [...itemList.map((ele) => ele.pop_id)]
                //   const newProductsPopIDs = itemList.map((ele) => ele.pop_id)
                //   // console.log(existingProductsPopIDs)
                //   const newProducts = itemList.filter((ele) => !ele.pop_id)
                //   const existingProducts = itemList.filter((ele) => ele.pop_id)
                //   const deletelist = data.filter((item) => {
                //     const array = itemList.map((ele) => ele.pop_id)
                //     return !array.includes(item)
                //   })
                if (false) {
                  // updatePurchaseOrderMutation
                } else {
                  try {
                    console.log("itemList", itemList)
                    const purchaseOrder = await createPurchaseOrderMutation({
                      vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
                      po_code: purchaseDetails.po_code,
                      po_description: purchaseDetails.po_description,
                      expiry_date: new Date(purchaseDetails.expiry_date),
                      expected_delivery: new Date(purchaseDetails.expected_delivery),
                      from_party: purchaseDetails.from_party,
                      agreement_status: purchaseDetails.agreement.replaceAll(" ", "_"),
                      rfq_id: Number(purchaseDetails.rfq_id),
                      purchase_order_products: {
                        create: itemList.map((ele, i) => ({
                          quantity: Number(ele.quantity),
                          price_per_unit: Number(ele.price_per_unit),
                          received_quantity: 0,
                          vendor_products: {
                            connect: {
                              vp_id: findProductVpID(i),
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
                setFilterProductOptions([])
              }}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePo
