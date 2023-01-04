import { createSearchFunction } from "app/constants"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { Button } from "primereact/button"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import React, { useEffect, useState } from "react"

const ScannedProducts = ({
  products,
  scanner,
  setScanner,
  setItemList,
  setRfqDialog,
  setRfqDetails,
  newRFQCode,
  rfqDetails,
}) => {
  const productListInitialState = [
    { product_id: "", quantity: null, price_per_unit: null, name: "" },
    { product_id: "", quantity: null, price_per_unit: null, name: "" },
    { product_id: "", quantity: null, price_per_unit: null, name: "" },
    { product_id: "", quantity: null, price_per_unit: null, name: "" },
    { product_id: "", quantity: null, price_per_unit: null, name: "" },
  ]

  const [productsList, setProductsList] = useState(productListInitialState)
  const [items, setItems] = useState(false)
  // const [displayForm, setDisplayForm] = useState(false)

  const [ProductsSuggestions, setProductsSuggestions] = useState<any>(null)
  const productOptions = products.map(({ product_id, name, products_sku, Price }) => {
    return {
      name: `${name}-${products_sku}`,
      product_id,
      Price,
    }
  })
  // console.log("productOptions", productOptions)
  const searchProducts = createSearchFunction(products, setProductsSuggestions)

  const handleFormChange = (e: any, i: number) => {
    let data = [...productsList]
    e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)
    setProductsList(data)
  }

  const addFields = () => {
    let newfield = { products_product_id: "", quantity: "", price_per_unit: "" }

    setProductsList([...productsList, newfield])
  }
  const removeFields = (index) => {
    setProductsList(productsList.filter((data, i) => index !== i))
  }

  // console.log("items", items)

  useEffect(() => {
    const checkForEmptyList = productsList.filter((ele, i) => ele.product_id).length ? true : false
    if (checkForEmptyList && scanner) {
      setItems(false)
    } else {
      // setItems(true)
    }
    console.log("checkForEmptyList", checkForEmptyList)
  }, [productsList])

  useEffect(() => {
    setItems(false)
  }, [])

  return (
    <div
      className={`col-12 ${
        scanner
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
      }`}
    >
      <div className="card p-fluid">
        <h5>Products Scanning Form</h5>

        <div className="formgrid grid p-4">
          <div className="col-12">
            <h6>Scanned Products List</h6>
            <hr />
          </div>
          {productsList.map((ele, i) => (
            <>
              <div key={`RFQ-product-${i}`} className="field col-12 lg:col-7 mt-2">
                <div className="p-float-label">
                  <AutoComplete
                    id="name"
                    name="name"
                    value={ele.name}
                    suggestions={ProductsSuggestions}
                    completeMethod={searchProducts}
                    field="name"
                    onChange={(e) => {
                      console.log(e)
                      let product_id = typeof e.value === "string" ? "" : e.value.product_id
                      let name = typeof e.value === "string" ? e.value : e.value.name
                      let price_per_unit = typeof e.value === "string" ? e.value : e.value.Price
                      let data = [...productsList]

                      data[i][e.target.name] = name
                      data[i].product_id = product_id
                      data[i].price_per_unit = price_per_unit

                      setProductsList(data)
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
                <span className="p-float-label">
                  <InputNumber
                    id={`product-prixe-${i}`}
                    name="price_per_unit"
                    value={ele.price_per_unit}
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
                    value={ele.quantity}
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
                  {i === productsList.length - 1 && (
                    <Button type="button" label="+" onClick={addFields} />
                  )}
                  {productsList.length > 1 && (
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
        <p className={`text-center p-error text-2xl ${items ? "block" : "hidden"}`}>
          ⚠ Please select atleast one product
        </p>

        <div className="flex mx-4 ">
          <Button
            // type="submit"
            className="mr-2"
            label="Create RFQ"
            onClick={(e) => {
              const listLength = productsList.filter((ele, i) => ele.product_id).length
              const checkForEmptyList = listLength ? true : false
              setItems(!checkForEmptyList)

              if (checkForEmptyList && !items) {
                setRfqDialog(true)
                const itemsBucket = productsList.map(
                  ({ price_per_unit, quantity, product_id }) => ({
                    products_product_id: product_id,
                    quantity: quantity,
                    price_per_unit: price_per_unit,
                  })
                )
                setItemList(itemsBucket)
                setRfqDetails({ ...rfqDetails, rfq_code: newRFQCode })
                setScanner(false)
                setProductsList(productListInitialState)
              }
            }}
          />
          <Button
            className="mr-2 p-button-secondary"
            label="Cancel"
            onClick={(e) => {
              setProductsList(productListInitialState)

              setScanner(false)
              setItems(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ScannedProducts
