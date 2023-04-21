import { Suspense, useEffect, useReducer, useState, useRef } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { invoke, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
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
import { Paginator } from "primereact/paginator";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";

/* TODO: <p>Need to render shopify order id if it is Shopify order</p>
   TODO:orders displayed are from order items need to change that after connecting oderItems to shipmentItems
*/

const initialState = {
  orders: [],
  filteredOrders: [],
  tabActiveIndex: 0,
  statusId: undefined,
  tableRowsCount: 10,
  skipCount: 0,
  first: 0,
  rows: 10,
  itemsPerPage: 10,
  selectedShipments: [],
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'GET_ORDERS':
      return { ...state, orders: payload };
    case 'FILTER_BY':
      return { ...state, filteredOrders: payload };
    case 'UPDATE_ACTIVE_TAB':
      return { ...state, tabActiveIndex: payload };
    case 'UPDATE_STATUS_ID':
      return { ...state, statusId: payload };
    case 'UPDATE_SKIP_COUNT':
      return { ...state, skipCount: payload };
    case 'UPDATE_TABLE_ROWS_COUNT':
      return { ...state, tableRowsCount: payload };
    case 'SET_SELECTED_SHIPMENTS':
      return { ...state, selectedShipments: payload };
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}

export const ShipmentsList = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { orders, tabActiveIndex, statusId, skipCount, tableRowsCount, selectedShipments } = state
  console.log('selectedShipments: ', selectedShipments);

  const [{ shipments, hasMore, count: shipmentCount }] = usePaginatedQuery(getShipments, {
    orderBy: { id: "asc" },
    where: { shipmentStatusId: statusId },
    skip: skipCount,
    take: tableRowsCount,
  });
  const [{ shipment_statuses, }] = useQuery(getShipment_statuses, {
    orderBy: { id: "asc" },
    where: {},
    skip: 0,
    take: undefined,
  });

  const orderSelectionMenu = useRef(null);

  const items = [
    {
      label: 'Options',
      items: [
        {
          label: 'Update',
          icon: 'pi pi-refresh',
          command: () => {
            toast.current.show({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-times',
          command: () => {
            toast.current.show({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
          }
        }
      ]
    },
    {
      label: 'Navigate',
      items: [
        {
          label: 'React Website',
          icon: 'pi pi-external-link',
          url: 'https://reactjs.org/'
        },
        {
          label: 'Router',
          icon: 'pi pi-upload',
          command: (e) => {
            //router.push('/fileupload');
          }
        }
      ]
    }
  ];


  const setOrders = (data) => {
    dispatch({ type: 'GET_ORDERS', payload: data });
    dispatch({ type: 'FILTER_BY', payload: data });
  };
  const tabMenuItems = shipment_statuses?.map(status => (
    {
      label: `${status.name === "CREATED" ? "NEW" : status.name}`,
      status: status.name,
      id: status.id
    }
  ))

  const paginator = () =>
    <Paginator first={skipCount} rows={tableRowsCount} totalRecords={shipmentCount} rowsPerPageOptions={[10, 20, 30]} onPageChange={onPageChange} />

  const renderHeader = () => {
    return (

      <div className="flex justify-content-between">
        <Menu model={items} popup ref={orderSelectionMenu} />
        <Button label="Actions" icon="pi pi-bars" onClick={(e) => orderSelectionMenu?.current.toggle(e)} />

      </div>
    )
  }



  useEffect(() => {
    setOrders(shipments)
  }, [shipments])


  const onPageChange = async (event) => {
    console.log('event: ', event);
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
  };


  return (

    <div className=" card">
      <div className="grid">
        <TabMenu
          model={[{ label: "ALL" }, ...tabMenuItems]}
          activeIndex={tabActiveIndex}
          onTabChange={(e) => {
            dispatch({ type: 'UPDATE_ACTIVE_TAB', payload: e.index })
            dispatch({ type: 'UPDATE_STATUS_ID', payload: e.value.id })
          }} />



        <div className="col-12">
          <DataTable
            value={orders}
            responsiveLayout="scroll"
            showGridlines
            stripedRows
            selectionMode='checkbox'
            selection={selectedShipments}
            onSelectionChange={(e) => dispatch({ type: "SET_SELECTED_SHIPMENTS", payload: e.value })}
            header={selectedShipments.length >= 1 && renderHeader}
            footer={paginator}

          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="Shipments" header="Shipments" body={({ shipmentNumber, ordersId }) => <div>
              <p>Code:{shipmentNumber}</p>
              <p>Order:{ordersId}</p>

            </div>} />
            <Column field="giftMessage" header="Gift Message" body={({ orders }) => orders?.giftMessage} />
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
            <Column field="invoiceNumber" header="Invoice   No." className="w-max"></Column>
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
    </div >
  );
}

const ShipmentsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Fulfillments</title>
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
