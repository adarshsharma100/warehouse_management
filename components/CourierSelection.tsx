import React, { useEffect, useState } from "react"
import { useFormik } from "formik"
import { Button } from "primereact/button"
import classNames from "classnames"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { validateZodSchema } from "blitz"
import { Dropdown } from "primereact/dropdown"

const CourierSelection = ({ }) => {
    const formik = useFormik({
        initialValues: {
            courierType: "",
            courier: "",
        },
        // validate: validateZodSchema(Package),
        onSubmit: async (data) => {

        },
    })


    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik?.errors?.[name]}</small>
    }

    const typeOptions = [
        // { label: 'Select a type', value: '' },
        { label: 'Online', value: 'online' },
        { label: 'Local', value: 'local' },
    ];

    const courierOptions = [
        // { label: 'Select a courier', value: '' },
        { label: 'DTDC', value: 'dtdc', type: 'online' },
        { label: 'Blue Dart', value: 'blue_dart', type: 'local' },
        { label: 'Delhivery', value: 'delhivery', type: 'online' },
        { label: 'DHL', value: 'dhl', type: 'online' },
    ];



    return (
        <>
            {formik.values.courierType === "local" &&
                <div className="text-right">Remaining AWB : 10</div>}
            <form className="p-fluid " onSubmit={formik.handleSubmit}>
                <div className="grid">
                    <div className="p-field col-2 md:col-6 lg:col-6">
                        <span className="p-float-label">
                            <Dropdown
                                id="type-dropdown"
                                value={formik.values?.courierType}
                                options={typeOptions}
                                onChange={formik.handleChange}
                                placeholder="Select a type"

                            />

                            <label htmlFor="courier">Courier Type</label>
                        </span>
                    </div>
                    <div className="field  md:col-6 lg:col-6">
                        <span className="p-float-label">
                            <Dropdown
                                id="courier-dropdown"
                                value={formik.values?.courier}
                                options={courierOptions}
                                onChange={formik.handleChange}
                                placeholder="Select a courier"

                            />
                            <label htmlFor="courier">Selected Courier</label>
                        </span>
                    </div>
                </div>
                <div className="flex justify-content-end">
                    <Button
                        className="p-button-secondary flex-grow-0 mr-2"
                        style={{ maxWidth: "50%" }}
                        type="button"
                        label="CANCEL"
                        onClick={() => { }}
                    />
                    <Button type="submit" label="NEXT" />
                </div>


            </form>

        </>
    )
}
export default CourierSelection
