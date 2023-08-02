import { useParam } from '@blitzjs/next';
import { useMutation, useQuery } from '@blitzjs/rpc';
import getPurchase_order from 'app/purchase_orders/queries/getPurchase_order';
import createVendor_shipment from 'app/vendor_shipments/mutations/createVendor_shipment';
import getVendor_shipments from 'app/vendor_shipments/queries/getVendor_shipments';
import classNames from 'classnames';
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import React, { useState } from 'react'

function VendorShipment() {
    const vendorShipmentDetails = {
        trackingId: "",
        shipmentId: "",
        courier: "",
    }
    const [{ vendor_shipments }] = useQuery(getVendor_shipments, {
        where: undefined,
        orderBy: undefined,
        skip: undefined,
        take: undefined
    })
    const purchase_orderId = useParam("purchase_orderId", "number")
    const [purchase_order, { refetch }] = useQuery(getPurchase_order, { id: purchase_orderId, })
    console.log('purchase_order: ++', purchase_order.id);

    console.log('vendor_shipments: ', vendor_shipments);
    const [activeVendor, setActiveVendor] = useState(false)
    const [createVendorShipment] = useMutation(createVendor_shipment)


    const formik = useFormik({
        initialValues: vendorShipmentDetails,
        onSubmit: async (data) => {
            console.log('data: ', data);
            const { trackingId, shipmentId, courier, }: any = data
            console.log('data trackingId: ', trackingId);

            if (false) {

            } else {
                try {
                    await createVendorShipment({
                        trackingId,
                        shipmentId,
                        courier,
                        purchase_orders: {
                            connect: {
                                id: purchase_order.id
                            }
                        }
                    }, {
                        onSuccess: (data) => {
                            alert("Created")
                            setActiveVendor(!activeVendor)
                            console.log('data: ', data);
                        },
                        onError: (error) => {
                            alert('Error:')
                            console.log('error: ', error);
                        }
                    }
                    )
                } catch (error) {
                    console.log('error: ', error);
                }
            }

        }
    })
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
    }

    const vendorComponent = [
        { field: 'trackingId', header: 'Tracking Id', },
        { field: "shipmentId", header: 'shipment Id' },
        { field: "courier", header: "Courier" },
    ].map((col) => {
        return (
            <Column
                key={col.field}
                field={col.field}
                header={col.header}
            // body={col.body}
            />
        )
    })

    const [trackingIDValue, setTrackingIDValue] = useState('');

    // const handleTrackingIDChange = (e) => {
    //     setTrackingIDValue(e.target.value);
    //     onTrackingIDChange(e.target.value);
    // };


    return (
        <div>
            <div className="flex justify-content-end px-3 mt-4 ">
                <Button
                    label="Create Vendor Shipment"
                    icon='pi pi-plus'
                    onClick={() => {
                        setActiveVendor(!activeVendor)
                        formik.resetForm()
                    }}
                />
            </div>
            {activeVendor ?
                <div className='col-12'>
                    <h2>Create Vendor Shipment</h2>
                    <form className="p-fluid" onSubmit={formik.handleSubmit}>
                        <div className='formgrid grid '>
                            <div className='field col-12 lg:col-3 mt-5'>
                                <span className="p-float-label ">
                                    <InputText id="trackingId"
                                        name="trackingId"
                                        value={formik.values?.trackingId}
                                        onChange={formik.handleChange}
                                        autoFocus
                                        className={classNames({ "p-invalid": isFormFieldValid("trackingId") })}
                                    />
                                    <label
                                        htmlFor="trackingId"
                                        className={classNames({ "p-error": isFormFieldValid("trackingId") })}
                                    >
                                        Tracking ID
                                    </label>
                                </span>

                            </div>
                            <div className='field col-12 lg:col-3 mt-5'>
                                <span className="p-float-label ">
                                    <InputText id="shipmentId"
                                        name="shipmentId"
                                        value={formik.values?.shipmentId}
                                        onChange={formik.handleChange}
                                        autoFocus
                                        className={classNames({ "p-invalid": isFormFieldValid("shipmentId") })}
                                    />
                                    <label
                                        htmlFor="shipmentId"
                                        className={classNames({ "p-error": isFormFieldValid("shipmentId") })}
                                    >
                                        Shipment ID
                                    </label>
                                </span>

                            </div>
                            <div className='field col-12 lg:col-3 mt-5'>
                                <span className="p-float-label ">
                                    <InputText id="courier"
                                        name="courier"
                                        value={formik.values?.courier}
                                        onChange={formik.handleChange}
                                        autoFocus
                                        className={classNames({ "p-invalid": isFormFieldValid("courier") })}
                                    />
                                    <label
                                        htmlFor="courier"
                                        className={classNames({ "p-error": isFormFieldValid("courier") })}
                                    >
                                        Courier
                                    </label>
                                </span>

                            </div>
                        </div>

                        <div className="flex justify-content-between gap-5 mt-4">
                            <Button type="submit" label="SUBMIT" />
                            <Button type="submit"
                                label="CANCEL"
                                onClick={() => {
                                    setActiveVendor(!activeVendor)
                                    formik.resetForm()
                                }}
                                className="p-button-secondary flex-grow-0" />
                        </div>

                    </form>
                </div>

                : ""}


            <div className="col-12 mt-4">
                <DataTable
                    value={vendor_shipments}
                    showGridlines
                >
                    <Column
                        header='Sl No.'
                        style={{width:"70px"}}
                        body={(ele, { rowIndex }) => (
                            <div key={rowIndex} className=" ">
                                <span className="bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center">{rowIndex + 1}</span>
                            </div>
                        )}
                    />
                    {vendorComponent}
                </DataTable>
            </div>
        </div>
    )
}

export default VendorShipment