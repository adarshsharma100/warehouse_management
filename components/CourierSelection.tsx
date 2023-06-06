import React, { useEffect, useState } from "react"
import { useFormik } from "formik"
import { Button } from "primereact/button"
import classNames from "classnames"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { validateZodSchema } from "blitz"
import { Dropdown } from "primereact/dropdown"
import { useQuery } from "@blitzjs/rpc"
import getCourier_types from "src/courier_types/queries/getCourier_types"
import getCouriers from "src/couriers/queries/getCouriers"
import { Package } from "app/auth/validations"

const CourierSelection = ({ dispatch }) => {
    const [selectedCourier, setSelectedCourier] = useState({})
    const [selectedType, setSelectedType] = useState({})

    const [{ courier_types }] = useQuery(getCourier_types, {
        orderBy: { id: "asc" },
        where: {},
        skip: 0,
        take: undefined,
    })

    const [{ couriers }] = useQuery(getCouriers, {
        orderBy: { id: "asc" },
        where: {},
        skip: 0,
        take: undefined,
    })




    const formik = useFormik({
        initialValues: {
            courierType: null,
            courier: null,
        },
        validate: validateZodSchema(CourierSelection),
        onSubmit: async (data) => {
            console.log('data: ', data);
        }
    })

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik?.errors?.[name]}</small>
    }

    const courierTypesOptions = () => courier_types?.map(({ id, type, }) => ({ id, label: type, value: type }))

    const courierOptions = () => {
        const _filteredCourier = couriers?.filter(courier => courier?.courier_types?.type === formik.values.courierType);
        return (_filteredCourier ?? couriers)?.map(({ id, name }) => ({ id, label: name, value: name, }));
    }
    console.log("formik.errors", formik.errors)
    return (
        <>
            {formik?.values?.courierType === "Local" &&
                <div className="text-right">Remaining AWB : 10</div>}

            <form className="p-fluid " onSubmit={formik.handleSubmit}>
                <div className="grid">
                    {[
                        { id: 1, field: "courierType", options: courierTypesOptions, label: "Select Courier Type", },
                        { id: 2, field: "courier", options: courierOptions, label: "Select Courier" }
                    ].map(({ id, field, options, label }) =>
                        <div className=" p-field  col-2 md:col-6 lg:col-6 mt-5" key={id}>
                            <span className="p-float-label">
                                <Dropdown
                                    id={field}
                                    value={formik.values[field]}
                                    options={options()}
                                    onChange={async (e) => {
                                        console.log("event", e)
                                        await formik.setValues({ ...formik.values, [field]: e.value })
                                        const selectedOptions = options().find(opt => opt.value === e.value)
                                        field === "courier" ? setSelectedCourier(selectedOptions) : setSelectedType(selectedOptions)
                                    }}
                                    className={classNames({ "p-invalid": isFormFieldValid(field) })}
                                />
                                <label
                                    htmlFor="courier"
                                    className={classNames({ "p-error": isFormFieldValid(field) })}
                                >{label}</label>
                            </span>
                            {getFormErrorMessage(field)}
                        </div>)}

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


        </>
    )
}
export default CourierSelection
