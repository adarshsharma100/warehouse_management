import { Suspense, useEffect } from "react";
import { Routes } from "@blitzjs/next";
import ReactDOM from 'react-dom';
import Head from "next/head";
import { Dialog } from 'primereact/dialog';
import router, { useRouter } from "next/router";
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { useParam } from "@blitzjs/next";
import Layout from "layouts/Layout";
import Loading from "components/loading";
import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import Image from "next/image";
import logo from './tifLogo.png';
import { useQuery } from "@blitzjs/rpc";
import getOrders from "app/orders/queries/getOrders";
import getOrder from "app/orders/queries/getOrder";
import { getQueryClient, useMutation, usePaginatedQuery } from "@blitzjs/rpc";
import Barcode from "react-barcode";
import { Accordion, AccordionTab } from "primereact/accordion";

// import Layout from "src/core/layouts/Layout";
// import getOrder from "src/orders/queries/getOrder";
// import deleteOrder from "src/orders/mutations/deleteOrder";

const columns = [

  { header: "Invoice", field: 'sales_invoice_details.invoiceNumber' },
  { field: "shipmentNumber", header: "Package" },
  // { field: "sku", header: "No. of SKUs" },
  // { field: "sellingPrice", header: "Selling Price w/o Taxes (₹)" },
  // { field: "discount", header: "Discount (₹)" },
  // { field: "subTotal", header: "Sub Total (₹)" },
  // { field: "tax", header: "Taxes (₹)" },
  // { field: "charge", header: "Charges (₹)" },
  {
    field: "",
    header: "Total (₹)",
    body: (rowData) => {
      const price = rowData.price || '-';
      return <p>{price}</p>;
    },
  }
  // {
  //   field: 'createdAt',
  //   header: "Created On",
  //   // body: (rowData) => <div>{dateFormat(rowData.createdAt)}</div>,
  // },
]

const columnsTwo = [
  { field: "item", header: "Item SKU Code" },
  { field: "unit", header: "Units" },
  { field: "mrp", header: "MRP" },
  { field: "sellingPrice", header: "Selling Price w/o Taxes" },
  { field: "discount", header: "Taxes (%)" },
  { field: "tax", header: "Additional Taxes (%)" },
  { field: "additionalTax", header: "Discount" },
  { field: "branchCode", header: "Branch Code" },

]

const orderColumn = [
  { field: "itemContains", header: "Item Contains" },
  { field: "products.description", header: "Product Description" },
  { field: "facility", header: "Facility" },
  { field: "price", header: "Price info (?)" },
  { field: "totalUnit", header: "Total Units" },
  { field: "inProcess", header: "In Process" },
  { field: "unfullfillable", header: "Unfullfillable" },
  { field: "cancelled", header: "Cancelled" },
  { field: "hold", header: "On Hold" },
  { field: "reshipped", header: "Reshipped" },
]
const shipmentColumn = [
  { field: "Item", header: "Item" },
  { field: "SKU", header: "SKU" },
  { field: "Quantity", header: "Quantity" },
  { field: "Cancelled", header: "Cancelled" },
  { field: "Hold", header: "Hold" },
  { field: "Zone", header: "Zone" },
  { field: "Picklist", header: "Picklist" },
  { field: "Item Contains", header: "Item Contains" },
]



const invoiceData = [{
  id: 1,
  invoice: "TIF/23-24/101587",
  package: 'ROBO100006',
  sku: '1',
  sellingPrice: '905.08',
  discount: '0',
  subTotal: '905.08',
  tax: '178.17',
  charge: '84.75',
  total: "1234",
  createdAt: '14 Apr 2023, 10:23'

}]

const orderData = [
  {
    itemContains: '',
    productDescription: '7731522109664-4303110000-10Pin Aligator clip',
    facility: 'robocraze',
    price: '168.00',
    totalUnit: '1',
    inProcess: '1',
    unfullfillable: '0',
    cancelled: '0',
    hold: '0',
    reshipped: '0',
  }
]

const itemData = [{
  id: 1,
  item: "TIF/23-24/101587",
  unit: 'ROBO100006',
  mrp: '1',
  sellingPrice: '905.08',
  discount: '0',
  tax: '905.08',
  additionalTax: '178.17',
  branchCode: '4.75',
}]
const shipmentData = [
  {
    "Item": '10 pin Crocodile clips with male jumper wires',
    "SKU": 'TIFCW0059',
    "Quantity": '1',
    "Cancelled": '0',
    "Hold": '0',
    "Zone": '-',
    'Picklist': '-',
    'Item Contains': '-',
  }
]

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    color: "#000",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

const summeryData = [
  { name: "Sub-Total before Discount & Taxes", value: '₹ 950' },
  { name: "Discounts", value: '0.00' },
  { name: "Additional Tax", value: '₹0.00' },
  { name: "Shipping Charge", value: '₹84.75' },
  { name: "COD Charges", value: '₹0.00' },
  { name: "Integrated GST", value: '₹178.17' },
  { name: "Total Tax on Sales", value: '₹178.17' },
  { name: "Net Amount", value: '₹1,168.00' },
]

const orderDetails = {
  orderNo: '1234567890',
  displayOrderNo: '45679',
  fulfillmentTAT: '14 Apr 2023, 16.02',
  priority: 'Normal',
  orderDate: '13 Apr 2023, 22.02',
  status: 'Complete',
  customer: 'Haresh R',
  GSTIN: '-',
  channel: 'Shopify',
  paymentMethod: 'Prepaid',
  orderAmount: '₹ 1,168.00',
  channelCreated: '13 Apr 2023, 22.02',
  unlwareCreated: '13 Apr 2023, 22.12',
  updatedAt: '14 Apr 2023, 16.02',
  notificationEmail: 'haresh.ram@gmail.com',
  notificationMobile: '2345678901',
  shoppingMethodCode: 'Premium (Priority (2-4 days))',
  shoppingMethodTitle: 'Premium (Priority (2-4 days))',
};

const shipmentDetails = {
  "Picklist Number": '-',
  "Shipment Mainfest": "-",
  "Return Mainfest": "-",
  "Invoice Number": "TIF/23-24/110380",
  "Parent Pckage ": "-",
  "Reshipment Order": "-",
  "RTO Facility": "TIF LABS PVT LTD",
  "Shipping Method": "std-false",
  "Courier Status": "-",
  "Courier Name ": "SREE_MURTHI",
  "Dispatched Date ": "-",
  "Delivery Date ": "-",
  "No. of Items ": "1",
  "Shipping Carrier ": "SREE_MURTHI",
}


export const OrderDetails = () => {

  const [selectedColumns] = useState(columns)
  const [selectedColumnsTwo] = useState(columnsTwo)
  const [orderSetectedColumn] = useState(orderColumn)
  const [shipmentSetectedColumn] = useState(shipmentColumn)

  const [dataSummery] = useState(summeryData)
  const [comments, setComments] = useState([]);
  const [dialogBox, setDialogBox] = useState(false);

  const orderId = useParam("orderId", "number")
  const ITEMS_PER_PAGE = 100;
  const router = useRouter();
  const page = Number(router.query.page) || 0;


  const [order] = useQuery(getOrder, { id: orderId })
  console.log('order: ', order);

  const [item] = useState(order.shipment)
  console.log('item: ', item);
  const [itemOrder] = useState(order.order_items)
  console.log('itemOrder: ', itemOrder);
  // const [invoiceData] = useState(order.shipment.map((ele) => ele.sales_invoice_details))
  // console.log('invoiceData: ', invoiceData);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newComment = {
      comment: event.target.elements.comment.value,
      timestamp: new Date().toLocaleString(),
    };
    setComments([...comments, newComment]);
    event.target.reset();
  }

  const columnComponents = selectedColumns.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        body={col?.body}
        
        filter
        filterPlaceholder="Search..."
      />
    )
  })

  const columnTwoComponents = selectedColumnsTwo.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        // body={col?.body}
        body={(rowData) => rowData[col.field] || '-'}
        filter
        filterPlaceholder="Search..."
      />
    )
  })

  const shipmentColumnComponent = shipmentSetectedColumn.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        body={col?.body}
        filter
        filterPlaceholder="Search..."
      />
    )
  })
  const orderColumnComponent = orderSetectedColumn.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        // body={col?.body}
        body={(rowData) => rowData[col.field] || '-'}


        filter
        filterPlaceholder="Search..."
      />
    )
  })

  const togglePdf = () => {
    setDialogBox(!dialogBox);
  }


  const PDFData = () => (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Invoice Details</Text>
          {/* <Image layout="fill" height={80} width={80} src="/tifLogo.png" style={{ width: 80, height: 80 }} /> */}
          {/* <image src='/tifLogo.png' alt='logo' /> */}
        </View>
        {/* <View>
          <DataTable value={itemData} responsiveLayout="scroll" showGridlines emptyMessage="No Results found." rowHover={true}>
            <Column field="id" header="Product ID" />
            <Column field="name" header="Product Name" />
            <Column field="price" header="Price" />
          </DataTable>
        </View> */}
      </Page>
    </Document>
  );

  const MyPDFDownloadLink = () => (
    <PDFDownloadLink document={<PDFData />} fileName="example.pdf">
      {({ blob, url, loading, error }) => (
        loading ? 'Loading document...' : 'Download now!'
      )}
    </PDFDownloadLink>
  );


  return (
    <>
      <Head>
        <title>Order Details</title>
      </Head>

      <div className="col-12">
        <div className="card flex gap-2  m-0">
          <h2>Orders - #{orderId}</h2>
          <i className="pi pi-copy mt-2" style={{ fontSize: '1.5rem' }} />
        </div>
      </div>
      <div className="card">
        <div className="flex gap-2">
          <div style={{ width: '75%' }}>
            <TabView>
              <TabPanel header='Order Items'>
                <div className="flex gap-2">
                  <div className="card">
                    <DataTable
                      value={itemOrder}
                      responsiveLayout="scroll"
                      showGridlines
                      // header={header1}
                      // filters={filters}
                      className="text-s datatable-responsive"
                      filterDisplay="menu"
                      emptyMessage="No Results found."
                      rowHover={true}
                    >
                      {orderColumnComponent}

                    </DataTable>
                  </div>
                </div>

              </TabPanel>
              <TabPanel header="Invoice">
                <div className="flex justify-content-between mt-3">
                  <div className="font-bold" style={{ fontSize: '17px', textDecoration: 'underline', padding: '10px' }}>Invoice Details</div>

                  <Button type="button" icon="pi pi-file-pdf"
                    severity="warning" tooltipOptions={{ position: "left" }}
                    tooltip="PDF" onClick={togglePdf} />
                </div>

                <div>
                  <Dialog header="Invoice Details" visible={dialogBox} style={{ width: '50vw' }} onHide={() => setDialogBox(false)}>
                    pdf data
                  </Dialog>
                </div>

                <div className="col-12 mt-3" >

                  <DataTable
                    value={item}
                    responsiveLayout="scroll"
                    showGridlines
                    // header={header1}
                    // filters={filters}
                    className="text-s datatable-responsive"
                    filterDisplay="menu"
                    emptyMessage="No Results found."
                    rowHover={true}
                  >
                    {columnComponents}

                  </DataTable>

                </div >

                <div className="col-12" >
                  <div className="font-bold" style={{ fontSize: '17px', textDecoration: 'underline' }}>Item Details</div>

                  <DataTable
                    // value={itemData}
                    value={item}
                    responsiveLayout="scroll"
                    showGridlines
                    // header={header1}
                    // filters={filters}
                    className="text-s datatable-responsive mt-4"
                    filterDisplay="menu"
                    emptyMessage="No Results found."
                    rowHover={true}
                  >
                    {columnTwoComponents}

                  </DataTable>

                </div>

                <div className="flex gap-5 justify-content-end">
                  <div className="text-lg p-2">
                    {dataSummery.map((item, index) => (
                      <div className="mt-2" key={index}>{item.name}</div>
                    ))}item
                  </div>
                  <div className="text-lg p-2 px-5">
                    {dataSummery.map((item, index) => (
                      // <div className="mt-2 " key={index}>{item.value}</div>
                      <div className="mt-2 " key={index}>-</div>

                    ))}
                  </div>
                </div>
              </TabPanel>
              <TabPanel header='Shipments'>
                <Accordion activeIndex={0}>
                  <AccordionTab
                    pt={{
                      headertitle: {
                        className: "w-full"
                      }
                    }}
                    header={
                      <div className="flex justify-content-between align-items-center"
                      >
                        <div>Shipment Id: ROBO108966</div>
                        <div>shipment Status: Ready to Ship</div>
                        <div>Created On: 29Jun 2023, 15:25</div>
                        <div className="flex gap-3">
                          <i className="pi pi-check-square" style={{ fontSize: '1.5rem' }} />
                          <i className="pi pi-book" style={{ fontSize: '1.5rem' }} />
                          <i className="pi pi-sync" style={{ fontSize: '1.5rem' }} />
                          <i className="pi pi-box" style={{ fontSize: '1.5rem' }} />
                          <i className="pi pi-lock" style={{ fontSize: '1.5rem' }} />
                        </div>
                      </div>
                    }>
                    <div className="flex">
                      {item.map((sales_invoice_details, i) => {
                        const { awb, sales_invoice_details: { invoiceNumber } } = sales_invoice_details;
                        const keyValuePairs = [
                          { key: "AWB", value: awb },
                          { key: "Invoice Number", value: invoiceNumber },
                          // Add more key-value pairs as needed
                        ];
                        return (
                          <div className="flex gap-2 text-xl flex-wrap align-items-center" key={i}>
                            {keyValuePairs.map(({ key, value }, index) => (
                              <div className="" key={key}>
                                <label className="font-bold">{key} :</label>
                                <label className="ml-2">{value} </label>
                                {/* {value} */}
                                {index < keyValuePairs.length - 1 && <span className="mx-2">{'  '}</span>}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>


                    <div className="mt-5" style={{ width: '50%' }}>
                      <DataTable
                        value={shipmentData}
                        responsiveLayout="scroll"
                        showGridlines
                        // header={header1}
                        // filters={filters}
                        className="text-s datatable-responsive mt-4"
                        filterDisplay="menu"
                        emptyMessage="No Results found."
                        rowHover={true}
                      >
                        {shipmentColumnComponent}

                      </DataTable>

                    </div>


                  </AccordionTab>

                </Accordion>
              </TabPanel>
              <TabPanel header='Activities'>
              </TabPanel>

              {/* <TabPanel header="Details">
                <div className="flex gap-5 ">
                  <div className="text-lg p-2">
                    {Object.entries(orderDetails).map(([key, value]) => (
                      <div className="mt-2" key={key}>{key}</div>
                    ))}
                  </div>
                  <div className="text-lg p-2 px-5">
                    {Object.entries(orderDetails).map(([key, value]) => (
                      <div className="mt-2 " key={key}>{value}</div>
                    ))}
                  </div>
                  <Barcode value="1234567" />

                </div>
              </TabPanel> */}
            </TabView>
          </div>
          <div style={{ width: '25%' }}>
            <Accordion activeIndex={0}>
              <AccordionTab header="Order Details">
                {/* <div className="flex gap-5 ">
                  <div className="text-lg p-2">
                    {Object.entries(orderDetails).map(([key, value]) => (
                      <div className="mt-2" key={key}>{key}</div>
                    ))}
                  </div>
                  <div className="text-lg p-2 px-5">
                    {Object.entries(orderDetails).map(([key, value]) => (
                      <div className="mt-2 " key={key}>{value}</div>
                    ))}
                  </div>
                </div> */}

                <div className="flex gap-5">
                  <div className="text-lg p-2">
                    <p>Payment Method</p>
                    <p>GSTIN</p>
                    <p>Payment Method</p>
                  </div>
                  <div className="text-lg p-2 px-5">
                    <p>{order.gateway === "" ? "-" : order.gateway}</p>
                    <p>{order.gstNumber === "" ? "-" : order.gstNumber}</p>
                    <p>{order.paymentMethodId === "" ? "-" : order.paymentMethodId}</p>
                  </div>

                </div>
              </AccordionTab>
              <AccordionTab header="Item Summery">
                <p className="m-0">

                </p>
              </AccordionTab>
              <AccordionTab header="Payment Summery">
                <p className="m-0">
                </p>
              </AccordionTab>
              <AccordionTab header="Billing/Shipping Address">
                <p className="m-0">
                </p>
              </AccordionTab>
            </Accordion>
          </div>

        </div>



        <div className="mt-6">
          {comments.map((comment, index) => (
            <div key={index}>
              <div className="message ">
                <p className="chatMessage">
                  {comment.comment}
                </p>
                <p>{comment.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea name="comment" className="col-12 p-2 mt-6  border-round outline-none border-none" placeholder="Write a Comment..." style={{ background: '#091d39' }} />
          <div className="flex gap-2 justify-content-end mt-2">
            <Button type="submit" label="Submit" />
            <Button label="Add a Comments" className="" />
          </div>
        </form>
      </div>
    </>
  )
}


const ShowOrderPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <OrderDetails />
      </Layout>
    </Suspense>

  );
};

// ShowOrderPage.authenticate = true;
// ShowOrderPage.getLayout = (page) => <Layout>{page}</Layout> ;



export default ShowOrderPage;

