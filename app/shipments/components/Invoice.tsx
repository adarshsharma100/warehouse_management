import React from 'react'
import { Page, Document, Image, StyleSheet, View, Text, PDFViewer } from "@react-pdf/renderer";
import Html from 'react-pdf-html';
import { useQuery } from '@blitzjs/rpc';
import getShipment from '../queries/getShipment';
import moment from 'moment';
import { create } from 'domain';
import numWords from 'num-words';

const price_in_words = (price) => {
  var sglDigit = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"],
    dblDigit = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"],
    tensPlace = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"],
    handle_tens = function (dgt, prevDgt) {
      return 0 == dgt ? "" : " " + (1 == dgt ? dblDigit[prevDgt] : tensPlace[dgt])
    },
    handle_utlc = function (dgt, nxtDgt, denom) {
      return (0 != dgt && 1 != nxtDgt ? " " + sglDigit[dgt] : "") + (0 != nxtDgt || dgt > 0 ? " " + denom : "")
    };

  var str = "",
    digitIdx = 0,
    digit = 0,
    nxtDigit = 0,
    words = [];
  if (price += "", isNaN(parseInt(price))) str = "";
  else if (parseInt(price) > 0 && price.length <= 10) {
    for (digitIdx = price.length - 1; digitIdx >= 0; digitIdx--) switch (digit = price[digitIdx] - 0, nxtDigit = digitIdx > 0 ? price[digitIdx - 1] - 0 : 0, price.length - digitIdx - 1) {
      case 0:
        words.push(handle_utlc(digit, nxtDigit, ""));
        break;
      case 1:
        words.push(handle_tens(digit, price[digitIdx + 1]));
        break;
      case 2:
        words.push(0 != digit ? " " + sglDigit[digit] + " Hundred" + (0 != price[digitIdx + 1] && 0 != price[digitIdx + 2] ? " and" : "") : "");
        break;
      case 3:
        words.push(handle_utlc(digit, nxtDigit, "Thousand"));
        break;
      case 4:
        words.push(handle_tens(digit, price[digitIdx + 1]));
        break;
      case 5:
        words.push(handle_utlc(digit, nxtDigit, "Lakh"));
        break;
      case 6:
        words.push(handle_tens(digit, price[digitIdx + 1]));
        break;
      case 7:
        words.push(handle_utlc(digit, nxtDigit, "Crore"));
        break;
      case 8:
        words.push(handle_tens(digit, price[digitIdx + 1]));
        break;
      case 9:
        words.push(0 != digit ? " " + sglDigit[digit] + " Hundred" + (0 != price[digitIdx + 1] || 0 != price[digitIdx + 2] ? " and" : " Crore") : "")
    }
    str = words.reverse().join("")
  } else str = "";
  return str

}

const decimalToWords = (price) => {
  const firstHalf = price_in_words(parseInt(price.split('.')[0]))
  const result = price.split('.')[1] ? firstHalf + " Point " + price_in_words(parseInt(price.split('.')[1])) : firstHalf
  return result
}

type Props = {
  invoice?: InvoiceData[],
  shipmentID: number
}

type InvoiceData = {
  shipmentNumber: string,
  orders: Order
}

type Order = {
  id: number,
  shopifyId: number
  gateway: string
  addresses_orders_shippingAddressIdToaddresses: Shipping
  addresses_orders_billingAddressIdToaddresses: Shipping
  customers: Customers
}

type Customers = {
  id: number,
  firstName: string,
  lastName: string
}

type Shipping = {
  areaStreet: string,
  cityCountryProvince: string
  pincode: string,

}

const Invoice = (props: Props) => {
  const { shipmentID, invoice } = props
  const [shipment] = useQuery(getShipment, { id: shipmentID });

  const showInvoiceData = invoice?.map((shipmentData) => {

    const { sales_invoice_details, orders, shipment_items } = shipment
    const { createdAt, invoiceNumber } = sales_invoice_details ?? {}
    const { shopifyId, gateway, customers, addresses_orders_billingAddressIdToaddresses, addresses_orders_shippingAddressIdToaddresses } = orders
    const { contact_number: billingContact, areaStreet: billingStreet, buildingNumber: billingBldgNumber, cityCountryProvince: billingCityProvince, state: billingState, pincode: billingPincode } = addresses_orders_billingAddressIdToaddresses
    const { contact_number: shippingContact, areaStreet: shippingStreet, buildingNumber: shippingBldgNumber, cityCountryProvince: shippingCityProvince, state: shippingState, pincode: shippingPincode } = addresses_orders_shippingAddressIdToaddresses
    const { firstName, lastName } = customers
    const totalObject = shipment_items.reduce(({ total, tax, totalWithTax }, { order_items }) => {
      return {
        total: parseFloat(order_items.quantity * order_items.price + total),
        tax: parseFloat(order_items.quantity * order_items.price * 0.18 + tax),
        totalWithTax: parseFloat(order_items.quantity * order_items.price * 1.18 + totalWithTax),
      }
    }, {
      total: 0,
      tax: 0,
      totalWithTax: 0
    })


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
            margin: 0px 0px 5px 0px;
            text-transform: uppercase;
            font-size: 14px;
          }
    
          h6 {
            margin: 0;
          }
    
          h4 {
            margin: 0px 0px 5px 0px;
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
            // border-collapse: collapse;
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
                <p>Invoice Number: ${invoiceNumber}</p>
                <p>Invoice Date: ${moment(createdAt).format('DD/MM/YYYY HH:mm')}</p>
              </div>
    
            </div>
    
            <div class="border">
              <h4>Order Details</h4>
              <p>Order Number: #${orders.id}</p>
              <p>OrderDate: ${moment(orders.createdAt).format('DD/MM/YYYY HH:mm')}</p>
              <p>Channel: ${shopifyId ? "Shopify" : "Manual"}</p>
              <p>Payment Mode: ${gateway}</p>
            </div>
          </div>
          <div class="parent">
            <div class="border">
              <h4>Bill To:</h4>
              <p>${firstName} ${lastName}</p>
              <p>Street Address: ${billingStreet}</p>
              <p>Bulding Number: ${billingBldgNumber}</p>
              <p>City/Province: ${billingCityProvince}</p>
              <p>State: ${billingState}</p>
              <p>Pincode: ${billingPincode}</p>
              <p>T: ${billingContact?.[0]?.number}</p>
            </div>
            <div class="border">
              <h4>Ship To:</h4>
              <p>${firstName} ${lastName}</p>
              <p>Street Address: ${shippingStreet}</p>
              <p>Bulding Number: ${shippingBldgNumber}</p>
              <p>City/Province: ${shippingCityProvince}</p>
              <p>State: ${shippingState}</p>
              <p>Pincode: ${shippingPincode}</p>
              <p>T: ${shippingContact?.[0]?.number}</p>
            </div>
            <div class="border">
              <h4>Dispatch Details</h4>
              <p>Courier:</p>
              <p>AWB No:</p>
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
                ${shipment_items.map(({ order_items }, index) => {
      const { products } = order_items
      const { name, sku, hsnCode } = products
      return `<tr>
                            <td>${index + 1}</td>
                            <td>${name}</td>
    
                            <td>
                              <p>SKU: ${sku}</p>
                              <p>HSN code: ${hsnCode ?? "-"}</p>
                            </td>
    
                            <td>${parseFloat(order_items.quantity).toFixed(2)}</td>
                            <td>${parseFloat(order_items.price).toFixed(2)}</td>
                            <td>${parseFloat(order_items.price * order_items.quantity).toFixed(2)}</td>
                            <td>${parseFloat(order_items.price * order_items.quantity * 0.18).toFixed(2)}</td>
                            <td>${parseFloat(order_items.price * order_items.quantity * 1.18).toFixed(2)}</td>
                          </tr>`
    }).join('')}
    
    
                <tr>
                  <td></td>
                  <td><b>Total:</b></td>
                  <td></td>
                  <td>${shipment_items.length}</td>
                  <td></td>
                  <td>${totalObject.total?.toFixed(2)}</td>
                  <td>${totalObject.tax?.toFixed(2)}</td>
                  <td>${totalObject.totalWithTax?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div style="margin: 15px 0px;">
                <p>Amount Chargeable (in words)</p>
                <p><b>INR ${decimalToWords(totalObject.totalWithTax?.toFixed(2)).toUpperCase()}</b></p>
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
    return html
  })





  return (
    <div>
      <PDFViewer width="1000" height="600" className="app">
        <Document>
          {showInvoiceData?.map((html, index) => (
            <Page size='A4'>
              <Html>{html}</Html>
            </Page>
          ))}
        </Document>
      </PDFViewer>
    </div>
  )
}

export default Invoice
