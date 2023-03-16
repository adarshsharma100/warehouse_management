import { Page, Text, View, Document, StyleSheet, renderToStream, Font } from "@react-pdf/renderer"

// const data = {
//   po_id: 260,
//   po_type: "Manual",
//   updated_on: "2022-12-20T10:39:05.863Z",
//   approved_on: "Invalid date",
//   created_at: "20-12-2022, 16:12",
//   from_party: "qwerty",
//   expiry_date: "2022-12-20T18:30:00.000Z",
//   expected_delivery: "2022-12-21T18:30:00.000Z",
//   agreement: "qwerty",
//   purchase_order_status_pos_id: 2,
//   vendor_vendor_id: 1,
//   po_description: "qwerty",
//   po_code: "PO#44",
//   rfq_id: 245,
//   grn_grn_id: 27,
//   agreement_status: "Approved",
//   vendor: "Dylan Alisson",
//   purchase_order_status: {
//     pos_id: 2,
//     pos_name: "Waiting for approval",
//     pos_description: "The PO is sent for approval and waiting to be",
//   },
//   purchase_order_products: [
//     {
//       pop_id: 94,
//       purchase_order_po_id: 260,
//       purchase_order_purchase_order_status_pos_id: 2,
//       purchase_order_vendor_vendor_id: 1,
//       vendor_products_vp_id: 11,
//       vendor_products_vendor_vendor_id: 1,
//       vendor_products_products_product_id: 4,
//       quantity: 23,
//       price_per_unit: 45,
//       received_quantity: 0,
//       vendor_products: {
//         vp_id: 11,
//         unit_price: 83,
//         vendor_vendor_id: 1,
//         products_product_id: 4,
//         enabled: 1,
//         priority: 1,
//         vendor_sku: "DA102",
//         products: {
//           product_id: 4,
//           name: "E18-D80NK Infrared Sensor Module",
//           description: "description",
//           product_type: "Sensors",
//           products_sku: "TIF004",
//           Price: 42,
//           product_unit: null,
//         },
//       },
//     },
//     {
//       pop_id: 95,
//       purchase_order_po_id: 260,
//       purchase_order_purchase_order_status_pos_id: 2,
//       purchase_order_vendor_vendor_id: 1,
//       vendor_products_vp_id: 2,
//       vendor_products_vendor_vendor_id: 1,
//       vendor_products_products_product_id: 2,
//       quantity: 78,
//       price_per_unit: 45,
//       received_quantity: 0,
//       vendor_products: {
//         vp_id: 2,
//         unit_price: 10,
//         vendor_vendor_id: 1,
//         products_product_id: 2,
//         enabled: 1,
//         priority: 2,
//         vendor_sku: "DA1001",
//         products: {
//           product_id: 2,
//           name: "ESP",
//           description: "esp-desc",
//           product_type: "Electronics",
//           products_sku: "TIF002",
//           Price: 142,
//           product_unit: "2pc set",
//         },
//       },
//     },
//     {
//       pop_id: 96,
//       purchase_order_po_id: 260,
//       purchase_order_purchase_order_status_pos_id: 2,
//       purchase_order_vendor_vendor_id: 1,
//       vendor_products_vp_id: 11,
//       vendor_products_vendor_vendor_id: 1,
//       vendor_products_products_product_id: 4,
//       quantity: 12,
//       price_per_unit: 45,
//       received_quantity: 0,
//       vendor_products: {
//         vp_id: 11,
//         unit_price: 83,
//         vendor_vendor_id: 1,
//         products_product_id: 4,
//         enabled: 1,
//         priority: 1,
//         vendor_sku: "DA102",
//         products: {
//           product_id: 4,
//           name: "E18-D80NK Infrared Sensor Module",
//           description: "description",
//           product_type: "Sensors",
//           products_sku: "TIF004",
//           Price: 42,
//           product_unit: null,
//         },
//       },
//     },
//   ],
//   vendorDetails: {
//     vendor_id: 1,
//     vendor_code: "DA",
//     vendor_email: "mdatif796@gmail.com",
//     vendor_city: "Panaji",
//     vendor_contact: "4562879123",
//     vendor_state: "Goa",
//     vendor_gstin: "GSTRIO783211111",
//     vendor: "Dylan Alisson",
//     address: "Rio ",
//     credit_period: "411",
//     lead_time: "471",
//     status: false,
//   },
// }

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
    fontSize: 10,
  },
  section: {
    marginBottom: 10,
  },

  heading1: {
    textAlign: "center",
    textDecoration: "underline",
    fontSize: "20px",
  },
  heading2: {
    textAlign: "center",
    marginTop: "5px",
    fontSize: "15px",
    marginBottom: "10px",
  },

  font10: {
    fontSize: "10px",
  },
  bold: {
    fontStyle: "bold",
  },
  normaBold: {
    fontStyle: "normal",
  },
  infoContainer: {
    fontSize: "10px",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  poFrom: {
    width: "26%",
    lineHeight: 1.5,
    textAlign: "justify",
  },
  poDetails: {
    // backgroundColor: "pink",
    width: "25%",
  },
  poDetailsTable: {
    marginTop: 6,
  },

  poDTflexBox: {
    flexDirection: "row",
    marginBottom: "4px",
  },

  flexGrow: {
    flexGrow: 1,
  },

  dispatch: {
    fontSize: "10px",
    flexDirection: "column",
    width: "25%",
  },

  toflexBox: {
    flexDirection: "row",
  },

  mb4: {
    // marginBottom: "4px",
    lineHeight: 1.5,
  },
  tableContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },

  tcellHeader: {
    flexGrow: 1,
    backgroundColor: "black",
    color: "white",
    textAlign: "center",
    borderRight: "1px solid white",
    // lineHeight: 2,
    padding: 5,
    alignSelf: "flex-end",
  },
  tcellrow: {
    flexGrow: 1,
    textAlign: "center",
    border: "1px solid black",
    padding: 5,
    margin: "auto",
    alignSelf: "flex-end",
  },
})
const MyDocument = ({ data }) => {
  const {
    poNumber,
    description,
    from_party,
    expectedDod,
    expiryDate,
    po_products: POP,
    vendors: { name: vendorName, gstin, vendor_branches }
  } = data

  const {
    buildingNumber,
    areaStreet,
    landmarkName,
    cityCountryProvince,
    state,
    pincode,
    country_addresses_countryTocountry: { name: country },
    contact_number
  } = vendor_branches[0].addresses

  const vendor_contact = contact_number.map(({ number }) => number).join(", ")

  const addressParts = [`${buildingNumber || ''}`, `${areaStreet || ''}`, `${landmarkName || ''}`, `${cityCountryProvince || ''}`, `${state || ''}`, `${pincode || ''}`, `${country || ''}`];

  const address = addressParts.filter(part => part !== '').join(', ');

  const poValue = products => products.reduce((acc, { price, quantity }) => acc += (price * quantity), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading1}>Purchase Order</Text>
          <Text style={(styles.normaBold, styles.font10)}>
            <Text style={(styles.bold, styles.font10)}>Date:</Text>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.poFrom}>
            <Text>From:-</Text>
            <Text>TIFS LABS</Text>
            <Text>
              TIF labs, First Floor, 912/10 Survey no. 104 4th G street, Chelekare, Kalyan Nagar,
              Bengaluru, Karnataka, India 560043
            </Text>
            <Text>Phone: 1234567890</Text>
            <Text>TIFLabs.in</Text>
          </View>
          <View style={styles.poDetails}>
            <Text>PO Details:-</Text>
            <View style={styles.poDetailsTable}>
              <View style={styles.poDTflexBox}>
                <Text style={{ width: "85px", fontWeight: 900 }}>Number</Text>
                <Text>: {poNumber}</Text>
              </View>
              <View style={styles.poDTflexBox}>
                <Text style={{ width: "85px" }}>Description</Text>
                <Text>: {description}</Text>
              </View>
              <View style={styles.poDTflexBox}>
                <Text style={{ width: "85px" }}>From party</Text>
                <Text>: {from_party}</Text>
              </View>
              <View style={styles.poDTflexBox}>
                <Text style={{ width: "85px" }}>Expected Delivery </Text>
                <Text>: {`${new Date(expiryDate).toLocaleDateString()}`}</Text>
              </View>
              <View style={styles.poDTflexBox}>
                <Text style={{ width: "85px" }}>Expiry Date </Text>
                <Text>: {`${new Date(expectedDod).toLocaleDateString()}`}</Text>
              </View>
              <View style={styles.poDTflexBox}>
                <Text style={{ width: "85px" }}>PO Value </Text>
                <Text>: {poValue(POP)}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={{ borderBottom: "1px" }}></Text>
        <Text style={{ marginTop: "10px", marginBottom: "5px" }}>To:-</Text>
        <View style={styles.dispatch}>
          <Text style={styles.mb4}>{vendorName}</Text>
          <Text style={styles.mb4}>{`#${address}`}</Text>
          <View style={[styles.toflexBox, styles.mb4]}>
            <Text style={{ width: "45px" }}>Phone</Text>
            <Text>{`: ${vendor_contact}`}</Text>
          </View>
          <View style={[styles.toflexBox, styles.mb4]}>
            <Text style={{ width: "45px" }}>GSTIN</Text>
            <Text>{`: ${gstin}`}</Text>
          </View>
        </View>
        <Text style={{ borderBottom: "1px" }}></Text>
        <View>
          <Text style={styles.heading2}>Products List:</Text>
          <View style={styles.tableContainer}>
            <Text style={[styles.tcellHeader, { width: "25px" }]}>No.</Text>
            <Text style={[styles.tcellHeader, { width: "200px" }]}>Name</Text>
            <Text style={[styles.tcellHeader, { width: "100px" }]}>Vendor-SKU</Text>
            <Text style={[styles.tcellHeader, { width: "100px" }]}>Product-SKU</Text>
            {/* <Text style={[styles.tcellHeader, { width: "100px" }]}>Description</Text> */}
            <Text style={[styles.tcellHeader, { width: "60px" }]}>Quantity</Text>
            <Text style={[styles.tcellHeader, { width: "75px" }]}>Unit Price</Text>
            <Text style={[styles.tcellHeader, { width: "50px", borderRight: "black" }]}>Total</Text>
          </View>
          {POP.map((
            { price, quantity, vendor_products: { products: { name, sku: product_sku }, sku: vendor_sku } }, i) => {

            return (
              <View style={styles.tableContainer} key={i}>
                <Text style={[styles.tcellrow, { width: "25px" }]}>{i + 1}</Text>
                <Text style={[styles.tcellrow, { width: "200px" }]}>{name}</Text>
                <Text style={[styles.tcellrow, { width: "100px" }]}>{vendor_sku}</Text>
                <Text style={[styles.tcellrow, { width: "100px" }]}>{product_sku}</Text>
                {/* <Text style={[styles.tcellrow, { width: "100px" }]}>
                  {description ? description : "-"}
                </Text> */}
                <Text style={[styles.tcellrow, { width: "60px" }]}>{quantity}</Text>
                <Text style={[styles.tcellrow, { width: "75px" }]}>{price}</Text>
                <Text style={[styles.tcellrow, { width: "50px" }]}>
                  {quantity * price}
                </Text>
              </View>
            )
          })}

        </View>
      </Page>
    </Document>
  )
}

export default MyDocument
// const MyDocument = ({ data }) => {
//   const {
//     po_code,
//     po_description,
//     from_party,
//     expiry_date,
//     expected_delivery,
//     purchase_order_products: POP,
//     vendorDetails: { vendor, vendor_state, vendor_city, vendor_contact, vendor_gstin },
//     purchase_order_terms,
//   } = data
//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <View style={styles.section}>
//           <Text style={styles.heading1}>Purchase Order</Text>
//           <Text style={(styles.normaBold, styles.font10)}>
//             <Text style={(styles.bold, styles.font10)}>Date:</Text>
//             {new Date().toLocaleDateString()}
//           </Text>
//         </View>
//         <View style={styles.infoContainer}>
//           <View style={styles.poFrom}>
//             <Text>From:-</Text>
//             <Text>TIFS LABS</Text>
//             <Text>
//               TIF labs, First Floor, 912/10 Survey no. 104 4th G street, Chelekare, Kalyan Nagar,
//               Bengaluru, Karnataka, India 560043
//             </Text>
//             <Text>Phone: 1234567890</Text>
//             <Text>TIFLabs.in</Text>
//           </View>
//           <View style={styles.poDetails}>
//             <Text>PO Details:-</Text>
//             <View style={styles.poDetailsTable}>
//               <View style={styles.poDTflexBox}>
//                 <Text style={{ width: "85px", fontWeight: 900 }}>Code</Text>
//                 <Text>: {po_code}</Text>
//               </View>
//               <View style={styles.poDTflexBox}>
//                 <Text style={{ width: "85px" }}>Description</Text>
//                 <Text>: {po_description}</Text>
//               </View>
//               <View style={styles.poDTflexBox}>
//                 <Text style={{ width: "85px" }}>From party</Text>
//                 <Text>: {from_party}</Text>
//               </View>
//               <View style={styles.poDTflexBox}>
//                 <Text style={{ width: "85px" }}>Expected Delivery </Text>
//                 <Text>: {`${new Date(expected_delivery).toLocaleDateString()}`}</Text>
//               </View>
//               <View style={styles.poDTflexBox}>
//                 <Text style={{ width: "85px" }}>Expiry Date </Text>
//                 <Text>: {`${new Date(expiry_date).toLocaleDateString()}`}</Text>
//               </View>
//               <View style={styles.poDTflexBox}>
//                 <Text style={{ width: "85px" }}>Terms</Text>
//                 <Text>: {purchase_order_terms}</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//         <Text style={{ borderBottom: "1px" }}></Text>
//         <Text style={{ marginTop: "10px", marginBottom: "5px" }}>To:-</Text>
//         <View style={styles.dispatch}>
//           <Text style={styles.mb4}>{vendor}</Text>
//           <Text style={styles.mb4}>{`${vendor_city} ${vendor_state}`}</Text>
//           <View style={[styles.toflexBox, styles.mb4]}>
//             <Text style={{ width: "45px" }}>Phone</Text>
//             <Text>{`: ${vendor_contact}`}</Text>
//           </View>
//           <View style={[styles.toflexBox, styles.mb4]}>
//             <Text style={{ width: "45px" }}>GSTIN</Text>
//             <Text>{`: ${vendor_gstin}`}</Text>
//           </View>
//         </View>
//         <Text style={{ borderBottom: "1px" }}></Text>
//         <View>
//           <Text style={styles.heading2}>Products List:</Text>
//           <View style={styles.tableContainer}>
//             <Text style={[styles.tcellHeader, { width: "25px" }]}>No.</Text>
//             <Text style={[styles.tcellHeader, { width: "200px" }]}>Name</Text>
//             <Text style={[styles.tcellHeader, { width: "100px" }]}>Product-SKU</Text>
//             {/* <Text style={[styles.tcellHeader, { width: "100px" }]}>Description</Text> */}
//             <Text style={[styles.tcellHeader, { width: "60px" }]}>Quantity</Text>
//             <Text style={[styles.tcellHeader, { width: "75px" }]}>Unit Price</Text>
//             <Text style={[styles.tcellHeader, { width: "50px", borderRight: "black" }]}>Total</Text>
//           </View>
//           {POP.map((ele, i) => {
//             const {
//               vendor_products: {
//                 products: { name, description },
//                 vendor_sku,
//               },
//               quantity,
//               price_per_unit,
//             } = ele
//             return (
//               <View style={styles.tableContainer} key={i}>
//                 <Text style={[styles.tcellrow, { width: "25px" }]}>{i + 1}</Text>
//                 <Text style={[styles.tcellrow, { width: "200px" }]}>{name}</Text>
//                 <Text style={[styles.tcellrow, { width: "100px" }]}>{vendor_sku}</Text>
//                 {/* <Text style={[styles.tcellrow, { width: "100px" }]}>
//                     {description ? description : "-"}
//                   </Text> */}
//                 <Text style={[styles.tcellrow, { width: "60px" }]}>{quantity}</Text>
//                 <Text style={[styles.tcellrow, { width: "75px" }]}>{price_per_unit}</Text>
//                 <Text style={[styles.tcellrow, { width: "50px" }]}>
//                   {quantity * price_per_unit}
//                 </Text>
//               </View>
//             )
//           })}
//         </View>
//       </Page>
//     </Document>
//   )
// }

