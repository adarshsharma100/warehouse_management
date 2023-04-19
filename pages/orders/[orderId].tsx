import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import ReactDOM from 'react-dom';
import Head from "next/head";
import { Dialog } from 'primereact/dialog';
import { useRouter } from "next/router";
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

// import Layout from "src/core/layouts/Layout";
// import getOrder from "src/orders/queries/getOrder";
// import deleteOrder from "src/orders/mutations/deleteOrder";

const columns = [
  { field: "invoice", header: "Invoice" },
  { field: "package", header: "Package" },
  { field: "sku", header: "No. of SKUs" },
  { field: "sellingPrice", header: "Selling Price w/o Taxes (₹)" },
  { field: "discount", header: "Discount (₹)" },
  { field: "subTotal", header: "Sub Total (₹)" },
  { field: "tax", header: "Taxes (₹)" },
  { field: "charge", header: "Charges (₹)" },
  { field: "total", header: "Total (₹)" },
  {
    field: 'createdAt',
    header: "Created On",
    // body: (rowData) => <div>{dateFormat(rowData.createdAt)}</div>,
  },
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


export const OrderDetails = () => {
  const router = useRouter();
  const orderId = useParam("orderId", "number");
  console.log('orderId: ', orderId);


  const [orders, { refetch }] = useQuery(getOrder, { id: orderId })
  console.log('orders: ', typeof orders);
  const [yes]=useState(orders)
  

  const [dialogBox, setDialogBox] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedColumns] = useState(columns)
  const [selectedColumnsTwo] = useState(columnsTwo)
  const [dataSummery] = useState(summeryData)

  function handleSubmit(event) {
    event.preventDefault();
    const newComment = {
      comment: event.target.elements.comment.value,
      timestamp: new Date().toLocaleString(),
    };
    setComments([...comments, newComment]);
    event.target.reset();
  }

  function togglePdf() {
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


  const [showDownloadLink, setShowDownloadLink] = useState(false);

  const handleButtonClick = () => {
    setShowDownloadLink(true);
  }

  const columnComponents = selectedColumns.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
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
        filter
        filterPlaceholder="Search..."
      />
    )
  })
  return (
    <>
      <Head>
        <title>Order Details</title>
      </Head>



      <div className="card">

        <TabView>
          <TabPanel header="Invoice">
            <div className="flex justify-content-between mt-3">
              <div className="font-bold" style={{ fontSize: '17px', textDecoration: 'underline', padding: '10px' }}>Invoice Details</div>

              <Button type="button" icon="pi pi-file-pdf"
                severity="warning" tooltipOptions={{ position: "left" }}
                tooltip="PDF" onClick={togglePdf} />
            </div>

            <div>
              <Dialog header="Invoice Details" visible={dialogBox} style={{ width: '50vw' }} onHide={() => setDialogBox(false)}>
                {/* <div className="">
                  <Image height={80} width={80} src='/tifLogo.png' />
                </div>

                <div className="col-12 mt-5" >
                  <div className="flex gap-4  align-items-center">
                    <div className="font-bold" style={{ fontSize: '17px', textDecoration: 'underline' }}>Invoice Details</div>
                    <Button
                      icon='pi pi-download'
                      onClick={handleButtonClick}
                      style={{ fontSize: '1.2rem', cursor: 'pointer' }}
                    />
                    {showDownloadLink && (
                      <MyPDFDownloadLink />
                    )}
                  </div>

                  <DataTable
                    value={invoiceData}
                    responsiveLayout="scroll"
                    showGridlines
                    // header={header1}
                    // filters={filters}
                    className="text-s datatable-responsive mt-4"
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
                    value={itemData}
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

                <div className="flex gap-5 ">
                  <div className="text-lg p-2">
                    <div className="mt-2">Sub-Total before Discount & Taxes</div>
                    <div className="mt-2">Discounts</div>
                    <div className="mt-2">Additional Tax</div>
                    <div className="mt-2">Shipping Charge</div>
                    <div className="mt-2">COD Charges</div>
                    <div className="mt-2">Integrated GST</div>
                    <div className="mt-2">Total Tax on Sales</div>
                    <div className="mt-2 font-bold">Net Amount</div>
                  </div>

                  <div className="text-lg p-2 px-5">
                    <div className="mt-2">₹ 950</div>
                    <div className="mt-2">0.00</div>
                    <div className="mt-2">₹0.00</div>
                    <div className="mt-2">₹84.75</div>
                    <div className="mt-2">₹0.00</div>
                    <div className="mt-2">₹178.17</div>
                    <div className="mt-2">₹178.17</div>
                    <div className="font-bold mt-2" >₹1,168.00</div>
                  </div>

                </div> */}

              </Dialog>
            </div>

            <div className="col-12 mt-3" >

              <DataTable
                value={invoiceData}
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
                value={itemData}
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
                ))}
              </div>
              <div className="text-lg p-2 px-5">
                {dataSummery.map((item, index) => (
                  <div className="mt-2 " key={index}>{item.value}</div>
                ))}
              </div>
            </div>
          </TabPanel>


          <TabPanel header="Details">
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
            </div>
          </TabPanel>

        </TabView>

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

      </div >






    </>
  );
};

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
