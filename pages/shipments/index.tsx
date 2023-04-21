import { Suspense, useEffect, useReducer, useRef, useState } from "react";
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
import { Dialog } from 'primereact/dialog';
import { ContextMenu } from 'primereact/contextmenu';
import { Page, Document, Image, StyleSheet, View, Text, PDFViewer } from "@react-pdf/renderer";
import Html from 'react-pdf-html';
import { Paginator } from "primereact/paginator";

import moment from "moment";

const initialState = {
  orders: [],
  filteredOrders: [],
  tabActiveIndex: 0,
  page: 0,
  statusId: undefined,
  tableRowsCount: 10,
  skipCount: 0,
  first: 0,
  rows: 10,
  itemsPerPage: 10
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

const html = `
<html>
  <head>
    <style>
			.parent {
				display: flex;
        flex-direction: row;
			}

			.border {
				border: 1px solid #ccc;
				padding: 5px;
				width: 100%;
			}

			.bottom_border {
				border-bottom: 1px solid #ccc;
				padding-bottom: 5px;
				margin-bottom: 10px;
			}

			p, ol {
				margin: 0;
				font-size: 9px;
				line-height: 1.4;
			}

			.parent:last-child {
				margin-bottom: 0;
			}

      h3 {
        margin: 0px;
        text-transform: uppercase;
        font-size: 14px;
      }

      h6 {
        margin: 0;
      }

      h4 {
        margin: 0px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }

      table, th, td {
        border: 1px solid black;
      }

      table {
				width: 100%;
        font-size: 10px;
        border-collapse: collapse;
        border: 1px solid black;
			}

      th,
			td {
				text-align: left;
				padding: 3px;
        border: 1px solid black;
			}
      th {
				color: rgb(10, 0, 0);
        border: 1px solid black;
        background: #E0E0E0;
			}


    </style>
  </head>
  <body>
    <div id="invoiceForm">
      <h3>Invoice Details</h3>
      <div class="parent">
        <div class="border">
          <h4>Sender</h4>
          <p><b>TIF LABS PRIVATE LIMITED</b></p>
          <p>No, 912/10, survey no, 104, 4th G street, Chelekere, Kalyan Nagar</p>
          <p>Bangaluru 560043</p>
          <p>Karnataka (29) India</p>
          <p>Phone Number: 123654896</p>
          <p>GSTIN: 29AAFCT7562C1Z5</p>
        </div>

        <div class="border" style="display:flex; justify-content: space-between;">
          <div>
            <h4>Invoice Details</h4>
            <p>Invoice Number: TIF/23-24/102052</p>
            <p>Invoice Date: 18-April-2023</p>
          </div>
        </div>

        <div class="border">
          <h4>Order Details</h4>
          <p>Order Number: #72787</p>
          <p>OrderDate: 18-April-2023</p>
          <p>Channel:<b> SHOPIFY</b></p>
          <p>Payment Mode: COD</p>
        </div>
      </div>
      <div class="parent">
        <div class="border">
        	<h4>Bill To:</h4>
					<p><b>Pranav Garg</b></p>
					<p>
						Mount International school, C/O KRISHNA ELECTRIC STORE, NEAR POLICE
						STATION LUDHIANA-141421 Punjab (03)India
					</p>
					<p>T: 9417288626</p>
        </div>
        <div class="border">
        	<h4>Ship To:</h4>
					<p><b>Pranav Garg</b></p>
					<p>
						Mount International school, C/O KRISHNA ELECTRIC STORE, NEAR POLICE
						STATION LUDHIANA-141421 Punjab (03)India
					</p>
					<p>T: 9417288626</p>
        </div>
        <div class="border">
					<h4>Dispatch Through: </h4>
					<p><b>Maruti</b></p>
					<p>AWB No:</p>
					<p><b>6FGDS256D6</b></p>
				</div>
      </div>

      <div style="margin-top: 15px;">
        <h3>Invoice Item Details</h3>
        <table style="width: 100%;">
          <tbody>
            <tr>
              <th>Sr No</th>
              <th>Product Name</th>
              <th>Product code</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Taxable Value(INR)</th>
              <th>IGST(INR)</th>
              <th>Amount (INR)</th>
            </tr>
            <tr>
              <td>1</td>
              <td><b>Raspberry pi Zero W Case</b></td>

              <td>
                <p>TIFAC0078</p>
                <p>HSN code:39231090</p>
              </td>

              <td>1</td>
              <td>800.42</td>
              <td>800.42</td>
              <td>144.08</td>
              <td>944.50</td>
            </tr>
            <tr>
              <td>2</td>
              <td><b>Raspberry Pi zero w-only board</b></td>
              <td>
                <p>TIFC00107</p>
                <p>HSN code:84733020</p>
              </td>
              <td>1</td>
              <td>800.42</td>
              <td>800.42</td>
              <td>144.08</td>
              <td>944.50</td>
            </tr>

            <tr>
              <td></td>
              <td><b>COD charges</b></td>
              <td></td>
              <td></td>
              <td></td>

              <td>42.38</td>
              <td>7.62</td>
              <td>50.00</td>
            </tr>
            <tr>
              <td></td>
              <td><b>Total:</b></td>
              <td></td>
              <td>1</td>
              <td></td>

              <td>1643.22</td>
              <td>295.78</td>
              <td>1939.0</td>
            </tr>
          </tbody>
        </table>
        <div style="margin: 15px 0px;">
        		<p>Amount Chargeable(in words)</p>
						<p><b>INR One Thousand Nine Hundred and Thirty</b></p>
						<p><b>Nine Rupees and Zero Paise Only</b></p>
						<p><b>Tax is payable on reverse charge basis :No</b></p>
        </div>
        <div style="display: flex; flex-direction: row;">
					<div class="border" style="flex:2">
            <h3>Declaration</h3>
            <ol style="padding-right: 35px">
              <li>All claims, if any, for shortages or damages must be reported to customer service on the day of delivery through the contact us page on the web store.</li>
              <li>All Disputes are subject to Karnataka(29) Jurisdiction only.</li>
            </ol>
            <br/>
            <p>Notes: Thank you for your business.</p>
            <p>Terms & Conditions: This is a system generated Invoice.</p>
            <p>No signature is required</p>
          </div>
          <div class="border" style="flex:1; text-align: center; display: flex; justify-content: space-between;">
            <h6>For TIF LABS PRIVATE LIMITED</h6>
            <p>Authorised Signatory</p>
          </div>
        </div>
      </div>
    </div>

  </body>
</html>
`

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
    case 'UPDATE_PAGE':
      return { ...state, page: payload };
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}

export const ShipmentsList = () => {
  const cm = useRef<ContextMenu>(null);
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [viewInvoicePdf, setViewInvoicePdf] = useState(false)

  const menuModel = [
    { label: 'View Invoice', icon: 'pi pi-fw pi-search', command: () => setViewInvoicePdf(true) },
  ];

  // const page = Number(router.query.page) || 0;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { orders, tabActiveIndex, page, statusId, skipCount, tableRowsCount } = state

  const [{ shipments, count: shipmentCount }] = usePaginatedQuery(getShipments, {
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

  // const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  // const goToNextPage = () => router.push({ query: { page: page + 1 } });


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



  useEffect(() => {
    setOrders(shipments)
  }, [shipments])


  const onPageChange = async (event) => {
    console.log('event: ', event);
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
    dispatch({ type: "UPDATE_PAGE", payload: event.page })
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
            dispatch({ type: "UPDATE_PAGE", payload: 0 })
          }} />

        <Dialog header="Header" visible={viewInvoicePdf} onHide={() => setViewInvoicePdf(false)}>
          <PDFViewer width="1000" height="600" className="app">
            <Document debug={true}>
              <Page style={styles.page}>
                <Html>{html}</Html>
              </Page>
            </Document>
          </PDFViewer>
        </Dialog>


        <div className="col-12">
          <ContextMenu model={menuModel} ref={cm} onHide={() => setSelectedShipment(null)} />
          <DataTable
            onContextMenu={(e) => cm.current.show(e.originalEvent)}
            contextMenuSelection={selectedShipment}
            onContextMenuSelectionChange={(e) => setSelectedShipment(e.value)}

            value={orders}
            responsiveLayout="scroll"
            showGridlines
            stripedRows
            footer={paginator}
          >
            <Column field="Shipments" header="Shipments" body={({ shipmentNumber, ordersId }) => <div>
              <p>Code:{shipmentNumber}</p>
              <p>Order:{ordersId}</p>
              {/* TODO: <p>Need to tender shopify order id if it is Shopify order</p> */}
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
