import React, { useEffect, useState } from "react"
import { useFormik } from "formik"
import { Button } from "primereact/button"
import classNames from "classnames"
import { InputNumber } from "primereact/inputnumber"
import { InputText } from "primereact/inputtext"
import { validateZodSchema } from "blitz"
import { CourierSelection, Package } from "app/auth/validations"
import { useMutation, useQuery } from "@blitzjs/rpc"

import { Dropdown } from "primereact/dropdown"
import getCourier_types from "app/courier_types/queries/getCourier_types"
import getCouriers from "app/couriers/queries/getCouriers"
import { Chip } from "primereact/chip"
import updateShipment from "app/shipments/mutations/updateShipment"
import deleteBulk_awb from "app/bulk_awbs/mutations/deleteBulk_awb"


const SelectCouriers = ({ dispatch, shipmentId, refetchShipments }) => {

    const [{ courier_types }] = useQuery(getCourier_types, {
        orderBy: { id: "asc" },
        where: {},
        skip: 0,
        take: undefined,
    })

    const [{ couriers }, { refetch: refetchCouriers }] = useQuery(getCouriers, {
        orderBy: { id: "asc" },
        where: {},
        skip: 0,
        take: undefined,
    })
    const [updateShipmentWithAwb] = useMutation(updateShipment)
    const [deleteAwbNumber] = useMutation(deleteBulk_awb)

    const [selectedCourier, setSelectedCourier] = useState({})

    const formik = useFormik({
        initialValues: {
            courierType: null,
            courier: null,
            height: null,
            weight: null,
        },
        validate: validateZodSchema(CourierSelection),
        onSubmit: async (data) => {

            await updateShipmentWithAwb({
                id: shipmentId,
                awb: selectedCourier?.bulk_awb[0].awbNumber,
                shipmentStatusId: 3
            }, {
                onSuccess: async (data) => {
                    console.log("Success")
                    formik.resetForm()
                    await refetchCouriers()
                    await refetchShipments()
                    setSelectedCourier({})
                    await deleteAwbNumber({
                        id: selectedCourier?.bulk_awb[0].id
                    })
                    dispatch({ type: 'RESET_SELECTED_SHIPMENTS', payload: [] })
                    dispatch({ type: "READY_TO_SHIP", payload: false })
                },
                onError: (data) => console.log("Success", data),
            })
        },
    })
    const localAwbCount = (
        <>
            <span className="bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center">{selectedCourier?.bulk_awb?.length}</span>
            <span className="ml-2 font-medium">Remaining AWB's</span>
        </>
    )

    const filterSelectedCourier = (name) => couriers.find(courier => name === courier.name)


    const courierTypesOptions = courier_types?.map(({ id, type, }) => ({ id, label: type, value: type }))

    const courierOptions = () => {
        const _filteredCourier = couriers?.filter(courier => courier?.courier_types?.type === formik.values.courierType);

        return _filteredCourier?.map(({ id, name }) => ({ id, label: name, value: name, }));
    }

    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik?.errors?.[name]}</small>
    }

    console.log("formik.errors", formik.errors)
    return (
        <>
            <div className="flex flex-column" >
                <span className="ml-auto">
                    {selectedCourier?.id && <Chip className="pl-0 pr-3" template={localAwbCount} />}
                </span>

                <form className="p-fluid mt-5" onSubmit={formik.handleSubmit}>
                    <div className="formgrid grid">
                        <div className="field col-2 md:col-6 lg:col-6">
                            <span className="p-float-label">
                                <Dropdown
                                    id="courierType"
                                    value={formik.values?.courierType}
                                    options={courierTypesOptions}
                                    onChange={formik.handleChange}
                                    placeholder="Select a type"
                                    className={classNames({ "p-invalid": isFormFieldValid("courierType") })}
                                />
                                <label
                                    htmlFor="courier"
                                    className={classNames({ "p-error": isFormFieldValid("courierType") })}
                                >
                                    Courier Type</label>
                            </span>
                            {getFormErrorMessage("courierType")}
                        </div>
                        <div className="field col-2 md:col-6 lg:col-6">
                            <span className="p-float-label">
                                <Dropdown
                                    id="courier"
                                    value={formik.values?.courier}
                                    options={courierOptions()}
                                    onChange={async (e) => {
                                        formik.handleChange(e)
                                        setSelectedCourier(filterSelectedCourier(e.target.value))
                                    }}
                                    placeholder="Select a courier"
                                    className={classNames({ "p-invalid": isFormFieldValid("courier") })}
                                />
                                <label
                                    htmlFor="courier"
                                    className={classNames({ "p-error": isFormFieldValid("courier") })}
                                >Selected Courier</label>
                            </span>
                            {getFormErrorMessage("courier")}
                        </div>
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
                                dispatch({ type: 'RESET_SELECTED_SHIPMENTS', payload: [] })
                                dispatch({ type: "READY_TO_SHIP", payload: false })
                            }}
                        />
                        <Button type="submit" label="SELECT" />
                    </div>


                </form>
            </div>
        </>
    )
}

export default SelectCouriers
