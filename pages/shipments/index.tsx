import { Suspense, useCallback, useEffect, useReducer, useRef, useState } from "react";
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
import { Chip } from "primereact/chip";
import { dateFormat } from "app/constants";
import { Dialog } from 'primereact/dialog';
import { ContextMenu } from 'primereact/contextmenu';
import { Page, Document, StyleSheet, PDFViewer } from "@react-pdf/renderer";
import Html from 'react-pdf-html';
import { Paginator } from "primereact/paginator";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import createBatch from "app/batches/mutations/createBatch"
import createManifest from "src/manifests/mutations/createManifest";
import createSalesInvoice from "app/sales_invoice_details/mutations/createSales_invoice_detail"
import { Steps } from 'primereact/steps';
import { MenuItem } from 'primereact/menuitem';

import moment from "moment";
import { Toast } from "primereact/toast";
import PackageDimensions from "components/PackageDimensions";
import Picklist from "app/shipments/components/Picklist";
import CourierSelection from "components/CourierSelection";
import Invoice from "app/shipments/components/Invoice";
import Manifest from "app/shipments/components/Manifest";

import { ConfirmDialog } from 'primereact/confirmdialog'; // For <ConfirmDialog /> component
import { confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method

import SelectCouriers from "components/SelectCouriers";
import { classNames } from "primereact/utils";
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from "primereact/fileupload";
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import updateShipment from "app/shipments/mutations/updateShipment";
import updateManyShipments from "app/shipments/mutations/updateManyShipments";


const initialState = {
  orders: [],
  filteredOrders: [],
  manifestShipments: [],
  manifestStep: 0,
  displayManifest: false,
  statusId: undefined,
  statusName: "ALL",
  tableRowsCount: 10,
  skipCount: 0,
  first: 0,
  rows: 10,
  itemsPerPage: 10,
  selectedShipments: [],
  isReadyToShip: false,
  readyToShipActiveIndex: 0,
  containerName: 'manifests',
  sasToken: process.env.NEXT_PUBLIC_STORAGESASTOKEN,
  storageAccountName: process.env.NEXT_PUBLIC_STORAGERESOURCENAME,
  manifestImageURL: ""
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
    case 'UPDATE_STATUS_NAME':
      return { ...state, statusName: payload };
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
    case 'DISPATCH_SHIPMENTS':
      return { ...state, displayManifest: true }
    case 'SET_SHIPMENT_STATE':
      return { ...state, [payload.prop]: payload.value }
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}

// const

const readyToShipItems = [
  {
    label: ' Package Dimensions'
  },
  {
    label: 'Select Courier'
  },
]

type Shipment = {
  id: numberstate
}

export const ShipmentsList = () => {
  const cm = useRef<ContextMenu>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [viewInvoicePdf, setViewInvoicePdf] = useState(false)
  const [files, setFiles] = useState([]); 

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
  const { orders, statusId, skipCount, tableRowsCount, selectedShipments, isReadyToShip, packageDimensions, readyToShipActiveIndex, containerName, sasToken, storageAccountName, manifestImageURL, statusName } = state
  console.log('selectedShipments ', selectedShipments);

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

  const actionMenuItems = [
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
    {
      label: 'Generate Manifest',
      icon: 'pi bi-clipboard2-data',
      command: (shipments) => {
        dispatch({ type: 'DISPATCH_SHIPMENTS' })
        // setManifestVisible(true)
      }
    },
    {
      label: 'Mark as Delivered',
      icon: 'pi  bi-geo-fill',
      command: async (e) => {
        // Create 2 STEP PROCESS TO CHANGE STATE
        await updateManyShipmentMutation({
          where: {
            id: {
              in: selectedShipments.map(({ id }) => id)
            }
          },
          shipmentStatusId: 5
        }, {
          onSuccess: async () => {
            console.log("success")
            await refetch()
          },
          onError: (error) => { console.log(error) }
        })

      }
    },

  ]
  const [items, setItems] = useState(actionMenuItems)

  const [createBatchMutation] = useMutation(createBatch)
  const [createManifestMutation] = useMutation(createManifest)
  const [createSalesInvoiceMutation] = useMutation(createSalesInvoice)
  const [updateManyShipmentMutation] = useMutation(updateManyShipments)

  const actionItemsOnFilter = () => {
    const FilterRules = {
      "PACKED": ["Batch Items", "View Picklist", "Ready To Ship"],
      "CREATED": ["Batch Items", "View Picklist", "Generate Invoice"],
      "READY TO SHIP": ["Batch Items", "View Picklist", "Generate Manifest"],
      "DISPATCHED": ["Batch Items", "View Picklist", "Mark as Delivered"],
      "DELIVERED": ["Batch Items", "View Picklist"],
      // "PUTAWAY PENDING": [],
      // "CUSTOMER RETURN": [],
      // "COURIER RETURN": [],
      // "SHIPMENT ERRORS": [],
    }
    const newItems = [...actionMenuItems]
    console.log('newItems: ',);
    console.log('newItems: ', {
      filter: FilterRules[statusName],

      new: newItems[0]
    });

    const filteredOptions = newItems.filter(({ label }) => FilterRules[statusName]?.includes(label))
    setItems(filteredOptions)

  }



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
        <Menu model={items} popup ref={orderSelectionMenu}
          onShow={actionItemsOnFilter}
        />
        {statusName !== "ALL" &&
          < Button label="Actions" icon="pi pi-bars" onClick={(e) => orderSelectionMenu?.current.toggle(e)} />}
      </div>
    )
  }

  const onUpload = (event) => {
    console.log('event: ', event);
    setFiles(event.files);
  };

  const uploadFileToBlob = useCallback(
    async (file: File | null, newFileName: string) => {
      if (!file) {
        console.log('No FILE');
      } else {
        const blobService = new BlobServiceClient(
          `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
        );

        const containerClient: ContainerClient =
          blobService.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(newFileName);
        console.log('file: ', file);
        const uploadResponse = await blockBlobClient.uploadBrowserData(file)
        return { uploadResponse, blockBlobClient }
      }
      console.log("done");
    },
    []
  );

  const uploadHandler = async (event: FileUploadHandlerEvent,) => {
    const filename = uuidv4()
    if (event.files[0]) {
      // const newFileName = event.files[0].name.split('.').pop();
      const response = await uploadFileToBlob(event.files[0], filename);
      console.log('response: ', response);

      await createManifestMutation({
        manifestNumber: filename,
        shipment: selectedShipments.map(({ id }) => ({ id }))
      }, {
        onSuccess: () => {
          dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestStep", value: 2 } })
          dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestImageURL", value: filename } })

        },
        onError: (error) => { console.log(error) }
      })


    }

  };



  useEffect(() => {
    setOrders(shipments)
  }, [shipments])


  const onPageChange = async (event) => {
    console.log('event: ', event);
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
  };

  const [pickListVisible, setPickListVisible] = useState(false)
  const [manifestVisible, setManifestVisible] = useState(false)


  return (

    <div className=" card">
      {isReadyToShip &&
        <div className="m-3 ">
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
      
      <Dialog style={{ minWidth: "75vw" }} visible={state.displayManifest} header="Manifest" onHide={() => {
        dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "displayManifest", value: false } })
        dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestStep", value: 0 } })
        dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestImageURL", value: "" } })
      }}>
        
        {/* <pre>{JSON.stringify(orders.slice(0, 3), null, 2)}</pre> */}
        <Steps
          className="p-2"
          model={[
            {
              label: 'Print Manifest',
              command: (event) => {
                dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestStep", value: 0 } })
              }
            },
            {
              label: 'Upload Manifest',
              command: (event) => {
                dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestStep", value: 1 } })
              }
            },
            {
              label: 'View Manifest',
              command: (event) => {
                dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestStep", value: 2 } })
              }
            }
          ]}
          activeIndex={state.manifestStep}
          readOnly={false}
        />
        <div className="p-4">
          {(state.manifestStep === 0) && <Manifest
            manifestData={selectedShipments.map(({ awb, id, shipmentNumber, orders, customer, shipment_items }) => {
              const { addresses_orders_shippingAddressIdToaddresses, customers, order_items, gateway } = orders
              const { areaStreet, cityCountryProvince, buildingNumber, pincode, state } = addresses_orders_shippingAddressIdToaddresses
              const totalObject = shipment_items.reduce(({ total, tax, totalWithTax, quantity }, { order_items }) => {
                return {
                  total: parseFloat(order_items.quantity * order_items.price + total),
                  tax: parseFloat(order_items.quantity * order_items.price * 0.18 + tax),
                  totalWithTax: parseFloat(order_items.quantity * order_items.price * 1.18 + totalWithTax),
                  quantity: order_items.quantity + quantity
                }
              }, {
                total: 0,
                tax: 0,
                totalWithTax: 0,
                quantity: 0
              })
              return {
                awb,
                orderId: id,
                refNum: shipmentNumber,
                attention: "name goes here",
                address1: areaStreet,
                address2: [buildingNumber, cityCountryProvince, state].filter(data => data).join(', '),
                pincode,
                contactNum: customers.contact_number,
                contents: order_items.map(({ products }) => `${products.name} (${products.sku})`),
                weight: "weight",
                declaredValue: totalObject?.totalWithTax,
                collectable: gateway === "COD" ? totalObject?.totalWithTax : 0,
                qty: totalObject?.quantity,
                mode: gateway,
              }
            })}
          />}
          {state.manifestStep === 1 && (
            <div className="flex align-items-center justify-content-center">
              <FileUpload
                name="demo[]"
                url="./upload.php"
                onUpload={onUpload}
                customUpload
                uploadHandler={uploadHandler}
                multiple
                accept="image/*"
                maxFileSize={1000000}
              />
            </div>
          )}
          {state.manifestStep === 2 && <div>
            <img src={`https://warehouse100.blob.core.windows.net/manifests/${manifestImageURL}`} alt="manifest-image" />
          </div>}
        </div>
        <Button
          label={state.manifestStep === 2 ? "CLOSE" : "NEXT"}
          className="manifest__next_Btn"
          onClick={() => {
            if (state.manifestStep === 2) {
              dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "displayManifest", value: false } })
              dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestStep", value: 0 } })
              dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestImageURL", value: "" } })
              return
            }
            dispatch({ type: "SET_SHIPMENT_STATE", payload: { prop: "manifestStep", value: state.manifestStep + 1 } })

          }}
        />

      </Dialog>
      {/* {selectedShipment?.id &&
        <Dialog header="Header" visible={viewInvoicePdf} onHide={() => setViewInvoicePdf(false)}>
          <Suspense fallback={<div>Loading...</div>}>
            <Invoice shipmentID={selectedShipment?.id} />
          </Suspense>
        </Dialog>
      } */}


      {/* {selectedShipments.length > 0 && (
        <Dialog header="Header" visible={viewInvoicePdf} onHide={() => setViewInvoicePdf(false)}>
          <Suspense fallback={<div>Loading...</div>}>
            {selectedShipments.map((shipment) => (
              <Invoice key={shipment.id} shipmentID={shipment.id} />
            ))}
          </Suspense>
        </Dialog>
      )} */}


      {selectedShipment && selectedShipment.length > 0 && (
        <Dialog
          header="Header"
          visible={viewInvoicePdf}
          onHide={() => setViewInvoicePdf(false)}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <PDFViewer>
              {selectedShipment.map((shipment) => (
                <InvoicePage key={shipment.id} shipmentID={shipment.id} />
              ))}
            </PDFViewer>
          </Suspense>
        </Dialog>
      )}





      <div className="grid">
        <ConfirmDialog />
        <Toast ref={toast} />

        
        <TabMenu
          model={[{ label: "ALL" }, ...tabMenuItems]}
          activeIndex={statusId}
          onTabChange={(e) => {
            dispatch({ type: 'UPDATE_STATUS_ID', payload: e.value.id })
            dispatch({ type: 'UPDATE_STATUS_NAME', payload: e.value.status ?? e.value.label })
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
