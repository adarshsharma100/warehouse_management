import React from 'react'
import { Page, Document, Image, StyleSheet, View, Text, PDFViewer } from "@react-pdf/renderer";
import Html from 'react-pdf-html';

type PicklistData = {
  invoice: Invoice
}

type Invoice = {
  SKU: string,
  itemName: string,
  brand: string | null,
  qty: number,
  image: string | null
}[]


const Picklist = ({ invoice }: PicklistData) => {
  if (!invoice)
    return <div></div>
  const html = `
  <html lang="en">
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
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Picklist Details</title>
  </head>

  <body>
      <h4>Picklist</h4>
    <table>
      <tr>
        <th>S.No</th>
        <th>SKU</th>
        <th>Item Name</th>
        <th>Brand</th>
        <th>Quantity</th>
        <th>Image</th>
      </tr>
      ${invoice
      .map(
        (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.SKU}</td>
              <td>${item.itemName}</td>
              <td>${item.brand ?? "-"}</td>
              <td>${item.qty}</td>
              <td><img src="${item.image ?? "-"}"/></td>
            </tr>
          `
      )
      .join("")}
    </table>
  </body>

  </html>`
  return (
    <PDFViewer width="1000" height="600" className="app">
      <Document>
        <Page>
          <Html>{html}</Html>
        </Page>
      </Document>
    </PDFViewer>
  )
}

export default Picklist
