import React, { Suspense } from "react"
import { PDFViewer } from "@react-pdf/renderer"
import { Page, Text, View, Document, StyleSheet, renderToStream, Font } from "@react-pdf/renderer"
import Loading from "components/loading"
import Layout from "layouts/Layout"
// import Roboto from "public/fonts/Roboto-Bold.ttf"

const data = {
  id: 29,
  poNumber: "PO#28",
  agreement: "lorem ipsum now then up",
  description: null,
  expectedDod: "2023-03-08T18:30:00.000Z",
  rejectedReason: null,
  expiryDate: "2023-03-08T18:30:00.000Z",
  approvedOn: null,
  createdAT: "2023-03-06T11:02:25.000Z",
  updatedAT: "2023-03-06T11:02:25.000Z",
  rfq: null,
  vendor: 1,
  status: 3,
  po_term: 2,
  approvedBy: null,
  amendedFrom: 6,
  piNumber: "uper",
  piDate: "2023-03-28T18:30:00.000Z",
  po_status: {
    id: 3,
    name: "Approved",
    description: "The PO has been approved to be placed with/em"
  },
  vendors: {
    id: 1,
    name: "Dylan Alisson",
    code: "DA",
    gstin: "GSTRIO783211111",
    creditPeriod: 5,
    leadTime: 4,
    status: "Active",
    vendorScore: 1,
    vendor_branches: [
      {
        addresses: {
          id: 202,
          buildingNumber: "25",
          areaStreet: null,
          landmarkName: "Near Osho Ashram",
          cityCountryProvince: "Pune",
          state: "Maharashtra",
          pincode: 411001,
          country: 1,
          emails_emails_addressesToaddresses: [
            {
              id: 2,
              email: "test@gmail.com",
              addresses: 202
            },
            {
              id: 7,
              email: "madonna@example.com",
              addresses: 202
            },
            {
              id: 12,
              email: "janis.joplin@example.com",
              addresses: 202
            },
            {
              id: 17,
              email: "tom.petty@example.com",
              addresses: 202
            }
          ],
          country_addresses_countryTocountry: {
            id: 1,
            name: "India"
          },
          contact_number: [
            { id: 2, type: 'mobile', number: 987654321, address: 202 },
            { id: 7, type: 'landline', number: 55555555, address: 202 },
            { id: 12, type: 'mobile', number: 99999999, address: 202 },
            { id: 17, type: 'landline', number: 66677788, address: 202 }
          ]

        }
      }
    ]
  },
  po_terms: {
    id: 2,
    name: "Net-30",
    description: "Net-30"
  },
  po_products: [
    {
      id: 27,
      quantity: 453,
      price: 249,
      vendorProduct: 11,
      purchaseOrder: 29,
      vendor_products: {
        id: 11,
        sku: "DYA-1235",
        priority: 1,
        status: "Active",
        product: 45,
        vendor: 1,
        products: {
          id: 45,
          name: " Soundbar",
          sku: "TIFSB015",
          description: " Wireless soundbar with subwoofer",
          length: null,
          width: null,
          height: null,
          weight: null,
          color: null,
          hsnCode: null,
          imageUrl: null,
          createdAT: "2023-03-05T07:55:59.000Z",
          updatedAT: "2023-03-05T07:55:59.000Z",
          customDuty: null,
          gstTaxTypeCode: null,
          taxCalcType: null,
          status: "Active",
          category: null,
          brand: null,
          costPrice: 249
        }
      }
    },
    {
      id: 28,
      quantity: 33,
      price: 10,
      vendorProduct: 18,
      purchaseOrder: 29,
      vendor_products: {
        id: 18,
        sku: "KLM-0009",
        priority: 3,
        status: "Active",
        product: 3,
        vendor: 1,
        products: {
          id: 3,
          name: "Machine Tools",
          sku: "TIFMT11",
          description: "Machine Tools update::",
          length: null,
          width: null,
          height: null,
          weight: null,
          color: null,
          hsnCode: null,
          imageUrl: "https://loremflickr.com/320/240/device?random=1",
          createdAT: null,
          updatedAT: null,
          customDuty: null,
          gstTaxTypeCode: null,
          taxCalcType: null,
          status: "Active",
          category: null,
          brand: null,
          costPrice: 10
        }
      }
    },
    {
      id: 29,
      quantity: 12,
      price: 149,
      vendorProduct: 8,
      purchaseOrder: 29,
      vendor_products: {
        id: 8,
        sku: "GHI-2222",
        priority: 2,
        status: "Active",
        product: 13,
        vendor: 1,
        products: {
          id: 13,
          name: "Smart Lock",
          sku: "TIFSL003",
          description: "Bluetooth-enabled smart lock for keyless entry",
          length: null,
          width: null,
          height: null,
          weight: null,
          color: null,
          hsnCode: null,
          imageUrl: null,
          createdAT: "2023-03-05T07:55:57.000Z",
          updatedAT: "2023-03-05T07:55:57.000Z",
          customDuty: null,
          gstTaxTypeCode: null,
          taxCalcType: null,
          status: "Active",
          category: null,
          brand: null,
          costPrice: 149
        }
      }
    }
  ]
}

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
                <Text style={{ width: "85px", fontWeight: 900 }}>Code</Text>
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

const App = () => (
  <PDFViewer style={{ width: "100%", height: "100vh" }}>{<MyDocument data={data} />}</PDFViewer>
)

const Apppage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <App />
      </Layout>
    </Suspense>
  )
}

export default Apppage
