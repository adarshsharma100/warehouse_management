import { Suspense, useEffect, useReducer, useState } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "layouts/Layout"
import Loading from "components/loading"
import getShipments from "app/shipments/queries/getShipments";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TabMenu } from 'primereact/tabmenu';
import getShipment_statuses from "app/shipment_statuses/queries/getShipment_statuses";
import { Chip } from "primereact/Chip";
import { dateFormat } from "app/constants";


const ITEMS_PER_PAGE = 100;
const initialState = {
  orders: [],
  filteredOrders: [],
  isLoading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'GET_ORDERS':
      return { ...state, orders: action.payload };
    case 'FILTER_BY':
      return { ...state, filteredOrders: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const ShipmentsList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ shipments, hasMore }] = usePaginatedQuery(getShipments, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });
  const [{ shipment_statuses, }] = useQuery(getShipment_statuses, {
    orderBy: { id: "asc" },
  });

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });

  const [state, dispatch] = useReducer(reducer, initialState);
  const { orders, filteredOrders } = state
  const setOrders = (data) => {
    dispatch({ type: 'GET_ORDERS', payload: data });
    dispatch({ type: 'FILTER_BY', payload: data });
  };
  const tabMenuItems = shipment_statuses?.map(status => (
    {
      label: `${status.name === "CREATED" ? "NEW" : status.name}`,
      status: status.name
    }
  ))

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setOrders(shipments)
  }, [])

  return (

    <div className=" card">
      <div className="grid">
        <TabMenu
          model={[{ label: "ALL" }, ...tabMenuItems]}
          activeIndex={activeIndex}
          onTabChange={(e) => {
            const tabStatus = e.value.status
            const tabName = e.value.label
            const filterOrdersByStatus = orders.filter(({ shipment_status: { name } }) => name === tabStatus)
            dispatch({ type: 'FILTER_BY', payload: tabName === "ALL" ? orders : filterOrdersByStatus })
          }} />



        <div className="col-12">
          <div className="card">
            <DataTable
              value={filteredOrders}
              // tableStyle={{ minWidth: '50rem' }}
              responsiveLayout="scroll"
              showGridlines
              stripedRows >
              <Column field="Shipments" header="Shipments" body={({ shipmentNumber, ordersId }) => <div>
                <p>Code:{shipmentNumber}</p>
                <p>Order:{ordersId}</p>
                {/* TODO: <p>Need to tender shopify order id if it is Shopify order</p> */}
              </div>} />
              <Column field="giftMessage" header="Gift Message" body={({ orders }) => orders?.giftMessage} />
              {/* <Column field="itemContains" header="Item Contains"></Column> */}
              <Column header="Products" body={({ orders: { order_items } }) => <div>
                {order_items?.map((product, i) => {
                  const { quantity, products: { name, sku } } = product
                  return (
                    <div key={i} className="pt-2 pb-2 w-18rem border-1 border-solid border-blue-700 border-round-2xl p-3 mb-3 ">
                      {[{ prop: "Name", value: name },
                      { prop: "SKU", value: sku },
                      { prop: "Quantity", value: quantity }
                      ].map(({ prop, value }, index) => (
                        <div key={index} className="grid">
                          <label className="font-semibold col-4">{prop}:</label>
                          <div className="col">
                            {value?.toString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>} >
              </Column>
              <Column header="Channel" body={({ orders: { shopifyId } }) =>
                <Chip
                  label={`${shopifyId ? "SH" : "IH"}`}
                  className={`${shopifyId ? "bg-green-500" : "bg-cyan-500"}`}
                />
              } >
              </Column>
              <Column header="Status" body={({ shipment_status }) => <div>
                <p>{shipment_status?.name}</p>
              </div>} >
              </Column>
              <Column header="Priority" body={({ priority }) => <div>
                <p>{priority}</p>
              </div>} >
              </Column>
              {/* <Column field="picklist" header="Picklist"></Column> */}
              <Column field="invoice" header="Invoice   No." className="w-max"></Column>
              <Column
                header="OnHold"
                body={({ onhold }) => <p>{onhold ? "Yes" : "No"}</p>} >
              </Column>
              <Column
                header="State"
                body={({ orders: { addresses_orders_shippingAddressIdToaddresses: { state } } }) =>
                  <p>{state}</p>} >
              </Column>
              <Column header="FulfillmentTAT" body={({ fulfilmentTat }) => <div>
                <p>{dateFormat(fulfilmentTat) ?? "-"}</p>
              </div>} >
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div >
  );
}

const ShipmentsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Shipments</title>
      </Head>

      <div>
        <Suspense fallback={<Loading />}>
          <ShipmentsList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default ShipmentsPage;
