import React from 'react'
import { Page, Document, Image, StyleSheet, View, Text, PDFViewer } from "@react-pdf/renderer";
import Html from 'react-pdf-html';

type Props = {
  manifestData: Manifest
}

type Manifest = {
  awb: string,
  orderId: string,
  refNum: string,
  attention: string,
  address1: string,
  address2: string,
  pincode: string,
  contactNum: string,
  contents: string,
  weight: number,
  declaredValue: number,
  collectable: number,
  qty: number,
  mode: string,
}[]


const Picklist = ({ manifestData }: Props) => {
  const html = `<html lang="en">
<head>
<title>Manifest Details</title>
<style>
  table {
    width: 100%;
    font-size: 9px;
    border-collapse: collapse;
    border: 1px solid black;
    page-break-inside:auto;
  }
  th {
    color: rgb(10, 0, 0);
    border: 1px solid black;
    background: #E0E0E0;
  }
  td {
    padding: 5px;
    font-size: 10px;
  }
  tr {
    page-break-inside:avoid;
    page-break-after:auto;
  }
</style>
</head>
<div id="manifestForm"></div>
<body>
  <table>
    <tr>
      <th>Sr.No</th>
      <th>AWB</th>
      <th>Order Id</th>
      <th>Reference Number</th>
      <th>Attention</th>
      <th>Address1</th>
      <th>Address2</th>
      <th>Pincode</th>
      <th>Contact Number</th>
      <th>Contents</th>
      <th>Weight</th>
      <th>Declared Value</th>
      <th>Collectable</th>
      <th>Qty</th>
      <th>Mode</th>
    </tr>
    ${manifestData?.map((shipment, index) => {
    return `<tr>
      <td>${index + 1}</td>
      ${[
        "awb",
        "orderId",
        "refNum",
        "attention",
        "address1",
        "address2",
        "pincode",
        "contactNum",
        "contents",
        "weight",
        "declaredValue",
        "collectable",
        "qty",
        "mode",
      ].map(key => `<td>${shipment?.[key] ?? "-"}</td>`)?.join('')}
    </tr>`
  })?.join("")}
  </table>
</body>
</html>`
  return (
    <PDFViewer width="100%" height="600" className="app">
      <Document>
        <Page orientation='landscape'>
          <Html>{html}</Html>
        </Page>
      </Document>
    </PDFViewer>
  )
}

export default Picklist
