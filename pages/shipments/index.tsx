import { Suspense, useEffect, useReducer, useRef, useState } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { invoke, useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
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
import { Dialog } from 'primereact/dialog';
import { ContextMenu } from 'primereact/contextmenu';
import { Page, Document, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import Html from 'react-pdf-html';
import { Paginator } from "primereact/paginator";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import createBatch from "app/batches/mutations/createBatch"
import createSalesInvoice from "app/sales_invoice_details/mutations/createSales_invoice_detail"
import { Steps } from 'primereact/steps';

import moment from "moment";
import { Toast } from "primereact/toast";
import PackageDimensions from "components/PackageDimensions";
import Picklist from "app/shipments/components/Picklist";
import CourierSelection from "components/CourierSelection";
import Invoice from "app/shipments/components/Invoice";

import { ConfirmDialog } from 'primereact/confirmdialog'; // For <ConfirmDialog /> component
import { confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method

import SelectCouriers from "components/SelectCouriers";

const initialState = {
  orders: [],
  filteredOrders: [],
  statusId: undefined,
  tableRowsCount: 10,
  skipCount: 0,
  first: 0,
  rows: 10,
  itemsPerPage: 10,
  selectedShipments: [],
  isReadyToShip: false,
  readyToShipActiveIndex: 0,
};


const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 7,
    paddingTop: 15,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: "13vh",
    lineHeight: 1.5,
    flexDirection: "column",
  }
});

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'GET_ORDERS':
      return { ...state, orders: payload };
    case 'FILTER_BY':
      return { ...state, filteredOrders: payload };
    case 'UPDATE_STATUS_ID':
      return { ...state, statusId: payload };
    case 'UPDATE_SKIP_COUNT':
      return { ...state, skipCount: payload };
    case 'UPDATE_TABLE_ROWS_COUNT':
      return { ...state, tableRowsCount: payload };
    case 'SET_SELECTED_SHIPMENTS':
      return { ...state, selectedShipments: payload };
    case 'RESET_SELECTED_SHIPMENTS':
      return { ...state, selectedShipments: [] };
    case 'READY_TO_SHIP':
      return { ...state, isReadyToShip: payload };
    case 'READY_TO_SHIP_ACTIVE_INDEX':
      return { ...state, readyToShipActiveIndex: payload };
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}

const readyToShipItems = [
  {
    label: ' Package Dimensions'
  },
  {
    label: 'Select Courier'
  },
]

type Shipment = {
  id: number
}

export const ShipmentsList = () => {
  const cm = useRef<ContextMenu>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [viewInvoicePdf, setViewInvoicePdf] = useState(false)

  const menuModel = [
    {
      label: 'View Invoice', icon: 'pi pi-fw pi-search', command: (data) => {
        // setSelectedShipment(data)
        setViewInvoicePdf(true)
      }
    },
    { label: 'View Picklist', icon: 'pi pi-fw pi-list', command: () => setPickListVisible(true) },
  ];

  // const page = Number(router.query.page) || 0;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { orders, statusId, skipCount, tableRowsCount, selectedShipments, isReadyToShip, packageDimensions, readyToShipActiveIndex } = state
  // console.log('selectedShipments: ', selectedShipments);

  const firstSelectedShipmentItem = selectedShipments[0]

  const [{ shipments, count: shipmentCount }, { refetch }] = usePaginatedQuery(getShipments, {
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

  const toast = useRef<Toast>(null);

  const orderSelectionMenu = useRef(null);


  const [items, setItems] = useState([
    {
      label: 'Options',
      items: [
        {
          label: 'Update',
          icon: 'pi pi-refresh',
          command: () => {
            toast.current?.show({ severity: 'success', summary: 'Updated', detail: 'Data Updated', life: 3000 });
          }
        },
        {
          label: 'Delete',
          icon: 'pi pi-times',
          command: () => {
            toast.current?.show({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
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
  ])

  const [createBatchMutation] = useMutation(createBatch)
  const [createSalesInvoiceMutation] = useMutation(createSalesInvoice)



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
    const CREATE_STATE = "CREATED"
    return (

      <div className="flex justify-content-between">
        <Menu model={items} popup ref={orderSelectionMenu} onShow={() => {
          if (selectedShipments[0].shipment_status.name === CREATE_STATE) {
            setItems([{
              label: 'Invoice',
              items: [
                {
                  label: 'Generate Invoice',
                  icon: 'pi pi-file-pdf',
                  command: () => {
                    // GENERATE INVOICE MUTATION
                    confirmDialog({
                      message: 'This will change the order status to "PACKED" and will generate invoice. Do you want to proceed?',
                      header: 'Confirmation',
                      icon: 'pi pi-exclamation-triangle',
                      accept: async () => {
                        const dataToReduceInventory = selectedShipments.reduce((acc, curr) => {
                          if (curr.shipment_items.length) {
                            // push id and quantity to acc
                            const currItems = curr.shipment_items.map((items) => {
                              const { order_items: { product, quantity } } = items
                              return ({ product, quantity })
                            })
                            return [...acc, ...currItems]
                          } return acc
                        }, [])
                        console.log('dataToReduceInventory: ', dataToReduceInventory);

                        await createSalesInvoiceMutation({

                          shipmentIds: selectedShipments.map(({ id }) => id),
                          shipmentProducts: dataToReduceInventory
                        }
                          ,
                          {
                            onSuccess: async () => {
                              await refetch()
                              toast.current?.show({ severity: 'success', summary: 'Invoice Generated', life: 3000 })
                              dispatch({ type: 'RESET_SELECTED_SHIPMENTS', payload: [] })

                            },
                            onError: (error) => {
                              console.log('error: ', error);
                              toast.current?.show({ severity: 'error', summary: 'Invoice Creation Failed', detail: `Failed to create invoice`, life: 3000 })
                            },
                          }
                        )
                      }
                    });

                  }
                },
                {
                  label: 'View Picklist',
                  icon: 'pi pi-file-pdf',
                  command: () => { setPickListVisible(true) }
                },
              ]
            }, {
              label: 'Group',
              items: [
                {
                  label: 'Batch Items',
                  icon: 'pi pi-box',
                  command: async () => {
                    // GENERATE BATCH MUTATION
                    const batchNumber = "BATCH_" + moment().format('x')
                    await createBatchMutation({
                      batchNumber: batchNumber,
                      shipment: {
                        connect: selectedShipments.map(({ id }) => ({ id }))
                      }
                    }, {
                      onSuccess: () => {
                        toast.current?.show({ severity: 'success', summary: 'Batch Added', detail: `Batch #${batchNumber}`, life: 3000 })
                      },
                      onError: (error) => {
                        console.log('error: ', error);
                        toast.current?.show({ severity: 'error', summary: 'Batch Creation Failed', detail: `Failed to create batch`, life: 3000 })
                      },
                    })
                  }
                },
                {
                  label: 'View Picklist',
                  icon: 'pi pi-file-pdf',
                  command: () => { setPickListVisible(true) }
                },
              ]
            }])
          } else if (firstSelectedShipmentItem.shipment_status.name === "PACKED") {
            setItems([{
              label: 'Options',
              items: [
                {
                  label: 'Ready To Ship',
                  icon: 'pi bi-box-seam',
                  command: (e) => {
                    // Create 2 STEP PROCESS TO CHANGE STATE
                    dispatch({ type: "READY_TO_SHIP", payload: true })
                    if (firstSelectedShipmentItem?.dimensionsId) {
                      dispatch({ type: "READY_TO_SHIP_ACTIVE_INDEX", payload: 1 })
                    }
                  }
                },
              ]
            },])
          }
        }} />
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

  const [pickListVisible, setPickListVisible] = useState(false)

  return (

    <div className=" card">
      {isReadyToShip &&
        <div className="m-3"     >
          <Steps model={readyToShipItems} activeIndex={readyToShipActiveIndex} />
          {!readyToShipActiveIndex &&
            <PackageDimensions shipmentId={firstSelectedShipmentItem?.id} dispatch={dispatch} />}

          {readyToShipActiveIndex === 1 && <SelectCouriers dispatch={dispatch} shipmentId={firstSelectedShipmentItem?.id} refetchShipments={refetch} />}
        </div>
      }
      <Dialog visible={pickListVisible} header="PickList" onHide={() => setPickListVisible(false)}>
        <Picklist invoice={selectedShipments.reduce((acc, { orders }) => {
          const { order_items } = orders;
          return [...acc, ...order_items.map(({ id, products, quantity }) => ({
            id,
            SKU: products.sku,
            itemName: products.name,
            brand: products.brand,
            qty: quantity,
            image: products.imageUrl,
          }))]
        }, [])} />
      </Dialog>
      {selectedShipment?.id && <Dialog header="Header" visible={viewInvoicePdf} onHide={() => setViewInvoicePdf(false)}>
        <Suspense fallback={<div>Loading...</div>}>
          <Invoice shipmentID={selectedShipment?.id} />
        </Suspense>
      </Dialog>}
      <div className="grid">
        <ConfirmDialog />
        <Toast ref={toast} />
        <TabMenu
          model={[{ label: "ALL" }, ...tabMenuItems]}
          activeIndex={statusId}
          onTabChange={(e) => {
            dispatch({ type: 'UPDATE_STATUS_ID', payload: e.value.id })
            dispatch({ type: 'RESET_SELECTED_SHIPMENTS', payload: [] })

          }} />
        <div className="col-12">
          <div className="flex justify-content-end">
            <i className="pi pi-info-circle"> Right click on shipment for more options</i>
          </div>
          <ContextMenu model={menuModel} ref={cm} />
          <DataTable
            onContextMenu={(e) => cm.current.show(e.originalEvent)}
            // contextMenuSelection={selectedShipment}
            onContextMenuSelectionChange={(e) => setSelectedShipment(e.value)}
            value={orders}
            responsiveLayout="scroll"
            showGridlines
            stripedRows
            selectionMode='multiple'
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
            <Column header="Products" body={({ orders: { order_items }, shipment_items }) => <div>
              {
                shipment_items.map(({ order_items: { products }, quantity }) => ({ products, quantity }))?.map((product, i) => {
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
                })

              }
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
