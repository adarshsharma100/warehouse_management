import { Form, FormProps } from "app/core/components/Form"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import classNames from "classnames"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { z } from "zod"
export { FORM_ERROR } from "app/core/components/Form"

export function VendorForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
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
      <h5>New Vendor</h5>
      <div className="formgrid grid">
        {[
          { type: "text", label: "Vendor", field: "vendor" },
          { type: "text", label: "Vendor Code", field: "vendor_code" },
          { type: "text", label: "Vendor SKU", field: "vendor_sku" },
          { type: "email", label: "Vendor Email", field: "vendor_email" },
          { type: "text", label: "Vendor City", field: "vendor_city" },
          { type: "text", label: "Vendor Contact", field: "vendor_contact" },
          { type: "text", label: "Vendor GSTIN", field: "vendor_gstin" },
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
      </div>
      <div className="flex justify-content-end">
        <Button type="submit" className="mr-2" label="ADD" />
      </div>
    </Form>
  )
}
