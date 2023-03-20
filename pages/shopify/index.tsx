import axios from "axios"
import Loading from "components/loading"
import Layout from "layouts/Layout"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Suspense, useState, useEffect } from "react"






export const Orders = () => {


    const [shopifyOrders, setShopifyOrders] = useState(null)
    console.log('shopifyOrders: ', shopifyOrders);




    useEffect(() => {
        let config = {
            headers: {
                'X-Shopify-Access-Token': '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',
                'Content-Type': 'application/json'
            },
        };

        axios.get("'https://robocraze-com.myshopify.com/admin/api/2023-01/orders.json", config)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.log(error);
            });


    }, [])

    return (
        <div>
            <div >
                <div className="card flex justify-content-between align-items-center mb-2">
                    <h4 className="mb-0">Orders</h4>
                    <div className="flex justify-content-end align-items-center">
                        <Button
                            icon="pi pi-plus"
                            label="Create Order"
                            onClick={() => {

                            }}
                        ></Button>

                    </div>
                </div>

            </div>
            {/* <DataTable
                value={ }
                responsiveLayout="scroll"
                showGridlines
                // header={renderHeader}
                stripedRows
                className="text-s datatable-responsive"

            // paginator
            // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
            // rows={PAGINATION_VARIABLES.rows}
            // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
            // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
            >
                <Column
                    field="products.sku"
                    header="Product SKU"
                // className="text-center"
                />
                <Column
                    field=""
                    header="PO"
                    body={() => <a href='/purchase_orders/id'>PO Num </a>}
                // className="text-center"
                />

                <Column
                    field="products.name"
                    header="Name"
                // className="text-center"
                />
                <Column
                    field="price"
                    header="Target Price / Unit"
                // className="text-center"
                />
                <Column
                    field="quantity"
                    header="Quantity"
                // className="text-center"
                />
            </DataTable> */}
        </div>
    )
}




const OrdersPage = () => {
    return (
        <Suspense fallback={<Loading />}>
            <Layout>
                <Orders />
            </Layout>
        </Suspense>
    )
}

export default OrdersPage