import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';



const parameters = [{
    title: "Picklist Number",
    value: "-",
}, {
    title: "Shipment Manifest",
    value: "-",
}, {
    title: "Return Manifest",
    value: "-",
}, {
    title: "Invoice Number",
    value: "-",
},
{
    title: "Parent Package",
    value: "-",
}, {
    title: "Reshipment Order",
    value: "-",

}, {
    title: "RTO Facility",
    value: "TIF LABS PVT LTD",
}, {
    title: "Shipping Method",
    value: "std-true",
}, {
    title: "Courier Status",
    value: "-",
},
{
    title: "Courier Name",
    value: "-",
}, {
    title: "Dispatched Date",
    value: "-",
}, {
    title: "Delivery Date",
    value: "-",
}, {
    title: "No. of Items",
    value: 34,
}, {
    title: "Shipping Carrier",
    value: "-",
}, {
    title: "AWD No.",
    value: "-",
},
{
    title: "No. of Boxes",
    value: 1,
}, {
    title: "Shipping Package Type",
    value: "SB",
}, {
    title: "Shipping Package Code",
    value: "-",
}, {
    title: "Package Dimension (mm)",
    value: 110 * 120 * 50,
},
{
    title: "Weight(kg)",
    value: 0.463,
}, {
    title: "Zone",
    value: "-",
}, {
    title: "E-waybill Number",
    value: "-",
}, {
    title: "E-waybill Valid Till",
    value: "-",
}, {
    title: "E-waybill Date",
    value: "-",
},

]

const products = [
    {
        shipment: { code: "ROBO99123", order: "71403" },
        "products": [
            { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
            { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
        ],
        channel: {
            name: "SH"
        },

        status: {
            name: "CREATED"
        },

        priority: {
            number: "0"
        },

        onhold: {
            name: "No"
        },

        state: {
            name: "Himachal Pradesh"
        },

        fulfillmentTAT: {
            date: "08 Apr 2023, 06:36, SLA BREACHED"
        },
    },

]

const cities = parameters.map(({ title }) => ({ name: title }))

export default function sampleFulfillment() {

    const [selectedNames, setSelectedNames] = useState(null);

    return (
        <div >

            <h1>Sample Fulfillment</h1>
            <pre>
                {JSON.stringify(selectedNames, null, 2)}
            </pre>


            <div className="flex">

                <span className='ml-auto block' ><MultiSelect value={selectedNames} onChange={(e) => setSelectedNames(e.value)} options={cities} optionLabel="name"
                    placeholder="Select Cities" maxSelectedLabels={3} className="w-full md:w-20rem" /></span>
            </div>




            <div className="grid">
                {
                    parameters.filter(({ title }) => {

                        if (selectedNames === null) return true

                        return selectedNames.some(({ name }) => name === title)

                    }).map(({ title, value }) => (
                        <div className="col-12 md:col-6 lg:col-3">{title}: {value}</div>
                    ))
                }
                <div className="col-12">
                    <DataTable value={products} tableStyle={{ minWidth: '50rem' }} showGridlines stripedRows >

                        <Column header="Shipment" body={({ shipment }) => <div>
                            <p>{shipment.code}</p>
                            <p>{shipment.order}</p>
                        </div>} >
                        </Column>


                        <Column field="giftMessage" header="Gift Message(s)"></Column>
                        <Column field="itemContains" header="Item Contains"></Column>

                        <Column header="Products" body={({ products }) => <div>
                            {products.map(product => (


                                <div>
                                    <p>{product.name}</p>
                                    <p>{product.SKU}</p>
                                    <p>{product.quantity}</p>
                                </div>
                            ))}
                        </div>} >
                        </Column>


                        <Column header="Channel" body={({ channel }) => <div>
                            <p>{channel.name}</p>
                        </div>} >
                        </Column>


                        <Column header="Status" body={({ status }) => <div>
                            <p>{status.name}</p>
                        </div>} >
                        </Column>

                        <Column header="Priority" body={({ priority }) => <div>
                            <p>{priority.number}</p>
                        </div>} >
                        </Column>
                        <Column field="picklist" header="Picklist"></Column>
                        <Column field="invoiceNo." header="Invoice No."></Column>
                        <Column header="OnHold" body={({ onhold }) => <div>
                            <p>{onhold.name}</p>
                        </div>} >
                        </Column>
                        <Column header="State" body={({ state }) => <div>
                            <p>{state.name}</p>
                        </div>} >
                        </Column>


                        <Column header="FulfillmentTAT" body={({ fulfillmentTAT }) => <div>
                            <p>{fulfillmentTAT.date}</p>
                        </div>} >
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}




