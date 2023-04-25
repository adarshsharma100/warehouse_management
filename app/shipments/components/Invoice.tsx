import React from 'react'

type Props = {}

const Invoice = (props: Props) => {
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
  return (
    <div>Invoice</div>
  )
}

export default Invoice
