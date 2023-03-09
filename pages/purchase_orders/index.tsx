import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import Layout from "layouts/Layout"
import { Column } from "primereact/column"
import { Divider } from "primereact/divider"
import { DataTable } from "primereact/datatable"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import moment from "moment"
import getPurchase_order_products from "app/purchase_order_products/queries/getPurchase_order_products"
import getVendors from "app/vendors/queries/getVendors"
import { Calendar } from "primereact/calendar"
import getVendor_products from "app/vendor_products/queries/getVendor_products"
import getRfqs from "app/rfqs/queries/getRfqs"
import getGrns from "app/grns/queries/getGrns"
import createPurchase_order_product from "app/purchase_order_products/mutations/createPurchase_order_product"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updatePurchase_order from "app/purchase_orders/mutations/updatePurchase_order"
import { date, number, undefined } from "zod"
import createManyPurchase_order_product from "app/purchase_order_products/mutations/createManyPurchase_order_product"
import deletePurchase_order from "app/purchase_orders/mutations/deletePurchase_order"
import deletePurchase_order_product from "app/purchase_order_products/mutations/deletePurchase_order_product"
import getRfq_products from "app/rfq_products/queries/getRfq_products"
import Loading from "components/loading"
import { Menu } from "primereact/menu"
import getProducts from "app/products/queries/getProducts"
import { ProductsList } from "pages/products"
import { Chips } from "primereact/chips"
import { Vendor } from "pages/vendors/[vendorId]"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import { TabView, TabPanel } from "primereact/tabview"
import Grn from "components/Grn"
import LoaderFullScreen from "components/LoaderFullScreen"
import ErrorCard from "components/ErrorCard"
import createGrn from "app/grns/mutations/createGrn"
import { Checkbox } from "primereact/checkbox"
import axios from "axios"
import { AutoComplete } from "primereact/autocomplete"
import { getAntiCSRFToken } from "@blitzjs/auth"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import {
  arrayFillCopy,
  calenderDateFormat,
  createSearchFunction,
  filterExistingValues,
  tsuccess,
  toDateObj,
  tError,
  dateFormat,
} from "app/constants"
import { Toast } from "primereact/toast"
import Invoice from "components/Invoice"
import createNotifications from "app/notifications_sents/mutations/createNotifications_sent"
import { useSession } from "@blitzjs/auth"
import { Ctx } from "blitz"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import CreateNewPo from "components/CreateNewPo"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import getAgreement_terms from "app/agreement_terms/queries/getAgreement_terms"

const ITEMS_PER_PAGE = 250

export const Purchase_ordersList = () => {
  const router = useRouter()
  const antiCSRFToken = getAntiCSRFToken()
  const user = useCurrentUser()
  const { id, role, name, email } = user


  const page = Number(router.query.page) || 0
  const [{ purchase_orders, hasMore }, { error: getPoError, refetch }] = usePaginatedQuery(
    getPurchase_orders,
    {
      orderBy: { id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    }
  )
  console.log('purchase_orders: ', purchase_orders);

  // const purchase_orders = [
  //   {
  //     po_id: 111,
  //     po_type: "sss",
  //     updated_on: "2022-11-15T11:46:48.081Z",
  //     approved_on: null,
  //     created_at: "2022-11-15T11:46:48.081Z",
  //     from_party: "TIF Labs",
  //     expiry_date: "2022-11-22T18:30:00.000Z",
  //     expected_delivery: "2022-11-24T18:30:00.000Z",
  //     agreement: "Approved",
  //     po_description: "Sensor Bundle",
  //     po_code: "PO#111",
  //     rfq_id: 18,
  //     grn_grn_id: 28,
  //     note: null,
  //     agreement_terms_id: 1,
  //     purchase_order_terms: "Net-45",
  //     purchase_order_status_id: 1,
  //     vendor_vendor_id: 3,
  //     vendor: {
  //       vendor_id: 3,
  //       vendor_code: "TE",
  //       vendor_email: "thomasEdison@gmail.com",
  //       vendor_city: "Miraj",
  //       vendor_contact: "8954236172",
  //       vendor_state: "Maharashtra",
  //       vendor_gstin: "GSTMIL009222222",
  //       vendor: "Thomas Edison",
  //       address: "Milan",
  //       credit_period: "4",
  //       lead_time: "4",
  //       status: false,
  //     },
  //     purchase_order_products: [
  //       {
  //         pop_id: 14,
  //         vendor_products_vp_id: 8,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 7,
  //         quantity: 89,
  //         price_per_unit: 85,
  //         received_quantity: 0,
  //         purchase_order_po_id: 8,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 8,
  //           unit_price: 45,
  //           vendor_vendor_id: 3,
  //           products_product_id: 7,
  //           enabled: 1,
  //           priority: 2,
  //           vendor_sku: "TE107",
  //           products: {
  //             product_id: 7,
  //             name: "Heat Flame Sensor",
  //             description: "description heat",
  //             product_type: "Sensors",
  //             products_sku: "TIF007",
  //             Price: 56,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 155,
  //         vendor_products_vp_id: 20,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 5,
  //         quantity: 7,
  //         price_per_unit: 56,
  //         received_quantity: 0,
  //         purchase_order_po_id: 8,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 20,
  //           unit_price: 120,
  //           vendor_vendor_id: 3,
  //           products_product_id: 5,
  //           enabled: 1,
  //           priority: 1,
  //           vendor_sku: "TE105",
  //           products: {
  //             product_id: 5,
  //             name: "MQ-135 gas sensor Module",
  //             description: "description 135",
  //             product_type: "Sensors",
  //             products_sku: "TIF005",
  //             Price: 56,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 156,
  //         vendor_products_vp_id: 83,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 4,
  //         quantity: 47,
  //         price_per_unit: 42,
  //         received_quantity: 0,
  //         purchase_order_po_id: 8,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 83,
  //           unit_price: 0,
  //           vendor_vendor_id: 3,
  //           products_product_id: 4,
  //           enabled: 1,
  //           priority: 1,
  //           vendor_sku: "TE104",
  //           products: {
  //             product_id: 4,
  //             name: "E18-D80NK Infrared Sensor Module",
  //             description: "description",
  //             product_type: "Sensors",
  //             products_sku: "TIF004",
  //             Price: 42,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 157,
  //         vendor_products_vp_id: 5,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 3,
  //         quantity: 14,
  //         price_per_unit: 24,
  //         received_quantity: 0,
  //         purchase_order_po_id: 8,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 5,
  //           unit_price: 50,
  //           vendor_vendor_id: 3,
  //           products_product_id: 3,
  //           enabled: 1,
  //           priority: 4,
  //           vendor_sku: "TE103",
  //           products: {
  //             product_id: 3,
  //             name: "Waterproof Ultrasonic Sensor",
  //             description: "water-desp",
  //             product_type: "Sensors",
  //             products_sku: "TIF003",
  //             Price: 24,
  //             product_unit: "combo",
  //           },
  //         },
  //       },
  //     ],
  //     purchase_order_status: {
  //       id: 1,
  //       name: "Created ",
  //       description: "The PO has been successfully created.",
  //     },
  //   },
  //   {
  //     po_id: 112,
  //     po_type: "Manual",
  //     updated_on: "2022-12-01T12:28:09.657Z",
  //     approved_on: null,
  //     created_at: "2022-12-01T12:28:09.657Z",
  //     from_party: "po from party",
  //     expiry_date: "2008-11-10T18:30:00.000Z",
  //     expected_delivery: "2008-11-10T18:30:00.000Z",
  //     agreement: "Waiting_For_Approval",
  //     po_description: "po description",
  //     po_code: "PO#112",
  //     rfq_id: 16,
  //     grn_grn_id: 24,
  //     note: null,
  //     agreement_terms_id: 1,
  //     purchase_order_terms: "Net-70",
  //     purchase_order_status_id: 1,
  //     vendor_vendor_id: 1,
  //     vendor: {
  //       vendor_id: 1,
  //       vendor_code: "DA",
  //       vendor_email: "mdatif796@gmail.com",
  //       vendor_city: "Panaji",
  //       vendor_contact: "4562879123",
  //       vendor_state: "Goa",
  //       vendor_gstin: "GSTRIO783211111",
  //       vendor: "Dylan Alisson",
  //       address: "Rio ",
  //       credit_period: "411",
  //       lead_time: "471",
  //       status: false,
  //     },
  //     purchase_order_products: [
  //       {
  //         pop_id: 38,
  //         vendor_products_vp_id: 2,
  //         vendor_products_vendor_vendor_id: 1,
  //         vendor_products_products_product_id: 2,
  //         quantity: 7,
  //         price_per_unit: 142,
  //         received_quantity: 0,
  //         purchase_order_po_id: 223,
  //         purchase_order_vendor_vendor_id: 1,
  //         vendor_products: {
  //           vp_id: 2,
  //           unit_price: 10,
  //           vendor_vendor_id: 1,
  //           products_product_id: 2,
  //           enabled: 1,
  //           priority: 2,
  //           vendor_sku: "DA1001",
  //           products: {
  //             product_id: 2,
  //             name: "ESP",
  //             description: "esp-desc",
  //             product_type: "Electronics",
  //             products_sku: "TIF002",
  //             Price: 142,
  //             product_unit: "2pc set",
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 39,
  //         vendor_products_vp_id: 11,
  //         vendor_products_vendor_vendor_id: 1,
  //         vendor_products_products_product_id: 4,
  //         quantity: 8,
  //         price_per_unit: 42,
  //         received_quantity: 0,
  //         purchase_order_po_id: 223,
  //         purchase_order_vendor_vendor_id: 1,
  //         vendor_products: {
  //           vp_id: 11,
  //           unit_price: 83,
  //           vendor_vendor_id: 1,
  //           products_product_id: 4,
  //           enabled: 1,
  //           priority: 1,
  //           vendor_sku: "DA102",
  //           products: {
  //             product_id: 4,
  //             name: "E18-D80NK Infrared Sensor Module",
  //             description: "description",
  //             product_type: "Sensors",
  //             products_sku: "TIF004",
  //             Price: 42,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 40,
  //         vendor_products_vp_id: 1,
  //         vendor_products_vendor_vendor_id: 1,
  //         vendor_products_products_product_id: 1,
  //         quantity: 9,
  //         price_per_unit: 11,
  //         received_quantity: 0,
  //         purchase_order_po_id: 223,
  //         purchase_order_vendor_vendor_id: 1,
  //         vendor_products: {
  //           vp_id: 1,
  //           unit_price: 424,
  //           vendor_vendor_id: 1,
  //           products_product_id: 1,
  //           enabled: 1,
  //           priority: 1,
  //           vendor_sku: "DA1002",
  //           products: {
  //             product_id: 1,
  //             name: "Pi",
  //             description: "Pi-descasw",
  //             product_type: "Electronics",
  //             products_sku: "TIF001",
  //             Price: 11,
  //             product_unit: "pc",
  //           },
  //         },
  //       },
  //     ],
  //     purchase_order_status: {
  //       id: 2,
  //       name: "Waiting for approval",
  //       description: "The PO is sent for approval and waiting to be",
  //     },
  //   },
  //   {
  //     po_id: 113,
  //     po_type: "Manual",
  //     updated_on: "2022-12-05T11:37:27.942Z",
  //     approved_on: null,
  //     created_at: "2022-12-05T11:37:27.942Z",
  //     from_party: "tif labs",
  //     expiry_date: "2022-11-30T18:30:00.000Z",
  //     expected_delivery: "2022-11-30T18:30:00.000Z",
  //     agreement: "Approved",
  //     po_description: "erf",
  //     po_code: "PO#113",
  //     rfq_id: 17,
  //     grn_grn_id: 1,
  //     note: null,
  //     agreement_terms_id: 1,
  //     purchase_order_terms: "100% - Advance",
  //     purchase_order_status_id: 1,
  //     vendor_vendor_id: 1,
  //     vendor: {
  //       vendor_id: 1,
  //       vendor_code: "DA",
  //       vendor_email: "mdatif796@gmail.com",
  //       vendor_city: "Panaji",
  //       vendor_contact: "4562879123",
  //       vendor_state: "Goa",
  //       vendor_gstin: "GSTRIO783211111",
  //       vendor: "Dylan Alisson",
  //       address: "Rio ",
  //       credit_period: "411",
  //       lead_time: "471",
  //       status: false,
  //     },
  //     purchase_order_products: [],
  //     purchase_order_status: {
  //       id: 3,
  //       name: "Approved",
  //       description: "The PO has been approved to be placed with/em",
  //     },
  //   },
  //   {
  //     po_id: 114,
  //     po_type: "Manual",
  //     updated_on: "2022-12-05T11:37:50.479Z",
  //     approved_on: null,
  //     created_at: "2022-12-05T11:37:50.479Z",
  //     from_party: "tif12345",
  //     expiry_date: "2022-11-30T18:30:00.000Z",
  //     expected_delivery: "2022-11-30T18:30:00.000Z",
  //     agreement: "Created_",
  //     po_description: "q12345",
  //     po_code: "PO#114",
  //     rfq_id: 17,
  //     grn_grn_id: 8,
  //     note: null,
  //     agreement_terms_id: 1,
  //     purchase_order_terms: "50% - Advance",
  //     purchase_order_status_id: 1,
  //     vendor_vendor_id: 1,
  //     vendor_Emails: ["mdatif796@gmail.com", "da@gmail.com", "dylan@gmail.com"],
  //     amendedFrom: "PO#004",
  //     AmendNotes: "Products Qty changed",
  //     vendor: {
  //       vendor_id: 1,
  //       vendor_code: "DA",
  //       vendor_email: "mdatif796@gmail.com",
  //       vendor_city: "Panaji",
  //       vendor_contact: "4562879123",
  //       vendor_state: "Goa",
  //       vendor_gstin: "GSTRIO783211111",
  //       vendor: "Dylan Alisson",
  //       address: "Rio ",
  //       credit_period: "411",
  //       lead_time: "471",
  //       status: false,
  //     },
  //     purchase_order_products: [
  //       {
  //         pop_id: 16,
  //         vendor_products_vp_id: 1,
  //         vendor_products_vendor_vendor_id: 1,
  //         vendor_products_products_product_id: 1,
  //         quantity: 10,
  //         price_per_unit: 500,
  //         received_quantity: 0,
  //         purchase_order_po_id: 186,
  //         purchase_order_vendor_vendor_id: 1,
  //         vendor_products: {
  //           vp_id: 1,
  //           unit_price: 424,
  //           vendor_vendor_id: 1,
  //           products_product_id: 1,
  //           enabled: 1,
  //           priority: 1,
  //           vendor_sku: "DA1002",
  //           products: {
  //             product_id: 1,
  //             name: "Pi",
  //             description: "Pi-descasw",
  //             product_type: "Electronics",
  //             products_sku: "TIF001",
  //             Price: 11,
  //             product_unit: "pc",
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 73,
  //         vendor_products_vp_id: 11,
  //         vendor_products_vendor_vendor_id: 1,
  //         vendor_products_products_product_id: 4,
  //         quantity: 4,
  //         price_per_unit: 42,
  //         received_quantity: 0,
  //         purchase_order_po_id: 186,
  //         purchase_order_vendor_vendor_id: 1,
  //         vendor_products: {
  //           vp_id: 11,
  //           unit_price: 83,
  //           vendor_vendor_id: 1,
  //           products_product_id: 4,
  //           enabled: 1,
  //           priority: 1,
  //           vendor_sku: "DA102",
  //           products: {
  //             product_id: 4,
  //             name: "E18-D80NK Infrared Sensor Module",
  //             description: "description",
  //             product_type: "Sensors",
  //             products_sku: "TIF004",
  //             Price: 42,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 74,
  //         vendor_products_vp_id: 2,
  //         vendor_products_vendor_vendor_id: 1,
  //         vendor_products_products_product_id: 2,
  //         quantity: 47,
  //         price_per_unit: 142,
  //         received_quantity: 0,
  //         purchase_order_po_id: 186,
  //         purchase_order_vendor_vendor_id: 1,
  //         vendor_products: {
  //           vp_id: 2,
  //           unit_price: 10,
  //           vendor_vendor_id: 1,
  //           products_product_id: 2,
  //           enabled: 1,
  //           priority: 2,
  //           vendor_sku: "DA1001",
  //           products: {
  //             product_id: 2,
  //             name: "ESP",
  //             description: "esp-desc",
  //             product_type: "Electronics",
  //             products_sku: "TIF002",
  //             Price: 142,
  //             product_unit: "2pc set",
  //           },
  //         },
  //       },
  //     ],
  //     purchase_order_status: {
  //       id: 4,
  //       name: "Amended",
  //       description: "The PO has been updated/edited after being Approved",
  //     },
  //   },
  //   {
  //     po_id: 115,
  //     po_type: "Manual",
  //     updated_on: "2022-12-08T08:17:09.229Z",
  //     approved_on: null,
  //     created_at: "2022-12-08T08:17:09.229Z",
  //     from_party: "dss",
  //     expiry_date: "2022-12-26T18:30:00.000Z",
  //     expected_delivery: "2022-12-26T18:30:00.000Z",
  //     agreement: "dfsd",
  //     po_description: "scfd",
  //     po_code: "PO#115",
  //     rfq_id: 201,
  //     grn_grn_id: 9,
  //     note: null,
  //     agreement_terms_id: 1,
  //     purchase_order_terms: "Net - 30",
  //     purchase_order_status_id: 1,
  //     vendor_vendor_id: 1,
  //     vendor: {
  //       vendor_id: 1,
  //       vendor_code: "DA",
  //       vendor_email: "mdatif796@gmail.com",
  //       vendor_city: "Panaji",
  //       vendor_contact: "4562879123",
  //       vendor_state: "Goa",
  //       vendor_gstin: "GSTRIO783211111",
  //       vendor: "Dylan Alisson",
  //       address: "Rio ",
  //       credit_period: "411",
  //       lead_time: "471",
  //       status: false,
  //     },
  //     purchase_order_products: [
  //       {
  //         pop_id: 41,
  //         vendor_products_vp_id: 6,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 6,
  //         quantity: 89,
  //         price_per_unit: 67,
  //         received_quantity: 0,
  //         purchase_order_po_id: 224,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 6,
  //           unit_price: 905,
  //           vendor_vendor_id: 3,
  //           products_product_id: 6,
  //           enabled: 1,
  //           priority: 5,
  //           vendor_sku: "TE106",
  //           products: {
  //             product_id: 6,
  //             name: "Turbidity Sensor",
  //             description: "description sensor",
  //             product_type: "Sensors",
  //             products_sku: "TIF006",
  //             Price: 67,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 149,
  //         vendor_products_vp_id: 83,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 4,
  //         quantity: 87,
  //         price_per_unit: 42,
  //         received_quantity: 0,
  //         purchase_order_po_id: 224,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 83,
  //           unit_price: 0,
  //           vendor_vendor_id: 3,
  //           products_product_id: 4,
  //           enabled: 1,
  //           priority: 1,
  //           vendor_sku: "TE104",
  //           products: {
  //             product_id: 4,
  //             name: "E18-D80NK Infrared Sensor Module",
  //             description: "description",
  //             product_type: "Sensors",
  //             products_sku: "TIF004",
  //             Price: 42,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 150,
  //         vendor_products_vp_id: 5,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 3,
  //         quantity: 78,
  //         price_per_unit: 24,
  //         received_quantity: 0,
  //         purchase_order_po_id: 224,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 5,
  //           unit_price: 50,
  //           vendor_vendor_id: 3,
  //           products_product_id: 3,
  //           enabled: 1,
  //           priority: 4,
  //           vendor_sku: "TE103",
  //           products: {
  //             product_id: 3,
  //             name: "Waterproof Ultrasonic Sensor",
  //             description: "water-desp",
  //             product_type: "Sensors",
  //             products_sku: "TIF003",
  //             Price: 24,
  //             product_unit: "combo",
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 151,
  //         vendor_products_vp_id: 8,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 7,
  //         quantity: 67,
  //         price_per_unit: 56,
  //         received_quantity: 0,
  //         purchase_order_po_id: 224,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 8,
  //           unit_price: 45,
  //           vendor_vendor_id: 3,
  //           products_product_id: 7,
  //           enabled: 1,
  //           priority: 2,
  //           vendor_sku: "TE107",
  //           products: {
  //             product_id: 7,
  //             name: "Heat Flame Sensor",
  //             description: "description heat",
  //             product_type: "Sensors",
  //             products_sku: "TIF007",
  //             Price: 56,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 152,
  //         vendor_products_vp_id: 6,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 6,
  //         quantity: 56,
  //         price_per_unit: 67,
  //         received_quantity: 0,
  //         purchase_order_po_id: 224,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 6,
  //           unit_price: 905,
  //           vendor_vendor_id: 3,
  //           products_product_id: 6,
  //           enabled: 1,
  //           priority: 5,
  //           vendor_sku: "TE106",
  //           products: {
  //             product_id: 6,
  //             name: "Turbidity Sensor",
  //             description: "description sensor",
  //             product_type: "Sensors",
  //             products_sku: "TIF006",
  //             Price: 67,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 153,
  //         vendor_products_vp_id: 20,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 5,
  //         quantity: 45,
  //         price_per_unit: 56,
  //         received_quantity: 0,
  //         purchase_order_po_id: 224,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 20,
  //           unit_price: 120,
  //           vendor_vendor_id: 3,
  //           products_product_id: 5,
  //           enabled: 1,
  //           priority: 1,
  //           vendor_sku: "TE105",
  //           products: {
  //             product_id: 5,
  //             name: "MQ-135 gas sensor Module",
  //             description: "description 135",
  //             product_type: "Sensors",
  //             products_sku: "TIF005",
  //             Price: 56,
  //             product_unit: null,
  //           },
  //         },
  //       },
  //       {
  //         pop_id: 154,
  //         vendor_products_vp_id: 5,
  //         vendor_products_vendor_vendor_id: 3,
  //         vendor_products_products_product_id: 3,
  //         quantity: 23,
  //         price_per_unit: 24,
  //         received_quantity: 0,
  //         purchase_order_po_id: 224,
  //         purchase_order_vendor_vendor_id: 3,
  //         vendor_products: {
  //           vp_id: 5,
  //           unit_price: 50,
  //           vendor_vendor_id: 3,
  //           products_product_id: 3,
  //           enabled: 1,
  //           priority: 4,
  //           vendor_sku: "TE103",
  //           products: {
  //             product_id: 3,
  //             name: "Waterproof Ultrasonic Sensor",
  //             description: "water-desp",
  //             product_type: "Sensors",
  //             products_sku: "TIF003",
  //             Price: 24,
  //             product_unit: "combo",
  //           },
  //         },
  //       },
  //     ],
  //   },
  // ]

  // const [{ purchase_order_products }, { error: getPoProductsError, refetch: refetchPoProducts }] =
  //   usePaginatedQuery(getPurchase_order_products, {
  //     orderBy: { pop_id: "asc" },
  //     skip: ITEMS_PER_PAGE * page,
  //     take: ITEMS_PER_PAGE,
  //   })

  const [{ vendors }, { error: getVenorsError }] = useQuery(getVendors, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  console.log('vendors: ', vendors);

  // const vendorsOld = [
  //   {
  //     vendor_id: 1,
  //     vendor_code: "DA",
  //     vendor_email: ["mdatif796@gmail.com", "da@gmail.com", "dylan@gmail.com"],
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
  //     vendor_email: ["udederson@gmail.com", "UE@gmail.com", "test@gmail.com"],
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
  //     vendor_email: ["thomasEdison@gmail.com", "TE@gmail.com", "tho@gmail.com"],
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
  // ]
  const [{ vendor_products }, { error: getVendorProductsError }] = useQuery(
    getVendor_products,
    {
      orderBy: { id: "asc" },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    }
  )

  // const vendor_productsOld = [
  //   {
  //     vp_id: 1,
  //     unit_price: 424,
  //     products: {
  //       product_id: 1,
  //       name: "Pi",
  //       description: "Pi-descasw",
  //       product_type: "Electronics",
  //       products_sku: "TIF001",
  //       Price: 11,
  //       product_unit: "pc",
  //     },
  //     vendor: {
  //       vendor_id: 1,
  //       vendor_code: "DA",
  //       vendor_email: "mdatif796@gmail.com",
  //       vendor_city: "Panaji",
  //       vendor_contact: "4562879123",
  //       vendor_state: "Goa",
  //       vendor_gstin: "GSTRIO783211111",
  //       vendor: "Dylan Alisson",
  //       address: "Rio ",
  //       credit_period: "411",
  //       lead_time: "471",
  //       status: false,
  //     },
  //     vendor_vendor_id: 1,
  //     products_product_id: 1,
  //     vendor_sku: "DA1002",
  //   },
  //   {
  //     vp_id: 2,
  //     unit_price: 10,
  //     products: {
  //       product_id: 2,
  //       name: "ESP",
  //       description: "esp-desc",
  //       product_type: "Electronics",
  //       products_sku: "TIF002",
  //       Price: 142,
  //       product_unit: "2pc set",
  //     },
  //     vendor: {
  //       vendor_id: 1,
  //       vendor_code: "DA",
  //       vendor_email: "mdatif796@gmail.com",
  //       vendor_city: "Panaji",
  //       vendor_contact: "4562879123",
  //       vendor_state: "Goa",
  //       vendor_gstin: "GSTRIO783211111",
  //       vendor: "Dylan Alisson",
  //       address: "Rio ",
  //       credit_period: "411",
  //       lead_time: "471",
  //       status: false,
  //     },
  //     vendor_vendor_id: 1,
  //     products_product_id: 2,
  //     vendor_sku: "DA1001",
  //   },
  //   {
  //     vp_id: 5,
  //     unit_price: 50,
  //     products: {
  //       product_id: 3,
  //       name: "Waterproof Ultrasonic Sensor",
  //       description: "water-desp",
  //       product_type: "Sensors",
  //       products_sku: "TIF003",
  //       Price: 24,
  //       product_unit: "combo",
  //     },
  //     vendor: {
  //       vendor_id: 3,
  //       vendor_code: "TE",
  //       vendor_email: "thomasEdison@gmail.com",
  //       vendor_city: "Miraj",
  //       vendor_contact: "8954236172",
  //       vendor_state: "Maharashtra",
  //       vendor_gstin: "GSTMIL009222222",
  //       vendor: "Thomas Edison",
  //       address: "Milan",
  //       credit_period: "4",
  //       lead_time: "4",
  //       status: false,
  //     },
  //     vendor_vendor_id: 3,
  //     products_product_id: 3,
  //     vendor_sku: "TE103",
  //   }
  // ]

  // const [{ rfqs }, { error: getRfqError }] = usePaginatedQuery(getRfqs, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })
  // const [{ rfq_products }, { error: getRfqProductsError }] = usePaginatedQuery(getRfq_products, {
  //   orderBy: { rfq_products_id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })
  const [{ products }, { error: getProductsError }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });

  // const productsOld = [
  //   {
  //     product_id: 1,
  //     name: "Pi",
  //     description: "Pi-descasw",
  //     product_type: "Electronics",
  //     products_sku: "TIF001",
  //     Price: 11,
  //     product_unit: "pc",
  //     vendor_products: [
  //       {
  //         vp_id: 1,
  //         unit_price: 424,
  //         vendor_vendor_id: 1,
  //         products_product_id: 1,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "DA1002",
  //       },
  //       {
  //         vp_id: 36,
  //         unit_price: 756,
  //         vendor_vendor_id: 4,
  //         products_product_id: 1,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TE417",
  //       },
  //       {
  //         vp_id: 37,
  //         unit_price: 454,
  //         vendor_vendor_id: 5,
  //         products_product_id: 1,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TE420",
  //       },
  //       {
  //         vp_id: 116,
  //         unit_price: 85,
  //         vendor_vendor_id: 3,
  //         products_product_id: 1,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TH4568",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 2,
  //     name: "ESP",
  //     description: "esp-desc",
  //     product_type: "Electronics",
  //     products_sku: "TIF002",
  //     Price: 142,
  //     product_unit: "2pc set",
  //     vendor_products: [
  //       {
  //         vp_id: 2,
  //         unit_price: 10,
  //         vendor_vendor_id: 1,
  //         products_product_id: 2,
  //         enabled: 1,
  //         priority: 2,
  //         vendor_sku: "DA1001",
  //       },
  //       {
  //         vp_id: 33,
  //         unit_price: 25,
  //         vendor_vendor_id: 123,
  //         products_product_id: 2,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "VJ338",
  //       },
  //       {
  //         vp_id: 114,
  //         unit_price: 41,
  //         vendor_vendor_id: 147,
  //         products_product_id: 2,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "FK490",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 3,
  //     name: "Waterproof Ultrasonic Sensor",
  //     description: "water-desp",
  //     product_type: "Sensors",
  //     products_sku: "TIF003",
  //     Price: 24,
  //     product_unit: "combo",
  //     vendor_products: [
  //       {
  //         vp_id: 5,
  //         unit_price: 50,
  //         vendor_vendor_id: 3,
  //         products_product_id: 3,
  //         enabled: 1,
  //         priority: 4,
  //         vendor_sku: "TE103",
  //       },
  //       {
  //         vp_id: 79,
  //         unit_price: 142,
  //         vendor_vendor_id: 4,
  //         products_product_id: 3,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "KA146",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 4,
  //     name: "E18-D80NK Infrared Sensor Module",
  //     description: "description",
  //     product_type: "Sensors",
  //     products_sku: "TIF004",
  //     Price: 42,
  //     product_unit: null,
  //     vendor_products: [
  //       {
  //         vp_id: 11,
  //         unit_price: 83,
  //         vendor_vendor_id: 1,
  //         products_product_id: 4,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "DA102",
  //       },
  //       {
  //         vp_id: 83,
  //         unit_price: 0,
  //         vendor_vendor_id: 3,
  //         products_product_id: 4,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TE104",
  //       },
  //       {
  //         vp_id: 108,
  //         unit_price: 45,
  //         vendor_vendor_id: 123,
  //         products_product_id: 4,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "VJ12345",
  //       },
  //       {
  //         vp_id: 113,
  //         unit_price: 40,
  //         vendor_vendor_id: 147,
  //         products_product_id: 4,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "FK491",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 5,
  //     name: "MQ-135 gas sensor Module",
  //     description: "description 135",
  //     product_type: "Sensors",
  //     products_sku: "TIF005",
  //     Price: 56,
  //     product_unit: null,
  //     vendor_products: [
  //       {
  //         vp_id: 20,
  //         unit_price: 120,
  //         vendor_vendor_id: 3,
  //         products_product_id: 5,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TE105",
  //       },
  //       {
  //         vp_id: 105,
  //         unit_price: 123,
  //         vendor_vendor_id: 2,
  //         products_product_id: 5,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "ssWW",
  //       },
  //       {
  //         vp_id: 106,
  //         unit_price: 111,
  //         vendor_vendor_id: 170,
  //         products_product_id: 5,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "qqq",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 6,
  //     name: "Turbidity Sensor",
  //     description: "description sensor",
  //     product_type: "Sensors",
  //     products_sku: "TIF006",
  //     Price: 67,
  //     product_unit: null,
  //     vendor_products: [
  //       {
  //         vp_id: 6,
  //         unit_price: 905,
  //         vendor_vendor_id: 3,
  //         products_product_id: 6,
  //         enabled: 1,
  //         priority: 5,
  //         vendor_sku: "TE106",
  //       },
  //       {
  //         vp_id: 9,
  //         unit_price: 88,
  //         vendor_vendor_id: 4,
  //         products_product_id: 6,
  //         enabled: 1,
  //         priority: 3,
  //         vendor_sku: "KM106",
  //       },
  //       {
  //         vp_id: 34,
  //         unit_price: 120,
  //         vendor_vendor_id: 5,
  //         products_product_id: 6,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TE1564",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 7,
  //     name: "Heat Flame Sensor",
  //     description: "description heat",
  //     product_type: "Sensors",
  //     products_sku: "TIF007",
  //     Price: 56,
  //     product_unit: null,
  //     vendor_products: [
  //       {
  //         vp_id: 8,
  //         unit_price: 45,
  //         vendor_vendor_id: 3,
  //         products_product_id: 7,
  //         enabled: 1,
  //         priority: 2,
  //         vendor_sku: "TE107",
  //       },
  //       {
  //         vp_id: 10,
  //         unit_price: 47,
  //         vendor_vendor_id: 4,
  //         products_product_id: 7,
  //         enabled: 1,
  //         priority: 2,
  //         vendor_sku: "KM107",
  //       },
  //       {
  //         vp_id: 35,
  //         unit_price: 11,
  //         vendor_vendor_id: 5,
  //         products_product_id: 7,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "TE571",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 8,
  //     name: "Eye Blink Sensor",
  //     description: "eye description",
  //     product_type: "Sensors",
  //     products_sku: "TIF008",
  //     Price: 53,
  //     product_unit: null,
  //     vendor_products: [
  //       {
  //         vp_id: 29,
  //         unit_price: 11,
  //         vendor_vendor_id: 1,
  //         products_product_id: 8,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "qws",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 9,
  //     name: "Laser Module",
  //     description: "description laser",
  //     product_type: "Sensors",
  //     products_sku: "TIF009",
  //     Price: 856,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 10,
  //     name: "Sound Sensor Module",
  //     description: "sound description",
  //     product_type: "Sensors",
  //     products_sku: "TIF010",
  //     Price: 56,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 11,
  //     name: "Servo Motor Pan-Tilt Setup",
  //     description: "servo description",
  //     product_type: "Motors and mechanical devices",
  //     products_sku: "TIF011",
  //     Price: 5657,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 12,
  //     name: "Micro Vibration Motor",
  //     description: "micro  ",
  //     product_type: "Motors and mechanical devices",
  //     products_sku: "TIF012",
  //     Price: 65,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 13,
  //     name: "A4988 Stepper Motor Driver",
  //     description: "description pump",
  //     product_type: "Motors and mechanical devices",
  //     products_sku: "TIF013",
  //     Price: 346,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 14,
  //     name: "R385 DC PUMP",
  //     description: "R385 ",
  //     product_type: "Motors and mechanical devices",
  //     products_sku: "TIF014",
  //     Price: 787,
  //     product_unit: null,
  //     vendor_products: [
  //       {
  //         vp_id: 104,
  //         unit_price: 12,
  //         vendor_vendor_id: 4,
  //         products_product_id: 14,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "dewa",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 15,
  //     name: "Solenoid valve 12V",
  //     description: "valve 12V",
  //     product_type: "Motors and mechanical devices",
  //     products_sku: "TIF015",
  //     Price: 343,
  //     product_unit: null,
  //     vendor_products: [
  //       {
  //         vp_id: 81,
  //         unit_price: 85,
  //         vendor_vendor_id: 1,
  //         products_product_id: 15,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "DA10456",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 16,
  //     name: "Neo 6M GPS Module",
  //     description: "Neo 6M GPS",
  //     product_type: "IOT & wireless devices",
  //     products_sku: "TIF016",
  //     Price: 657,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 17,
  //     name: "NRF24L01+PA+LNA",
  //     description: "NRF24L01+PA+LNA",
  //     product_type: "IOT & wireless devices",
  //     products_sku: "TIF017",
  //     Price: 786,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 18,
  //     name: "test",
  //     description: "tes0123",
  //     product_type: "IOT & wireless devices",
  //     products_sku: "TIF018",
  //     Price: 657,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 19,
  //     name: "ESP12E ESP8266 Wireless Transceiver Module",
  //     description: "ESP12E ",
  //     product_type: "IOT & wireless devices",
  //     products_sku: "TIF019",
  //     Price: 53,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 20,
  //     name: "dummy name",
  //     description: "dummy name",
  //     product_type: "dummy product type",
  //     products_sku: "TIF000",
  //     Price: 4,
  //     product_unit: null,
  //     vendor_products: [],
  //   },
  //   {
  //     product_id: 21,
  //     name: "Watermelon",
  //     description:
  //       "Water-melon is a flowering plant species of the Cucurbitaceae family orem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,\nmolestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum",
  //     product_type: "Fruit",
  //     products_sku: "Test",
  //     Price: 7,
  //     product_unit: "kg",
  //     vendor_products: [
  //       {
  //         vp_id: 102,
  //         unit_price: 15,
  //         vendor_vendor_id: 123,
  //         products_product_id: 21,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "VJW1001",
  //       },
  //       {
  //         vp_id: 112,
  //         unit_price: 45,
  //         vendor_vendor_id: 147,
  //         products_product_id: 21,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "FK489",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 23,
  //     name: "Test CSV",
  //     description: "Test CSV",
  //     product_type: "CSV",
  //     products_sku: "TestSKU",
  //     Price: 67,
  //     product_unit: null,
  //     vendor_products: [
  //       {
  //         vp_id: 86,
  //         unit_price: 12,
  //         vendor_vendor_id: 1,
  //         products_product_id: 23,
  //         enabled: 1,
  //         priority: 1,
  //         vendor_sku: "aws",
  //       },
  //     ],
  //   },
  //   {
  //     product_id: 64,
  //     name: "boat",
  //     description: "asdddasd",
  //     product_type: "eleectric",
  //     products_sku: "TI-100",
  //     Price: 0,
  //     product_unit: "Pc",
  //     vendor_products: [],
  //   },
  // ]
  // const [{ grns }, { error: getGrnsError, refetch: refetchGrn }] = useQuery(getGrns, {
  //   orderBy: { grn_id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })

  // const [{ prefixes }, { error: getPrefixesError }] = useQuery(getPrefixes, {
  //   orderBy: { id: "asc" },
  // })

  const [createPurchaseOrderMutation, { isLoading: creatingPO, error: creatingMutationError }] =
    useMutation(createPurchase_order)
  const [updatePurchaseOrderMutation, { isLoading: UpdatingPO, error: updatingMutationError }] =
    useMutation(updatePurchase_order)
  const [createGrnMutation, { error: grnCreationError }] = useMutation(createGrn)
  const [createNotificationsMutations, { error: notificationCreationError }] =
    useMutation(createNotifications)

  const [createManyPurchaseOrderProductsMutation] = useMutation(createManyPurchase_order_product)
  const [deletePurchase_orderMutation] = useMutation(deletePurchase_order)
  const [deletePurchase_orderParoductMutation] = useMutation(deletePurchase_order_product)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [activeProducts, setActiveProducts] = useState([])
  const [filterProductOptions, setFilterProductOptions] = useState([])
  const initialItemState = {
    purchase_order_po_id: "",
    purchase_order_purchase_order_status_pos_id: 1,
    purchase_order_vendor_vendor_id: "",
    vendor_products_vp_id: "",
    vendor_products_vendor_vendor_id: "",
    vendor_products_products_product_id: "",
    quantity: "-",
    price_per_unit: "-",
    received_quantity: 0,
    products_product_id: "",
    product_name: "",
  }

  const [itemList, setItemList] = useState([initialItemState])
  const initialPurchaseState = {
    vendor_vendor_id: "",
    po_code: "",
    po_description: "",
    expiry_date: "",
    expected_delivery: "",
    from_party: "",
    terms: "",
    rfq_id: "",
    itemsLength: false,
    purchase_order_status: "",
    vendor_Emails: [],
    agreement: "",
    piNumber: "",
    piDate: ""
  }




  const [purchaseDetails, setPurchaseDetails] = useState(initialPurchaseState)
  const [sendPoDialog, setSendPoDialog] = useState(false)
  const [activeRow, setActiveRow] = useState({})
  const [poEditState, setPoEditState] = useState(false)
  const scrollToPo = useRef<HTMLHeadingElement>(null)
  const poError = [updatingMutationError, creatingMutationError]
  const [rfq, setRfq] = useState({ rfqNumber: "", rfqId: "" })

  // const [isLoading, setIsLoading] = useState(false)

  const menu = useRef<Menu>(null)
  const toast = useRef(null)
  const Po = useRef<CreateNewPo>(null)

  // const rfqOptions = rfqs.map(({ id, rfq_description, rfq_code }) => {
  //   return { name: `${rfq_code}:${rfq_description}`, value: id }
  // })

  // console.log("filterProductOptions", filterProductOptions)
  // console.log("products", products)
  const [ProductsSuggestions, setProductsSuggestions] = useState<any>(null)


  const [fetchGrn, setFetchGrn] = useState(false)

  useEffect(() => {
    if (fetchGrn) {
      triggerRefetch(refetchGrn).catch((error) => setPoErrorMsgs([...poErrorMsgs, ...[error]]))
      setFetchGrn(false)
    }
  }, [fetchGrn])

  useEffect(() => {
    if (router.query.hasOwnProperty("rfqdata")) {
      const { rfqdata } = router.query;
      const parsedRfqdata = JSON.parse(rfqdata)


      const { rfq_products, rfqNumber, rfqId } = parsedRfqdata

      setRfq({ rfqNumber, rfqId })

      console.log('rfqdata: ', parsedRfqdata);
      Po?.current?.setReadOnlyForm(false)
      Po?.current?.formik.resetForm()
      const twoFields = arrayFillCopy(2, initialItemState)
      setPoEditState(false)
      setPurchaseDialog(true)
      setPurchaseDetails(initialPurchaseState)
      Po?.current?.formik.setValues({ itemsLength: true })

      //   [
      //     {
      //         "id": 1,
      //         "quantity": 32,
      //         "price": 20,
      //         "rfq": 3,
      //         "product": 5,
      //         "products": {
      //             "id": 5,
      //             "name": "Controllers.",
      //             "sku": "TIFCO28",
      //             "description": "Controllers, update test2",
      //             "length": null,
      //             "width": null,
      //             "height": null,
      //             "weight": null,
      //             "color": null,
      //             "hsnCode": null,
      //             "imageUrl": "https://loremflickr.com/320/240/device?random=2",
      //             "createdAT": null,
      //             "updatedAT": null,
      //             "customDuty": null,
      //             "gstTaxTypeCode": null,
      //             "taxCalcType": null,
      //             "status": "Active",
      //             "category": null,
      //             "brand": null,
      //             "costPrice": 20
      //         }
      //     }
      // ]

      const poProducts = rfq_products.map((rfqProduct) => {
        const { quantity, price, products: { sku, name, id }, } = rfqProduct
        return {
          product_name: `${sku} - ${name}`,
          products_product_id: id,
          price_per_unit: price,
          quantity
        }
      })

      setItemList([...poProducts, ...twoFields])

      router.replace({
        pathname: '/purchase_orders',
        query: {},
      }).catch(console.log("Awesome"))
    }

  }, [router.query.rfqdata])


  const triggerRefetch = async (refetchGrn) => {
    return await refetchGrn()
  }

  const tablePurchaseOrders = purchase_orders.map((ele) => {
    return {
      ...ele,
      approved_on: moment(ele.approved_on).format("DD-MM-YYYY, HH:MM"),
      created_at: moment(ele.created_at).format("DD-MM-YYYY, HH:MM"),
      // expected_delivery: moment(new Date(ele.expected_delivery)).format("DD-MM-YYYY"),
      // expiry_date: moment(new Date(ele.expiry_date)).format("DD-MM-YYYY"),
      // updated_on: moment(ele.updated_on).format("DD-MM-YYYY, HH:MM"),
      // po_status: ele.purchase_order_status.pos_name,
      vendor: ele.vendor.vendor,
    }
  })
  // const tableProducts = purchase_order_products.map((ele) => {
  //   return {
  //     ...ele,
  //     product_name: ele?.vendor_products?.products.name,
  //     product_sku: ele?.vendor_products?.products.products_sku,
  //     products_product_id: ele?.vendor_products.products?.product_id,
  //   }
  // })
  // console.log("tableProducts", tableProducts)

  // const addFields = () => {
  //   let newfield = {
  //     purchase_order_po_id: "",
  //     purchase_order_purchase_order_status_pos_id: 1,
  //     purchase_order_vendor_vendor_id: "",
  //     vendor_products_vp_id: "",
  //     vendor_products_vendor_vendor_id: "",
  //     vendor_products_products_product_id: "",
  //     quantity: "",
  //     price_per_unit: "",
  //     received_quantity: 0,
  //   }

  //   setItemList([...itemList, newfield])
  // }
  // const removeFields = (index) => {
  //   setItemList(itemList.filter((data, i) => index !== i))
  // }

  // const handleFormChange = (e: any, i: number) => {
  //   // console.log("many", e)
  //   let data = [...itemList]
  //   // e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)

  //   if (e.target) {
  //     data[i][e.target.name] = e.value
  //     // data[i].vendor_products_vp_id = findProductVpID(i)
  //   } else {
  //     data[i][e.originalEvent.target.name] = e.value
  //   }

  //   // console.log("many ", data)
  //   setItemList(data)
  // }
  const items = [
    {
      label: "Options",
      items: [
        // {
        //   label: "Delete",
        //   icon: "pi pi-trash",
        //   command: async () => {
        //     await deletePurchase_orderParoductMutation({
        //       purchase_order_po_id: activeRow.po_id,
        //     })
        //     await deletePurchase_orderMutation({ po_id: activeRow.po_id })
        //     await refetch()
        //   },
        // },
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: async () => {
            scrollToPo?.current?.scrollIntoView()

            setPoEditState(true)
            console.log(activeRow)

            const {
              vendor,
              vendor_vendor_id,
              po_code,
              po_description,
              expiry_date,
              expected_delivery,
              from_party,
              agreement,
              rfq_id,
              po_status,
            } = activeRow

            const expiry = moment(expiry_date, "DD-MM-YYYY").toDate()
            const expected = moment(expected_delivery, "DD-MM-YYYY").toDate()
            await formik.setValues({
              vendor,
              vendor_vendor_id,
              po_code,
              po_description,
              expiry_date: expiry,
              expected_delivery: expected,
              from_party,
              agreement: po_status?.replaceAll("_", " "),
              rfq_id,
              itemsLength: true,
            })

            const active = tableProducts
              .filter((ele) => activeRow.po_id === ele.purchase_order_po_id)
              .map((ele) => ({ ...ele, product_name: `${ele.product_sku} - ${ele.product_name}` }))

            console.log("active", active)

            setItemList(active)
            setActivePO()
            setPurchaseDialog(true)
          },
        },
        {
          label: "Send mail",
          icon: "pi pi-send",
          command: () => {
            setSendPoDialog(true)
            setActivePO()
          },
        },
        {
          label: "More info",
          icon: "pi pi-info-circle",
          command: () => (window.location.href = `/purchase_orders/${activeRow.po_id}`),
        },
        // {
        //   label: "View Products",
        //   icon: "pi pi-external-link",
        //   command: () => {
        //     const active = tableProducts.filter(({ purchase_order_po_id }) => {
        //       return purchase_order_po_id === activeRow.po_id
        //     })
        //     console.log("active: ", active)
        //     setActiveProducts(active)
        //     setProductDialog(true)
        //   },
        // },
        // {
        //   label: "Update Status",
        //   icon: "pi pi-chevron-circle-up",
        //   command: () => {},
        // },
        // {
        //   label: "Generate Gatepass",
        //   icon: "pi pi-file",
        //   command: () => {},
        // },
        // {
        //   label: "Generate GRN",
        //   icon: "pi pi-file",
        //   command: () => {},
        // },
        // {
        //   label: "Set as Recurrent",
        //   icon: "pi pi-replay",
        //   command: () => {},
        // },
        // {
        //   label: "Approve",
        //   icon: "pi pi-check-circle",
        //   command: () => {},
        // },
      ],
    },
  ]


  const [expandedRows, setExpandedRows] = useState()

  // const findProductVpID = (i, list) => {
  //   const currentVendor = Number(formik.values.vendor_vendor_id)
  //   const vendorProducts = vendor_products.filter((item) => item.vendor_vendor_id === currentVendor)
  //   const vpId = vendorProducts.filter(
  //     (ele) => ele.products_product_id === Number(list[i]?.products_product_id)
  //   )[0]?.vp_id

  //   return vpId
  // }

  const rowExpansionTemplate = (data) => {
    return (
      <div className="w-full">
        <TabView>
          <TabPanel header="Products Lists ">
            <div className="expandTables">
              <DataTable
                value={data.po_products}
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
                  header="Sl.No"
                  body={(rowData, { rowIndex }) => rowIndex + 1}
                  style={{ width: "3em" }}
                />

                <Column
                  field="vendor_products.products.sku"
                  header="Product SKU"
                // className="text-center"
                />
                <Column
                  field="vendor_products.sku"
                  header="Vendor SKU"
                // className="text-center"
                />

                <Column
                  field="vendor_products.products.name"
                  header="Name"
                // className="text-center"
                />
                <Column
                  field="price"
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
          </TabPanel>
          {/* <TabPanel header="  Invoice">
            <Invoice
              currentGrn={currentGrn}
              prefixes={prefixes}
              poDetails={data}
              refetch={refetchGrn}
              setFetchGrn={setFetchGrn}
            />
          </TabPanel>
          <TabPanel header="GRN">
            {!currentGrn && (
              <div className="flex justify-content-center pt-3 flex-column">
                <p className="m-auto mb-3 text-xl">
                  GRN not yet created for this PO yet, you can create it using below button.
                </p>
                <Button
                  className="m-auto mb-3"
                  icon="pi pi-plus"
                  label="Create GRN"
                  onClick={async () => {
                    try {
                      const newgrn = await createGrnMutation({
                        grn_batch_code: `GRN-4-${data.po_code}`,
                        purchase_order: {
                          connect: {
                            po_id: data.po_id,
                          },
                        },
                      })
                    } catch (error) {
                      console.log("createGrnMutation", error)
                    }
                    await refetch()
                    await refetchGrn()
                    console.log("refeatched")
                  }}
                ></Button>
              </div>
            )}
            {currentGrn && (
              <Grn
                currentGrn={currentGrn}
                prefixes={prefixes}
                poDetails={data}
                refetch={refetchGrn}
              />
            )}
          </TabPanel> */}
        </TabView>
      </div>
    )
  }

  const updateItemList = (po) => {
    const { po_products } = po
    console.log('po_products: ', po_products);
    // console.log("activeRow: ", activeRow)
    const poProducts = po_products.map((pop) => {

      const { vendor_products: { products: { sku, name, id }, }, price } = pop
      return {
        ...pop,
        product_name: `${sku} - ${name}`,
        products_product_id: id,
        price_per_unit: price
      }
    })

    setItemList(poProducts)
  }

  const [poErrorMsgs, setPoErrorMsgs] = useState([])

  useEffect(() => {
    const ErrorArray = [
      updatingMutationError,
      creatingMutationError,

      // getPoError,
      // getPoProductsError,
      // getVenorsError,
      // getVendorProductsError,

      // getProductsError,

      grnCreationError,
    ]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setPoErrorMsgs(msg)
  }, [
    updatingMutationError,
    creatingMutationError,

    // getPoError,
    // getPoProductsError,
    // getVenorsError,
    // getVendorProductsError,

    // getProductsError,

    grnCreationError,
  ])

  console.log('itemList:1456 ', itemList);

  const removeErrorBox = (i) => {
    const msgArray = [...poErrorMsgs]
    msgArray.splice(i, 1)
    setPoErrorMsgs(msgArray)
  }
  console.log('activeRow: ', activeRow);

  const [filters, setFilters] = useState(null)
  const [globalFilterValue, setGlobalFilterValue] = useState("")

  const clearFilter = () => {
    initFilters()
  }
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters1 = { ...filters }
    _filters1["global"].value = value

    setFilters(_filters1)
    setGlobalFilterValue(value)
  }
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },

      po_code: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      description: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      po_status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      from_party: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      agreement_status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      expected_delivery: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      updatedAt: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
    })
    setGlobalFilterValue("")
  }

  const dateFilterTemplate = (options) => {
    console.log('optionsPO: ', options);
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat={calenderDateFormat()}
        placeholder={calenderDateFormat()}
        mask="99/99/9999"
      />
    )
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          className="p-button-outlined"
          onClick={clearFilter}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
      </div>
    )
  }
  const header1 = renderHeader()

  const refetchFuns = [refetch,]

  useEffect(() => {
    initFilters()
  }, [])

  return (
    <div className="grid w-full mr-0">
      <Toast ref={toast} />
      {creatingPO && <LoaderFullScreen />}
      {UpdatingPO && <LoaderFullScreen />}
      <Dialog
        header="Send PO"
        visible={sendPoDialog}
        style={{ width: "50vw" }}
        onHide={() => setSendPoDialog(false)}
      >
        <p>{`You are about to send ${activeRow?.poNumber} to ${activeRow?.vendor} `}</p>
        <div className="w-full flex justify-content-end mt-2 pl-2">
          <Button
            icon="pi pi-send"
            label="Confirm"
            onClick={async () => {
              console.log("sendmailData: ", activeRow)
              const formatedData = {
                ...activeRow,
                expected_delivery: toDateObj(activeRow?.expected_delivery),
                expiry_date: toDateObj(activeRow?.expiry_date),
              }

              const bigIntToString = (key, value) => typeof value === 'bigint' ? value.toString() : value;


              const requestData = JSON.stringify(
                {
                  data: {
                    vendor_vendor_id: activeRow?.vendors?.id,
                    // csrf: antiCSRFToken,
                  },
                  po: formatedData,
                  // po: activeRow,
                }, bigIntToString)

              var config = {
                method: "post",
                url: "http://localhost:3000/api/po",
                headers: {
                  "Content-Type": "application/json",
                  ["anti-csrf"]: antiCSRFToken,
                },
                data: requestData,
              }

              await axios(config)
                .then((e) => setSendPoDialog(false))
                .catch((error) => {
                  tError(null, `Failed to send Mail - ${error}`)
                  console.log("error: ", error)
                })
            }}
          />
        </div>
      </Dialog>

      <div className="col-12">
        <div className="card flex justify-content-between align-items-center">
          <h4 ref={scrollToPo} className="mb-0">
            Purchase Orders
          </h4>
          <Button
            icon="pi pi-plus"
            label="Create PO"
            onClick={() => {
              Po?.current?.setReadOnlyForm(false)
              const fiveFields = arrayFillCopy(5, initialItemState)
              setPoEditState(false)
              setPurchaseDialog(true)
              setPurchaseDetails({
                vendor_vendor_id: "",
                po_code: "",
                po_description: "",
                expiry_date: "",
                expected_delivery: "",
                from_party: "",
                agreement: "",
                rfq_id: "",
              })
              setItemList(fiveFields)
              setFilterProductOptions([])
              Po?.current?.formik.resetForm()
            }}
          ></Button>
        </div>
        {poErrorMsgs.map((ele, i) => (
          <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
        ))}
      </div>

      <CreateNewPo
        products={products}
        purchase_orders={purchase_orders}
        purchaseDetails={purchaseDetails}
        itemList={itemList}
        setItemList={setItemList}
        // purchase_order_products={purchase_order_products}
        activeRow={activeRow}
        setActiveRow={setActiveRow}
        poEditState={poEditState}
        toast={toast}
        purchaseDialog={purchaseDialog}
        setPurchaseDialog={setPurchaseDialog}
        vendor_products={vendor_products}
        vendors={vendors}
        initialItemState={initialItemState}
        setErrorMsgs={setPoErrorMsgs}
        refetchFuns={refetchFuns}
        scrollToPo={scrollToPo}
        setPoEditState={setPoEditState}
        ref={Po}
        setSendPoDialog={setSendPoDialog}
        rfq={rfq}
        initialPurchaseState={initialPurchaseState}
        setPurchaseDetails={setPurchaseDetails}

      />

      <div className="col-12">
        <div className="card">
          <DataTable
            value={purchase_orders}
            showGridlines
            scrollable
            // header={renderHeader}
            stripedRows
            className="text-s datatable-responsive"
            // paginator
            // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
            // rows={PAGINATION_VARIABLES.rows}
            // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
            // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            filters={filters}
            header={header1}
            filterDisplay="menu"
            // globalFilterFields={["products_sku"]}
            emptyMessage="No Results found."
            onRowClick={async (e) => {
              scrollToPo?.current?.scrollIntoView()
              setPoEditState(true)
              setActiveRow(e.data)
              updateItemList(e.data)
              setPurchaseDialog(true)
              Po.current?.setReadOnlyForm(true)
            }}
          >
            <Column
              header="Details"
              expander={true}
              // className="overflow-hidden"
              style={{ width: "10px" }}
            />
            {/* <Column field="po_id" header="ID" body={({ po_id }) => `${prefixes[2].prefix}-${po_id}`} /> */}
            <Column
              field="poNumber"
              header="Po Number"
              filter
              filterPlaceholder="Search by Code"
            // className="text-center"
            />

            <Column
              field="description"
              header="Description"
              className="overflow-hidden"
              filter
              filterPlaceholder="Search by Description"
            // className="text-center"
            />


            <Column
              field="vendors.name"
              filterField="vendor"
              header="Vendor"
              className="overflow-hidden"
              filter
              filterPlaceholder="Search by Vendor"
            // className="text-center"
            />

            <Column
              field="updatedAt"
              filterField="updatedAt"
              header="Updated on"
              dataType="date"
              body={(rowData) => dateFormat(rowData.updatedAT)}
              filter
              filterElement={dateFilterTemplate}
            // className="text-center"
            />

            <Column
              field="expectedDod"
              header="Expected Delivery"
              filterField="expected_delivery"
              dataType="date"
              body={(rowData) =>
                dateFormat(rowData.updatedAT)
              }
              filter
              filterElement={dateFilterTemplate}
            // className="text-center"
            />
            {/* <Column
              field="from_party"
              header="From Party"
              className="overflow-hidden"
              filter
              filterPlaceholder="Search by Party"
            // className="text-center"
            /> */}
            <Column
              field="po_status"
              header="Status"
              className="overflow-hidden"
              body={(rowdata) => rowdata.po_status?.name}
              filter
              filterPlaceholder="Search by Agreement"
            // style={{ width: "10px" }}
            // className="text-center"
            />
            <Column
              // field="vendor_gstin"
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Menu model={items} popup ref={menu} id="popup_menu" />
                    <Button
                      // label="Show"
                      icon="pi pi-ellipsis-v"
                      onClick={(event) => {
                        console.log("awesomeEvent", event)
                        setActiveRow(rowData)
                        menu.current.toggle(event)
                      }}
                      aria-controls="popup_menu"
                      aria-haspopup
                    />
                  </div>
                )
              }}
            // className="text-center"
            />
          </DataTable>
        </div>
      </div>
    </div>
  )
}

const Purchase_ordersPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Purchase_ordersList />
      </Layout>
    </Suspense>
  )
}
Purchase_ordersPage.authenticate = false

export default Purchase_ordersPage
