import React, { useEffect, useState } from "react"
import { useFormik } from "formik"
import { Button } from "primereact/button"
import classNames from "classnames"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { validateZodSchema } from "blitz"
import { Package } from "app/auth/validations"
import { useMutation } from "@blitzjs/rpc"
import createDimension from "app/dimensions/mutations/createDimension"
import updateShipment from "app/shipments/mutations/updateShipment"
import createShipment from "app/shipments/mutations/createShipment"

const PackageDimensions = ({ shipmentId, dispatch }) => {
  const [CreatePackageDimensions] = useMutation(createDimension)
  const formik = useFormik({
    initialValues: {
      length: null,
      width: null,
      height: null,
      weight: null,
    },
    validate: validateZodSchema(Package),
    onSubmit: async (data) => {

      const _package = await CreatePackageDimensions({
        ...data,
        shipment: {
          connect: {
            id: shipmentId
          }
        }
      }, {
        onSuccess: (data) => {
          alert("onSuccess")
          dispatch({ type: "READY_TO_SHIP_ACTIVE_INDEX", payload: 1 })
        },
        onError: (data) => { alert("onError") }
      },)

    },
  })


  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik?.errors?.[name]}</small>
  }

  return (
    <>
      <form className="p-fluid" onSubmit={formik.handleSubmit}>


        <div className="formgrid grid">
          {[
            { type: "number", label: "Length", field: "length" },
            { type: "number", label: "Width", field: "width" },
            { type: "number", label: "Height", field: "height" },
            { type: "number", label: "Weight", field: "weight" },
          ].map((fieldObj, i) => {
            const { label, field } = fieldObj
            return (
              <div key={i} className="field col-10 md:col-3 lg:col-3 mt-4">
                <span className="p-float-label">
                  <InputNumber
                    id={field}
                    name={field}
                    value={formik.values[field]}
                    onValueChange={formik.handleChange}
                    minFractionDigits={2}
                    autoFocus
                    className={classNames({ "p-invalid": isFormFieldValid(field) })}
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
            )
          })}
        </div>

        <div className="flex justify-content-end">
          <Button
            className="p-button-secondary flex-grow-0 mr-2"
            style={{ maxWidth: "50%" }}
            type="button"
            label="CANCEL"
            onClick={() => {
              dispatch({ type: "READY_TO_SHIP", payload: false })
              dispatch({ type: "READY_TO_SHIP_ACTIVE_INDEX", payload: 0 })
            }}
          />
          <Button type="submit" label="NEXT" />
        </div>


      </form>
      <pre>{ }</pre>
    </>
  )
}
export default PackageDimensions
