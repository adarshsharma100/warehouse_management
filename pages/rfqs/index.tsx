import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery, invoke } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { InputNumber } from "primereact/inputnumber"
import { Divider } from "primereact/divider"
import getRfqs from "app/rfqs/queries/getRfqs"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import moment from "moment"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import getProducts from "app/products/queries/getProducts"
import createRfq from "app/rfqs/mutations/createRfq"
import getRfq_products from "app/rfq_products/queries/getRfq_products"
import createRfq_product from "app/rfq_products/mutations/createRfq_product"
import createManyRfq_products from "app/rfq_products/mutations/createManyRfq_products"
import deleteRfq_product from "app/rfq_products/mutations/deleteRfq_product"
import deleteRfq from "app/rfqs/mutations/deleteRfq"
import getVendors from "app/vendors/queries/getVendors"
import getVendor_products from "app/vendor_products/queries/getVendor_products"

import { Calendar } from "primereact/calendar"
import createManyPurchase_order_product from "app/purchase_order_products/mutations/createManyPurchase_order_product"
import createPurchase_order from "app/purchase_orders/mutations/createPurchase_order"
import updateRfq from "app/rfqs/mutations/updateRfq"
import updateManyRfq_products from "app/rfq_products/mutations/updateManyRfq_products"
import updateRfq_product from "app/rfq_products/mutations/updateRfq_product"
import { RfqForm } from "app/rfqs/components/RfqForm"
import { Menu } from "primereact/menu"
import { InputTextarea } from "primereact/inputtextarea"
import { mail } from "../../helperFunctions/mail"
import { Chip } from "primereact/chip"
import axios from "axios"
import Loading from "components/loading"
import LoaderFullScreen from "components/LoaderFullScreen"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import ErrorCard from "components/ErrorCard"
import { MultiSelect } from "primereact/multiselect"
import { Checkbox } from "primereact/checkbox"
import { AutoComplete } from "primereact/autocomplete"
import sendEmail from "helperFunctions/rfqMail"
import CreatePo from "components/CreatePo"
import getRfq_senttos from "app/rfq_senttos/queries/getRfq_senttos"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import {
  arrayFillCopy,
  dateFormat,
  createCSV,
  createSearchFunction,
  filterExistingValues,
  tsuccess,
  calenderDateFormat,
  tError,
  tWarn,
  getRemainingPoProducts,
} from "app/constants"
import getMutation_admin_mail from "app/mutation_admin_mails/queries/getMutation_admin_mail"
import { Toast } from "primereact/toast"
import ScannedProducts from "components/ScannedProducts"
import { getAntiCSRFToken } from "@blitzjs/auth"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { date } from "zod"
import CreateNewPo from "components/CreateNewPo"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders"
import { clearConfigCache } from "prettier"
import getAgreement_terms from "app/agreement_terms/queries/getAgreement_terms"
import { spawn } from "child_process"
import RFQPO from "components/RFQPO"
import getEmails from "app/emails/queries/getEmails"
// import { Chip } from "primereact/Chip"
// import Image from "next/image"
import { Image } from "blitz"

import db from "db"
import getRfq from "app/rfqs/queries/getRfq"
import getRfqDetails from "pages/api/rfq/getRfqDetails"
import getPurchase_order from "app/purchase_orders/queries/getPurchase_order"

const ITEMS_PER_PAGE = 100

export const RfqsList = () => {
  const router = useRouter()
  const antiCSRFToken = getAntiCSRFToken()
  const user = useCurrentUser()
  const { id, role, name, email } = user

  const page = Number(router.query.page) || 0
  // const [{ rfqs, hasMore }, { refetch }] = usePaginatedQuery(getRfqs, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })
  const [{ rfqs }, { error: rfqError, refetch }] = useQuery(getRfqs, {
    orderBy: { id: "desc" },
  })
  const [{ emails },] = useQuery(getEmails, {
    orderBy: { id: "asc" },
  })

  // const [{ purchase_orders }, { error: getPoError }] = useQuery(getPurchase_orders, {
  //   orderBy: { po_id: "desc" }, // Do not change the order this will affect on LatestPO function
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })

  //DB-8.0

  const [{ products }, { error: productsError }] = usePaginatedQuery(getProducts, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })



  // const [{ rfq_products }, { refetch: fetchRfqProducts }] = usePaginatedQuery(getRfq_products, {
  //   orderBy: { rfq_products_id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })


  // const [{ rfq_products }, { refetch: fetchRfqProducts, error: getRfq_productsError }] = useQuery(
  //   getRfq_products,
  //   {
  //     orderBy: { rfq_products_id: "asc" },
  //     // skip: 0,
  //     // take: ITEMS_PER_PAGE,
  //   }
  // )

  const data = {
    "rfq_products": [
      {
        "price_per_unit": 856,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 11,
        "rfq_id": 17,
        "products_product_id": 1
      },
      {
        "price_per_unit": 78,
        "products": {
          "product_id": 7,
          "name": "Heat Flame Sensor",
          "description": "description heat",
          "product_type": "Sensors",
          "products_sku": "TIF007",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 70,
        "rfq_products_id": 13,
        "rfq_id": 18,
        "products_product_id": 7
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 4,
        "rfq_products_id": 15,
        "rfq_id": 19,
        "products_product_id": 2
      },
      {
        "price_per_unit": 220,
        "products": {
          "product_id": 14,
          "name": "R385 DC PUMP",
          "description": "R385 ",
          "product_type": "Motors and mechanical devices",
          "products_sku": "TIF014",
          "Price": 787,
          "product_unit": null
        },
        "quantity": 30,
        "rfq_products_id": 16,
        "rfq_id": 22,
        "products_product_id": 14
      },
      {
        "price_per_unit": 5,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 6,
        "rfq_products_id": 110,
        "rfq_id": 161,
        "products_product_id": 1
      },
      {
        "price_per_unit": 12,
        "products": {
          "product_id": 20,
          "name": "dummy name",
          "description": "dummy name",
          "product_type": "dummy product type",
          "products_sku": "TIF000",
          "Price": 4,
          "product_unit": null
        },
        "quantity": 13,
        "rfq_products_id": 135,
        "rfq_id": 192,
        "products_product_id": 20
      },
      {
        "price_per_unit": 78,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 74,
        "rfq_products_id": 136,
        "rfq_id": 192,
        "products_product_id": 1
      },
      {
        "price_per_unit": 10,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 10,
        "rfq_products_id": 137,
        "rfq_id": 193,
        "products_product_id": 1
      },
      {
        "price_per_unit": 99,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 8,
        "rfq_products_id": 138,
        "rfq_id": 194,
        "products_product_id": 1
      },
      {
        "price_per_unit": 7,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 8,
        "rfq_products_id": 163,
        "rfq_id": 161,
        "products_product_id": 2
      },
      {
        "price_per_unit": 99,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 8,
        "rfq_products_id": 170,
        "rfq_id": 194,
        "products_product_id": 1
      },
      {
        "price_per_unit": 856,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 171,
        "rfq_id": 17,
        "products_product_id": 1
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 213,
        "rfq_id": 16,
        "products_product_id": 5
      },
      {
        "price_per_unit": 1,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 11,
        "rfq_products_id": 219,
        "rfq_id": 238,
        "products_product_id": 2
      },
      {
        "price_per_unit": 34,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 45,
        "rfq_products_id": 220,
        "rfq_id": 239,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 67,
        "rfq_products_id": 221,
        "rfq_id": 239,
        "products_product_id": 1
      },
      {
        "price_per_unit": 0,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 100,
        "rfq_products_id": 222,
        "rfq_id": 240,
        "products_product_id": 1
      },
      {
        "price_per_unit": 78,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 8,
        "rfq_products_id": 225,
        "rfq_id": 241,
        "products_product_id": 5
      },
      {
        "price_per_unit": 0,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 226,
        "rfq_id": 243,
        "products_product_id": 5
      },
      {
        "price_per_unit": 12,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 1,
        "rfq_products_id": 227,
        "rfq_id": 244,
        "products_product_id": 5
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 228,
        "rfq_id": 16,
        "products_product_id": 2
      },
      {
        "price_per_unit": 45,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 45,
        "rfq_products_id": 229,
        "rfq_id": 245,
        "products_product_id": 4
      },
      {
        "price_per_unit": 45,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 45,
        "rfq_products_id": 230,
        "rfq_id": 245,
        "products_product_id": 2
      },
      {
        "price_per_unit": 45,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 45,
        "rfq_products_id": 231,
        "rfq_id": 245,
        "products_product_id": 4
      },
      {
        "price_per_unit": 34,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 56,
        "rfq_products_id": 232,
        "rfq_id": 246,
        "products_product_id": 4
      },
      {
        "price_per_unit": 23,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 40,
        "rfq_products_id": 233,
        "rfq_id": 247,
        "products_product_id": 3
      },
      {
        "price_per_unit": 3,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 3,
        "rfq_products_id": 234,
        "rfq_id": 248,
        "products_product_id": 4
      },
      {
        "price_per_unit": 12,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 13,
        "rfq_products_id": 235,
        "rfq_id": 249,
        "products_product_id": 4
      },
      {
        "price_per_unit": 58,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 59,
        "rfq_products_id": 236,
        "rfq_id": 249,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 7,
          "name": "Heat Flame Sensor",
          "description": "description heat",
          "product_type": "Sensors",
          "products_sku": "TIF007",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 1,
        "rfq_products_id": 237,
        "rfq_id": 250,
        "products_product_id": 7
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 2,
        "rfq_products_id": 238,
        "rfq_id": 252,
        "products_product_id": 4
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 1,
        "rfq_products_id": 239,
        "rfq_id": 253,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 240,
        "rfq_id": 254,
        "products_product_id": 5
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 1,
        "rfq_products_id": 241,
        "rfq_id": 255,
        "products_product_id": 4
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 242,
        "rfq_id": 256,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 243,
        "rfq_id": 257,
        "products_product_id": 5
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 244,
        "rfq_id": 258,
        "products_product_id": 3
      },
      {
        "price_per_unit": 0,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 245,
        "rfq_id": 259,
        "products_product_id": 3
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 246,
        "rfq_id": 260,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 247,
        "rfq_id": 261,
        "products_product_id": 5
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 248,
        "rfq_id": 262,
        "products_product_id": 3
      },
      {
        "price_per_unit": 67,
        "products": {
          "product_id": 6,
          "name": "Turbidity Sensor",
          "description": "description sensor",
          "product_type": "Sensors",
          "products_sku": "TIF006",
          "Price": 67,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 249,
        "rfq_id": 263,
        "products_product_id": 6
      },
      {
        "price_per_unit": 67,
        "products": {
          "product_id": 6,
          "name": "Turbidity Sensor",
          "description": "description sensor",
          "product_type": "Sensors",
          "products_sku": "TIF006",
          "Price": 67,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 250,
        "rfq_id": 264,
        "products_product_id": 6
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 40,
        "rfq_products_id": 251,
        "rfq_id": 265,
        "products_product_id": 4
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 140,
        "rfq_products_id": 252,
        "rfq_id": 265,
        "products_product_id": 2
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 50,
        "rfq_products_id": 253,
        "rfq_id": 265,
        "products_product_id": 5
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 254,
        "rfq_id": 266,
        "products_product_id": 4
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 255,
        "rfq_id": 266,
        "products_product_id": 2
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 256,
        "rfq_id": 266,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 257,
        "rfq_id": 267,
        "products_product_id": 5
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 10,
        "rfq_products_id": 258,
        "rfq_id": 268,
        "products_product_id": 4
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 259,
        "rfq_id": 306,
        "products_product_id": 3
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 260,
        "rfq_id": 306,
        "products_product_id": 4
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 261,
        "rfq_id": 306,
        "products_product_id": 3
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 2,
        "rfq_products_id": 262,
        "rfq_id": 307,
        "products_product_id": 3
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 1,
        "rfq_products_id": 263,
        "rfq_id": 307,
        "products_product_id": 4
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 264,
        "rfq_id": 16,
        "products_product_id": 4
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 12,
        "rfq_products_id": 265,
        "rfq_id": 308,
        "products_product_id": 5
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 10,
        "rfq_products_id": 266,
        "rfq_id": 308,
        "products_product_id": 3
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 267,
        "rfq_id": 309,
        "products_product_id": 5
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 268,
        "rfq_id": 309,
        "products_product_id": 4
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 269,
        "rfq_id": 309,
        "products_product_id": 3
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 270,
        "rfq_id": 309,
        "products_product_id": 2
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 271,
        "rfq_id": 309,
        "products_product_id": 1
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 272,
        "rfq_id": 311,
        "products_product_id": 3
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 273,
        "rfq_id": 311,
        "products_product_id": 3
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 274,
        "rfq_id": 311,
        "products_product_id": 2
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 21,
        "rfq_products_id": 275,
        "rfq_id": 315,
        "products_product_id": 2
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 276,
        "rfq_id": 317,
        "products_product_id": 3
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 277,
        "rfq_id": 320,
        "products_product_id": 2
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 278,
        "rfq_id": 321,
        "products_product_id": 1
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 279,
        "rfq_id": 322,
        "products_product_id": 2
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 12,
        "rfq_products_id": 280,
        "rfq_id": 323,
        "products_product_id": 5
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 281,
        "rfq_id": 323,
        "products_product_id": 3
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 12,
        "rfq_products_id": 282,
        "rfq_id": 324,
        "products_product_id": 1
      },
      {
        "price_per_unit": 0,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 283,
        "rfq_id": 325,
        "products_product_id": 4
      },
      {
        "price_per_unit": 856,
        "products": {
          "product_id": 9,
          "name": "Laser Module",
          "description": "description laser",
          "product_type": "Sensors",
          "products_sku": "TIF009",
          "Price": 856,
          "product_unit": null
        },
        "quantity": 70,
        "rfq_products_id": 284,
        "rfq_id": 325,
        "products_product_id": 9
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 33,
        "rfq_products_id": 285,
        "rfq_id": 326,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 33,
        "rfq_products_id": 286,
        "rfq_id": 327,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 33,
        "rfq_products_id": 287,
        "rfq_id": 328,
        "products_product_id": 5
      },
      {
        "price_per_unit": 14,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 10,
        "rfq_products_id": 288,
        "rfq_id": 329,
        "products_product_id": 5
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 241,
        "rfq_products_id": 291,
        "rfq_id": 329,
        "products_product_id": 2
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 10,
          "name": "Sound Sensor Module",
          "description": "sound description",
          "product_type": "Sensors",
          "products_sku": "TIF010",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 4,
        "rfq_products_id": 292,
        "rfq_id": 19,
        "products_product_id": 10
      },
      {
        "price_per_unit": 343,
        "products": {
          "product_id": 15,
          "name": "Solenoid valve 12V",
          "description": "valve 12V",
          "product_type": "Motors and mechanical devices",
          "products_sku": "TIF015",
          "Price": 343,
          "product_unit": null
        },
        "quantity": 8,
        "rfq_products_id": 293,
        "rfq_id": 19,
        "products_product_id": 15
      },
      {
        "price_per_unit": 5657,
        "products": {
          "product_id": 11,
          "name": "Servo Motor Pan-Tilt Setup",
          "description": "servo description",
          "product_type": "Motors and mechanical devices",
          "products_sku": "TIF011",
          "Price": 5657,
          "product_unit": null
        },
        "quantity": 6,
        "rfq_products_id": 294,
        "rfq_id": 19,
        "products_product_id": 11
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 4,
        "rfq_products_id": 295,
        "rfq_id": 19,
        "products_product_id": 5
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 2,
        "rfq_products_id": 296,
        "rfq_id": 19,
        "products_product_id": 3
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 1,
        "rfq_products_id": 297,
        "rfq_id": 19,
        "products_product_id": 4
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 299,
        "rfq_id": 339,
        "products_product_id": 5
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 300,
        "rfq_id": 339,
        "products_product_id": 1
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 301,
        "rfq_id": 339,
        "products_product_id": 4
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 302,
        "rfq_id": 339,
        "products_product_id": 2
      },
      {
        "price_per_unit": 0,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 23,
        "rfq_products_id": 303,
        "rfq_id": 340,
        "products_product_id": 5
      },
      {
        "price_per_unit": 0,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 1,
        "rfq_products_id": 304,
        "rfq_id": 340,
        "products_product_id": 3
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 2,
        "rfq_products_id": 305,
        "rfq_id": 341,
        "products_product_id": 4
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 306,
        "rfq_id": 342,
        "products_product_id": 3
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 12,
        "rfq_products_id": 307,
        "rfq_id": 343,
        "products_product_id": 5
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 308,
        "rfq_id": 344,
        "products_product_id": 4
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 325,
        "rfq_id": 361,
        "products_product_id": 4
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 326,
        "rfq_id": 362,
        "products_product_id": 2
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 12,
        "rfq_products_id": 327,
        "rfq_id": 363,
        "products_product_id": 5
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 1,
        "rfq_products_id": 328,
        "rfq_id": 364,
        "products_product_id": 3
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 12,
        "rfq_products_id": 329,
        "rfq_id": 365,
        "products_product_id": 5
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 330,
        "rfq_id": 366,
        "products_product_id": 1
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 12,
        "rfq_products_id": 331,
        "rfq_id": 367,
        "products_product_id": 4
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 332,
        "rfq_id": 368,
        "products_product_id": 1
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 333,
        "rfq_id": 369,
        "products_product_id": 4
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 334,
        "rfq_id": 370,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 335,
        "rfq_id": 370,
        "products_product_id": 5
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 342,
        "rfq_id": 322,
        "products_product_id": 5
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 343,
        "rfq_id": 322,
        "products_product_id": 4
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 344,
        "rfq_id": 322,
        "products_product_id": 1
      },
      {
        "price_per_unit": 3398,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 345,
        "rfq_id": 342,
        "products_product_id": 5
      },
      {
        "price_per_unit": 346,
        "products": {
          "product_id": 13,
          "name": "A4988 Stepper Motor Driver",
          "description": "description pump",
          "product_type": "Motors and mechanical devices",
          "products_sku": "TIF013",
          "Price": 346,
          "product_unit": null
        },
        "quantity": 12,
        "rfq_products_id": 346,
        "rfq_id": 374,
        "products_product_id": 13
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 347,
        "rfq_id": 375,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 348,
        "rfq_id": 376,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 349,
        "rfq_id": 377,
        "products_product_id": 5
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 350,
        "rfq_id": 378,
        "products_product_id": 3
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 351,
        "rfq_id": 379,
        "products_product_id": 1
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 352,
        "rfq_id": 380,
        "products_product_id": 5
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 353,
        "rfq_id": 381,
        "products_product_id": 5
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 354,
        "rfq_id": 382,
        "products_product_id": 1
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 45,
        "rfq_products_id": 355,
        "rfq_id": 383,
        "products_product_id": 1
      },
      {
        "price_per_unit": 856,
        "products": {
          "product_id": 9,
          "name": "Laser Module",
          "description": "description laser",
          "product_type": "Sensors",
          "products_sku": "TIF009",
          "Price": 856,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 356,
        "rfq_id": 17,
        "products_product_id": 9
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 0,
        "rfq_products_id": 357,
        "rfq_id": 17,
        "products_product_id": 4
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 361,
        "rfq_id": 17,
        "products_product_id": 2
      },
      {
        "price_per_unit": 24,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "quantity": 0,
        "rfq_products_id": 362,
        "rfq_id": 16,
        "products_product_id": 3
      },
      {
        "price_per_unit": 142,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "quantity": 0,
        "rfq_products_id": 363,
        "rfq_id": 16,
        "products_product_id": 2
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 0,
        "rfq_products_id": 366,
        "rfq_id": 384,
        "products_product_id": 1
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 6,
        "rfq_products_id": 367,
        "rfq_id": 385,
        "products_product_id": 5
      },
      {
        "price_per_unit": 65,
        "products": {
          "product_id": 12,
          "name": "Micro Vibration Motor",
          "description": "micro  ",
          "product_type": "Motors and mechanical devices",
          "products_sku": "TIF012",
          "Price": 65,
          "product_unit": null
        },
        "quantity": 5,
        "rfq_products_id": 368,
        "rfq_id": 385,
        "products_product_id": 12
      },
      {
        "price_per_unit": 56,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "quantity": 21,
        "rfq_products_id": 369,
        "rfq_id": 385,
        "products_product_id": 5
      },
      {
        "price_per_unit": 42,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "quantity": 42,
        "rfq_products_id": 370,
        "rfq_id": 385,
        "products_product_id": 4
      },
      {
        "price_per_unit": 11,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "quantity": 34,
        "rfq_products_id": 371,
        "rfq_id": 385,
        "products_product_id": 1
      }
    ],
    "vendors": [
      {
        "vendor_id": 1,
        "vendor_code": "DA",
        "vendor_email": "mdatif796@gmail.com",
        "vendor_city": "Panaji",
        "vendor_contact": "4562879123",
        "vendor_state": "Goa",
        "vendor_gstin": "GSTRIO783211111",
        "vendor": "Dylan Alisson",
        "address": "Rio ",
        "credit_period": "411",
        "lead_time": "471",
        "status": false,
        "vendor_tags": [
          {
            "id": 52,
            "vendor_vendor_id": 1,
            "tags_id": 1,
            "tags": {
              "id": 1,
              "name": "best",
              "color": "#ffcdd2"
            }
          },
          {
            "id": 51,
            "vendor_vendor_id": 1,
            "tags_id": 21,
            "tags": {
              "id": 21,
              "name": "specializations",
              "color": "A9927D"
            }
          }
        ]
      },
      {
        "vendor_id": 2,
        "vendor_code": "UE",
        "vendor_email": "udederson@gmail.com",
        "vendor_city": "Manuguru",
        "vendor_contact": "8956237845",
        "vendor_state": "Andhra Pradesh",
        "vendor_gstin": "GSTMAN012541111",
        "vendor": "Ud Ederson",
        "address": "Manaus",
        "credit_period": "5",
        "lead_time": "4",
        "status": true,
        "vendor_tags": [
          {
            "id": 12,
            "vendor_vendor_id": 2,
            "tags_id": 1,
            "tags": {
              "id": 1,
              "name": "best",
              "color": "#ffcdd2"
            }
          },
          {
            "id": 3,
            "vendor_vendor_id": 2,
            "tags_id": 2,
            "tags": {
              "id": 2,
              "name": "poor",
              "color": "#FCFF4B"
            }
          },
          {
            "id": 29,
            "vendor_vendor_id": 2,
            "tags_id": 6,
            "tags": {
              "id": 6,
              "name": "priority",
              "color": "F1A208"
            }
          }
        ]
      },
      {
        "vendor_id": 3,
        "vendor_code": "TE",
        "vendor_email": "thomasEdison@gmail.com",
        "vendor_city": "Miraj",
        "vendor_contact": "8954236172",
        "vendor_state": "Maharashtra",
        "vendor_gstin": "GSTMIL009222222",
        "vendor": "Thomas Edison",
        "address": "Milan",
        "credit_period": "4",
        "lead_time": "4",
        "status": false,
        "vendor_tags": [
          {
            "id": 7,
            "vendor_vendor_id": 3,
            "tags_id": 1,
            "tags": {
              "id": 1,
              "name": "best",
              "color": "#ffcdd2"
            }
          },
          {
            "id": 30,
            "vendor_vendor_id": 3,
            "tags_id": 4,
            "tags": {
              "id": 4,
              "name": "delivery time",
              "color": "#FFFFFF"
            }
          }
        ]
      },
      {
        "vendor_id": 4,
        "vendor_code": "KM",
        "vendor_email": "kamehameha@gmail.com",
        "vendor_city": "Tonk",
        "vendor_contact": "7856124391",
        "vendor_state": "Rajasthan",
        "vendor_gstin": "GSTTK0097811111",
        "vendor": "Kamehameha",
        "address": "Tokyo",
        "credit_period": "7",
        "lead_time": "4",
        "status": true,
        "vendor_tags": [
          {
            "id": 9,
            "vendor_vendor_id": 4,
            "tags_id": 1,
            "tags": {
              "id": 1,
              "name": "best",
              "color": "#ffcdd2"
            }
          },
          {
            "id": 31,
            "vendor_vendor_id": 4,
            "tags_id": 10,
            "tags": {
              "id": 10,
              "name": "certifications",
              "color": "5E4352"
            }
          },
          {
            "id": 33,
            "vendor_vendor_id": 4,
            "tags_id": 21,
            "tags": {
              "id": 21,
              "name": "specializations",
              "color": "A9927D"
            }
          },
          {
            "id": 32,
            "vendor_vendor_id": 4,
            "tags_id": 25,
            "tags": {
              "id": 25,
              "name": "awards",
              "color": null
            }
          },
          {
            "id": 19,
            "vendor_vendor_id": 4,
            "tags_id": 26,
            "tags": {
              "id": 26,
              "name": "inventory",
              "color": "A1B5D8"
            }
          }
        ]
      },
      {
        "vendor_id": 5,
        "vendor_code": "RH",
        "vendor_email": "rahul@gmail.com",
        "vendor_city": "Dumka",
        "vendor_contact": "4556788925",
        "vendor_state": "Jharkhand",
        "vendor_gstin": "GSTDUB012541111",
        "vendor": "Rahul",
        "address": "Dubai",
        "credit_period": "3",
        "lead_time": "4",
        "status": true,
        "vendor_tags": [
          {
            "id": 16,
            "vendor_vendor_id": 5,
            "tags_id": 12,
            "tags": {
              "id": 12,
              "name": "customer service",
              "color": "427AA1"
            }
          },
          {
            "id": 20,
            "vendor_vendor_id": 5,
            "tags_id": 14,
            "tags": {
              "id": 14,
              "name": "payment options",
              "color": "D9F9A5"
            }
          }
        ]
      },
      {
        "vendor_id": 123,
        "vendor_code": "VJ",
        "vendor_email": "varunram.66@gmail.com",
        "vendor_city": "Bangalore",
        "vendor_contact": "7892496089",
        "vendor_state": "Karnataka",
        "vendor_gstin": "GSTN97313398111",
        "vendor": "Varun",
        "address": "Hennur",
        "credit_period": "12",
        "lead_time": "21",
        "status": false,
        "vendor_tags": [
          {
            "id": 21,
            "vendor_vendor_id": 123,
            "tags_id": 2,
            "tags": {
              "id": 2,
              "name": "poor",
              "color": "#FCFF4B"
            }
          }
        ]
      },
      {
        "vendor_id": 133,
        "vendor_code": "iotif",
        "vendor_email": "iot@gmail.com",
        "vendor_city": "Gopalganj",
        "vendor_contact": "4567892567",
        "vendor_state": "Bihar",
        "vendor_gstin": "GSTO14562398745",
        "vendor": "TIF",
        "address": "banglore",
        "credit_period": "10",
        "lead_time": "12",
        "status": false,
        "vendor_tags": [
          {
            "id": 5,
            "vendor_vendor_id": 133,
            "tags_id": 1,
            "tags": {
              "id": 1,
              "name": "best",
              "color": "#ffcdd2"
            }
          },
          {
            "id": 22,
            "vendor_vendor_id": 133,
            "tags_id": 30,
            "tags": {
              "id": 30,
              "name": "logistics",
              "color": "b908c9"
            }
          }
        ]
      },
      {
        "vendor_id": 134,
        "vendor_code": "KR",
        "vendor_email": "kar@gmail.com",
        "vendor_city": "Cambay",
        "vendor_contact": "8987634523",
        "vendor_state": "Gujarat",
        "vendor_gstin": "GSTI87640111111",
        "vendor": "Karan",
        "address": "12th street ",
        "credit_period": "4",
        "lead_time": "5",
        "status": true,
        "vendor_tags": [
          {
            "id": 53,
            "vendor_vendor_id": 134,
            "tags_id": 4,
            "tags": {
              "id": 4,
              "name": "delivery time",
              "color": "#FFFFFF"
            }
          },
          {
            "id": 54,
            "vendor_vendor_id": 134,
            "tags_id": 16,
            "tags": {
              "id": 16,
              "name": "warranty",
              "color": "679436"
            }
          },
          {
            "id": 23,
            "vendor_vendor_id": 134,
            "tags_id": 20,
            "tags": {
              "id": 20,
              "name": "lead time",
              "color": "EAC5D8"
            }
          },
          {
            "id": 55,
            "vendor_vendor_id": 134,
            "tags_id": 22,
            "tags": {
              "id": 22,
              "name": "availability",
              "color": "D9F9A5"
            }
          },
          {
            "id": 56,
            "vendor_vendor_id": 134,
            "tags_id": 101,
            "tags": {
              "id": 101,
              "name": "awesome",
              "color": "5E0035"
            }
          }
        ]
      },
      {
        "vendor_id": 135,
        "vendor_code": "RA",
        "vendor_email": "raj@gail.com",
        "vendor_city": "banglor",
        "vendor_contact": "1546237964",
        "vendor_state": "Karnataka",
        "vendor_gstin": "GSTI14254572222",
        "vendor": "Raj",
        "address": "11th street",
        "credit_period": "11",
        "lead_time": "12",
        "status": true,
        "vendor_tags": [
          {
            "id": 6,
            "vendor_vendor_id": 135,
            "tags_id": 1,
            "tags": {
              "id": 1,
              "name": "best",
              "color": "#ffcdd2"
            }
          }
        ]
      },
      {
        "vendor_id": 147,
        "vendor_code": "FK",
        "vendor_email": "xylene8@gmail.com",
        "vendor_city": "Salur",
        "vendor_contact": "4567891238",
        "vendor_state": "Andhra Pradesh",
        "vendor_gstin": "GSTIN6786543467",
        "vendor": "Frank",
        "address": "11",
        "credit_period": "11",
        "lead_time": "11",
        "status": true,
        "vendor_tags": [
          {
            "id": 25,
            "vendor_vendor_id": 147,
            "tags_id": 2,
            "tags": {
              "id": 2,
              "name": "poor",
              "color": "#FCFF4B"
            }
          }
        ]
      },
      {
        "vendor_id": 168,
        "vendor_code": "z",
        "vendor_email": "z@g.com",
        "vendor_city": "Chirala",
        "vendor_contact": "1456987856",
        "vendor_state": "Andhra Pradesh",
        "vendor_gstin": "145698712345698",
        "vendor": "z",
        "address": "asd",
        "credit_period": "45",
        "lead_time": "56",
        "status": true,
        "vendor_tags": [
          {
            "id": 35,
            "vendor_vendor_id": 168,
            "tags_id": 5,
            "tags": {
              "id": 5,
              "name": "location",
              "color": "#E4D6A7"
            }
          },
          {
            "id": 26,
            "vendor_vendor_id": 168,
            "tags_id": 26,
            "tags": {
              "id": 26,
              "name": "inventory",
              "color": "A1B5D8"
            }
          }
        ]
      },
      {
        "vendor_id": 170,
        "vendor_code": "asq",
        "vendor_email": "d@c.com",
        "vendor_city": "Wanaparthy",
        "vendor_contact": "1234567894",
        "vendor_state": "Andhra Pradesh",
        "vendor_gstin": "123456789568745",
        "vendor": "q",
        "address": "sda",
        "credit_period": "12",
        "lead_time": "45",
        "status": true,
        "vendor_tags": [
          {
            "id": 18,
            "vendor_vendor_id": 170,
            "tags_id": 15,
            "tags": {
              "id": 15,
              "name": "return policy",
              "color": "A9927D"
            }
          },
          {
            "id": 36,
            "vendor_vendor_id": 170,
            "tags_id": 19,
            "tags": {
              "id": 19,
              "name": "quantity discounts",
              "color": "005C69"
            }
          }
        ]
      },
      {
        "vendor_id": 171,
        "vendor_code": "m",
        "vendor_email": "m2@G.COM",
        "vendor_city": "Zahirabad",
        "vendor_contact": "1456239875",
        "vendor_state": "Andhra Pradesh",
        "vendor_gstin": "123654789632145",
        "vendor": "m",
        "address": "WSAQ",
        "credit_period": "45",
        "lead_time": "69",
        "status": true,
        "vendor_tags": [
          {
            "id": 17,
            "vendor_vendor_id": 171,
            "tags_id": 2,
            "tags": {
              "id": 2,
              "name": "poor",
              "color": "#FCFF4B"
            }
          },
          {
            "id": 34,
            "vendor_vendor_id": 171,
            "tags_id": 19,
            "tags": {
              "id": 19,
              "name": "quantity discounts",
              "color": "005C69"
            }
          }
        ]
      },
      {
        "vendor_id": 173,
        "vendor_code": "SWD",
        "vendor_email": "SD@GMAIL.COM",
        "vendor_city": "Bellampalle",
        "vendor_contact": "7895263654",
        "vendor_state": "Andhra Pradesh",
        "vendor_gstin": "SDEF412C5D6E3S6",
        "vendor": "vj",
        "address": "STRING ",
        "credit_period": "56",
        "lead_time": "85",
        "status": true,
        "vendor_tags": [
          {
            "id": 27,
            "vendor_vendor_id": 173,
            "tags_id": 21,
            "tags": {
              "id": 21,
              "name": "specializations",
              "color": "A9927D"
            }
          },
          {
            "id": 13,
            "vendor_vendor_id": 173,
            "tags_id": 22,
            "tags": {
              "id": 22,
              "name": "availability",
              "color": "D9F9A5"
            }
          }
        ]
      },
      {
        "vendor_id": 192,
        "vendor_code": "AS",
        "vendor_email": "AS@gmail.com",
        "vendor_city": "AS",
        "vendor_contact": "AS",
        "vendor_state": "AS",
        "vendor_gstin": "AS",
        "vendor": "AS",
        "address": "AS",
        "credit_period": "AS",
        "lead_time": "AS",
        "status": true,
        "vendor_tags": []
      }
    ],
    "vendor_products": [
      {
        "vp_id": 1,
        "unit_price": 424,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "vendor": {
          "vendor_id": 1,
          "vendor_code": "DA",
          "vendor_email": "mdatif796@gmail.com",
          "vendor_city": "Panaji",
          "vendor_contact": "4562879123",
          "vendor_state": "Goa",
          "vendor_gstin": "GSTRIO783211111",
          "vendor": "Dylan Alisson",
          "address": "Rio ",
          "credit_period": "411",
          "lead_time": "471",
          "status": false
        },
        "vendor_vendor_id": 1,
        "products_product_id": 1,
        "vendor_sku": "DA1002"
      },
      {
        "vp_id": 2,
        "unit_price": 10,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "vendor": {
          "vendor_id": 1,
          "vendor_code": "DA",
          "vendor_email": "mdatif796@gmail.com",
          "vendor_city": "Panaji",
          "vendor_contact": "4562879123",
          "vendor_state": "Goa",
          "vendor_gstin": "GSTRIO783211111",
          "vendor": "Dylan Alisson",
          "address": "Rio ",
          "credit_period": "411",
          "lead_time": "471",
          "status": false
        },
        "vendor_vendor_id": 1,
        "products_product_id": 2,
        "vendor_sku": "DA1001"
      },
      {
        "vp_id": 5,
        "unit_price": 50,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "vendor": {
          "vendor_id": 3,
          "vendor_code": "TE",
          "vendor_email": "thomasEdison@gmail.com",
          "vendor_city": "Miraj",
          "vendor_contact": "8954236172",
          "vendor_state": "Maharashtra",
          "vendor_gstin": "GSTMIL009222222",
          "vendor": "Thomas Edison",
          "address": "Milan",
          "credit_period": "4",
          "lead_time": "4",
          "status": false
        },
        "vendor_vendor_id": 3,
        "products_product_id": 3,
        "vendor_sku": "TE103"
      },
      {
        "vp_id": 6,
        "unit_price": 905,
        "products": {
          "product_id": 6,
          "name": "Turbidity Sensor",
          "description": "description sensor",
          "product_type": "Sensors",
          "products_sku": "TIF006",
          "Price": 67,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 3,
          "vendor_code": "TE",
          "vendor_email": "thomasEdison@gmail.com",
          "vendor_city": "Miraj",
          "vendor_contact": "8954236172",
          "vendor_state": "Maharashtra",
          "vendor_gstin": "GSTMIL009222222",
          "vendor": "Thomas Edison",
          "address": "Milan",
          "credit_period": "4",
          "lead_time": "4",
          "status": false
        },
        "vendor_vendor_id": 3,
        "products_product_id": 6,
        "vendor_sku": "TE106"
      },
      {
        "vp_id": 8,
        "unit_price": 45,
        "products": {
          "product_id": 7,
          "name": "Heat Flame Sensor",
          "description": "description heat",
          "product_type": "Sensors",
          "products_sku": "TIF007",
          "Price": 56,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 3,
          "vendor_code": "TE",
          "vendor_email": "thomasEdison@gmail.com",
          "vendor_city": "Miraj",
          "vendor_contact": "8954236172",
          "vendor_state": "Maharashtra",
          "vendor_gstin": "GSTMIL009222222",
          "vendor": "Thomas Edison",
          "address": "Milan",
          "credit_period": "4",
          "lead_time": "4",
          "status": false
        },
        "vendor_vendor_id": 3,
        "products_product_id": 7,
        "vendor_sku": "TE107"
      },
      {
        "vp_id": 9,
        "unit_price": 88,
        "products": {
          "product_id": 6,
          "name": "Turbidity Sensor",
          "description": "description sensor",
          "product_type": "Sensors",
          "products_sku": "TIF006",
          "Price": 67,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 4,
          "vendor_code": "KM",
          "vendor_email": "kamehameha@gmail.com",
          "vendor_city": "Tonk",
          "vendor_contact": "7856124391",
          "vendor_state": "Rajasthan",
          "vendor_gstin": "GSTTK0097811111",
          "vendor": "Kamehameha",
          "address": "Tokyo",
          "credit_period": "7",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 4,
        "products_product_id": 6,
        "vendor_sku": "KM106"
      },
      {
        "vp_id": 10,
        "unit_price": 47,
        "products": {
          "product_id": 7,
          "name": "Heat Flame Sensor",
          "description": "description heat",
          "product_type": "Sensors",
          "products_sku": "TIF007",
          "Price": 56,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 4,
          "vendor_code": "KM",
          "vendor_email": "kamehameha@gmail.com",
          "vendor_city": "Tonk",
          "vendor_contact": "7856124391",
          "vendor_state": "Rajasthan",
          "vendor_gstin": "GSTTK0097811111",
          "vendor": "Kamehameha",
          "address": "Tokyo",
          "credit_period": "7",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 4,
        "products_product_id": 7,
        "vendor_sku": "KM107"
      },
      {
        "vp_id": 11,
        "unit_price": 83,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 1,
          "vendor_code": "DA",
          "vendor_email": "mdatif796@gmail.com",
          "vendor_city": "Panaji",
          "vendor_contact": "4562879123",
          "vendor_state": "Goa",
          "vendor_gstin": "GSTRIO783211111",
          "vendor": "Dylan Alisson",
          "address": "Rio ",
          "credit_period": "411",
          "lead_time": "471",
          "status": false
        },
        "vendor_vendor_id": 1,
        "products_product_id": 4,
        "vendor_sku": "DA102"
      },
      {
        "vp_id": 20,
        "unit_price": 120,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 3,
          "vendor_code": "TE",
          "vendor_email": "thomasEdison@gmail.com",
          "vendor_city": "Miraj",
          "vendor_contact": "8954236172",
          "vendor_state": "Maharashtra",
          "vendor_gstin": "GSTMIL009222222",
          "vendor": "Thomas Edison",
          "address": "Milan",
          "credit_period": "4",
          "lead_time": "4",
          "status": false
        },
        "vendor_vendor_id": 3,
        "products_product_id": 5,
        "vendor_sku": "TE105"
      },
      {
        "vp_id": 29,
        "unit_price": 11,
        "products": {
          "product_id": 8,
          "name": "Eye Blink Sensor",
          "description": "eye description",
          "product_type": "Sensors",
          "products_sku": "TIF008",
          "Price": 53,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 1,
          "vendor_code": "DA",
          "vendor_email": "mdatif796@gmail.com",
          "vendor_city": "Panaji",
          "vendor_contact": "4562879123",
          "vendor_state": "Goa",
          "vendor_gstin": "GSTRIO783211111",
          "vendor": "Dylan Alisson",
          "address": "Rio ",
          "credit_period": "411",
          "lead_time": "471",
          "status": false
        },
        "vendor_vendor_id": 1,
        "products_product_id": 8,
        "vendor_sku": "qws"
      },
      {
        "vp_id": 33,
        "unit_price": 25,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "vendor": {
          "vendor_id": 123,
          "vendor_code": "VJ",
          "vendor_email": "varunram.66@gmail.com",
          "vendor_city": "Bangalore",
          "vendor_contact": "7892496089",
          "vendor_state": "Karnataka",
          "vendor_gstin": "GSTN97313398111",
          "vendor": "Varun",
          "address": "Hennur",
          "credit_period": "12",
          "lead_time": "21",
          "status": false
        },
        "vendor_vendor_id": 123,
        "products_product_id": 2,
        "vendor_sku": "VJ338"
      },
      {
        "vp_id": 34,
        "unit_price": 120,
        "products": {
          "product_id": 6,
          "name": "Turbidity Sensor",
          "description": "description sensor",
          "product_type": "Sensors",
          "products_sku": "TIF006",
          "Price": 67,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 5,
          "vendor_code": "RH",
          "vendor_email": "rahul@gmail.com",
          "vendor_city": "Dumka",
          "vendor_contact": "4556788925",
          "vendor_state": "Jharkhand",
          "vendor_gstin": "GSTDUB012541111",
          "vendor": "Rahul",
          "address": "Dubai",
          "credit_period": "3",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 5,
        "products_product_id": 6,
        "vendor_sku": "TE1564"
      },
      {
        "vp_id": 35,
        "unit_price": 11,
        "products": {
          "product_id": 7,
          "name": "Heat Flame Sensor",
          "description": "description heat",
          "product_type": "Sensors",
          "products_sku": "TIF007",
          "Price": 56,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 5,
          "vendor_code": "RH",
          "vendor_email": "rahul@gmail.com",
          "vendor_city": "Dumka",
          "vendor_contact": "4556788925",
          "vendor_state": "Jharkhand",
          "vendor_gstin": "GSTDUB012541111",
          "vendor": "Rahul",
          "address": "Dubai",
          "credit_period": "3",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 5,
        "products_product_id": 7,
        "vendor_sku": "TE571"
      },
      {
        "vp_id": 36,
        "unit_price": 756,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "vendor": {
          "vendor_id": 4,
          "vendor_code": "KM",
          "vendor_email": "kamehameha@gmail.com",
          "vendor_city": "Tonk",
          "vendor_contact": "7856124391",
          "vendor_state": "Rajasthan",
          "vendor_gstin": "GSTTK0097811111",
          "vendor": "Kamehameha",
          "address": "Tokyo",
          "credit_period": "7",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 4,
        "products_product_id": 1,
        "vendor_sku": "TE417"
      },
      {
        "vp_id": 37,
        "unit_price": 454,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "vendor": {
          "vendor_id": 5,
          "vendor_code": "RH",
          "vendor_email": "rahul@gmail.com",
          "vendor_city": "Dumka",
          "vendor_contact": "4556788925",
          "vendor_state": "Jharkhand",
          "vendor_gstin": "GSTDUB012541111",
          "vendor": "Rahul",
          "address": "Dubai",
          "credit_period": "3",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 5,
        "products_product_id": 1,
        "vendor_sku": "TE420"
      },
      {
        "vp_id": 79,
        "unit_price": 142,
        "products": {
          "product_id": 3,
          "name": "Waterproof Ultrasonic Sensor",
          "description": "water-desp",
          "product_type": "Sensors",
          "products_sku": "TIF003",
          "Price": 24,
          "product_unit": "combo"
        },
        "vendor": {
          "vendor_id": 4,
          "vendor_code": "KM",
          "vendor_email": "kamehameha@gmail.com",
          "vendor_city": "Tonk",
          "vendor_contact": "7856124391",
          "vendor_state": "Rajasthan",
          "vendor_gstin": "GSTTK0097811111",
          "vendor": "Kamehameha",
          "address": "Tokyo",
          "credit_period": "7",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 4,
        "products_product_id": 3,
        "vendor_sku": "KA146"
      },
      {
        "vp_id": 81,
        "unit_price": 85,
        "products": {
          "product_id": 15,
          "name": "Solenoid valve 12V",
          "description": "valve 12V",
          "product_type": "Motors and mechanical devices",
          "products_sku": "TIF015",
          "Price": 343,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 1,
          "vendor_code": "DA",
          "vendor_email": "mdatif796@gmail.com",
          "vendor_city": "Panaji",
          "vendor_contact": "4562879123",
          "vendor_state": "Goa",
          "vendor_gstin": "GSTRIO783211111",
          "vendor": "Dylan Alisson",
          "address": "Rio ",
          "credit_period": "411",
          "lead_time": "471",
          "status": false
        },
        "vendor_vendor_id": 1,
        "products_product_id": 15,
        "vendor_sku": "DA10456"
      },
      {
        "vp_id": 83,
        "unit_price": 0,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 3,
          "vendor_code": "TE",
          "vendor_email": "thomasEdison@gmail.com",
          "vendor_city": "Miraj",
          "vendor_contact": "8954236172",
          "vendor_state": "Maharashtra",
          "vendor_gstin": "GSTMIL009222222",
          "vendor": "Thomas Edison",
          "address": "Milan",
          "credit_period": "4",
          "lead_time": "4",
          "status": false
        },
        "vendor_vendor_id": 3,
        "products_product_id": 4,
        "vendor_sku": "TE104"
      },
      {
        "vp_id": 86,
        "unit_price": 12,
        "products": {
          "product_id": 23,
          "name": "Test CSV",
          "description": "Test CSV",
          "product_type": "CSV",
          "products_sku": "TestSKU",
          "Price": 67,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 1,
          "vendor_code": "DA",
          "vendor_email": "mdatif796@gmail.com",
          "vendor_city": "Panaji",
          "vendor_contact": "4562879123",
          "vendor_state": "Goa",
          "vendor_gstin": "GSTRIO783211111",
          "vendor": "Dylan Alisson",
          "address": "Rio ",
          "credit_period": "411",
          "lead_time": "471",
          "status": false
        },
        "vendor_vendor_id": 1,
        "products_product_id": 23,
        "vendor_sku": "aws"
      },
      {
        "vp_id": 102,
        "unit_price": 15,
        "products": {
          "product_id": 21,
          "name": "Watermelon",
          "description": "Water-melon is a flowering plant species of the Cucurbitaceae family orem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,\nmolestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum",
          "product_type": "Fruit",
          "products_sku": "Test",
          "Price": 7,
          "product_unit": "kg"
        },
        "vendor": {
          "vendor_id": 123,
          "vendor_code": "VJ",
          "vendor_email": "varunram.66@gmail.com",
          "vendor_city": "Bangalore",
          "vendor_contact": "7892496089",
          "vendor_state": "Karnataka",
          "vendor_gstin": "GSTN97313398111",
          "vendor": "Varun",
          "address": "Hennur",
          "credit_period": "12",
          "lead_time": "21",
          "status": false
        },
        "vendor_vendor_id": 123,
        "products_product_id": 21,
        "vendor_sku": "VJW1001"
      },
      {
        "vp_id": 104,
        "unit_price": 12,
        "products": {
          "product_id": 14,
          "name": "R385 DC PUMP",
          "description": "R385 ",
          "product_type": "Motors and mechanical devices",
          "products_sku": "TIF014",
          "Price": 787,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 4,
          "vendor_code": "KM",
          "vendor_email": "kamehameha@gmail.com",
          "vendor_city": "Tonk",
          "vendor_contact": "7856124391",
          "vendor_state": "Rajasthan",
          "vendor_gstin": "GSTTK0097811111",
          "vendor": "Kamehameha",
          "address": "Tokyo",
          "credit_period": "7",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 4,
        "products_product_id": 14,
        "vendor_sku": "dewa"
      },
      {
        "vp_id": 105,
        "unit_price": 123,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 2,
          "vendor_code": "UE",
          "vendor_email": "udederson@gmail.com",
          "vendor_city": "Manuguru",
          "vendor_contact": "8956237845",
          "vendor_state": "Andhra Pradesh",
          "vendor_gstin": "GSTMAN012541111",
          "vendor": "Ud Ederson",
          "address": "Manaus",
          "credit_period": "5",
          "lead_time": "4",
          "status": true
        },
        "vendor_vendor_id": 2,
        "products_product_id": 5,
        "vendor_sku": "ssWW"
      },
      {
        "vp_id": 106,
        "unit_price": 111,
        "products": {
          "product_id": 5,
          "name": "MQ-135 gas sensor Module",
          "description": "description 135",
          "product_type": "Sensors",
          "products_sku": "TIF005",
          "Price": 56,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 170,
          "vendor_code": "asq",
          "vendor_email": "d@c.com",
          "vendor_city": "Wanaparthy",
          "vendor_contact": "1234567894",
          "vendor_state": "Andhra Pradesh",
          "vendor_gstin": "123456789568745",
          "vendor": "q",
          "address": "sda",
          "credit_period": "12",
          "lead_time": "45",
          "status": true
        },
        "vendor_vendor_id": 170,
        "products_product_id": 5,
        "vendor_sku": "qqq"
      },
      {
        "vp_id": 108,
        "unit_price": 45,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 123,
          "vendor_code": "VJ",
          "vendor_email": "varunram.66@gmail.com",
          "vendor_city": "Bangalore",
          "vendor_contact": "7892496089",
          "vendor_state": "Karnataka",
          "vendor_gstin": "GSTN97313398111",
          "vendor": "Varun",
          "address": "Hennur",
          "credit_period": "12",
          "lead_time": "21",
          "status": false
        },
        "vendor_vendor_id": 123,
        "products_product_id": 4,
        "vendor_sku": "VJ12345"
      },
      {
        "vp_id": 112,
        "unit_price": 45,
        "products": {
          "product_id": 21,
          "name": "Watermelon",
          "description": "Water-melon is a flowering plant species of the Cucurbitaceae family orem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,\nmolestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum",
          "product_type": "Fruit",
          "products_sku": "Test",
          "Price": 7,
          "product_unit": "kg"
        },
        "vendor": {
          "vendor_id": 147,
          "vendor_code": "FK",
          "vendor_email": "xylene8@gmail.com",
          "vendor_city": "Salur",
          "vendor_contact": "4567891238",
          "vendor_state": "Andhra Pradesh",
          "vendor_gstin": "GSTIN6786543467",
          "vendor": "Frank",
          "address": "11",
          "credit_period": "11",
          "lead_time": "11",
          "status": true
        },
        "vendor_vendor_id": 147,
        "products_product_id": 21,
        "vendor_sku": "FK489"
      },
      {
        "vp_id": 113,
        "unit_price": 40,
        "products": {
          "product_id": 4,
          "name": "E18-D80NK Infrared Sensor Module",
          "description": "description",
          "product_type": "Sensors",
          "products_sku": "TIF004",
          "Price": 42,
          "product_unit": null
        },
        "vendor": {
          "vendor_id": 147,
          "vendor_code": "FK",
          "vendor_email": "xylene8@gmail.com",
          "vendor_city": "Salur",
          "vendor_contact": "4567891238",
          "vendor_state": "Andhra Pradesh",
          "vendor_gstin": "GSTIN6786543467",
          "vendor": "Frank",
          "address": "11",
          "credit_period": "11",
          "lead_time": "11",
          "status": true
        },
        "vendor_vendor_id": 147,
        "products_product_id": 4,
        "vendor_sku": "FK491"
      },
      {
        "vp_id": 114,
        "unit_price": 41,
        "products": {
          "product_id": 2,
          "name": "ESP",
          "description": "esp-desc",
          "product_type": "Electronics",
          "products_sku": "TIF002",
          "Price": 142,
          "product_unit": "2pc set"
        },
        "vendor": {
          "vendor_id": 147,
          "vendor_code": "FK",
          "vendor_email": "xylene8@gmail.com",
          "vendor_city": "Salur",
          "vendor_contact": "4567891238",
          "vendor_state": "Andhra Pradesh",
          "vendor_gstin": "GSTIN6786543467",
          "vendor": "Frank",
          "address": "11",
          "credit_period": "11",
          "lead_time": "11",
          "status": true
        },
        "vendor_vendor_id": 147,
        "products_product_id": 2,
        "vendor_sku": "FK490"
      },
      {
        "vp_id": 116,
        "unit_price": 85,
        "products": {
          "product_id": 1,
          "name": "Pi",
          "description": "Pi-descasw",
          "product_type": "Electronics",
          "products_sku": "TIF001",
          "Price": 11,
          "product_unit": "pc"
        },
        "vendor": {
          "vendor_id": 3,
          "vendor_code": "TE",
          "vendor_email": "thomasEdison@gmail.com",
          "vendor_city": "Miraj",
          "vendor_contact": "8954236172",
          "vendor_state": "Maharashtra",
          "vendor_gstin": "GSTMIL009222222",
          "vendor": "Thomas Edison",
          "address": "Milan",
          "credit_period": "4",
          "lead_time": "4",
          "status": false
        },
        "vendor_vendor_id": 3,
        "products_product_id": 1,
        "vendor_sku": "TH4568"
      }
    ],
    "prefixes": [
      {
        "id": 1,
        "name": "PRODUCT",
        "prefix": "PROD"
      },
      {
        "id": 2,
        "name": "RFQ",
        "prefix": "RFQ"
      },
      {
        "id": 3,
        "name": "PO",
        "prefix": "PO"
      },
      {
        "id": 4,
        "name": "GRN",
        "prefix": "GRN"
      }
    ],
    "rfq_senttos": [
      {
        "id": 11,
        "email": "dylan.p@tiflabs.in",
        "rfq_id": 191
      },
      {
        "id": 15,
        "email": "test@gmail.com",
        "rfq_id": 201
      },
      {
        "id": 16,
        "email": "test45@gmail.com",
        "rfq_id": 201
      },
      {
        "id": 28,
        "email": "QUID@g.com",
        "rfq_id": 209
      },
      {
        "id": 57,
        "email": "vj@gmail.com",
        "rfq_id": 238
      },
      {
        "id": 58,
        "email": "ss",
        "rfq_id": 239
      },
      {
        "id": 59,
        "email": "saa",
        "rfq_id": 240
      },
      {
        "id": 60,
        "email": "vj@gmail.com",
        "rfq_id": 241
      },
      {
        "id": 62,
        "email": "asd",
        "rfq_id": 243
      },
      {
        "id": 63,
        "email": "sdfds",
        "rfq_id": 244
      },
      {
        "id": 64,
        "email": "wefwe",
        "rfq_id": 245
      },
      {
        "id": 65,
        "email": "wewe",
        "rfq_id": 245
      },
      {
        "id": 66,
        "email": "sfsd",
        "rfq_id": 246
      },
      {
        "id": 67,
        "email": "fasf",
        "rfq_id": 246
      },
      {
        "id": 68,
        "email": "dfg",
        "rfq_id": 247
      },
      {
        "id": 69,
        "email": "ser",
        "rfq_id": 247
      },
      {
        "id": 70,
        "email": "dsds",
        "rfq_id": 248
      },
      {
        "id": 71,
        "email": "dfdfs",
        "rfq_id": 248
      },
      {
        "id": 72,
        "email": "dfs",
        "rfq_id": 249
      },
      {
        "id": 73,
        "email": "sdf",
        "rfq_id": 249
      },
      {
        "id": 74,
        "email": "sdsd",
        "rfq_id": 250
      },
      {
        "id": 75,
        "email": "ds",
        "rfq_id": 250
      },
      {
        "id": 78,
        "email": "saa",
        "rfq_id": 252
      },
      {
        "id": 79,
        "email": "dsdsa",
        "rfq_id": 252
      },
      {
        "id": 80,
        "email": "dfg",
        "rfq_id": 253
      },
      {
        "id": 81,
        "email": "gds",
        "rfq_id": 253
      },
      {
        "id": 97,
        "email": "kamehameha@gmail.com",
        "rfq_id": 311
      },
      {
        "id": 101,
        "email": "kamehameha@gmail.com",
        "rfq_id": 315
      },
      {
        "id": 115,
        "email": "udederson@gmail.com",
        "rfq_id": 329
      },
      {
        "id": 122,
        "email": "varunram.66@gmail.com",
        "rfq_id": 329
      },
      {
        "id": 123,
        "email": "varunram.66@gmail.com",
        "rfq_id": 326
      },
      {
        "id": 125,
        "email": "kamehameha@gmail.com",
        "rfq_id": 342
      },
      {
        "id": 126,
        "email": "varunram.66@gmail.com",
        "rfq_id": 343
      },
      {
        "id": 128,
        "email": "varunram.66@gmail.com",
        "rfq_id": 344
      },
      {
        "id": 149,
        "email": "varunram.66@gmail.com",
        "rfq_id": 19
      },
      {
        "id": 150,
        "email": "varunram.66@gmail.com",
        "rfq_id": 22
      },
      {
        "id": 151,
        "email": "varunram.66@gmail.com",
        "rfq_id": 209
      },
      {
        "id": 154,
        "email": "F@gmail.com",
        "rfq_id": 209
      },
      {
        "id": 155,
        "email": "F@gmail.com",
        "rfq_id": 240
      },
      {
        "id": 160,
        "email": "xylene8@gmail.com",
        "rfq_id": 362
      },
      {
        "id": 175,
        "email": "varunram.66@gmail.com",
        "rfq_id": 370
      },
      {
        "id": 176,
        "email": "kar@gmail.com",
        "rfq_id": 371
      },
      {
        "id": 180,
        "email": "varunram.66@gmail.com",
        "rfq_id": 322
      },
      {
        "id": 181,
        "email": "varunram.66@gmail.com",
        "rfq_id": 374
      },
      {
        "id": 182,
        "email": "varunram.66@gmail.com",
        "rfq_id": 16
      },
      {
        "id": 183,
        "email": "xylene8@gmail.com",
        "rfq_id": 16
      },
      {
        "id": 184,
        "email": "z@g.com",
        "rfq_id": 16
      },
      {
        "id": 185,
        "email": "d@c.com",
        "rfq_id": 16
      },
      {
        "id": 186,
        "email": "m2@G.COM",
        "rfq_id": 16
      },
      {
        "id": 187,
        "email": "kar@gmail.com",
        "rfq_id": 16
      },
      {
        "id": 188,
        "email": "raj@gmail,com",
        "rfq_id": 16
      },
      {
        "id": 189,
        "email": "udederson@gmail.com",
        "rfq_id": 16
      },
      {
        "id": 190,
        "email": "m2@G.COM",
        "rfq_id": 311
      },
      {
        "id": 191,
        "email": "d@c.com",
        "rfq_id": 311
      },
      {
        "id": 192,
        "email": "z@g.com",
        "rfq_id": 311
      },
      {
        "id": 193,
        "email": "xylene8@gmail.com",
        "rfq_id": 311
      },
      {
        "id": 194,
        "email": "raj@gmail,com",
        "rfq_id": 311
      },
      {
        "id": 195,
        "email": "kar@gmail.com",
        "rfq_id": 311
      },
      {
        "id": 196,
        "email": "varunram.66@gmail.com",
        "rfq_id": 311
      },
      {
        "id": 197,
        "email": "xylene8@gmail.com",
        "rfq_id": 309
      },
      {
        "id": 198,
        "email": "varunram.66@gmail.com",
        "rfq_id": 161
      },
      {
        "id": 199,
        "email": "varunram.66@gmail.com",
        "rfq_id": 375
      },
      {
        "id": 200,
        "email": "varunram.66@gmail.com",
        "rfq_id": 376
      },
      {
        "id": 201,
        "email": "varunram.66@gmail.com",
        "rfq_id": 377
      },
      {
        "id": 202,
        "email": "varunram.66@gmail.com",
        "rfq_id": 379
      },
      {
        "id": 203,
        "email": "varunram.66@gmail.com",
        "rfq_id": 380
      },
      {
        "id": 204,
        "email": "varunram.66@gmail.com",
        "rfq_id": 381
      },
      {
        "id": 205,
        "email": "varunram.66@gmail.com",
        "rfq_id": 324
      },
      {
        "id": 206,
        "email": "varunram.66@gmail.com",
        "rfq_id": 17
      },
      {
        "id": 207,
        "email": "varunram.66@gmail.com",
        "rfq_id": 18
      },
      {
        "id": 208,
        "email": "varunram.66@gmail.com",
        "rfq_id": 240
      },
      {
        "id": 211,
        "email": "mdatif796@gmail.com",
        "rfq_id": 17
      },
      {
        "id": 212,
        "email": "varunram.66@gmail.com",
        "rfq_id": 385
      },
      {
        "id": 213,
        "email": "mdatif796@gmail.com",
        "rfq_id": 385
      }
    ],

  }

  const [selectedRfqs, setSelectedRfqs] = useState(null);

  const { rfq_senttos, prefixes, rfq_products } = data

  // const [{ vendors }, { error: getVendorsError }] = usePaginatedQuery(getVendors, {
  //   orderBy: { vendor_id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })

  const vendors = [
    {
      "vendor_id": 1,
      "vendor_code": "DA",
      "vendor_email": "mdatif796@gmail.com",
      "vendor_city": "Panaji",
      "vendor_contact": "4562879123",
      "vendor_state": "Goa",
      "vendor_gstin": "GSTRIO783211111",
      "vendor": "Dylan Alisson",
      "address": "Rio ",
      "credit_period": "411",
      "lead_time": "471",
      "status": 0
    },
    {
      "vendor_id": 2,
      "vendor_code": "UE",
      "vendor_email": "udederson@gmail.com",
      "vendor_city": "Manuguru",
      "vendor_contact": "8956237845",
      "vendor_state": "Andhra Pradesh",
      "vendor_gstin": "GSTMAN012541111",
      "vendor": "Ud Ederson",
      "address": "Manaus",
      "credit_period": "5",
      "lead_time": "4",
      "status": 1
    },
    {
      "vendor_id": 3,
      "vendor_code": "TE",
      "vendor_email": "thomasEdison@gmail.com",
      "vendor_city": "Miraj",
      "vendor_contact": "8954236172",
      "vendor_state": "Maharashtra",
      "vendor_gstin": "GSTMIL009222222",
      "vendor": "Thomas Edison",
      "address": "Milan",
      "credit_period": "4",
      "lead_time": "4",
      "status": 0
    },
    {
      "vendor_id": 4,
      "vendor_code": "KM",
      "vendor_email": "kamehameha@gmail.com",
      "vendor_city": "Tonk",
      "vendor_contact": "7856124391",
      "vendor_state": "Rajasthan",
      "vendor_gstin": "GSTTK0097811111",
      "vendor": "Kamehameha",
      "address": "Tokyo",
      "credit_period": "7",
      "lead_time": "4",
      "status": 1
    },
    {
      "vendor_id": 5,
      "vendor_code": "RH",
      "vendor_email": "rahul@gmail.com",
      "vendor_city": "Dumka",
      "vendor_contact": "4556788925",
      "vendor_state": "Jharkhand",
      "vendor_gstin": "GSTDUB012541111",
      "vendor": "Rahul",
      "address": "Dubai",
      "credit_period": "3",
      "lead_time": "4",
      "status": 1
    },
    {
      "vendor_id": 123,
      "vendor_code": "VJ",
      "vendor_email": "varunram.66@gmail.com",
      "vendor_city": "Bangalore",
      "vendor_contact": "7892496089",
      "vendor_state": "Karnataka",
      "vendor_gstin": "GSTN97313398111",
      "vendor": "Varun",
      "address": "Hennur",
      "credit_period": "12",
      "lead_time": "21",
      "status": 0
    },
    {
      "vendor_id": 133,
      "vendor_code": "iotif",
      "vendor_email": "iot@gmail.com",
      "vendor_city": "Gopalganj",
      "vendor_contact": "4567892567",
      "vendor_state": "Bihar",
      "vendor_gstin": "GSTO14562398745",
      "vendor": "TIF",
      "address": "banglore",
      "credit_period": "10",
      "lead_time": "12",
      "status": 0
    },
    {
      "vendor_id": 134,
      "vendor_code": "KR",
      "vendor_email": "kar@gmail.com",
      "vendor_city": "Cambay",
      "vendor_contact": "8987634523",
      "vendor_state": "Gujarat",
      "vendor_gstin": "GSTI87640111111",
      "vendor": "Karan",
      "address": "12th street ",
      "credit_period": "4",
      "lead_time": "5",
      "status": 1
    },
    {
      "vendor_id": 135,
      "vendor_code": "RA",
      "vendor_email": "raj@gail.com",
      "vendor_city": "banglor",
      "vendor_contact": "1546237964",
      "vendor_state": "Karnataka",
      "vendor_gstin": "GSTI14254572222",
      "vendor": "Raj",
      "address": "11th street",
      "credit_period": "11",
      "lead_time": "12",
      "status": 1
    },
    {
      "vendor_id": 147,
      "vendor_code": "FK",
      "vendor_email": "xylene8@gmail.com",
      "vendor_city": "Salur",
      "vendor_contact": "4567891238",
      "vendor_state": "Andhra Pradesh",
      "vendor_gstin": "GSTIN6786543467",
      "vendor": "Frank",
      "address": "11",
      "credit_period": "11",
      "lead_time": "11",
      "status": 1
    },
    {
      "vendor_id": 168,
      "vendor_code": "z",
      "vendor_email": "z@g.com",
      "vendor_city": "Chirala",
      "vendor_contact": "1456987856",
      "vendor_state": "Andhra Pradesh",
      "vendor_gstin": "145698712345698",
      "vendor": "z",
      "address": "asd",
      "credit_period": "45",
      "lead_time": "56",
      "status": 1
    },
    {
      "vendor_id": 170,
      "vendor_code": "asq",
      "vendor_email": "d@c.com",
      "vendor_city": "Wanaparthy",
      "vendor_contact": "1234567894",
      "vendor_state": "Andhra Pradesh",
      "vendor_gstin": "123456789568745",
      "vendor": "q",
      "address": "sda",
      "credit_period": "12",
      "lead_time": "45",
      "status": 1
    },
    {
      "vendor_id": 171,
      "vendor_code": "m",
      "vendor_email": "m2@G.COM",
      "vendor_city": "Zahirabad",
      "vendor_contact": "1456239875",
      "vendor_state": "Andhra Pradesh",
      "vendor_gstin": "123654789632145",
      "vendor": "m",
      "address": "WSAQ",
      "credit_period": "45",
      "lead_time": "69",
      "status": 1
    },
    {
      "vendor_id": 173,
      "vendor_code": "SWD",
      "vendor_email": "SD@GMAIL.COM",
      "vendor_city": "Bellampalle",
      "vendor_contact": "7895263654",
      "vendor_state": "Andhra Pradesh",
      "vendor_gstin": "SDEF412C5D6E3S6",
      "vendor": "vj",
      "address": "STRING ",
      "credit_period": "56",
      "lead_time": "85",
      "status": 1
    },
    {
      "vendor_id": 192,
      "vendor_code": "AS",
      "vendor_email": "AS@gmail.com",
      "vendor_city": "AS",
      "vendor_contact": "AS",
      "vendor_state": "AS",
      "vendor_gstin": "AS",
      "vendor": "AS",
      "address": "AS",
      "credit_period": "AS",
      "lead_time": "AS",
      "status": 1
    }
  ]
  // const [{ vendor_products }, { error: getVendorsProductsError }] = usePaginatedQuery(
  //   getVendor_products,
  //   {
  //     orderBy: { vp_id: "asc" },
  //     skip: ITEMS_PER_PAGE * page,
  //     take: ITEMS_PER_PAGE,
  //   }
  // )

  // const [{ prefixes }, { error: getPrefixesError }] = useQuery(getPrefixes, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })


  // const [{ rfq_senttos }, { error: getRfq_senttosError }] = useQuery(getRfq_senttos, {
  //   orderBy: { id: "asc" },
  // })


  // const [{ agreement_terms: rfqTerms }, { error: agreementTermsError }] = useQuery(
  //   getAgreement_terms,
  //   {
  //     where: { for: "rfq" },
  //     orderBy: { id: "asc" },
  //   }
  // )




  const [sendDialog, setSendDialog] = useState(false)
  const [createRFQMutation, { isLoading: creatingRfq, error: createRFQMutationError }] =
    useMutation(createRfq)
  const [updateRFQMutation, { isLoading: updatingRfq, error: updateRFQMutationError }] =
    useMutation(updateRfq)
  const [createNotificationsMutations] = useMutation(createNotifications_sent)
  const [createRFQProductMutation] = useMutation(createManyRfq_products)
  const [deleteRFQProductMutation] = useMutation(deleteRfq_product)
  const [deleteRFQMutation] = useMutation(deleteRfq)
  const [createManyPurchaseOrderProductsMutation] = useMutation(createManyPurchase_order_product)
  // const [updateManyRfqProductsMutation] = useMutation(updateManyRfq_products)
  const [updateRfqProductMutation] = useMutation(updateRfq_product)
  const [createPurchaseOrderMutation] = useMutation(createPurchase_order)

  //   {
  //     "id": 3,
  //     "name": "Machine Tools",
  //     "sku": "tif-001",
  //     "description": "Machine Tools update::",
  //     "length": null,
  //     "width": null,
  //     "height": null,
  //     "weight": null,
  //     "color": null,
  //     "hsnCode": null,
  //     "imageUrl": null,
  //     "createdAT": null,
  //     "updatedAT": null,
  //     "customDuty": null,
  //     "gstTaxTypeCode": null,
  //     "taxCalcType": null,
  //     "status": "Active",
  //     "category": null,
  //     "brand": null
  // }
  const productOptions = products.map(
    ({ id, name, sku, vendor_products, costPrice }) => {
      return {
        name: `${sku} - ${name}`,
        id,
        // vendorID: vendor_products?.map((ele) => ele.vendor_vendor_id),
        costPrice
      }
    }
  )
  const [productsSuggestions, setProductsSuggestions] = useState<any>(null)
  const searchProducts = createSearchFunction(productOptions, setProductsSuggestions)
  const menu = useRef<Menu>(null)
  const toast = useRef(null)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [rfqDialog, setRfqDialog] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const [purchaseDialog, setPurchaseDialog] = useState(false)
  const [purchaseProductOption, setPurchaseProductOption] = useState([])
  // const [vendorChangeState, setVendorChangeState] = useState(false)
  const [newRFQCode, setNewRFQCode] = useState("")
  const initialRfqState = {
    rfqNumber: "",
    rfq_description: "",
    expectedDod: "",
    rfq_email: null,
    itemsLength: false,
    agreement: "",
    id: "",
    status: "Created"
  }
  const [rfqDetails, setRfqDetails] = useState(initialRfqState)
  const [rfqEditState, setRfqEditState] = useState(false)
  const [readOnlyForm, setReadOnlyForm] = useState(true)
  const [activeRfqId, setActiveRfqId] = useState("")
  // const [productItemList, setProductItemList] = useState([
  //   {
  //     purchase_order_po_id: "",
  //     purchase_order_purchase_order_status_pos_id: 1,
  //     purchase_order_vendor_vendor_id: "",
  //     vendor_products_vp_id: "",
  //     vendor_products_vendor_vendor_id: "",
  //     vendor_products_products_product_id: "",
  //     quantity: "",
  //     price_per_unit: "",
  //     received_quantity: 0,
  //     product_name: "",
  //     vendor_unit_: "",
  //     product_id: "",
  //   },
  // ])

  const initialItemList = {
    product_id: "",
    quantity: "",
    costPrice: "",
    product_name: "",
    last_po_price: "-",
    last_vendor: "",
    avg_price: "-",
  }

  const [itemList, setItemList] = useState([
    {
      ...initialItemList,
    },
  ])
  const initialPoItemState = {
    purchase_order_po_id: "",
    purchase_order_purchase_order_status_pos_id: 1,
    purchase_order_vendor_vendor_id: "",
    vendor_products_vp_id: "",
    vendor_products_vendor_vendor_id: "",
    vendor_products_products_product_id: "",
    quantity: "",
    price_per_unit: "",
    received_quantity: 0,
    products_product_id: "",
    product_name: "",
  }
  const [poItemList, setPoItemList] = useState([initialPoItemState])

  const [activeRfq, setActiveRfq] = useState([])
  const [purchaseDetails, setPurchaseDetails] = useState({
    vendor_vendor_id: "",
    po_code: "",
    po_description: "",
    expiry_date: "",
    expected_delivery: "",
    from_party: "",
    agreement: "",
    rfq_id: null,
  })
  const [activeRow, setActiveRow] = useState({})

  const [mailDetails, setMailDetails] = useState({
    to: [],
    subject: "",
    message: "",
  })
  const [expandedRows, setExpandedRows] = useState(null)
  const [currentRfqitemsID, setCurrentRfqitemsID] = useState([])
  const [rfqErrorMsgs, setRfqErrorMsgs] = useState([])
  const [RFQCodechecked, setRFQCodeChecked] = useState<boolean>(true)
  const [scanner, setScanner] = useState<boolean>(false)
  const scrollToRfq = useRef<HTMLHeadingElement>(null)
  const [rfqStatusSuggestions, setrfqStatusSuggestions] = useState<any>(null)

  const rfqStatus = ["Created", "Processing", "Completed"]
    .map((term) => ({ name: term, value: term }))

  const searchStatus = createSearchFunction(rfqStatus, setrfqStatusSuggestions)

  // const tableRfqProducts = rfq_products?.map((ele) => {
  //   return {
  //     ...ele,
  //     product_name: ele.products.name,
  //     product_sku: ele.products.products_sku,
  //   }
  // })
  const statuses = ["1", "0"]

  // const termsOptions = rfqTerms.map((ele) => ele.name)
  const dateFilterTemplate = (options) => {
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
  // const statusFilterTemplate = (options) => {
  //
  //   return (
  //     <Dropdown
  //       value={options.value}
  //       options={statuses}
  //       onChange={(e) => options.filterCallback(e.value, options.index)}
  //       itemTemplate={statusItemTemplate}
  //       placeholder="Select a Status"
  //       className="p-column-filter"
  //       showClear
  //     />
  //   )
  // }
  const statusItemTemplate = (option) => {
    return (
      <span className={`badge status-${option === "1" ? "active" : "inactive"}`}>
        {option === "1" ? "Active" : "Closed"}
      </span>
    )
  }

  // const termsFilterTemplate = (options) => {
  //
  //   return (
  //     <Dropdown
  //       value={options.value}
  //       options={termsOptions}
  //       onChange={(e) => options.filterCallback(e.value, options.index)}
  //       itemTemplate={termsItemTemplate}
  //       placeholder="Select a Status"
  //       className="p-column-filter"
  //       showClear
  //     />
  //   )
  // }
  const termsItemTemplate = (option) => {
    return <span>{option}</span>
  }
  const columns = [
    {
      field: "rfqNumber",
      header: "RFQ No.",
      filter: true,
      filterPlaceholder: "Search by Code",
    },
    {
      field: "description",
      header: "Description",
      filter: true,
      filterPlaceholder: "Search by Description",
    },
    {
      field: "createdAt",
      header: "Created at",
      filterField: "createdAt",
      filter: true,
      filterElement: dateFilterTemplate,
      dataType: "date",
      // body: (rowData) => moment(new Date(rowData.createdAt)).format("DD-MM-YYYY, HH:MM"),
      body: (rowData) => dateFormat(rowData.createdAt),
    },
    {
      // field: "updatedAt",
      header: "updatedAt",
      filterField: "Updated at",
      filter: true,
      filterElement: dateFilterTemplate,
      dataType: "date",
      // body: (rowData) => moment(new Date(rowData.updatedAt)).format("DD-MM-YYYY, HH:MM"),
      body: (rowData) => dateFormat(rowData.createdAt),
    },
    {
      field: "status",
      header: "Status",
      filter: true,
      // body: (rowData) => (
      //   <span>
      //     {rowData.status}
      //   </span>
      // ),
      // filterElement: statusFilterTemplate,
      filterPlaceholder: "Search by status"
    },
    // {
    //   field: "rfq_sentto",
    //   header: "Vendors",
    //   // filter: true,
    //   body: (rowData) => {
    //

    //     const sentMails = rowData.rfq_sentto?.map((ele) => ele.email)
    //     const uniqueMails = [...new Set(sentMails)]
    //

    //     const sentVendors = vendors
    //       .filter((ele, i) => uniqueMails.includes(ele.vendor_email))
    //       .map((ele) => ele.vendor)
    //     return (
    //       <div className="tooltip-pr">
    //         <span className="tooltiptext-pr">{sentVendors.join(" , ")}</span>
    //       </div>
    //     )
    //   },
    // },
    // {
    //   field: "agreement_terms_id",
    //   header: "Terms",
    //   filter: true,
    //   body: (rowData) => {
    //

    //     return <span>{rowData.agreement_terms.name}</span>
    //   },
    //   filterPlaceholder: "Search by Terms",
    //   filterElement: termsFilterTemplate,
    // },
  ]
  const [selectedColumns, setSelectedColumns] = useState(columns)

  //

  const LatestPO = (poList, num) => {
    // get all the po
    // serach the po from last for selected product and get the price

    const lastProductPrice = poList.find((ele) =>
      ele.purchase_order_products.find((ele) => ele.vendor_products_products_product_id === num)
    )

    // const {
    //   // vendor: { vendor },
    //   purchase_order_products,
    //   // po_id,
    // } = lastProductPrice

    const vendor = lastProductPrice?.vendor?.vendor
    const po_id = lastProductPrice?.po_id
    const prod_price = lastProductPrice?.purchase_order_products?.find(
      (ele) => ele.vendor_products_products_product_id === num
    ).price_per_unit

    const data = {
      po_id,
      vendor: vendor || "NA",
      prod_price,
    }
    console.log

    return data
  }
  const AverageCostPrice = (poList, num) => {
    // get all the po

    const productPos = poList.filter((ele) =>
      ele.purchase_order_products.some((item) => item.vendor_products_products_product_id === num)
    )

    const totalPrice = productPos.reduce((acc, ele) => {
      let matchingProducts = ele.purchase_order_products.filter(
        (product) => product.vendor_products_products_product_id === num
      )
      return acc + matchingProducts.reduce((acc, product) => acc + product.price_per_unit, 0)
    }, 0)

    const avgPrice = totalPrice / productPos.length

    //

    return avgPrice
  }

  // useEffect(() => {
  //   const active = tableRfqProducts.filter(({ rfq_id }) => {
  //     return Number(rfq_id) === Number(activeRfqId)
  //   })
  //   const activeProducts = active.map(({ products }) => {
  //     return products.product_id
  //   })

  //   const activeProductsdetails = vendor_products

  //     .filter(({ products, vendor }) => {
  //       return (
  //         activeProducts.includes(products.product_id) &&
  //         Number(vendor.vendor_id) === Number(purchaseDetails.vendor_vendor_id)
  //       )
  //     })
  //     .map((ele) => {
  //       return {
  //         purchase_order_po_id: "",
  //         purchase_order_purchase_order_status_pos_id: 1,
  //         purchase_order_vendor_vendor_id: ele.vendor.vendor_id,
  //         vendor_products_vp_id: ele.vp_id,
  //         vendor_products_vendor_vendor_id: ele.vendor.vendor_id,
  //         vendor_products_products_product_id: ele.products.product_id,
  //         quantity: "",
  //         price_per_unit: ele.unit_price,
  //         received_quantity: 0,
  //         product_name: ele.products.name,
  //         vendor_unit_price: ele.unit_price,
  //         product_id: ele.products.product_id,
  //       }
  //     })

  //   // setProductItemList(activeProductsdetails)
  // }, [vendorChangeState])

  const tableRFQ = rfqs.map((ele) => {
    //
    return {
      ...ele,
      // created_at: moment(ele.createdAt).format("DD-MM-YYYY, HH:MM"),
      // updated_at: moment(ele.updatedAt).format("DD-MM-YYYY, HH:MM"),
      // name: ele.products.name,
    }
  })

  const options = vendors.map(({ vendor, vendor_id, vendor_code }) => {
    return {
      name: ` ${vendor_code}: ${vendor}`,
      value: vendor_id,
    }
  })
  // const optionsForVendorEmails = vendors.map(({ vendor, vendor_email, vendor_code }) => {
  //   return {
  //     name: ` ${vendor_code}: ${vendor}`,
  //     value: vendor_email,
  //   }
  // })


  const optionsForVendorEmails = emails.map(({ id, email }) => {
    return {
      name: email,
      value: id,
    }
  })

  const findEmailId = (mail) => {
    const ID = emails?.find(({ email }) => mail === email)?.id
    return ID
  }




  const rfqOptions = rfqs.map(({ rfqNumber, rfq_description, id }) => {
    return {
      name: `${rfqNumber}: ${rfq_description}`,
      value: id,
    }
  })

  const createNewRFQCode = () => {
    const nextRfqId = rfqs.length + 1
    setNewRFQCode(`RFQ#${nextRfqId}`)
  }

  const [vendorOptions, setVendorOptions] = useState(options)
  const [vendorEmailOptions, setVendorEmailOptions] = useState(optionsForVendorEmails)
  const [vendorEmailSuggestions, setVendorEmailSuggestions] = useState<any>(null)

  const [filters, setFilters] = useState({})
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

      rfqNumber: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      description: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      updatedAt: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      createdAt: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      active: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      agreement_terms_id: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      status: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    })
    setGlobalFilterValue("")
  }

  // col Toggle

  const onColumnToggle = (event) => {

    let selectedColumns = event.value

    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.header === col.header)
    )
    setSelectedColumns(orderedSelectedColumns)

  }
  const columnComponents = selectedColumns.map((col) => {
    const { field, filterField, dataType, body, header, filter, filterPlaceholder, filterElement } =
      col
    return (
      <Column
        key={field}
        field={field}
        header={header}
        filter={filter}
        filterPlaceholder={filterPlaceholder}
        filterField={filterField}
        filterElement={filterElement ? filterElement : false}
        body={body}
        dataType={dataType}
      />
    )
  })

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <div>
          <MultiSelect
            value={selectedColumns}
            options={columns}
            optionLabel="header"
            onChange={onColumnToggle}
            style={{ width: "20em" }}
          />
        </div>
        <div className="flex">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Keyword Search"
            />
          </span>
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Clear"
            className="p-button-outlined"
            onClick={clearFilter}
          />
          {/* <Button
            icon="pi pi-sync"
            className="m-1"
            onClick={async (e) => {

            }}
            tooltip="Update Status" /> */}

        </div>
      </div>
    )
  }
  const header1 = renderHeader()

  const addFields = () => {
    let newfield = initialItemList

    setItemList([...itemList, newfield])
  }
  const removeFields = (index) => {
    setItemList(itemList.filter((data, i) => index !== i))
  }
  const [itemsList, setItemsList] = useState<any>(null)
  // const addFieldsPurchase = () => {
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
  //     product_name: "",
  //     vendor_unit_: "",
  //     product_id: "",
  //   }

  //   setProductItemList([...productItemList, newfield])
  // }
  // const removeFieldsPurchase = (index) => {
  //   let data = [...productItemList]
  //   const data2 = data.splice(index, 1)

  //   setProductItemList(data2)
  // }
  const handleFormChange = (e: any, i: number) => {
    let data = [...itemList]
    e.target ? (data[i][e.target.name] = e.value) : (data[i][e.originalEvent.target.name] = e.value)
    setItemList(data)
  }

  //

  // const setRfqItemList = () => {
  //   const active = tableRfqProducts
  //     .filter(({ rfq_id }) => {
  //       return rfq_id === activeRow.id
  //     })
  //     .map(({ products, quantity, price_per_unit, rfq_products_id }) => {
  //       return {
  //         products_product_id: products.product_id,
  //         quantity: quantity,
  //         price_per_unit: price_per_unit,
  //         rfq_products_id,
  //       }
  //     })
  //   setItemList(active)
  // }
  // const setPoItems = () => {
  //   const active = tableRfqProducts
  //     .filter(({ rfq_id }) => {
  //       return rfq_id === activeRow.id
  //     })
  //     .map(({ products, quantity, price_per_unit, rfq_products_id, product_name }) => {
  //       return {
  //         ...initialPoItemState,
  //         products_product_id: products.product_id,
  //         quantity,
  //         price_per_unit,
  //         rfq_products_id,
  //         product_name: `${products.products_sku} - ${products.name}`,
  //       }
  //     })
  //   setPoItemList(active)
  // }

  //

  const items = [
    {
      label: "Options",
      items: [
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: async () => {
            const expectedDod = new Date(activeRow.expectedDod)
            setRfqEditState(true)
            await formik.setValues({
              rfqNumber: activeRow.rfqNumber,
              rfq_description: activeRow.rfq_description,
              expectedDod,
              id: activeRow.id,
              itemsLength: true,
              terms: activeRow.agreement_terms,
            })
            // setRfqDetails({
            //   rfqNumber: activeRow.rfqNumber,
            //   rfq_description: activeRow.rfq_description,
            //   expectedDod: activeRow.expectedDod,
            //   id: activeRow.id,
            // })
            // const active = tableRfqProducts
            //   .filter(({ rfq_id }) => {
            //     return rfq_id === activeRow.id
            //   })
            //   .map(({ products, quantity, price_per_unit, rfq_products_id }) => {
            //     return {
            //       products_product_id: products.product_id,
            //       quantity: quantity,
            //       price_per_unit: price_per_unit,
            //       rfq_products_id,
            //       product_name: `${products.products_sku} - ${products.name}`,
            //     }
            //   })

            //
            //
            // setItemList(active)
            setRfqDialog(true)
            scrollToRfq.current?.scrollIntoView()
          },
        },
        // {
        //   label: "Delete",
        //   icon: "pi pi-trash",
        //   command: async () => {
        //     // await deleteRFQProductMutation({ rfq_id: activeRow.id })
        //     // await deleteRFQMutation({ id: activeRow.id })
        //     // await refetch()
        //   },
        // },
        // {
        //   label: "View Products",
        //   icon: "pi pi-external-link",
        //   command: () => {
        //     const active = tableRfqProducts.filter(({ rfq_id }) => {
        //       return rfq_id === activeRow.id
        //     })
        //     //
        //     setActiveRfq(active)
        //     setProductDialog(true)
        //   },
        // },
        {
          label: "Create PO",
          icon: "pi pi-plus",
          command: () => {
            // setPoItems()
            // setRfqItemList()
            // scrollToRfq?.current?.scrollIntoView()
            // setPurchaseDialog(true)
            ;
          },
        },
        {
          label: "Send RFQ",
          icon: "pi pi-send",
          command: () => {
            setSendDialog(true)
            setRfqDetails({ ...rfqDetails, rfq_email: [] })
          },
        },
        {
          label: "Update-Status",
          icon: "pi pi-refresh",
          command: async (e) => {
            const active = activeRow.active === 0 ? 1 : 0
            await updateRFQMutation(
              {
                id: activeRow.id,
                active,
              },
              {
                onSuccess: async (data) => {
                  const rfqNumber = data?.rfqNumber
                  const status = active ? "Active" : "Inactive"

                  toast?.current.show(
                    tsuccess("Updated", `${rfqNumber} is now ${status}`),
                    await createNotificationsMutations({
                      user_id: id,
                      user_name: name,
                      user_email: email,
                      mutations: `${rfqNumber} is now ${status}`,
                      created_at: new Date().toString(),
                    })
                  )
                },
              }
            )
            await refetch()
          },
        },
        {
          label: "download csv",
          icon: "pi pi-send",
          command: () => {


            const rfq_prods = activeRow?.rfq_products

            // return

            const csvHeader = "Sl No,SKU,Item,Image,Qty,Cost Price,Target Price\n"

            const csvBody = rfq_prods.map((ele, i) => {
              const {
                quantity,
                price_per_unit,
                products_product_id: productId,
                products: { name: item, description, products_sku: sku },
              } = ele
              const price = LatestPO(purchase_orders, productId).prod_price

              return [i + 1, sku, item, "IMAGE", quantity, price, price_per_unit].toString() + "\n"
            })
            const csvData = csvHeader + csvBody.join("")
            const name = activeRow?.rfqNumber


            createCSV(csvData, name)
          },
        },
      ],
    },
  ]
  //
  const rowExpansionTemplate = (data) => {
    return (
      <div className="w-full expandTable">

        <h3>Sent To:</h3>
        {data.rfq_sentto.map(({ emails: { email } }, i) => <Chip className="mr-3" key={i} label={email} />)}
        <h3>Products List:</h3>
        <DataTable
          value={data.rfq_products}
          responsiveLayout="scroll"
          showGridlines
          // header={renderHeader}
          stripedRows
          className="text-s datatable-responsive"

        // paginator
        // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
        // rows={PAGINATION_VARIABLES.rows}
        // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
        // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
        >
          {/* <Column field="rfq_products_id" header="ID" style={{ paddingTop: "0.5rem" }} /> */}
          <Column field="products.imageUrl" header="Image" body={(rowdata) => <img src={rowdata?.products?.imageUrl} alt="Product Image" height="100" width="100" />} />
          <Column
            field="products.sku"
            header="Product SKU"
          // className="text-center"
          />
          <Column
            field=""
            header="PO"
            body={() => <a href='/purchase_orders/id'>PO Num </a>}
          // className="text-center"
          />

          <Column
            field="products.name"
            header="Name"
          // className="text-center"
          />
          <Column
            field="price"
            header="Target Price / Unit"
          // className="text-center"
          />
          <Column
            field="quantity"
            header="Quantity"
          // className="text-center"
          />
        </DataTable>
      </div>
    )
  }

  const formik = useFormik({
    initialValues: rfqDetails,
    validationSchema: Yup.object().shape({
      // rfqNumber: Yup.string().required("*Required"),
      // rfq_description: Yup.string().required("*Required"),
      // expectedDod: Yup.mixed().required("*Required"),
      // terms: Yup.mixed().required("*Required"),
      itemsLength: Yup.boolean().equals([true], "⚠ Please select atleast one product").required(),

    }),
    onSubmit: async (data) => {
      console.log('formdata: ', data);


      const selectedProducts = itemList.filter((prod) => prod?.product_id)

      if (selectedProducts.length === 0) {
        const msg = {
          message: "You should at least select 1 product from the select products List ",
        }
        setRfqErrorMsgs([...rfqErrorMsgs, msg])
        return
      }
      const { rfqNumber, rfq_description, rfq_email, expectedDod, agreement, status } = data
      const rfqToMails = rfq_email?.length
        ? rfq_email?.map(({ name }, i) => name) : null

      // const dateToString = expectedDod.toString()
      const sentoEmails = rfq_email?.length
        ? rfq_email?.map((mail, i) => ({
          emails: {
            connect: {
              id: mail?.value ?? findEmailId(mail)
            }
          }
        }))
        : undefined

      if (rfqEditState) {

        if (activeRow?.rfq_sentto?.length === 0) {


          const newProductList = itemList.filter((item) => !item.rfq_products_id)
          const removemail = { ...rfqDetails }
          const delProductList = currentRfqitemsID.filter(
            (x) => !itemList.map(({ rfq_products_id }) => rfq_products_id).includes(x)
          )
          delete removemail.rfq_email

          try {
            const updatRfqStatus = updateRFQMutation({
              id: activeRow.id,
              rfqNumber,
              description: rfq_description,
              expectedDod,
              agreement,
              rfq_products: {
                create: newProductList.map((ele) => ({
                  price: Number(ele.costPrice),
                  quantity: Number(ele.quantity),
                  products: {
                    connect: {
                      id: Number(ele.product_id),
                    },
                  },
                })),
                updateMany: itemList.map((ele) => ({
                  where: {
                    id: ele.rfq_products_id,
                  },
                  data: {
                    price: Number(ele.costPrice),
                    quantity: Number(ele.quantity),
                  },
                })),
                deleteMany: {
                  id: {
                    in: delProductList,
                  },
                },
              },
            }, {
              onSuccess: async (data) => {
                const rfqNumber = data?.rfqNumber
                toast?.current.show(
                  tsuccess("Updated", `${rfqNumber} is now updated sucessfully`),
                  // await createNotificationsMutations({
                  //   user_id: id,
                  //   user_name: name,
                  //   user_email: email,
                  //   mutations: `${rfqNumber} is Updated`,
                  //   created_at: new Date().toString(),
                  // })
                  setActiveRow({})
                )
                await refetch()
                setRfqDialog(false)
                formik.resetForm()
              },
              onError: (data) => {
                const rfqNumber = data?.rfqNumber
                toast?.current.show(
                  tError("Updated", `${rfqNumber} Could not Update`),
                )
              },
            })
          } catch (error) {

          }
        } else {

          try {
            const newRfqData = await createRFQMutation(
              {
                rfqNumber,
                description: rfq_description,
                expectedDod,
                status: "Created",
                agreement,
                rfq_products: {
                  create: selectedProducts.map((ele) => ({
                    price: Number(ele.costPrice),
                    quantity: Number(ele.quantity),
                    products: {
                      connect: {
                        id: Number(ele.product_id),
                      },
                    },
                  })),
                },
                rfq_sentto: {
                  create: sentoEmails
                },
                rfq: {
                  connect: {
                    id: activeRow?.id
                  }
                }
              },
              {
                onSuccess: async (data) => {
                  const rfqNumber = data?.rfqNumber
                  toast?.current?.show(tsuccess(null, `${rfqNumber} created successfully.`))
                  await refetch()
                  setRfqDialog(false)
                  formik.resetForm()

                },
              }
            )
          } catch (error) {
            console.log('rfq Amending error: ', error);

          }
        }


      } else {
        // removing emptyFields
        try {
          const newRfqData = await createRFQMutation(
            {
              rfqNumber,
              description: rfq_description,
              expectedDod,
              status: "Created",
              agreement,
              rfq_products: {
                create: selectedProducts.map((ele) => ({
                  price: Number(ele.costPrice),
                  quantity: Number(ele.quantity),
                  products: {
                    connect: {
                      id: Number(ele.product_id),
                    },
                  },
                })),
              },
              rfq_sentto: {
                // create: [{
                //   emails: {
                //     connect: {
                //       id: 3
                //     }
                //   }
                // }, {
                //   emails: {
                //     connect: {
                //       id: 2
                //     }
                //   }
                // }]
                create: sentoEmails

              },
            },
            {
              onSuccess: async (data) => {
                const rfqNumber = data?.rfqNumber
                toast?.current?.show(tsuccess(null, `${rfqNumber} created successfully.`))
                await refetch()
                setRfqDialog(false)
                formik.resetForm()

                // await createNotificationsMutations({
                //   user_id: id,
                //   user_name: name,
                //   user_email: email,
                //   mutations: `${rfqNumber} is Created`,
                //   created_at: new Date().toString(),
                // })
              },
            }
          )
        } catch (error) {
          console.log("rfq_CreationError :", error)
        }
      }

    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const emailsuggestions = createSearchFunction(optionsForVendorEmails, setVendorEmailSuggestions)

  useEffect(() => {
    const currentItemsIds = itemList.map(({ rfq_products_id }) => rfq_products_id)
    setCurrentRfqitemsID([...currentItemsIds])
  }, [rfqDialog])

  useEffect(() => {
    //to rerender from while working with item list
    ; (async () => {
      await formik.setValues({ ...formik.values })
    })()
      .catch((error) => console.log(error))
  }, [itemList, rfqDialog])

  useEffect(() => {
    const ErrorArray = [
      updateRFQMutationError,
      createRFQMutationError,
      rfqError,
      productsError,
      // getRfq_senttosError,
      // getPrefixesError,
      // getVendorsProductsError,
      // getVendorsError,
      // getRfq_productsError,
    ]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setRfqErrorMsgs(msg)
  }, [
    updateRFQMutationError,
    createRFQMutationError,
    rfqError,
    productsError,
    // getRfq_senttosError,
    // getPrefixesError,
    // getVendorsProductsError,
    // getVendorsError,
    // getRfq_productsError,
  ])

  const allowExpansion = (rowData) => {
    // return rowData.orders.length > 0;
    return true
  }

  const removeErrorBox = (i) => {
    const msgArray = [...rfqErrorMsgs]
    msgArray.splice(i, 1)
    setRfqErrorMsgs(msgArray)
  }
  // useEffect(() => {
  //   if (RFQCodechecked && rfqDialog) {
  //     updateFormValues()
  //       .catch((error) => {
  //         console.log("From updateFormValues", error)
  //       })
  //   }
  // }, [RFQCodechecked, scanner])

  const updateFormValues = async () => {
    await formik.setValues({ ...formik.values, rfqNumber: newRFQCode })
  }

  // useEffect(() => {
  //   // RFQCodechecked
  //   //   ? setRfqDetails({
  //   //       ...rfqDetails,
  //   //       rfqNumber: newRFQCode,
  //   //     })
  //   //   : null
  // }, [RFQCodechecked])

  useEffect(() => {
    createNewRFQCode()
  })

  useEffect(() => {
    initFilters()
  }, [])

  return (
    <div ref={scrollToRfq} className="grid w-full mr-0">
      <Toast ref={toast} />
      {(updatingRfq || creatingRfq) && <LoaderFullScreen />}
      <Dialog
        header="Send Quotation"
        visible={sendDialog}
        style={{ width: "50vw" }}
        onHide={() => setSendDialog(false)}
      >


        <span className="p-float-label w-full">
          <h2>Emails</h2>
          <AutoComplete
            style={{ minWidth: "33%", height: "auto" }}
            value={rfqDetails.rfq_email}
            suggestions={vendorEmailSuggestions}
            completeMethod={emailsuggestions}
            field="name"
            multiple
            onChange={(e) => setRfqDetails({ ...rfqDetails, rfq_email: e.value })}
            aria-label="Vendor-Emails"
            dropdownAriaLabel="Select Email"

          />
          <label htmlFor="autocomplete">Emails</label>
        </span>

        <div className="w-full flex justify-content-end mt-2 pl-2">
          <Button
            icon="pi pi-send"
            label="Send"
            onClick={async () => {



              // const existingEmails = rfq_senttos
              //   .filter((item) => item.rfq_id === activeRow.id)
              //   .map((item) => item.email)

              //   [
              //     {
              //         "id": 67,
              //         "email": 1,
              //         "rfq": 80,
              //         "sentOn": "2023-03-02T10:00:41.000Z",
              //         "emails": {
              //             "id": 1,
              //             "email": "varunram.66@gmail.com",
              //             "addresses": 1
              //         }
              //     },
              //     {
              //         "id": 68,
              //         "email": 3,
              //         "rfq": 80,
              //         "sentOn": "2023-03-02T10:00:41.000Z",
              //         "emails": {
              //             "id": 3,
              //             "email": "da@gmail.com",
              //             "addresses": 3
              //         }
              //     }
              // ]


              const existingEmails = activeRow?.rfq_sentto.map(({ emails: { email } }) => (email))





              const selectedEmails = rfqDetails?.rfq_email.map((email) => email.name)

              const newMails = filterExistingValues(selectedEmails, existingEmails)

              const sentoEmails = newMails?.length
                ? newMails?.map((mail, i) => ({
                  emails: {
                    connect: {
                      id: mail?.value ?? findEmailId(mail)
                    }
                  }
                }))
                : undefined


              const update = await updateRFQMutation({
                id: activeRow.id,
                rfq_sentto: {
                  create: sentoEmails
                },
              })

              const uniquerfq = rfqs.find((ele) => ele.id === activeRow.id)


              const requestData = JSON.stringify({
                data: {

                  SendtoMails: rfqDetails?.rfq_email


                  // rfq_sentto: {
                  //   create: rfqDetails?.rfq_email.length
                  //     ? rfqDetails?.rfq_email?.map((item, i) => ({ email: item }))
                  //     : undefined,
                  // },
                },
                rfq: uniquerfq,
              })
              var config = {
                method: "post",
                url: "http://localhost:3000/api/rfq",
                headers: {
                  "Content-Type": "application/json",
                  ["anti-csrf"]: antiCSRFToken,
                },
                data: requestData,
              }

              await axios(config)
                .then(setSendDialog(false))
                .catch((error) => console.log(error?.response?.data))
              // .then(function (response) {})
              // .catch(function (error) {})
            }}
          />
        </div>
      </Dialog>
      <div className="col-12">
        <div className="card flex justify-content-between align-items-center mb-2">
          <h4 className="mb-0">Request for Quotations</h4>
          <div className="flex justify-content-end align-items-center">
            <Button
              icon="pi pi-plus"
              label="Create RFQ"
              onClick={async () => {
                // const itemListWithEmptyList = Array(5).fill({
                //   products_product_id: "",
                //   quantity: "",
                //   price_per_unit: "",
                // })
                setRfqEditState(false)

                // setRfqDetails({
                //   rfqNumber: newRFQCode,
                //   rfq_description: "",
                //   expectedDod: "",
                //   rfq_email: "",
                // })

                await formik.setValues({ ...initialRfqState })

                const fiveFields = arrayFillCopy(5, initialItemList)
                setItemList(fiveFields)
                setRfqDialog(true)
                setRFQCodeChecked(true)
                setReadOnlyForm(false)
              }}
            ></Button>

          </div>
        </div>
        {rfqErrorMsgs.map((ele, i) => (
          <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
        ))}
      </div>
      {/* {activeRow && <pre>{JSON.stringify(activeRow, null, 2)}</pre>} */}
      <div
        className={`col-12 ${rfqDialog
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
          } `}
      >
        <div className={` card `}>
          <form className="p-fluid" onSubmit={formik.handleSubmit}>
            <div className="flex justify-content-between">
              <h5 className="mb-3">{`
            ${readOnlyForm ? "RFQ-Details" : rfqEditState ? "Update - RFQ" : "Create - RFQ"}
            `}</h5>

              {readOnlyForm && (
                <div>
                  <Button
                    // label="Edit"
                    icon="pi pi-pencil"
                    className="m-1"
                    onClick={async (e) => {
                      e.preventDefault()
                      setReadOnlyForm(false)
                      setRfqEditState(true)
                    }}
                    tooltip="Edit Form"
                    tooltipOptions={{ position: "top" }}
                  />
                  <Button
                    // label="Edit"
                    icon="pi pi-plus"
                    className="m-1"
                    onClick={async (e) => {
                      e.preventDefault()

                      try {
                        const rfqDetails = await invoke(getRfq, {
                          id: activeRow?.id
                        })
                        // const rfqProducts = rfqDetails?.rfq_products;
                        // const purchaseOrders = rfqDetails?.purchase_orders_purchase_orders_rfqTorfq

                        // const getpoProducts = purchaseOrders?.
                        //   flatMap(({ po_products }) => po_products)?.
                        //   map(({ vendor_products: { products: { id } } }) => id);

                        // const productsToPo = rfqProducts?.
                        //   filter(({ product }) => !getpoProducts.includes(product))

                        const productsToPo = getRemainingPoProducts(rfqDetails)

                        if (productsToPo.length) {
                          const { id, rfqNumber } = activeRow
                          const rfqdata = {
                            rfqId: id,
                            rfqNumber,
                            rfq_products: productsToPo
                          }

                          await router.push({
                            pathname: "/purchase_orders",
                            query: { rfqdata: JSON.stringify(rfqdata) },
                          });

                        } else {
                          toast?.current.show(tWarn(null, "All the products of this rfq has PO"))

                          if (activeRow.status === "Created") {
                            await updateRFQMutation(
                              {
                                id: activeRow?.id,
                                status: "Completed",
                              },
                              {
                                onSuccess: async (data) => {
                                  const rfqNumber = data?.rfqNumber
                                  const status = data?.status

                                  toast?.current.show(
                                    tsuccess("Updated", `${rfqNumber} is now ${status}`))
                                  await refetch()

                                },
                              }
                            )
                          }
                        }
                      } catch (error) {
                        console.log("Error while creating PO from RFQ", error);
                      }
                    }}
                    tooltip="Create PO"
                    tooltipOptions={{ position: "top" }}
                  />
                  <Button
                    // label="Edit"
                    icon="pi pi-send"
                    className="m-1"
                    onClick={async (e) => {
                      e.preventDefault()
                      setSendDialog(true)
                      setRfqDetails({ ...rfqDetails, rfq_email: [] })
                    }}
                    tooltip="Send RFQ"
                    tooltipOptions={{ position: "top" }}
                  />
                  {/* <Button
                    icon="bi bi-subtract"
                    className="m-1"
                    onClick={async (e) => {
                      e.preventDefault()
                      const active = activeRow.active === 0 ? 1 : 0
                      await updateRFQMutation(
                        {
                          id: activeRow.id,
                          active,
                        },
                        {
                          onSuccess: async (data) => {
                            const rfqNumber = data?.rfqNumber
                            const status = active ? "Active" : "Inactive"

                            toast?.current.show(
                              tsuccess("Updated", `${rfqNumber} is now ${status}`),
                              await createNotificationsMutations({
                                user_id: id,
                                user_name: name,
                                user_email: email,
                                mutations: `${rfqNumber} is now ${status}`,
                                created_at: new Date().toString(),
                              })
                            )
                          },
                        }
                      )
                      await refetch()
                    }}
                    tooltip="Update-Status"
                    tooltipOptions={{ position: "top" }}
                  /> */}
                  <Button
                    icon="pi pi-arrow-down"
                    className="m-1"
                    onClick={async (e) => {
                      e.preventDefault()
                      const rfq_prods = activeRow?.rfq_products
                      // return

                      const csvHeader = "Sl No,SKU,Item,Image,Qty,CostPrice,Target Price\n"

                      const csvBody = rfq_prods.map((ele, i) => {
                        const {
                          quantity,
                          price_per_unit,
                          products_product_id: productId,
                          products: { name: item, description, products_sku: sku },
                        } = ele
                        // const price = LatestPO(purchase_orders, productId).prod_price
                        const price = LatestPO(purchase_orders, productId).prod_price

                        return (
                          [i + 1, sku, item, "IMAGE", quantity, price, price_per_unit].toString() +
                          "\n"
                        )
                      })
                      const csvData = csvHeader + csvBody.join("")
                      const name = activeRow?.rfqNumber

                      createCSV(csvData, name)
                    }}
                    tooltip="Download CSV"
                    tooltipOptions={{ position: "top" }}
                  />
                </div>
              )}
            </div>
            <div className="formgrid grid p-4">
              <div className="col-12">
                {/* <h6>RFQ Details:</h6> */}
              </div>
              <div className="col-12 lg:col-4 ">
                <div className="field">
                  <span className="p-float-label ">
                    <InputText
                      id="rfqNumber"
                      name="rfqNumber"
                      value={RFQCodechecked ? "Auto Generated" : formik.values.rfqNumber}
                      onChange={formik.handleChange}
                      disabled={RFQCodechecked}
                      autoFocus
                      className={classNames({ "p-invalid": isFormFieldValid("rfqNumber") })}
                    />
                    <label
                      htmlFor="rfqNumber"
                      className={classNames({ "p-error": isFormFieldValid("rfqNumber") })}
                    >
                      RFQ Code
                    </label>
                  </span>
                  {getFormErrorMessage("rfqNumber")}
                  <div className="field-checkbox mb-5 mt-2">
                    <Checkbox
                      // style={{ width: "0.1rem", height: "0rem" }}
                      onChange={(e) => setRFQCodeChecked(e.checked)}
                      checked={RFQCodechecked}
                      disabled={rfqEditState}
                    />
                    <label
                      // htmlFor="binary"
                      className="text-sm	"
                    >
                      Un-check to add custom code.
                    </label>
                  </div>
                </div>


              </div>
              <div className="col-12 lg:col-4">
                <div className="field">
                  <span className="p-float-label">
                    <InputText
                      id="rfq_description"
                      name="rfq_description"
                      value={formik.values.rfq_description}
                      disabled={readOnlyForm}
                      onChange={formik.handleChange}
                      className={classNames({ "p-invalid": isFormFieldValid("rfq_description") })}
                      autoFocus
                    />
                    <label
                      htmlFor="rfq_description"
                      className={classNames({ "p-error": isFormFieldValid("rfq_description") })}
                    >
                      RFQ Description
                    </label>
                  </span>
                  {getFormErrorMessage("rfq_description")}
                </div>
              </div>
              <div className="col-12 lg:col-4">
                <div className="field">
                  <span className="p-float-label">
                    <Calendar
                      id="expectedDod"
                      minDate={new Date()}
                      // // value={(rfqDetails.expectedDod)}
                      // onChange={(e) =>
                      //   setRfqDetails({ ...rfqDetails, expectedDod: e.target.value?.toString() })
                      value={formik.values.expectedDod}
                      dateFormat={calenderDateFormat()}
                      disabled={readOnlyForm}
                      onChange={async (e) => {
                        await formik.setValues({
                          ...formik.values,
                          expectedDod: e.value,
                        })
                      }}
                      className={classNames({ "p-invalid": isFormFieldValid("expectedDod") })}
                    />
                    <label
                      style={{ zIndex: 10 }}
                      htmlFor="expectedDod"
                      className={classNames({ "p-error": isFormFieldValid("expectedDod") })}
                    >
                      Expected Delivery
                    </label>
                  </span>
                  {getFormErrorMessage("expectedDod")}
                </div>
              </div>

              <div className="col-12 lg:col-4">
                <div className="field">
                  <div className="p-float-label">
                    <AutoComplete
                      id="status"
                      // disabled={fieldDisable}
                      value={formik.values?.status}
                      suggestions={rfqStatusSuggestions}
                      completeMethod={searchStatus}
                      disabled={readOnlyForm}
                      dropdown
                      field="name"
                      onChange={async (e) => {
                        let status = typeof e.value === "string" ? e.value : e.value.name

                        await formik.setValues({
                          ...formik.values,
                          status
                        })

                        if (rfqEditState) {
                          try {
                            const updatRfqStatus = updateRFQMutation({
                              id: activeRow.id,
                              status,

                            }, {
                              onSuccess: async (data) => {
                                const rfqNumber = data?.rfqNumber
                                toast?.current.show(
                                  tsuccess(`Status Updated to ${status}`, `${rfqNumber} is now updated sucessfully`),

                                )
                              },
                              onError: (data) => {
                                const rfqNumber = data?.rfqNumber
                                toast?.current.show(
                                  tError("Updated", `${rfqNumber} Could not Update`),
                                )
                              },
                            })
                          } catch (error) {
                            console.log('While Updating RFQ:', error);
                          }
                        }


                      }}
                      aria-label="Agreement Terms"
                      dropdownAriaLabel="Agreement Terms"
                      className={classNames({ "p-invalid": isFormFieldValid("status") })}
                    />

                    <label
                      htmlFor="status"
                      className={classNames({ "p-error": isFormFieldValid("status") })}
                    >
                      Status
                    </label>
                  </div>
                  {getFormErrorMessage("status")}
                </div>
              </div>

              <div className="col-12 lg:col-4">
                <div className="field">
                  <span className="p-float-label">
                    <InputText
                      id="agreement"
                      name="agreement"
                      value={formik.values.agreement}
                      disabled={readOnlyForm}
                      onChange={formik.handleChange}
                      className={classNames({ "p-invalid": isFormFieldValid("agreement") })}
                      autoFocus
                    />
                    <label
                      htmlFor="agreement"
                      className={classNames({ "p-error": isFormFieldValid("agreement") })}
                    >
                      Agreement
                    </label>
                  </span>
                  {getFormErrorMessage("agreement")}
                </div>
              </div>

              <div className="col-12">
                <h6 className="mb-4">Send To Emails:</h6>
              </div>

              <span className="p-float-label w-full">
                <AutoComplete
                  // className="w-4"
                  style={{ minWidth: "33%" }}
                  value={formik.values.rfq_email}
                  suggestions={vendorEmailSuggestions}
                  completeMethod={emailsuggestions}
                  disabled={readOnlyForm || rfqEditState}
                  field="name"
                  multiple
                  onChange={async (e) => {
                    await formik.setValues({ ...formik.values, rfq_email: e.value })
                  }}
                  aria-label="Vendor-Emails"
                  dropdownAriaLabel="Select Email"
                />
                <label htmlFor="autocomplete">Emails</label>
              </span>

              <div className="col-12 mt-5">
                <h6>Select Products:</h6>
              </div>
              {itemList.map((ele, i) => (
                <>
                  <div className="col-12 grid mt-1" key={`RFQ-product-${i}`}>
                    <div className="col-12 lg:col-6">
                      <div className="field">
                        <div className="p-float-label">
                          <AutoComplete
                            id="name"
                            name="name"
                            value={ele.product_name}
                            suggestions={productsSuggestions}
                            completeMethod={searchProducts}
                            disabled={readOnlyForm}
                            //   forceSelection //
                            dropdown
                            field="name"
                            onChange={async (e) => {
                              let product_id = typeof e.value === "string" ? "" : e.value?.id
                              let name = typeof e.value === "string" ? e.value : e.value?.name
                              let costPrice = typeof e.value === "string" ? 0 : e.value?.costPrice
                              let data = [...itemList]


                              // const lastPo = LatestPO(purchase_orders, product_id)
                              // const avg_price = AverageCostPrice(purchase_orders, product_id)

                              data[i].product_name = name
                              data[i].product_id = product_id
                              data[i].costPrice = costPrice

                              let itemsLength = !e.value?.name ? false : true
                              await formik.setValues({ ...formik.values, itemsLength })

                              setItemList(data)
                            }}
                            aria-label="products"
                            dropdownAriaLabel="Select Product"
                          //   className={classNames({ "p-invalid": isFormFieldValid("name") })}
                          />

                          <label
                            htmlFor="name"
                          //   className={classNames({ "p-error": isFormFieldValid("name") })}
                          >
                            Select Product
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 lg:col-1">
                      <div className="field">
                        <span className="p-float-label ">
                          <InputNumber
                            id={`product-prixe-${i}`}
                            name="costPrice"
                            value={Number(ele.costPrice)}
                            disabled={readOnlyForm}
                            onChange={(e) => handleFormChange(e, i)}
                          // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                          />
                          <label
                          // className="labelpos_1"
                          >
                            Target price
                          </label>
                        </span>
                      </div>
                      {/* {getFormErrorMessage("name")} */}
                    </div>
                    <div className="col-12 lg:col-1">
                      <div className="field">
                        <span className="p-float-label">
                          <InputNumber
                            id={`product-qty-${i}`}
                            name="quantity"
                            disabled={readOnlyForm}
                            value={Number(ele.quantity)}
                            onChange={(e) => handleFormChange(e, i)}
                          // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                          />
                          <label
                          // className={classNames({ "p-error": isFormFieldValid("name") })}
                          >
                            Quantity
                          </label>
                        </span>
                      </div>
                      {/* {getFormErrorMessage("name")} */}
                    </div>
                    <div className="col-12 lg:col-1">
                      <div className="field">
                        <span className="p-float-label">
                          <InputText
                            id="last_po_price"
                            name="last_po_price"
                            disabled
                            value={ele.last_po_price}
                            onChange={(e) => handleFormChange(e, i)}
                          // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                          />
                          <label
                          // className="labelpos_1"
                          // className={classNames({ "p-error": isFormFieldValid("name") })}
                          >
                            Last PO Price
                          </label>
                        </span>
                      </div>
                      {/* {getFormErrorMessage("name")} */}
                    </div>

                    <div className="col-12 lg:col-2">
                      <div className="field">
                        <span className="p-float-label">
                          <InputText
                            id="last_vendor"
                            name="last_vendor"
                            value={ele.last_vendor}
                            disabled
                            onChange={(e) => handleFormChange(e, i)}
                          // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                          />
                          <label
                          // className={classNames({ "p-error": isFormFieldValid("name") })}
                          >
                            Last Vendor
                          </label>
                        </span>
                      </div>
                      {/* {getFormErrorMessage("name")} */}
                    </div>
                    <div className="field col-6 lg:col-1">
                      <div className="field">
                        {!readOnlyForm && <span className="p-buttonset ">
                          {i === itemList.length - 1 && (
                            <Button type="button" label="+" onClick={addFields} />
                          )}
                          {itemList.length > 1 && (
                            <Button
                              type="button"
                              label="x"
                              className="p-button-secondary"
                              onClick={(e) => {
                                removeFields(i)
                              }}
                            />
                          )}
                        </span>}
                      </div>
                    </div>
                  </div>
                </>
              ))}
              <div className="m-auto text-2xl">{getFormErrorMessage("itemsLength")}</div>
            </div>

            <div className="flex mx-4 justify-content-end ">
              {!readOnlyForm && (
                <Button
                  type="submit"
                  className="mr-2"
                  label={rfqEditState ? "UPDATE" : "SUBMIT"}
                  onClick={async (e) => { }}
                />
              )}
              <Button
                className="mr-2 p-button-secondary"
                style={{ maxWidth: "50%" }}
                label="CANCEL"
                onClick={(e) => {
                  e.preventDefault()
                  setRfqDialog(false)
                  setRfqEditState(false)
                  setRfqDetails({
                    rfqNumber: "",
                    rfq_description: "",
                    expectedDod: "",
                    rfq_email: [],
                  })
                  const fiveFields = arrayFillCopy(5, initialItemList)
                  setItemList(fiveFields)

                  formik.resetForm()
                }}
              />
            </div>
          </form>
        </div>
      </div>
      {/* <ScannedProducts
        products={products}
        scanner={scanner}
        setScanner={setScanner}
        setItemList={setItemList}
        setRfqDialog={setRfqDialog}
        newRFQCode={newRFQCode}
        setRfqDetails={setRfqDetails}
        rfqDetails={rfqDetails}
      /> */}
      {/* <CreateNewPo
        products={products}
        purchaseDialog={purchaseDialog}
        setPurchaseDialog={setPurchaseDialog}
        vendor_products={vendor_products}
        toast={toast}
        vendors={vendors}
        purchaseDetails={purchaseDetails}
        itemList={poItemList}
        setItemList={setPoItemList}
        initialItemState={initialPoItemState}
        setErrorMsgs={setRfqErrorMsgs}
        rfQCode={newRFQCode}
        // activeRow={activeRow}
        // poEditState={poEditState}
      /> */}

      {/* <RFQPO
        products={products}
        vendors={vendors}
        purchaseDetails={purchaseDetails}
        itemList={poItemList}
        purchase_orders={purchase_orders}
        purchaseDialog={purchaseDialog}
        setPurchaseDialog={setPurchaseDialog}
        setItemList={setPoItemList}
        initialItemState={initialPoItemState}
      /> */}

      {/* <CreatePo
        rfqData={activeRow}
        productOptions={productOptions}
        removeFields={removeFields}
        vendor_products={vendor_products}
        products={products}
        purchaseDialog={purchaseDialog}
        setPurchaseDialog={setPurchaseDialog}
        prefixes={prefixes}
      /> */}
      <div className="col-12">
        <div className="card">
          <DataTable
            value={tableRFQ}
            // scrollable
            // scrollHeight="60vh"
            showGridlines
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
            emptyMessage="No Results found."
            onRowClick={async (e) => {
              scrollToRfq?.current?.scrollIntoView()
              window.scroll(100, 100)
              setActiveRow(e.data)
              let obj = {
                "id": 26,
                "rfqNumber": "RFQ#25",
                "description": "",
                "status": "Created",
                "expectedDod": "2023-03-02T18:30:00.000Z",
                "agreement": "",
                "createdAt": "2023-03-01T13:04:00.000Z",
                "updatedAt": "2023-03-01T13:04:00.000Z",
                "rfq_products": [
                  {
                    "id": 22,
                    "quantity": 0,
                    "price": 10,
                    "rfq": 26,
                    "product": 3,
                    "products": {
                      "id": 3,
                      "name": "Machine Tools",
                      "sku": "TIFMT11",
                      "description": "Machine Tools update::",
                      "length": null,
                      "width": null,
                      "height": null,
                      "weight": null,
                      "color": null,
                      "hsnCode": null,
                      "imageUrl": "https://loremflickr.com/320/240/device?random=1",
                      "createdAT": null,
                      "updatedAT": null,
                      "customDuty": null,
                      "gstTaxTypeCode": null,
                      "taxCalcType": null,
                      "status": "Active",
                      "category": null,
                      "brand": null,
                      "costPrice": 10
                    }
                  }
                ],
                "rfq_sentto": [
                  {
                    "id": 33,
                    "email": 4,
                    "rfq": 26,
                    "sentOn": "2023-03-01T13:04:00.000Z",
                    "emails": {
                      "id": 4,
                      "email": "vj@gmail.com",
                      "addresses": 2
                    }
                  },
                  {
                    "id": 34,
                    "email": 1,
                    "rfq": 26,
                    "sentOn": "2023-03-01T13:04:00.000Z",
                    "emails": {
                      "id": 1,
                      "email": "varunram.66@gmail.com",
                      "addresses": 1
                    }
                  }
                ]
              }
              const rfqProducts = e.data.rfq_products

              let active = rfqProducts.map(
                ({ id: rfq_products_id, products: { id: product_id, sku, name }, quantity, price, }) => {
                  return {
                    product_id,
                    quantity: quantity,
                    costPrice: price,
                    rfq_products_id,
                    product_name: `${sku} - ${name}`,

                  }
                }
              )
              setItemList(active)

              const { rfqNumber, description: rfq_description, expectedDod, id, agreement, status } = e.data

              // const _expectedDod = moment(expectedDod).toDate()
              const sentToEmails = e.data.rfq_sentto.map(({ emails: { email } }) => email)

              await formik.setValues({
                rfqNumber: rfqNumber,
                rfq_description,
                id,
                itemsLength: true,
                agreement,
                rfq_email: sentToEmails,
                expectedDod,
                status,
              })

              setRfqDialog(true)
              setReadOnlyForm(true)
            }}
            selectionMode='checkbox'
            selection={selectedRfqs}
            onSelectionChange={(e) => setSelectedRfqs(e.value)}
          // tableStyle={{ minWidth: '50rem' }}
          >
            {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} /> */}
            <Column expander={allowExpansion} style={{ width: "3em" }} />

            {/* <Column
              field="rfqNumber"
              header="RFQ No."
              filter
              filterPlaceholder="Search by Code"
              // className="text-center"
            /> */}
            {/* <Column
              field="rfq_description"
              header="Description"
              filter
              filterPlaceholder="Search by Description"
              // className="text-center"
            /> */}

            {/* <Column
              header="Created at"
              filterField="createdAt"
              dataType="date"
              body={(rowData) => moment(new Date(rowData.createdAt)).format("DD-MM-YYYY, HH:MM")}
              filter
              filterElement={dateFilterTemplate}

              // className="text-center"
            /> */}
            {/* <Column
              header="Updated at"
              filterField="updatedAt"
              dataType="date"
              body={(rowData) => moment(new Date(rowData.updatedAt)).format("DD-MM-YYYY, HH:MM")}
              filter
              filterElement={dateFilterTemplate}

              // className="text-center"
            /> */}
            {/* <Column
              field="active"
              header="Status"
              body={(rowData) => {
                return (
                  <span className={`badge status-${rowData.active ? "active" : "inactive"}`}>
                    {rowData.active ? "Active" : "Closed"}
                  </span>
                )
              }}
              filter
              filterElement={statusFilterTemplate}
            /> */}
            {/* <Column
              field="rfq_sentto"
              header="Vendors"
              body={(rowData) => {
                const sentMails = rowData.rfq_sentto?.map((ele) => ele.email)
                const uniqueMails = [...new Set(sentMails)]

                const sentVendors = vendors
                  .filter((ele, i) => uniqueMails.includes(ele.vendor_email))
                  .map((ele) => ele.vendor)

                // return <div className="cutoff-text">{sentVendors.join(" , ")}</div>
                return (
                  <div className="tooltip-pr">
                    <span className="tooltiptext-pr">{sentVendors.join(" , ")}</span>
                  </div>
                )
              }}
            /> */}
            {/* <Column
              field="agreement_terms_id"
              header="Terms"
              body={(rowData) => {
                console.log("rowDataterms: ", rowData)

                return <span>{rowData.agreement_terms.name}</span>
              }}
              filter
              filterPlaceholder="Search by Terms"
              filterElement={termsFilterTemplate}
              // className="text-center"
            /> */}
            {columnComponents}
          </DataTable>
        </div>
      </div>
    </div >
  )
}

const RfqsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <RfqsList />
      </Layout>
    </Suspense>
  )
}

export default RfqsPage
