import { useParam } from '@blitzjs/next';
import { useMutation, usePaginatedQuery, useQuery } from '@blitzjs/rpc';
import { tError, tsuccess } from 'app/constants';
import getPurchase_order from 'app/purchase_orders/queries/getPurchase_order';
import createVendor_shipment from 'app/vendor_shipments/mutations/createVendor_shipment';
import getVendor_shipments from 'app/vendor_shipments/queries/getVendor_shipments';
import classNames from 'classnames';
import { useFormik } from 'formik';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import React, { useReducer, useRef, useState } from 'react'
import { initialFilterRules } from "app/constants"
import { FilterMatchMode } from 'primereact/api';
import { Paginator } from 'primereact/paginator';
import { useRouter } from 'next/router';


const ITEMS_PER_PAGE = 20;
const initialState = {
    tableRowsCount: 10,
    skipCount: 0,

};

const reducer = (state, { type, payload }) => {
    switch (type) {
        case 'UPDATE_TABLE_ROWS_COUNT':
            return { ...state, tableRowsCount: payload }
        case 'UPDATE_SKIP_COUNT':
            return { ...state, skipCount: payload }
        default:
            throw new Error(`Unhandled action type: ${type}`);
    }
}
function VendorShipment() {
    const router = useRouter();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { skipCount, tableRowsCount } = state;
    const page = Number(router.query.page) || 0;

    const toast = useRef(null)
    const vendorShipmentDetails = {
        trackingId: "",
        shipmentId: "",
        courier: "",
    }
    // const [{ vendor_shipments, }, { refetch }] = useQuery(getVendor_shipments, {
    //     where: undefined,
    //     orderBy: undefined,
    //     skip: undefined,
    //     take: undefined
    // })
    const [{ vendor_shipments, }, { refetch }] = usePaginatedQuery(getVendor_shipments, {
        where: undefined,
        orderBy: undefined,
        skip: undefined,
        take: undefined
    })
    const purchase_orderId = useParam("purchase_orderId", "number")
    const [purchase_order,] = useQuery(getPurchase_order, { id: purchase_orderId, })
    const { id: poId, poNumber } = purchase_order
    const filteredShipments = vendor_shipments.filter((shipment) => shipment.purchaseOrderId === poId);

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
                        onSuccess: async (data) => {
                            toast?.current.show(tsuccess(`Created Shipment`))
                            await refetch()

                            formik.resetForm()
                            setActiveVendor(!activeVendor)
                        },
                        onError: (error) => {
                            toast?.current.show(tError("Error",))
                            console.log('error: ', error);
                            refetch()
                        }
                    }
                    )
                } catch (error) {
                    console.log('error: ', error);
                    refetch()
                }
            }

        }
    })
    const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
    const getFormErrorMessage = (name) => {
        return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
    }

    const vendorComponent = [
        { field: 'trackingId', header: 'Tracking Id', filters: true, filterPlaceholder: 'Search...' },
        { field: "shipmentId", header: 'Shipment Id', filters: true, filterPlaceholder: 'Search...' },
        { field: "courier", header: "Courier", filters: true, filterPlaceholder: 'Search...' },
    ].map((col) => {
        return (
            <Column
                key={col.field}
                field={col.field}
                header={col.header}
                filter
            // body={col.body}
            />
        )
    })

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(filteredShipments);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'products');
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });

                module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
            }
        });
    };

    const initialFilters = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        trackingId: initialFilterRules.andContains,
        shipmentId: initialFilterRules.andContains,
        courier: initialFilterRules.andContains,
    }

    const [filters, setFilters] = useState(initialFilters)
    const [globalFilterValue, setGlobalFilterValue] = useState("")
    const clearFilter = () => {
        setFilters(initialFilters)
        setGlobalFilterValue("")
    }
    const onGlobalFilterChange = (e) => {
        const value = e.target.value
        let _filters1 = { ...filters }
        _filters1["global"].value = value

        setFilters(_filters1)
        setGlobalFilterValue(value)
    }

    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <div className="flex gap-4">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Keyword Search"
                        />
                    </span>
                    <Button
                        type="button"
                        icon="pi pi-filter-slash"
                        label="Clear"
                        className="p-button-outlined"
                        onClick={clearFilter}
                    />

                    <Button
                        type="button"
                        icon="pi pi-file-excel"
                        label="Export as XLSX"
                        // severity="success"
                        rounded onClick={exportExcel}
                        tooltip="Export Data"
                        tooltipOptions={{ position: 'top' }}
                    />

                </div>
            </div>
        )
    }

    // const renderHeader = () => {
    //     return (
    //         <div className='flex justify-content-between align-items-center'>
    //             <div>Vendor Sipment</div>
    //             <div className="flex justify-content-end">
    //                 <div className="flex gap-4">
    //                     <span className="p-input-icon-left">
    //                         <i className="pi pi-search" />
    //                         <InputText
    //                             value={globalFilterValue}
    //                             onChange={onGlobalFilterChange}
    //                             placeholder="Keyword Search"
    //                         />
    //                     </span>
    //                     <Button
    //                         type="button"
    //                         icon="pi pi-filter-slash"
    //                         label="Clear"
    //                         className="p-button-outlined"
    //                         onClick={clearFilter}
    //                     />

    //                     <Button
    //                         type="button"
    //                         icon="pi pi-file-excel"
    //                         label="Export as XLSX"
    //                         // severity="success"
    //                          onClick={exportExcel}
    //                         tooltip="Export Data"
    //                         tooltipOptions={{ position: 'top' }}
    //                     />

    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }
    const vendorShipmentHeader = renderHeader();

    const handlePageChange = async (event) => {
        console.log(event);
        dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
        dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
    }
    const pagination = () => <Paginator first={skipCount} rows={tableRowsCount} totalRecords={filteredShipments?.length} rowsPerPageOptions={[10, 20, 30]} onPageChange={handlePageChange} />

    return (
        <div>
            <Toast ref={toast} />
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
                    value={filteredShipments}
                    showGridlines
                    header={renderHeader}
                    filters={filters}
                    footer={pagination}
                >
                    <Column
                        header='Sl No.'
                        style={{ width: "70px" }}
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
