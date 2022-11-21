import { Form, FormProps } from "app/core/components/Form"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { z } from "zod"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
export { FORM_ERROR } from "app/core/components/Form"

export function RfqForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S>
      {...props}
      onSubmit={async () => {
        // if (!activeVendor) {
        //   await createVendorMutation({
        //     ...vendorDetails,
        //   })
        // } else {
        //   await updateVendorMutation({ ...vendorDetails })
        // }
        // await refetch()
        // setActiveVendor(false)
      }}
      className="p-fluid"
    >
      <h5>New RFQ</h5>
      <div className="formgrid grid">
        <div className="col-12">
          <h6>RFQ Details:</h6>
        </div>
        {[
          { type: "text", label: "RFQ Code", field: "rfq_code" },
          { type: "text", label: "RFQ Name", field: "rfq_name" },
          { type: "text", label: "Delivery Time", field: "expected_dod" },
        ].map((ele, i) => {
          return (
            <div key={`${ele.field}${i}`} className="field col-12 lg:col-3 mt-2">
              <span className="p-float-label">
                <InputText
                  id={ele.field}
                  name={ele.field}
                  // value={vendorDetails[ele.field]}
                  onChange={(e) => {
                    // setVendorDetails({ ...vendorDetails, [ele.field]: e.target.value })
                  }}
                  // value={formik.values.name}
                  // onChange={formik.handleChange}
                  // value=
                  // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                />
                <label
                  htmlFor={ele.field}
                  // className={classNames({ "p-error": isFormFieldValid("name") })}
                >
                  {ele.label}
                </label>
              </span>
              {/* {getFormErrorMessage("name")} */}
            </div>
          )
        })}
        <div className="col-12">
          <h6>Select Products:</h6>
        </div>
        <div className="field col-12 lg:col-3 ">
          <Dropdown
            name="products_product_id"
            // disabled={editState}
            optionLabel="name"
            // value={ele.products_product_id}
            // options={productOptions}
            // onChange={(e) => handleFormChange(e, i)}
            placeholder="Select  Product"
          />
        </div>
        <div className="field col-12 lg:col-3 ">
          <span className="p-float-label">
            <InputNumber
              // id={ele.field}
              // name={ele.field}
              // value={vendorDetails[ele.field]}
              onChange={(e) => {
                // setVendorDetails({ ...vendorDetails, [ele.field]: e.target.value })
              }}
              // value={formik.values.name}
              // onChange={formik.handleChange}
              // value=
              // className={classNames({ "p-invalid": isFormFieldValid("name") })}
            />
            <label
            // className={classNames({ "p-error": isFormFieldValid("name") })}
            >
              Price per unit
            </label>
          </span>
          {/* {getFormErrorMessage("name")} */}
        </div>
        <div className="field col-12 lg:col-3 ">
          <span className="p-float-label">
            <InputNumber
              // id={ele.field}
              // name={ele.field}
              // value={vendorDetails[ele.field]}
              onChange={(e) => {
                // setVendorDetails({ ...vendorDetails, [ele.field]: e.target.value })
              }}
              // value={formik.values.name}
              // onChange={formik.handleChange}
              // value=
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
        <div className="field col-6 lg:col-3 ">
          <span className="p-buttonset">
            <Button label="+" />
            <Button label="-" className="p-button-secondary" />
          </span>
        </div>
      </div>
      <div className="flex justify-content-end">
        <Button type="submit" className="mr-2" label="ADD" />
      </div>
    </Form>
  )
}
