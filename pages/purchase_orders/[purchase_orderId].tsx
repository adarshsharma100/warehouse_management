import { Suspense, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
// import Layout from "app/core/layouts/Layout"
import getPurchase_order from "app/purchase_orders/queries/getPurchase_order"
import deletePurchase_order from "app/purchase_orders/mutations/deletePurchase_order"
import Loading from "components/loading"
import Layout from "layouts/Layout"
import getGrns from "app/grns/queries/getGrns"
import moment from "moment"
import getVendors from "app/vendors/queries/getVendors"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Accordion, AccordionTab } from "primereact/accordion"
import { TabPanel, TabView } from "primereact/tabview"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import Invoice from "components/Invoice"
import { Button } from "primereact/button"
import Grn from "components/Grn"
import createGrn from "app/grns/mutations/createGrn"
import CreateGrn_status from "app/grn_statuses/mutations/createGrn_status"
import { InputTextarea } from "primereact/inputtextarea"
import { useFormik } from "formik"
import * as Yup from "yup"
import { InputText } from "primereact/inputtext"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import getGrn_statuses from "app/grn_statuses/queries/getGrn_statuses"
import get_Grns from 'app/grns/queries/getGrns'
import { MultiSelect } from "primereact/multiselect"
import { dateFormat } from "app/constants"
import updateGrn from "app/grns/mutations/updateGrn"
import getGrn_products from "app/grn_products/queries/getGrn_products"
import getGrn_product from "app/grn_products/queries/getGrn_product"
import { check } from "prettier"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"


export const Purchase_order = () => {
  const router = useRouter()
  const purchase_orderId = useParam("purchase_orderId", "number")
  const grn_productsId = useParam("grn_productsId", "number")
  const [value, setValue] = useState("")
  const user = useCurrentUser()
  const { id, role, name, email } = user

  console.log('purchase_orderId: ', purchase_orderId);
  // const vendors = [
  //   {
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
  //     status: 0,
  //   },
  //   {
  //     vendor_id: 2,
  //     vendor_code: "UE",
  //     vendor_email: "udederson@gmail.com",
  //     vendor_city: "Manuguru",
  //     vendor_contact: "8956237845",
  //     vendor_state: "Andhra Pradesh",
  //     vendor_gstin: "GSTMAN012541111",
  //     vendor: "Ud Ederson",
  //     address: "Manaus",
  //     credit_period: "5",
  //     lead_time: "4",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 3,
  //     vendor_code: "TE",
  //     vendor_email: "thomasEdison@gmail.com",
  //     vendor_city: "Miraj",
  //     vendor_contact: "8954236172",
  //     vendor_state: "Maharashtra",
  //     vendor_gstin: "GSTMIL009222222",
  //     vendor: "Thomas Edison",
  //     address: "Milan",
  //     credit_period: "4",
  //     lead_time: "4",
  //     status: 0,
  //   },
  //   {
  //     vendor_id: 4,
  //     vendor_code: "KM",
  //     vendor_email: "kamehameha@gmail.com",
  //     vendor_city: "Tonk",
  //     vendor_contact: "7856124391",
  //     vendor_state: "Rajasthan",
  //     vendor_gstin: "GSTTK0097811111",
  //     vendor: "Kamehameha",
  //     address: "Tokyo",
  //     credit_period: "7",
  //     lead_time: "4",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 5,
  //     vendor_code: "RH",
  //     vendor_email: "rahul@gmail.com",
  //     vendor_city: "Dumka",
  //     vendor_contact: "4556788925",
  //     vendor_state: "Jharkhand",
  //     vendor_gstin: "GSTDUB012541111",
  //     vendor: "Rahul",
  //     address: "Dubai",
  //     credit_period: "3",
  //     lead_time: "4",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 123,
  //     vendor_code: "VJ",
  //     vendor_email: "varunram.66@gmail.com",
  //     vendor_city: "Bangalore",
  //     vendor_contact: "7892496089",
  //     vendor_state: "Karnataka",
  //     vendor_gstin: "GSTN97313398111",
  //     vendor: "Varun",
  //     address: "Hennur",
  //     credit_period: "12",
  //     lead_time: "21",
  //     status: 0,
  //   },
  //   {
  //     vendor_id: 133,
  //     vendor_code: "iotif",
  //     vendor_email: "iot@gmail.com",
  //     vendor_city: "Gopalganj",
  //     vendor_contact: "4567892567",
  //     vendor_state: "Bihar",
  //     vendor_gstin: "GSTO14562398745",
  //     vendor: "TIF",
  //     address: "banglore",
  //     credit_period: "10",
  //     lead_time: "12",
  //     status: 0,
  //   },
  //   {
  //     vendor_id: 134,
  //     vendor_code: "KR",
  //     vendor_email: "kar@gmail.com",
  //     vendor_city: "Cambay",
  //     vendor_contact: "8987634523",
  //     vendor_state: "Gujarat",
  //     vendor_gstin: "GSTI87640111111",
  //     vendor: "Karan",
  //     address: "12th street ",
  //     credit_period: "4",
  //     lead_time: "5",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 135,
  //     vendor_code: "RA",
  //     vendor_email: "raj@gail.com",
  //     vendor_city: "banglor",
  //     vendor_contact: "1546237964",
  //     vendor_state: "Karnataka",
  //     vendor_gstin: "GSTI14254572222",
  //     vendor: "Raj",
  //     address: "11th street",
  //     credit_period: "11",
  //     lead_time: "12",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 147,
  //     vendor_code: "FK",
  //     vendor_email: "xylene8@gmail.com",
  //     vendor_city: "Salur",
  //     vendor_contact: "4567891238",
  //     vendor_state: "Andhra Pradesh",
  //     vendor_gstin: "GSTIN6786543467",
  //     vendor: "Frank",
  //     address: "11",
  //     credit_period: "11",
  //     lead_time: "11",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 168,
  //     vendor_code: "z",
  //     vendor_email: "z@g.com",
  //     vendor_city: "Chirala",
  //     vendor_contact: "1456987856",
  //     vendor_state: "Andhra Pradesh",
  //     vendor_gstin: "145698712345698",
  //     vendor: "z",
  //     address: "asd",
  //     credit_period: "45",
  //     lead_time: "56",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 170,
  //     vendor_code: "asq",
  //     vendor_email: "d@c.com",
  //     vendor_city: "Wanaparthy",
  //     vendor_contact: "1234567894",
  //     vendor_state: "Andhra Pradesh",
  //     vendor_gstin: "123456789568745",
  //     vendor: "q",
  //     address: "sda",
  //     credit_period: "12",
  //     lead_time: "45",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 171,
  //     vendor_code: "m",
  //     vendor_email: "m2@G.COM",
  //     vendor_city: "Zahirabad",
  //     vendor_contact: "1456239875",
  //     vendor_state: "Andhra Pradesh",
  //     vendor_gstin: "123654789632145",
  //     vendor: "m",
  //     address: "WSAQ",
  //     credit_period: "45",
  //     lead_time: "69",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 173,
  //     vendor_code: "SWD",
  //     vendor_email: "SD@GMAIL.COM",
  //     vendor_city: "Bellampalle",
  //     vendor_contact: "7895263654",
  //     vendor_state: "Andhra Pradesh",
  //     vendor_gstin: "SDEF412C5D6E3S6",
  //     vendor: "vj",
  //     address: "STRING ",
  //     credit_period: "56",
  //     lead_time: "85",
  //     status: 1,
  //   },
  //   {
  //     vendor_id: 192,
  //     vendor_code: "AS",
  //     vendor_email: "AS@gmail.com",
  //     vendor_city: "AS",
  //     vendor_contact: "AS",
  //     vendor_state: "AS",
  //     vendor_gstin: "AS",
  //     vendor: "AS",
  //     address: "AS",
  //     credit_period: "AS",
  //     lead_time: "AS",
  //     status: 1,
  //   },
  // ]

  const grnss = [
    {
      grn_id: 1,
      grn_batch_code: "GRN#3",
      grn_status: "QC-Started",
      created_on: "2022-12-14T10:10:46.000Z",
      grn_desc: "mild magic",
      grn_status_id: 4,
      grn_status_grnTogrn_status: {
        id: 4,
        name: "Closed",
      },
    },
    {
      grn_id: 2,
      grn_batch_code: "GRN#4",
      grn_status: "QC-Completed",
      created_At: "2022-12-14T10:15:52.000Z",
      grn_desc: "lorem text123",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 3,
      grn_batch_code: "GRN#1",
      grn_status: "Created",
      created_on: "2022-12-14T09:02:55.277Z",
      grn_desc: "wse",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 4,
      grn_batch_code: "GRN#2",
      grn_status: "Created",
      created_on: "2022-12-14T09:08:04.396Z",
      grn_desc: "wase",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 5,
      grn_batch_code: "GRN#5",
      grn_status: "Created",
      created_on: "2022-12-15T05:23:11.893Z",
      grn_desc: "eees",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 6,
      grn_batch_code: "GRN#6",
      grn_status: "Created",
      created_on: "2022-12-15T10:00:37.999Z",
      grn_desc: "lorem",
      grn_status_id: 2,
      grn_status_grnTogrn_status: {
        id: 2,
        name: "QC Started",
      },
    },
    {
      grn_id: 8,
      grn_batch_code: "GRN#7",
      grn_status: "QC-Completed",
      created_on: "2022-12-15T10:02:37.574Z",
      grn_desc: "dummy",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 9,
      grn_batch_code: "GRN#8",
      grn_status: "QC-Completed",
      created_on: "2022-12-15T10:12:07.203Z",
      grn_desc: "test",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 10,
      grn_batch_code: "GRN#9",
      grn_status: "Created",
      created_on: "2022-12-15T10:15:19.106Z",
      grn_desc: "txt",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 11,
      grn_batch_code: "GRN-4-aw",
      grn_status: "Created",
      created_on: "2022-12-15T10:15:44.571Z",
      grn_desc: "fulltime",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 12,
      grn_batch_code: "GRN-4-wqdwdc",
      grn_status: "Created",
      created_on: "2022-12-15T10:17:40.464Z",
      grn_desc: "sunny",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 13,
      grn_batch_code: "GRN-4-1",
      grn_status: "Created",
      created_on: "2022-12-15T10:18:47.444Z",
      grn_desc: "egghead",
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 14,
      grn_batch_code: "GRN-4-sf",
      grn_status: "Created",
      created_on: "2022-12-15T10:19:18.781Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 15,
      grn_batch_code: "GRN-4-123",
      grn_status: "Created",
      created_on: "2022-12-15T10:20:20.539Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 16,
      grn_batch_code: "GRN-4-22",
      grn_status: "Created",
      created_on: "2022-12-15T10:21:05.784Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 17,
      grn_batch_code: "GRN-4-qazz",
      grn_status: "Created",
      created_on: "2022-12-15T10:55:50.280Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 18,
      grn_batch_code: "GRN-4-PO#57",
      grn_status: "QC-Started",
      created_on: "2023-01-02T05:44:22.620Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 19,
      grn_batch_code: "GRN-4-PO#66",
      grn_status: "Created",
      created_on: "2023-01-02T05:50:34.326Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 20,
      grn_batch_code: "GRN-4-PO#80",
      grn_status: "Created",
      created_on: "2023-01-02T06:04:14.652Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 21,
      grn_batch_code: "GRN-4-PO#82",
      grn_status: "Created",
      created_on: "2023-01-02T06:04:44.242Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 22,
      grn_batch_code: "GRN-4-PO#83",
      grn_status: "Created",
      created_on: "2023-01-02T06:05:13.673Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 23,
      grn_batch_code: "GRN-4-po code",
      grn_status: "Created",
      created_on: "2023-01-04T12:56:16.292Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 24,
      grn_batch_code: "GRN-4-po code",
      grn_status: "Created",
      created_on: "2023-01-04T12:56:19.462Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 25,
      grn_batch_code: "GRN-4-PO#43",
      grn_status: "Created",
      created_on: "2023-01-10T13:17:42.184Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 26,
      grn_batch_code: "GRN-4-PO#44",
      grn_status: "Created",
      created_on: "2023-01-12T04:43:38.998Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 27,
      grn_batch_code: "GRN-4-PO#44",
      grn_status: "QC-Started",
      created_on: "2023-01-12T04:43:40.967Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
    {
      grn_id: 28,
      grn_batch_code: "GRN-4-PO#57",
      grn_status: "Created",
      created_on: "2023-01-20T07:20:28.718Z",
      grn_desc: null,
      grn_status_id: 1,
      grn_status_grnTogrn_status: {
        id: 1,
        name: "Created",
      },
    },
  ]

  // const purchase_order = {
  //   po_id: 8,
  //   po_type: "sss",
  //   updated_on: "2022-11-15T11:46:48.081Z",
  //   approved_on: null,
  //   created_at: "2022-11-15T11:46:48.081Z",
  //   from_party: "TIF Labs",
  //   expiry_date: "2022-11-22T18:30:00.000Z",
  //   expected_delivery: "2022-11-24T18:30:00.000Z",
  //   agreement: "Approved",
  //   po_description: "Sensor Bundle",
  //   po_code: "PO#57",
  //   rfq_id: 18,
  //   grn_grn_id: 28,
  //   note: null,
  //   agreement_terms_id: 1,
  //   purchase_order_status_id: 1,
  //   vendor_vendor_id: 3,
  //   purchase_order_products: [
  //     {
  //       pop_id: 14,
  //       vendor_products_vp_id: 8,
  //       vendor_products_vendor_vendor_id: 3,
  //       vendor_products_products_product_id: 7,
  //       quantity: 89,
  //       price_per_unit: 85,
  //       received_quantity: 0,
  //       purchase_order_po_id: 8,
  //       purchase_order_vendor_vendor_id: 3,
  //       vendor_products: {
  //         vp_id: 8,
  //         unit_price: 45,
  //         vendor_vendor_id: 3,
  //         products_product_id: 7,
  //         enabled: 1,
  //         priority: 2,
  //         vendor_sku: "TE107",
  //         products: {
  //           product_id: 7,
  //           name: "Heat Flame Sensor",
  //           description: "description heat",
  //           product_type: "Sensors",
  //           products_sku: "TIF007",
  //           Price: 56,
  //           product_unit: null,
  //         },
  //       },
  //     },
  //     {
  //       pop_id: 155,
  //       vendor_products_vp_id: 20,
  //       vendor_products_vendor_vendor_id: 3,
  //       vendor_products_products_product_id: 5,
  //       quantity: 7,
  //       price_per_unit: 56,
  //       received_quantity: 0,
  //       purchase_order_po_id: 8,
  //       purchase_order_vendor_vendor_id: 3,
  //       vendor_products: {
  //         vp_id: 20,
  //         unit_price: 120,
  //         vendor_vendor_id: 3,
  //         products_product_id: 5,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TE105",
  //         products: {
  //           product_id: 5,
  //           name: "MQ-135 gas sensor Module",
  //           description: "description 135",
  //           product_type: "Sensors",
  //           products_sku: "TIF005",
  //           Price: 56,
  //           product_unit: null,
  //         },
  //       },
  //     },
  //     {
  //       pop_id: 156,
  //       vendor_products_vp_id: 83,
  //       vendor_products_vendor_vendor_id: 3,
  //       vendor_products_products_product_id: 4,
  //       quantity: 47,
  //       price_per_unit: 42,
  //       received_quantity: 0,
  //       purchase_order_po_id: 8,
  //       purchase_order_vendor_vendor_id: 3,
  //       vendor_products: {
  //         vp_id: 83,
  //         unit_price: 0,
  //         vendor_vendor_id: 3,
  //         products_product_id: 4,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TE104",
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
  //       pop_id: 157,
  //       vendor_products_vp_id: 5,
  //       vendor_products_vendor_vendor_id: 3,
  //       vendor_products_products_product_id: 3,
  //       quantity: 14,
  //       price_per_unit: 24,
  //       received_quantity: 0,
  //       purchase_order_po_id: 8,
  //       purchase_order_vendor_vendor_id: 3,
  //       vendor_products: {
  //         vp_id: 5,
  //         unit_price: 50,
  //         vendor_vendor_id: 3,
  //         products_product_id: 3,
  //         enabled: 1,
  //         priority: 4,
  //         vendor_sku: "TE103",
  //         products: {
  //           product_id: 3,
  //           name: "Waterproof Ultrasonic Sensor",
  //           description: "water-desp",
  //           product_type: "Sensors",
  //           products_sku: "TIF003",
  //           Price: 24,
  //           product_unit: "combo",
  //         },
  //       },
  //     },
  //   ],
  // }
  const prefixes = [
    {
      id: 1,
      name: "PRODUCT",
      prefix: "PROD",
    },
    {
      id: 2,
      name: "RFQ",
      prefix: "RFQ",
    },
    {
      id: 3,
      name: "PO",
      prefix: "PO",
    },
    {
      id: 4,
      name: "GRN",
      prefix: "GRN",
    },
  ]

  const GrnProducts = [
    {
      itemSku: "TIFMT0009",
      vendorSku: "NA",
      batchCode: "-",
      received: "600",
      rejected: "0",
      pendingQuanity: "0",
      priceInfo: "480",
      additionalCost: "0",
    },
    {
      itemSku: "TIFMT0033",
      vendorSku: "NA",
      batchCode: "-",
      received: "624",
      rejected: "0",
      pendingQuanity: "0",
      priceInfo: "110",
      additionalCost: "0",
    },
    {
      itemSku: "TIFMT0011",
      vendorSku: "NA",
      batchCode: "-",
      received: "100",
      rejected: "0",
      pendingQuanity: "0",
      priceInfo: "9",
      additionalCost: "0",
    },
    {
      itemSku: "TIFMT0014",
      vendorSku: "NA",
      batchCode: "-",
      received: "50",
      rejected: "0",
      pendingQuanity: "0",
      priceInfo: "30",
      additionalCost: "0",
    },
    {
      itemSku: "TIFMT0002",
      vendorSku: "NA",
      batchCode: "-",
      received: "49",
      rejected: "0",
      pendingQuanity: "0",
      priceInfo: "50",
      additionalCost: "0",
    },
    {
      itemSku: "TIFMT0040",
      vendorSku: "NA",
      batchCode: "-",
      received: "60",
      rejected: "0",
      pendingQuanity: "0",
      priceInfo: "12",
      additionalCost: "0",
    },
  ]
  const GrnFormDetails = {
    grnNumber: '',
    invoiceNo: "",
    status: "",
    invoiceDate: '',
    trackingId: '',
    eta: '',
    createdAt: '',
    updatedAt: '',
    createdBy: '',

  }

  const dateFormats = (dateObj) => moment(new Date(dateObj)).format("DD-MM-YYYY, HH:MM")

  const columns = [
    { type: 'text', label: "Grn Number", field: 'grnNumber' },
    { type: 'text', label: "Invoice No", field: 'invoiceNo' },
    { type: 'text', label: "Tracking Id", field: 'trackingId' },
    { type: 'text', label: "Status", field: 'status' },
    {
      label: "Created At",
      body: (rowData) => <div>{dateFormat(rowData.createdAt)}</div>,
    },
    {
      label: "Update At",
      body: (rowData) => <div>{dateFormat(rowData.updatedAt)}</div>,
    },
    {
      label: "ETA",
      body: (rowData) => <div>{dateFormat(rowData.eta)}</div>,
    },
    {
      label: "Invoice Date",
      body: (rowData) => <div>{dateFormat(rowData.invoiceDate)}</div>,
    },
    {
      label: "Created By",
      body: (rowData) => <div>{dateFormats(rowData.createdBy)}</div>,
    },


  ]
  const grnProductColumn = [
    { type: 'text', label: "Vendor SKU", field: 'po_products.vendor_products.sku' },
    { type: 'text', label: "Item SKU", field: 'po_products.vendor_products.products.sku' },
    { type: 'text', label: "Received Quantity", field: 'receivedQuantity' },
    { type: 'text', label: "Rejected Quantity", field: 'rejectedQuantity' },
    { type: 'text', label: "Po Product", field: 'poProduct' },
    { type: 'text', label: "Grn", field: 'grn' },
  ]

  // console.log("purchase_orderId", purchase_orderId)
  // const [deletePurchase_orderMutation] = useMutation(deletePurchase_order)
  const [purchase_order, { refetch }] = useQuery(getPurchase_order, {
    id: purchase_orderId,
  })

  console.log('purchase_order: ', purchase_order);
  // const [{ vendors }, { error: getVenorsError }] = useQuery(getVendors, {
  //   orderBy: { vendor_id: "asc" },
  // })
  // const [{ grns }, { refetch: refetchGrn }] = useQuery(getGrns, {
  //   orderBy: { grn_id: "asc" },
  //   skip: undefined,
  //   where: undefined,
  //   take: undefined
  // })
  // console.log('grns: ', grns);

  // const [{ prefixes }, { error: getPrefixesError }] = useQuery(getPrefixes, {
  //   orderBy: { id: "asc" },
  // })

  const [createGrnMutation, { error: grnCreationError }] = useMutation(createGrn)
  const [updateGrnMutation] = useMutation(updateGrn)
  const [{ grn_statuses },] = useQuery(getGrn_statuses, {
    orderBy: { id: "asc" },
  })
  const [{ grns },] = useQuery(getGrns, {
    orderBy: { id: 'asc' },
  })
  console.log('grns: ', grns);


  const [checkGrn, setCheckGrn] = useState(purchase_order.grn)
  console.log('checkGrn: ', checkGrn);


  const findVendor = (id) => vendors.find((ele, i) => (ele.vendor_id = id)).vendor

  const {
    po_id,
    po_type,
    updated_on,
    approved_on,
    created_at,
    from_party,
    expiry_date,
    expected_delivery,
    agreement,
    purchase_order_status_pos_id,
    vendor_vendor_id,
    po_description,
    po_code,
    rfq_id,
    grn_grn_id,
    agreement_status,
    purchase_order_products,
  } = purchase_order

  const currentGrn = grnss[0]
  const [grnDetails, setGrnDetails] = useState(GrnFormDetails)
  const [active, setActive] = useState(false)
  const [showData, setShowData] = useState([])
  const [values, setValues] = useState('');
  const [status, setStatus] = useState()
  // console.log('status: ', status);
  const [items, setItems] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState(columns)
  const [productsColumn, setProductsColumn] = useState(grnProductColumn)
  const [activeRowData, setActiveRowData] = useState({})
  const [editGrns, setEditGrns] = useState(false)
  const [edit, setEdit] = useState(false)
  const [updateGrns, setUpdateGrns] = useState(false)

  const [inputs, setInputs] = useState([{ value: '' }]);

  const handleAddInput = () => {
    setInputs([...inputs, { value: '' }]);
  };

  const handleRemoveInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };


  const handleInputChange = (index, event) => {
    const newInputs = [...inputs];
    newInputs[index].value = event.target.value;
    setInputs(newInputs);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(inputs.map(input => input.value));

  };





  const onColumnToggle = (event) => {
    let productsColumn = event.value
    let orderedSelectedColumns = grnProductColumn.filter((col) =>
      productsColumn.some((sCol) => sCol.field === col.field)
    )
    // setSelectedColumns(orderedSelectedColumns)
    setProductsColumn(orderedSelectedColumns)
  }

  const search = (event) => {
    let _items = grn_statuses;
    setItems(grn_statuses.map((i) => i.name));
  }

  const header = (
    <div style={{ textAlign: "left" }}>
      <MultiSelect
        value={productsColumn}
        options={columns}
        optionLabel="header"
        onChange={onColumnToggle}
        style={{ width: "20em" }}
      />
    </div>
  )

  const columnComponents = productsColumn.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.label}
        filter
        filterPlaceholder="Search...."
      />
    )
  })



  const formik = useFormik({
    initialValues: grnDetails,
    validationSchema: Yup.object().shape({
      invoiceNo: Yup.string().required("*Required"),
      grnNumber: Yup.string().required('*Required')
    }),
    onSubmit: async (data) => {
      console.log('data: ', data);
      console.log("inputValue", inputs);

      setShowData(<pre>{JSON.stringify(data, null, 2)}</pre>)

      const { grnNumber, invoiceNo, invoiceDate, createdBy, trackingId, eta }: any = data
      const activeUpdateId = activeRowData.id

      const ss = purchase_order.po_products.map((product) => ({
        receivedQuantity: product.quantity,
        rejectedQuantity: 0,
        poProduct: product.id,
        // price: product.price
      }))
      if (updateGrns) {
        try {
          await updateGrnMutation({
            id: activeUpdateId,
            grnNumber,
            invoiceNo,
            invoiceDate: new Date(),
            trackingId,
            createdBy: 8,
            eta: new Date(),
            status: Number(status),
            purchaseOrder: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          }, {
            onSuccess: (data) => {
              alert('Updated!')
              console.log(data)
            },
            onError: (error) => {
              alert("OnError")
              console.log('error: ', error);
            }
          }
          )

        } catch (error) {
          console.log('error: ', error);
        }
      }
      else {
        try {
          await createGrnMutation({
            grnNumber,
            invoiceNo,
            invoiceDate: new Date(),
            trackingId,
            createdBy: id,
            eta: new Date(),
            status: Number(status),
            purchaseOrder: purchase_orderId,
            createdAt: new Date(),
            updatedAt: new Date(),
            grn_products: {
              create: ss
            },
          }, {
            onSuccess: (data) => {
              alert("Created!")
              refetch()
              console.log('data: ', data);
            },
            onError: (error) => {
              alert("error++")
              console.log('error: ', error);
            }
          }
          )
        } catch (error) {
          alert("Error")
          console.log('error: ', error);

        }
      }

    }
  })
  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }


  

  return (
    <>
      <Head>
        <title>{po_code}</title>
      </Head>

      <div>
        <h1>{po_code}</h1>
        <div className="lg:flex m-3 p-1 border-1 border-round border-primary">
          <section className="lg:w-3 p-3 m-2 border-1 border-round border-primary">
            <h3 className="text-center">Details</h3>
            <div className="flex flex-column justify-content-center text-lg">
              {[
                { field: "Code", value: po_code },
                { field: "Description", value: po_description },
                { field: "From Party", value: from_party },
                { field: "Expected Delivery", value: expected_delivery },
                { field: "Expiry Date", value: expiry_date },
                { field: "Agreement", value: agreement_status || `-` },
                // { field: "Vendor", value: findVendor(vendor_vendor_id) },
              ].map((ele, i) => (
                <div className="grid align-items-center py-2" key={i}>
                  <p className="flex-1 m-0">{ele.field}</p>
                  <span>: &nbsp; </span>
                  <p className="flex-1">
                    {typeof ele.value === "string"
                      ? ele.value
                      : moment(ele.value).format("DD-MM-YYYY, HH:MM")}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="flex-1 p-3 m-2 border-1 border-round border-primary  ">
            <h3 className="text-center">Products</h3>
            <div className="">
              <DataTable
                value={purchase_order_products}
                responsiveLayout="scroll"
                showGridlines
                // header={renderHeader}
                stripedRows
                className="text-s datatable-responsive w-full mt-5"
              // paginator
              // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
              // rows={PAGINATION_VARIABLES.rows}
              // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
              // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
              >
                <Column
                  field="pop_id"
                  header="ID"
                // className="text-center"
                />
                <Column
                  field="vendor_products.products.products_sku"
                  header="Product SKU"
                // className="text-center"
                />

                <Column
                  field="vendor_products.products.name"
                  header="Name"
                // className="text-center"
                />
                <Column
                  field="price_per_unit"
                  header="Price / Unit"
                // className="text-center"
                />
                <Column
                  field="quantity"
                  header="Quantity"
                // className="text-center"
                />
              </DataTable>
            </div>
          </section>
        </div>

        <div>
          {active && <div className="card">
            <div>
              {editGrns ?
                <div className="flex justify-content-between">
                  <h3 className="mb-0">Update GRN</h3>
                  <Button icon='pi pi-pencil' onClick={() => { setEdit(!edit); setUpdateGrns(!updateGrns) }} />
                </div>

                : <h3 className="mb-0">Create GRN</h3>}
            </div>

            <form className="p-fluid" onSubmit={formik.handleSubmit}>
              {active &&

                <div className="">
                  <div className="formgrid grid gap-4">
                    {[
                      { type: 'text', label: "Grn Number", field: 'grnNumber' },
                      { type: 'text', label: "Invoice No", field: 'invoiceNo' },
                      { type: 'text', label: "Invoice Date", field: 'invoiceDate' },
                      { type: 'text', label: "Tracking Id", field: 'trackingId' },
                      { type: 'text', label: "ETA", field: 'eta' },
                      // { type: 'text', label: "Created At", field: 'createdAt' },
                      // { type: 'text', label: "Updated At", field: 'updatedAt' },
                      { type: 'text', label: "created By", field: 'createdBy' },
                    ].map((ele, i) => {
                      return (
                        <div key={`create-${ele.field}-${i}`}
                          className="field mt-4 flex">
                          <span className="p-float-label mt-4">
                            <InputText
                              disabled={edit}
                              id={ele.field}
                              name={ele.field}
                              value={formik.values[ele.field]}
                              onChange={formik.handleChange}
                              autoFocus
                              className={classNames({ "p-invalid ": isFormFieldValid(ele.field) })}
                            />
                            <label
                              htmlFor={ele.field}
                              className={classNames({ "p-error": isFormFieldValid(ele.field) })}
                            >
                              {ele.label}
                            </label>
                          </span>
                          {getFormErrorMessage(ele.field)}
                        </div>
                      )
                    })
                    }

                  </div>

                  <div className="flex gap-4 align-items-center flex-wrap">
                    {inputs.map((input, index) => (
                      <div key={index} className='flex gap-4'>
                        {/* <label>Project</label> */}
                        <InputText
                          type="text"
                          disabled={edit}
                          value={input.value}
                          onChange={(event) => handleInputChange(index, event)}
                          placeholder="Project"
                        />

                        {index > 0 && <Button type="button" icon='pi pi-minus' onClick={() => handleRemoveInput(index)} />}
                      </div>
                    ))}
                    <Button disabled={edit} type="button" icon="pi pi-plus" onClick={handleAddInput} />

                  </div>

                  <AutoComplete disabled={edit} className="mt-4" placeholder="GrnStatus" value={values} suggestions={items} completeMethod={search} onChange={(e) => {
                    const selectedStatus: any = grn_statuses.find(status => status.name === e.value);
                    setStatus(selectedStatus.id);
                    setValues(e.value);
                  }} dropdown />

                  <div className="flex justify-content-between gap-5 m-4">
                    <Button type="submit" label="SUBMIT" className="" />
                    <Button type="submit" label="CANCLE" onClick={() => { setActive(!active); setEditGrns(false); formik.resetForm() }} className="p-button-secondary flex-grow-0" />
                  </div>

                </div>
              }


            </form>
          </div>}
        </div>


        <div className="flex justify-content-end px-3 mt-4 ">
          <Button icon='pi pi-plus' onClick={() => { setActive(!active); setEdit(false) }} />
        </div>


        {checkGrn.length > 0 ?

          <div className="mt-4">
            {checkGrn.map((i) => {
              return (
                <Accordion>
                  <AccordionTab header={i.grnNumber}>
                    <TabView>
                      <TabPanel header="Invoice">
                        <div className="formgrid grid mt-3 card " style={{ backgroundColor: "#05101e" }}>

                          <div key={i.id} className="flex flex-wrap gap-6 rounded-md p-4 shadow-md">
                            {Object.entries(i).map(([key, value]) => {

                              if (value instanceof Date) {
                                value = value.toLocaleString("en-US", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                });
                              }
                              if (key === "grn_products") {
                                value = (
                                  <div>
                                    {value.map((item) => (
                                      <div key={item.id}>{item.id}</div>
                                    ))}
                                    <div className="font-semibold">
                                      Total: {value.length} items
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={key} className="flex gap-2 mb-2">
                                  <div className="w-1/3 text-gray-600 font-semibold">{key}:</div>
                                  <div className="w-2/3">{value.toString()}</div>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                        {/* <DataTable
                          value={purchase_order.grn.map((ele) => ele.grn_products.map((i) => i))}
                          responsiveLayout="scroll"
                          showGridlines
                          className="text-s datatable-responsive"
                          filterDisplay="menu"
                          emptyMessage="No Results found."
                          onRowClick={async (e) => {
                            console.log('e.data: ', e.data);
                            setActiveRowData({ ...e.data })
                            setEditGrns(true)
                            setActive(true)
                            setEdit(true)
                            await formik.setValues({
                              ...e.data,
                            })
                          }}
                        >
                          {columnComponents}
                        </DataTable> */}

                        <DataTable
                          editMode="cell"
                          value={purchase_order.grn.flatMap((ele) => ele.grn_products)}
                          responsiveLayout="scroll"
                          showGridlines
                          className="text-s datatable-responsive"
                          filterDisplay="menu"
                          emptyMessage="No Results found."
                        >
                          {columnComponents}
                        </DataTable>
                      </TabPanel>

                    </TabView>
                  </AccordionTab>

                </Accordion>
              )
            })}
          </div>

          : null}














        {/* <div className="col-12">
          <div className="card">
            <DataTable
              value={grns}
              responsiveLayout="scroll"
              showGridlines
              className="text-s datatable-responsive"
              filterDisplay="menu"
              emptyMessage="No Results found."
              onRowClick={async (e) => {
                console.log('e.data: ', e.data);
                setActiveRowData({ ...e.data })
                setEditGrns(true)
                setActive(true)
                setEdit(true)
                await formik.setValues({
                  ...e.data,
                })
              }}
            >
              {columnComponents}
            </DataTable>
          </div>
        </div> */}

        {/* <div>{showData}</div> */}



      </div>
    </>
  )
}

const ShowPurchase_orderPage = () => {
  return (


    <Suspense fallback={<Loading />}>
      <Layout>
        <Purchase_order />
      </Layout>
    </Suspense>

  )
}


export default ShowPurchase_orderPage

{/* <Accordion className="px-3 mt-3">
<AccordionTab header="GRN#001">
  <TabView>
    {/* <TabPanel header="Invoice">
      <>
        <div className="formgrid grid mt-3 card " style={{ backgroundColor: "#05101e" }}>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong> Vendor :</strong>
            </p>
            <p>vendor</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong> Invoice No :</strong>
            </p>
            <p>ABCD567</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Terms/Agreement :</strong>
            </p>
            <p>Regarding payment</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Created On :</strong>
            </p>
           
            <p>14-12-2022</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Delivered On :</strong>
            </p>
            
            <p>-</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Description :</strong>
            </p>
            <p>currentGrn?.grn_desc</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Status :</strong>
            </p>
            <p>Waiting_For_Approval</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Contact Person :</strong>
            </p>
            <p>User 1</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Value in Rs. :</strong>
            </p>
            <p>14,256</p>
          </div>
        </div>

        <div>
          <div className="flex justify-content-between">
            <h5>Items</h5>
            <span>
              
              <Button
                className="m-auto mb-3"
                icon="pi pi-plus"
                label="Create GRN"
                onClick={async () => {
                  try {
                    const newgrn = await createGrnMutation({
                      grn_batch_code: `GRN-4-${po_code}`,
                      purchase_order: {
                        connect: {
                          po_id: po_id,
                        },
                      },
                    })
                  } catch (error) {
                    console.log("createGrnMutation", error)
                  }
                  await refetch()
                  console.log("refeatched")
                }}
              ></Button>
            </span>
          </div>
          <DataTable
            value={purchase_order_products}
            responsiveLayout="scroll"
            showGridlines
            // header={renderHeader}
            stripedRows
            className="text-s datatable-responsive w-full mt-5"
            // paginator
            // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
            // rows={PAGINATION_VARIABLES.rows}
            // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
            // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
          >
            <Column
              field="vendor_products.vendor_sku"
              header="Vendor-SKU"
              // className="text-center"
            />

            <Column
              field="vendor_products.products.name"
              header="Product"
              // className="text-center"
            />
            <Column
              field="vendor_products.products.description"
              header="Description"
              // className="text-center"
            />
            <Column
              field="quantity"
              header="Qty."
              // className="text-center"
            />
            <Column
              field="price_per_unit"
              header="Price"
              // className="text-center"
            />
            <Column
              // field=""
              header="Total"
              body={(rowData) => {
                const { quantity, price_per_unit } = rowData
                console.log("rowData", rowData)
                return quantity * price_per_unit
              }}
              // className="text-center"
            />
          </DataTable>
        </div>
      </>
    </TabPanel> */}

{/* <TabPanel header="GRN">
      <>
        <div className="formgrid grid mt-3 card " style={{ backgroundColor: "#05101e" }}>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong> GRN ID :</strong>
            </p>
            <p>{currentGrn && `${prefixes[3].prefix}-${currentGrn?.grn_id}`}</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Batch Code :</strong>
            </p>
            <p>{currentGrn?.grn_batch_code}</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Created On :</strong>
            </p>
            {currentGrn && <p>{moment(currentGrn?.created_on).format("DD-MM-YYYY")}</p>}
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Description :</strong>
            </p>
            <p>{currentGrn?.grn_desc}</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Status :</strong>
            </p>
            <p>{currentGrn?.grn_status}</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>Recevie Person :</strong>
            </p>
            <p>User 1</p>
          </div>
          <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
            <p className="mb-1 fb-50">
              <strong>QC Person :</strong>
            </p>
            <p>User 2</p>
          </div>
        </div>
        <div>
          <div className="flex justify-content-between">
            <h5>Items</h5>
            <span>
              <Button
                className="mr-3"
                label="Start QC"
                onClick={async () => {
                  await updateGrnMutation({
                    grn_id: currentGrn.grn_id,
                    grn_status: "QC-Started",
                  })
                  refetch()
                }}
              />
              <Button
                label="QC Completed"
                onClick={async () => {
                  await updateGrnMutation({
                    grn_id: currentGrn.grn_id,
                    grn_status: "QC-Completed",
                  })
                  refetch()
                }}
              />
            </span>
          </div>
          <DataTable
            value={purchase_order_products}
            responsiveLayout="scroll"
            showGridlines
            // header={renderHeader}
            stripedRows
            className="text-s datatable-responsive w-full mt-5"
            // paginator
            // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
            // rows={PAGINATION_VARIABLES.rows}
            // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
            // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
          >
            <Column
              field="vendor_products.products.description"
              header="Item-description"
              // className="text-center"
            />

            <Column
              field="quantity"
              header="Recevied"
              // className="text-center"
            />
            <Column
              field=""
              header="Good-Stock"
              // className="text-center"
            />
            <Column
              field=""
              header="Bad-stock"
              // className="text-center"
            />
            <Column
              field=""
              header="Rejection Reason"
              // className="text-center"
            />
          </DataTable>
        </div>
      </>
    </TabPanel> */}

//     <TabPanel header="Invoice/GRN">
//       <>
//         <div className="formgrid grid mt-3 card " style={{ backgroundColor: "#05101e" }}>
//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong> Vendor Invoice# :</strong>
//             </p>
//             <p>NI/22-23/2034</p>
//           </div>
//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong> GRN#</strong>
//             </p>
//             <p>G1468</p>
//           </div>

//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong> GRN status :</strong>
//             </p>
//             <p>COMPLETED</p>
//           </div>

//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong> Created On :</strong>
//             </p>
//             <p>14 Feb 2023, 15:40</p>
//           </div>

//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong> Recevied Units :</strong>
//             </p>
//             <p>1483</p>
//           </div>
//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong>Rejected Units :</strong>
//             </p>
//             <p>0</p>
//           </div>
//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong>Vendor Invoice Date :</strong>
//             </p>
//             {/* {currentGrn && <p>{moment(currentGrn?.created_on).format("DD-MM-YYYY")}</p>} */}
//             <p>14-2-2023</p>
//           </div>
//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong> Received Amount :</strong>
//             </p>
//             {/* {currentGrn && <p>{moment(currentGrn?.created_on).format("DD-MM-YYYY")}</p>} */}
//             <p>₹ 362210.00</p>
//           </div>
//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong>Rejected Amount :</strong>
//             </p>
//             <p>₹ 0.00</p>
//           </div>
//           {/* <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//                                   <p className="mb-1 fb-50">
//                                       <strong>ASN :</strong>
//                                   </p>
//                                   <p>-</p>
//                               </div> */}
//           <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
//             <p className="mb-1 fb-50">
//               <strong>Created By:</strong>
//             </p>
//             <p>warehouseops.robocraze@.q...</p>
//           </div>
//         </div>
//         <div>
//           <div className="flex justify-content-between">
//             <h5 className="font-bold">QC Completed Items</h5>
//             <span>
//               {/* <Button className="mr-3" label="Create GRN" onClick={async () => {}} /> */}
//               {/* <Button
//                                           className="m-auto mb-3"
//                                           icon="pi pi-plus"
//                                           label="Create GRN"
//                                           onClick={async () => {
//                                               try {
//                                                   const newgrn = await createGrnMutation({
//                                                       grn_batch_code: `GRN-4-${po_code}`,
//                                                       purchase_order: {
//                                                           connect: {
//                                                               po_id: po_id,
//                                                           },
//                                                       },
//                                                   })
//                                               } catch (error) {
//                                                   console.log("createGrnMutation", error)
//                                               }
//                                               await refetch()
//                                               console.log("refeatched")
//                                           }}
//                                       ></Button> */}
//             </span>
//           </div>
//           <DataTable
//             // value={purchase_order_products}
//             value={GrnProducts}
//             responsiveLayout="scroll"
//             showGridlines
//             // header={renderHeader}
//             stripedRows
//             className="text-s datatable-responsive w-full mt-5"
//           // paginator
//           // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
//           // rows={PAGINATION_VARIABLES.rows}
//           // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
//           // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
//           >
//             <Column
//               field="itemSku"
//               header="item SKU"

//             // className="text-center"
//             />

//             <Column
//               field="vendorSku"
//               header="vendor SKU"
//             // className="text-center"
//             />

//             <Column
//               field="received"
//               header="Received"

//             />
//             <Column
//               field="rejected"
//               header="Rejected"
//             // className="text-center"
//             />

//             <Column
//               field="pendingQuanity"
//               header="Pending Quanity"
//             // className="text-center"
//             />
//             <Column
//               field="priceInfo"
//               header="Price Info "
//             // className="text-center"
//             />
//             {/* <Column
//                                       field="additionalCost"
//                                       header="Additional Cost"
//                                   // className="text-center"
//                                   /> */}
//           </DataTable>

//           <div className="card " style={{ position: "relative" }}>
//             <InputTextarea
//               placeholder="write a comment..."
//               value={value}
//               onChange={(e) => setValue(e.target.value)}
//               rows={3}
//               cols={30}
//               style={{ width: "100%" }}
//             />
//           </div>
//           <div className="flex justify-content-end">
//             <Button>Add Comments</Button>
//           </div>
//         </div>
//       </>
//     </TabPanel>
//   </TabView>
// </AccordionTab>
// <AccordionTab header="GRN#002">
//   {/* <TabView>
//     <TabPanel header="GRN#003">
//       <Invoice
//         currentGrn={currentGrn}
//         prefixes={prefixes}
//         poDetails={purchase_order}
//         // refetch={refetchGrn}
//       />
//     </TabPanel>

//     <TabPanel header="GRN">
//       {!currentGrn && (
//         <div className="flex justify-content-center pt-3 flex-column">
//           <p className="m-auto mb-3 text-xl">
//             GRN not yet created for this PO yet, you can create it using below button.
//           </p>
//           <Button
//             className="m-auto mb-3"
//             icon="pi pi-plus"
//             label="Create GRN"
//             onClick={async () => {
//               try {
//                 const newgrn = await createGrnMutation({
//                   grn_batch_code: `GRN-4-${po_code}`,
//                   purchase_order: {
//                     connect: {
//                       po_id,
//                     },
//                   },
//                 })
//               } catch (error) {
//                 console.log("createGrnMutation", error)
//               }

//               await refetchGrn()
//               console.log("refeatched")
//             }}
//           ></Button>
//         </div>
//       )}
//       {currentGrn && (
//         <Grn
//           currentGrn={currentGrn}
//           prefixes={prefixes}
//           poDetails={purchase_order}
//           // refetch={refetchGrn}
//         />
//       )}
//     </TabPanel>
//   </TabView> */}
//   Content II
// </AccordionTab>
// <AccordionTab header="Invoice III">Content III</AccordionTab>
// </Accordion> */}