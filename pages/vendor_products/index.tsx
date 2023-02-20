import { Suspense, useEffect, useRef, useState } from "react"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"

import getVendor_products from "app/vendor_products/queries/getVendor_products"
import Layout from "layouts/Layout"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import getVendors from "app/vendors/queries/getVendors"
import { Dropdown } from "primereact/dropdown"
import getProducts from "app/products/queries/getProducts"
import { InputText } from "primereact/inputtext"
import createVendor_product from "app/vendor_products/mutations/createVendor_product"
import updateVendor_product from "app/vendor_products/mutations/updateVendor_product"
import deleteVendor_product from "app/vendor_products/mutations/deleteVendor_product"
import { FileUpload } from "primereact/fileupload"
import Loading from "components/loading"
import papa from "papaparse"
import downloadCsv from "download-csv"
import { Toast } from "primereact/toast"
import { InputNumber } from "primereact/inputnumber"
import ErrorCard from "components/ErrorCard"
import { createCSVFormat, createSearchFunction, tsuccess } from "app/constants"
import { FALSE } from "sass"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { devNull } from "os"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { MultiSelect } from "primereact/multiselect"

const ITEMS_PER_PAGE = 100

export const Vendor_productsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0

  const vendor_products = [
    {
      vp_id: 1,
      unit_price: 424,
      products: {
        product_id: 1,
        name: "Pi",
        description: "Pi-descasw",
        product_type: "Electronics",
        products_sku: "TIF001",
        Price: 11,
        product_unit: "pc",
      },
      vendor: {
        vendor_id: 1,
        vendor_code: "DA",
        vendor_email: "mdatif796@gmail.com",
        vendor_city: "Panaji",
        vendor_contact: "4562879123",
        vendor_state: "Goa",
        vendor_gstin: "GSTRIO783211111",
        vendor: "Dylan Alisson",
        address: "Rio ",
        credit_period: "411",
        lead_time: "471",
        status: false,
      },
      vendor_vendor_id: 1,
      products_product_id: 1,
      vendor_sku: "DA1002",
    },
    {
      vp_id: 2,
      unit_price: 10,
      products: {
        product_id: 2,
        name: "ESP",
        description: "esp-desc",
        product_type: "Electronics",
        products_sku: "TIF002",
        Price: 142,
        product_unit: "2pc set",
      },
      vendor: {
        vendor_id: 1,
        vendor_code: "DA",
        vendor_email: "mdatif796@gmail.com",
        vendor_city: "Panaji",
        vendor_contact: "4562879123",
        vendor_state: "Goa",
        vendor_gstin: "GSTRIO783211111",
        vendor: "Dylan Alisson",
        address: "Rio ",
        credit_period: "411",
        lead_time: "471",
        status: false,
      },
      vendor_vendor_id: 1,
      products_product_id: 2,
      vendor_sku: "DA1001",
    },
    {
      vp_id: 5,
      unit_price: 50,
      products: {
        product_id: 3,
        name: "Waterproof Ultrasonic Sensor",
        description: "water-desp",
        product_type: "Sensors",
        products_sku: "TIF003",
        Price: 24,
        product_unit: "combo",
      },
      vendor: {
        vendor_id: 3,
        vendor_code: "TE",
        vendor_email: "thomasEdison@gmail.com",
        vendor_city: "Miraj",
        vendor_contact: "8954236172",
        vendor_state: "Maharashtra",
        vendor_gstin: "GSTMIL009222222",
        vendor: "Thomas Edison",
        address: "Milan",
        credit_period: "4",
        lead_time: "4",
        status: false,
      },
      vendor_vendor_id: 3,
      products_product_id: 3,
      vendor_sku: "TE103",
    },
    {
      vp_id: 6,
      unit_price: 905,
      products: {
        product_id: 6,
        name: "Turbidity Sensor",
        description: "description sensor",
        product_type: "Sensors",
        products_sku: "TIF006",
        Price: 67,
        product_unit: null,
      },
      vendor: {
        vendor_id: 3,
        vendor_code: "TE",
        vendor_email: "thomasEdison@gmail.com",
        vendor_city: "Miraj",
        vendor_contact: "8954236172",
        vendor_state: "Maharashtra",
        vendor_gstin: "GSTMIL009222222",
        vendor: "Thomas Edison",
        address: "Milan",
        credit_period: "4",
        lead_time: "4",
        status: false,
      },
      vendor_vendor_id: 3,
      products_product_id: 6,
      vendor_sku: "TE106",
    },
    {
      vp_id: 8,
      unit_price: 45,
      products: {
        product_id: 7,
        name: "Heat Flame Sensor",
        description: "description heat",
        product_type: "Sensors",
        products_sku: "TIF007",
        Price: 56,
        product_unit: null,
      },
      vendor: {
        vendor_id: 3,
        vendor_code: "TE",
        vendor_email: "thomasEdison@gmail.com",
        vendor_city: "Miraj",
        vendor_contact: "8954236172",
        vendor_state: "Maharashtra",
        vendor_gstin: "GSTMIL009222222",
        vendor: "Thomas Edison",
        address: "Milan",
        credit_period: "4",
        lead_time: "4",
        status: false,
      },
      vendor_vendor_id: 3,
      products_product_id: 7,
      vendor_sku: "TE107",
    },
    {
      vp_id: 9,
      unit_price: 88,
      products: {
        product_id: 6,
        name: "Turbidity Sensor",
        description: "description sensor",
        product_type: "Sensors",
        products_sku: "TIF006",
        Price: 67,
        product_unit: null,
      },
      vendor: {
        vendor_id: 4,
        vendor_code: "KM",
        vendor_email: "kamehameha@gmail.com",
        vendor_city: "Tonk",
        vendor_contact: "7856124391",
        vendor_state: "Rajasthan",
        vendor_gstin: "GSTTK0097811111",
        vendor: "Kamehameha",
        address: "Tokyo",
        credit_period: "7",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 4,
      products_product_id: 6,
      vendor_sku: "KM106",
    },
    {
      vp_id: 10,
      unit_price: 47,
      products: {
        product_id: 7,
        name: "Heat Flame Sensor",
        description: "description heat",
        product_type: "Sensors",
        products_sku: "TIF007",
        Price: 56,
        product_unit: null,
      },
      vendor: {
        vendor_id: 4,
        vendor_code: "KM",
        vendor_email: "kamehameha@gmail.com",
        vendor_city: "Tonk",
        vendor_contact: "7856124391",
        vendor_state: "Rajasthan",
        vendor_gstin: "GSTTK0097811111",
        vendor: "Kamehameha",
        address: "Tokyo",
        credit_period: "7",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 4,
      products_product_id: 7,
      vendor_sku: "KM107",
    },
    {
      vp_id: 11,
      unit_price: 83,
      products: {
        product_id: 4,
        name: "E18-D80NK Infrared Sensor Module",
        description: "description",
        product_type: "Sensors",
        products_sku: "TIF004",
        Price: 42,
        product_unit: null,
      },
      vendor: {
        vendor_id: 1,
        vendor_code: "DA",
        vendor_email: "mdatif796@gmail.com",
        vendor_city: "Panaji",
        vendor_contact: "4562879123",
        vendor_state: "Goa",
        vendor_gstin: "GSTRIO783211111",
        vendor: "Dylan Alisson",
        address: "Rio ",
        credit_period: "411",
        lead_time: "471",
        status: false,
      },
      vendor_vendor_id: 1,
      products_product_id: 4,
      vendor_sku: "DA102",
    },
    {
      vp_id: 20,
      unit_price: 120,
      products: {
        product_id: 5,
        name: "MQ-135 gas sensor Module",
        description: "description 135",
        product_type: "Sensors",
        products_sku: "TIF005",
        Price: 56,
        product_unit: null,
      },
      vendor: {
        vendor_id: 3,
        vendor_code: "TE",
        vendor_email: "thomasEdison@gmail.com",
        vendor_city: "Miraj",
        vendor_contact: "8954236172",
        vendor_state: "Maharashtra",
        vendor_gstin: "GSTMIL009222222",
        vendor: "Thomas Edison",
        address: "Milan",
        credit_period: "4",
        lead_time: "4",
        status: false,
      },
      vendor_vendor_id: 3,
      products_product_id: 5,
      vendor_sku: "TE105",
    },
    {
      vp_id: 29,
      unit_price: 11,
      products: {
        product_id: 8,
        name: "Eye Blink Sensor",
        description: "eye description",
        product_type: "Sensors",
        products_sku: "TIF008",
        Price: 53,
        product_unit: null,
      },
      vendor: {
        vendor_id: 1,
        vendor_code: "DA",
        vendor_email: "mdatif796@gmail.com",
        vendor_city: "Panaji",
        vendor_contact: "4562879123",
        vendor_state: "Goa",
        vendor_gstin: "GSTRIO783211111",
        vendor: "Dylan Alisson",
        address: "Rio ",
        credit_period: "411",
        lead_time: "471",
        status: false,
      },
      vendor_vendor_id: 1,
      products_product_id: 8,
      vendor_sku: "qws",
    },
    {
      vp_id: 33,
      unit_price: 25,
      products: {
        product_id: 2,
        name: "ESP",
        description: "esp-desc",
        product_type: "Electronics",
        products_sku: "TIF002",
        Price: 142,
        product_unit: "2pc set",
      },
      vendor: {
        vendor_id: 123,
        vendor_code: "VJ",
        vendor_email: "varunram.66@gmail.com",
        vendor_city: "Bangalore",
        vendor_contact: "7892496089",
        vendor_state: "Karnataka",
        vendor_gstin: "GSTN97313398111",
        vendor: "Varun",
        address: "Hennur",
        credit_period: "12",
        lead_time: "21",
        status: false,
      },
      vendor_vendor_id: 123,
      products_product_id: 2,
      vendor_sku: "VJ338",
    },
    {
      vp_id: 34,
      unit_price: 120,
      products: {
        product_id: 6,
        name: "Turbidity Sensor",
        description: "description sensor",
        product_type: "Sensors",
        products_sku: "TIF006",
        Price: 67,
        product_unit: null,
      },
      vendor: {
        vendor_id: 5,
        vendor_code: "RH",
        vendor_email: "rahul@gmail.com",
        vendor_city: "Dumka",
        vendor_contact: "4556788925",
        vendor_state: "Jharkhand",
        vendor_gstin: "GSTDUB012541111",
        vendor: "Rahul",
        address: "Dubai",
        credit_period: "3",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 5,
      products_product_id: 6,
      vendor_sku: "TE1564",
    },
    {
      vp_id: 35,
      unit_price: 11,
      products: {
        product_id: 7,
        name: "Heat Flame Sensor",
        description: "description heat",
        product_type: "Sensors",
        products_sku: "TIF007",
        Price: 56,
        product_unit: null,
      },
      vendor: {
        vendor_id: 5,
        vendor_code: "RH",
        vendor_email: "rahul@gmail.com",
        vendor_city: "Dumka",
        vendor_contact: "4556788925",
        vendor_state: "Jharkhand",
        vendor_gstin: "GSTDUB012541111",
        vendor: "Rahul",
        address: "Dubai",
        credit_period: "3",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 5,
      products_product_id: 7,
      vendor_sku: "TE571",
    },
    {
      vp_id: 36,
      unit_price: 756,
      products: {
        product_id: 1,
        name: "Pi",
        description: "Pi-descasw",
        product_type: "Electronics",
        products_sku: "TIF001",
        Price: 11,
        product_unit: "pc",
      },
      vendor: {
        vendor_id: 4,
        vendor_code: "KM",
        vendor_email: "kamehameha@gmail.com",
        vendor_city: "Tonk",
        vendor_contact: "7856124391",
        vendor_state: "Rajasthan",
        vendor_gstin: "GSTTK0097811111",
        vendor: "Kamehameha",
        address: "Tokyo",
        credit_period: "7",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 4,
      products_product_id: 1,
      vendor_sku: "TE417",
    },
    {
      vp_id: 37,
      unit_price: 454,
      products: {
        product_id: 1,
        name: "Pi",
        description: "Pi-descasw",
        product_type: "Electronics",
        products_sku: "TIF001",
        Price: 11,
        product_unit: "pc",
      },
      vendor: {
        vendor_id: 5,
        vendor_code: "RH",
        vendor_email: "rahul@gmail.com",
        vendor_city: "Dumka",
        vendor_contact: "4556788925",
        vendor_state: "Jharkhand",
        vendor_gstin: "GSTDUB012541111",
        vendor: "Rahul",
        address: "Dubai",
        credit_period: "3",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 5,
      products_product_id: 1,
      vendor_sku: "TE420",
    },
    {
      vp_id: 79,
      unit_price: 142,
      products: {
        product_id: 3,
        name: "Waterproof Ultrasonic Sensor",
        description: "water-desp",
        product_type: "Sensors",
        products_sku: "TIF003",
        Price: 24,
        product_unit: "combo",
      },
      vendor: {
        vendor_id: 4,
        vendor_code: "KM",
        vendor_email: "kamehameha@gmail.com",
        vendor_city: "Tonk",
        vendor_contact: "7856124391",
        vendor_state: "Rajasthan",
        vendor_gstin: "GSTTK0097811111",
        vendor: "Kamehameha",
        address: "Tokyo",
        credit_period: "7",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 4,
      products_product_id: 3,
      vendor_sku: "KA146",
    },
    {
      vp_id: 81,
      unit_price: 85,
      products: {
        product_id: 15,
        name: "Solenoid valve 12V",
        description: "valve 12V",
        product_type: "Motors and mechanical devices",
        products_sku: "TIF015",
        Price: 343,
        product_unit: null,
      },
      vendor: {
        vendor_id: 1,
        vendor_code: "DA",
        vendor_email: "mdatif796@gmail.com",
        vendor_city: "Panaji",
        vendor_contact: "4562879123",
        vendor_state: "Goa",
        vendor_gstin: "GSTRIO783211111",
        vendor: "Dylan Alisson",
        address: "Rio ",
        credit_period: "411",
        lead_time: "471",
        status: false,
      },
      vendor_vendor_id: 1,
      products_product_id: 15,
      vendor_sku: "DA10456",
    },
    {
      vp_id: 83,
      unit_price: 0,
      products: {
        product_id: 4,
        name: "E18-D80NK Infrared Sensor Module",
        description: "description",
        product_type: "Sensors",
        products_sku: "TIF004",
        Price: 42,
        product_unit: null,
      },
      vendor: {
        vendor_id: 3,
        vendor_code: "TE",
        vendor_email: "thomasEdison@gmail.com",
        vendor_city: "Miraj",
        vendor_contact: "8954236172",
        vendor_state: "Maharashtra",
        vendor_gstin: "GSTMIL009222222",
        vendor: "Thomas Edison",
        address: "Milan",
        credit_period: "4",
        lead_time: "4",
        status: false,
      },
      vendor_vendor_id: 3,
      products_product_id: 4,
      vendor_sku: "TE104",
    },
    {
      vp_id: 86,
      unit_price: 12,
      products: {
        product_id: 23,
        name: "Test CSV",
        description: "Test CSV",
        product_type: "CSV",
        products_sku: "TestSKU",
        Price: 67,
        product_unit: null,
      },
      vendor: {
        vendor_id: 1,
        vendor_code: "DA",
        vendor_email: "mdatif796@gmail.com",
        vendor_city: "Panaji",
        vendor_contact: "4562879123",
        vendor_state: "Goa",
        vendor_gstin: "GSTRIO783211111",
        vendor: "Dylan Alisson",
        address: "Rio ",
        credit_period: "411",
        lead_time: "471",
        status: false,
      },
      vendor_vendor_id: 1,
      products_product_id: 23,
      vendor_sku: "aws",
    },
    {
      vp_id: 102,
      unit_price: 15,
      products: {
        product_id: 21,
        name: "Watermelon",
        description:
          "Water-melon is a flowering plant species of the Cucurbitaceae family orem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,\nmolestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum",
        product_type: "Fruit",
        products_sku: "Test",
        Price: 7,
        product_unit: "kg",
      },
      vendor: {
        vendor_id: 123,
        vendor_code: "VJ",
        vendor_email: "varunram.66@gmail.com",
        vendor_city: "Bangalore",
        vendor_contact: "7892496089",
        vendor_state: "Karnataka",
        vendor_gstin: "GSTN97313398111",
        vendor: "Varun",
        address: "Hennur",
        credit_period: "12",
        lead_time: "21",
        status: false,
      },
      vendor_vendor_id: 123,
      products_product_id: 21,
      vendor_sku: "VJW1001",
    },
    {
      vp_id: 104,
      unit_price: 12,
      products: {
        product_id: 14,
        name: "R385 DC PUMP",
        description: "R385 ",
        product_type: "Motors and mechanical devices",
        products_sku: "TIF014",
        Price: 787,
        product_unit: null,
      },
      vendor: {
        vendor_id: 4,
        vendor_code: "KM",
        vendor_email: "kamehameha@gmail.com",
        vendor_city: "Tonk",
        vendor_contact: "7856124391",
        vendor_state: "Rajasthan",
        vendor_gstin: "GSTTK0097811111",
        vendor: "Kamehameha",
        address: "Tokyo",
        credit_period: "7",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 4,
      products_product_id: 14,
      vendor_sku: "dewa",
    },
    {
      vp_id: 105,
      unit_price: 123,
      products: {
        product_id: 5,
        name: "MQ-135 gas sensor Module",
        description: "description 135",
        product_type: "Sensors",
        products_sku: "TIF005",
        Price: 56,
        product_unit: null,
      },
      vendor: {
        vendor_id: 2,
        vendor_code: "UE",
        vendor_email: "udederson@gmail.com",
        vendor_city: "Manuguru",
        vendor_contact: "8956237845",
        vendor_state: "Andhra Pradesh",
        vendor_gstin: "GSTMAN012541111",
        vendor: "Ud Ederson",
        address: "Manaus",
        credit_period: "5",
        lead_time: "4",
        status: true,
      },
      vendor_vendor_id: 2,
      products_product_id: 5,
      vendor_sku: "ssWW",
    },
    {
      vp_id: 106,
      unit_price: 111,
      products: {
        product_id: 5,
        name: "MQ-135 gas sensor Module",
        description: "description 135",
        product_type: "Sensors",
        products_sku: "TIF005",
        Price: 56,
        product_unit: null,
      },
      vendor: {
        vendor_id: 170,
        vendor_code: "asq",
        vendor_email: "d@c.com",
        vendor_city: "Wanaparthy",
        vendor_contact: "1234567894",
        vendor_state: "Andhra Pradesh",
        vendor_gstin: "123456789568745",
        vendor: "q",
        address: "sda",
        credit_period: "12",
        lead_time: "45",
        status: true,
      },
      vendor_vendor_id: 170,
      products_product_id: 5,
      vendor_sku: "qqq",
    },
    {
      vp_id: 108,
      unit_price: 45,
      products: {
        product_id: 4,
        name: "E18-D80NK Infrared Sensor Module",
        description: "description",
        product_type: "Sensors",
        products_sku: "TIF004",
        Price: 42,
        product_unit: null,
      },
      vendor: {
        vendor_id: 123,
        vendor_code: "VJ",
        vendor_email: "varunram.66@gmail.com",
        vendor_city: "Bangalore",
        vendor_contact: "7892496089",
        vendor_state: "Karnataka",
        vendor_gstin: "GSTN97313398111",
        vendor: "Varun",
        address: "Hennur",
        credit_period: "12",
        lead_time: "21",
        status: false,
      },
      vendor_vendor_id: 123,
      products_product_id: 4,
      vendor_sku: "VJ12345",
    },
    {
      vp_id: 112,
      unit_price: 45,
      products: {
        product_id: 21,
        name: "Watermelon",
        description:
          "Water-melon is a flowering plant species of the Cucurbitaceae family orem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,\nmolestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum",
        product_type: "Fruit",
        products_sku: "Test",
        Price: 7,
        product_unit: "kg",
      },
      vendor: {
        vendor_id: 147,
        vendor_code: "FK",
        vendor_email: "xylene8@gmail.com",
        vendor_city: "Salur",
        vendor_contact: "4567891238",
        vendor_state: "Andhra Pradesh",
        vendor_gstin: "GSTIN6786543467",
        vendor: "Frank",
        address: "11",
        credit_period: "11",
        lead_time: "11",
        status: true,
      },
      vendor_vendor_id: 147,
      products_product_id: 21,
      vendor_sku: "FK489",
    },
    {
      vp_id: 113,
      unit_price: 40,
      products: {
        product_id: 4,
        name: "E18-D80NK Infrared Sensor Module",
        description: "description",
        product_type: "Sensors",
        products_sku: "TIF004",
        Price: 42,
        product_unit: null,
      },
      vendor: {
        vendor_id: 147,
        vendor_code: "FK",
        vendor_email: "xylene8@gmail.com",
        vendor_city: "Salur",
        vendor_contact: "4567891238",
        vendor_state: "Andhra Pradesh",
        vendor_gstin: "GSTIN6786543467",
        vendor: "Frank",
        address: "11",
        credit_period: "11",
        lead_time: "11",
        status: true,
      },
      vendor_vendor_id: 147,
      products_product_id: 4,
      vendor_sku: "FK491",
    },
    {
      vp_id: 114,
      unit_price: 41,
      products: {
        product_id: 2,
        name: "ESP",
        description: "esp-desc",
        product_type: "Electronics",
        products_sku: "TIF002",
        Price: 142,
        product_unit: "2pc set",
      },
      vendor: {
        vendor_id: 147,
        vendor_code: "FK",
        vendor_email: "xylene8@gmail.com",
        vendor_city: "Salur",
        vendor_contact: "4567891238",
        vendor_state: "Andhra Pradesh",
        vendor_gstin: "GSTIN6786543467",
        vendor: "Frank",
        address: "11",
        credit_period: "11",
        lead_time: "11",
        status: true,
      },
      vendor_vendor_id: 147,
      products_product_id: 2,
      vendor_sku: "FK490",
    },
    {
      vp_id: 116,
      unit_price: 85,
      products: {
        product_id: 1,
        name: "Pi",
        description: "Pi-descasw",
        product_type: "Electronics",
        products_sku: "TIF001",
        Price: 11,
        product_unit: "pc",
      },
      vendor: {
        vendor_id: 3,
        vendor_code: "TE",
        vendor_email: "thomasEdison@gmail.com",
        vendor_city: "Miraj",
        vendor_contact: "8954236172",
        vendor_state: "Maharashtra",
        vendor_gstin: "GSTMIL009222222",
        vendor: "Thomas Edison",
        address: "Milan",
        credit_period: "4",
        lead_time: "4",
        status: false,
      },
      vendor_vendor_id: 3,
      products_product_id: 1,
      vendor_sku: "TH4568",
    },
  ]

  const vendors = [
    {
      vendor_id: 1,
      vendor_code: "DA",
      vendor_email: "mdatif796@gmail.com",
      vendor_city: "Panaji",
      vendor_contact: "4562879123",
      vendor_state: "Goa",
      vendor_gstin: "GSTRIO783211111",
      vendor: "Dylan Alisson",
      address: "Rio ",
      credit_period: "411",
      lead_time: "471",
      status: 0,
    },
    {
      vendor_id: 2,
      vendor_code: "UE",
      vendor_email: "udederson@gmail.com",
      vendor_city: "Manuguru",
      vendor_contact: "8956237845",
      vendor_state: "Andhra Pradesh",
      vendor_gstin: "GSTMAN012541111",
      vendor: "Ud Ederson",
      address: "Manaus",
      credit_period: "5",
      lead_time: "4",
      status: 1,
    },
    {
      vendor_id: 3,
      vendor_code: "TE",
      vendor_email: "thomasEdison@gmail.com",
      vendor_city: "Miraj",
      vendor_contact: "8954236172",
      vendor_state: "Maharashtra",
      vendor_gstin: "GSTMIL009222222",
      vendor: "Thomas Edison",
      address: "Milan",
      credit_period: "4",
      lead_time: "4",
      status: 0,
    },
    {
      vendor_id: 4,
      vendor_code: "KM",
      vendor_email: "kamehameha@gmail.com",
      vendor_city: "Tonk",
      vendor_contact: "7856124391",
      vendor_state: "Rajasthan",
      vendor_gstin: "GSTTK0097811111",
      vendor: "Kamehameha",
      address: "Tokyo",
      credit_period: "7",
      lead_time: "4",
      status: 1,
    },
    {
      vendor_id: 5,
      vendor_code: "RH",
      vendor_email: "rahul@gmail.com",
      vendor_city: "Dumka",
      vendor_contact: "4556788925",
      vendor_state: "Jharkhand",
      vendor_gstin: "GSTDUB012541111",
      vendor: "Rahul",
      address: "Dubai",
      credit_period: "3",
      lead_time: "4",
      status: 1,
    },
    {
      vendor_id: 123,
      vendor_code: "VJ",
      vendor_email: "varunram.66@gmail.com",
      vendor_city: "Bangalore",
      vendor_contact: "7892496089",
      vendor_state: "Karnataka",
      vendor_gstin: "GSTN97313398111",
      vendor: "Varun",
      address: "Hennur",
      credit_period: "12",
      lead_time: "21",
      status: 0,
    },
    {
      vendor_id: 133,
      vendor_code: "iotif",
      vendor_email: "iot@gmail.com",
      vendor_city: "Gopalganj",
      vendor_contact: "4567892567",
      vendor_state: "Bihar",
      vendor_gstin: "GSTO14562398745",
      vendor: "TIF",
      address: "banglore",
      credit_period: "10",
      lead_time: "12",
      status: 0,
    },
    {
      vendor_id: 134,
      vendor_code: "KR",
      vendor_email: "kar@gmail.com",
      vendor_city: "Cambay",
      vendor_contact: "8987634523",
      vendor_state: "Gujarat",
      vendor_gstin: "GSTI87640111111",
      vendor: "Karan",
      address: "12th street ",
      credit_period: "4",
      lead_time: "5",
      status: 1,
    },
    {
      vendor_id: 135,
      vendor_code: "RA",
      vendor_email: "raj@gail.com",
      vendor_city: "banglor",
      vendor_contact: "1546237964",
      vendor_state: "Karnataka",
      vendor_gstin: "GSTI14254572222",
      vendor: "Raj",
      address: "11th street",
      credit_period: "11",
      lead_time: "12",
      status: 1,
    },
    {
      vendor_id: 147,
      vendor_code: "FK",
      vendor_email: "xylene8@gmail.com",
      vendor_city: "Salur",
      vendor_contact: "4567891238",
      vendor_state: "Andhra Pradesh",
      vendor_gstin: "GSTIN6786543467",
      vendor: "Frank",
      address: "11",
      credit_period: "11",
      lead_time: "11",
      status: 1,
    },
    {
      vendor_id: 168,
      vendor_code: "z",
      vendor_email: "z@g.com",
      vendor_city: "Chirala",
      vendor_contact: "1456987856",
      vendor_state: "Andhra Pradesh",
      vendor_gstin: "145698712345698",
      vendor: "z",
      address: "asd",
      credit_period: "45",
      lead_time: "56",
      status: 1,
    },
    {
      vendor_id: 170,
      vendor_code: "asq",
      vendor_email: "d@c.com",
      vendor_city: "Wanaparthy",
      vendor_contact: "1234567894",
      vendor_state: "Andhra Pradesh",
      vendor_gstin: "123456789568745",
      vendor: "q",
      address: "sda",
      credit_period: "12",
      lead_time: "45",
      status: 1,
    },
    {
      vendor_id: 171,
      vendor_code: "m",
      vendor_email: "m2@G.COM",
      vendor_city: "Zahirabad",
      vendor_contact: "1456239875",
      vendor_state: "Andhra Pradesh",
      vendor_gstin: "123654789632145",
      vendor: "m",
      address: "WSAQ",
      credit_period: "45",
      lead_time: "69",
      status: 1,
    },
    {
      vendor_id: 173,
      vendor_code: "SWD",
      vendor_email: "SD@GMAIL.COM",
      vendor_city: "Bellampalle",
      vendor_contact: "7895263654",
      vendor_state: "Andhra Pradesh",
      vendor_gstin: "SDEF412C5D6E3S6",
      vendor: "vj",
      address: "STRING ",
      credit_period: "56",
      lead_time: "85",
      status: 1,
    },
    {
      vendor_id: 192,
      vendor_code: "AS",
      vendor_email: "AS@gmail.com",
      vendor_city: "AS",
      vendor_contact: "AS",
      vendor_state: "AS",
      vendor_gstin: "AS",
      vendor: "AS",
      address: "AS",
      credit_period: "AS",
      lead_time: "AS",
      status: 1,
    },
  ]

  const products = [
    {
      product_id: 1,
      name: "Pi",
      description: "Pi-descasw",
      product_type: "Electronics",
      products_sku: "TIF001",
      Price: 11,
      product_unit: "pc",
    },
    {
      product_id: 2,
      name: "ESP",
      description: "esp-desc",
      product_type: "Electronics",
      products_sku: "TIF002",
      Price: 142,
      product_unit: "2pc set",
    },
    {
      product_id: 3,
      name: "Waterproof Ultrasonic Sensor",
      description: "water-desp",
      product_type: "Sensors",
      products_sku: "TIF003",
      Price: 24,
      product_unit: "combo",
    },
    {
      product_id: 4,
      name: "E18-D80NK Infrared Sensor Module",
      description: "description",
      product_type: "Sensors",
      products_sku: "TIF004",
      Price: 42,
      product_unit: null,
    },
    {
      product_id: 5,
      name: "MQ-135 gas sensor Module",
      description: "description 135",
      product_type: "Sensors",
      products_sku: "TIF005",
      Price: 56,
      product_unit: null,
    },
    {
      product_id: 6,
      name: "Turbidity Sensor",
      description: "description sensor",
      product_type: "Sensors",
      products_sku: "TIF006",
      Price: 67,
      product_unit: null,
    },
    {
      product_id: 7,
      name: "Heat Flame Sensor",
      description: "description heat",
      product_type: "Sensors",
      products_sku: "TIF007",
      Price: 56,
      product_unit: null,
    },
    {
      product_id: 8,
      name: "Eye Blink Sensor",
      description: "eye description",
      product_type: "Sensors",
      products_sku: "TIF008",
      Price: 53,
      product_unit: null,
    },
    {
      product_id: 9,
      name: "Laser Module",
      description: "description laser",
      product_type: "Sensors",
      products_sku: "TIF009",
      Price: 856,
      product_unit: null,
    },
    {
      product_id: 10,
      name: "Sound Sensor Module",
      description: "sound description",
      product_type: "Sensors",
      products_sku: "TIF010",
      Price: 56,
      product_unit: null,
    },
    {
      product_id: 11,
      name: "Servo Motor Pan-Tilt Setup",
      description: "servo description",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF011",
      Price: 5657,
      product_unit: null,
    },
    {
      product_id: 12,
      name: "Micro Vibration Motor",
      description: "micro  ",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF012",
      Price: 65,
      product_unit: null,
    },
    {
      product_id: 13,
      name: "A4988 Stepper Motor Driver",
      description: "description pump",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF013",
      Price: 346,
      product_unit: null,
    },
    {
      product_id: 14,
      name: "R385 DC PUMP",
      description: "R385 ",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF014",
      Price: 787,
      product_unit: null,
    },
    {
      product_id: 15,
      name: "Solenoid valve 12V",
      description: "valve 12V",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF015",
      Price: 343,
      product_unit: null,
    },
    {
      product_id: 16,
      name: "Neo 6M GPS Module",
      description: "Neo 6M GPS",
      product_type: "IOT & wireless devices",
      products_sku: "TIF016",
      Price: 657,
      product_unit: null,
    },
    {
      product_id: 17,
      name: "NRF24L01+PA+LNA",
      description: "NRF24L01+PA+LNA",
      product_type: "IOT & wireless devices",
      products_sku: "TIF017",
      Price: 786,
      product_unit: null,
    },
    {
      product_id: 18,
      name: "test",
      description: "tes0123",
      product_type: "IOT & wireless devices",
      products_sku: "TIF018",
      Price: 657,
      product_unit: null,
    },
    {
      product_id: 19,
      name: "ESP12E ESP8266 Wireless Transceiver Module",
      description: "ESP12E ",
      product_type: "IOT & wireless devices",
      products_sku: "TIF019",
      Price: 53,
      product_unit: null,
    },
    {
      product_id: 20,
      name: "dummy name",
      description: "dummy name",
      product_type: "dummy product type",
      products_sku: "TIF000",
      Price: 4,
      product_unit: null,
    },
    {
      product_id: 21,
      name: "Watermelon",
      description:
        "Water-melon is a flowering plant species of the Cucurbitaceae family orem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,\nmolestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum",
      product_type: "Fruit",
      products_sku: "Test",
      Price: 7,
      product_unit: "kg",
    },
    {
      product_id: 23,
      name: "Test CSV",
      description: "Test CSV",
      product_type: "CSV",
      products_sku: "TestSKU",
      Price: 67,
      product_unit: null,
    },
    {
      product_id: 64,
      name: "boat",
      description: "asdddasd",
      product_type: "eleectric",
      products_sku: "TI-100",
      Price: 0,
      product_unit: "Pc",
    },
  ]
  // const [{ vendor_products }, { refetch, isLoading }] = useQuery(getVendor_products, {
  //   orderBy: { vp_id: "asc" },
  // })

  // const [{ vendors }, { error: vp_VendorFetchingError, isLoading: isVendorsLoading }] = useQuery(
  //   getVendors,
  //   {
  //     orderBy: { vendor_id: "asc" },
  //   }
  // )

  // const [{ products }, { error: vp_ProductsFetchingError, isLoading: isProductsLoading }] =
  //   useQuery(getProducts, {
  //     orderBy: { product_id: "asc" },
  //   })

  const [activeRowData, setActiveRowData] = useState({})

  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const [productDialog, setProductDialog] = useState(false)
  const [activeVendorData, setActiveVendorData] = useState({})

  const [errorProducts, setErrorProducts] = useState([])
  const [vendorDialog, setVendorDialog] = useState(false)
  console.log("vendorDialog", vendorDialog)
  const initialProductState = {
    unit_price: null,
    vendor_vendor_id: null,
    products_product_id: null,
    vendor_sku: "",
    name: "",
    vendor: "",
  }
  const [newProduct, setNewProduct] = useState(initialProductState)
  console.log("newProduct", newProduct)
  const [activeRow, setActiveRow] = useState({})
  const { unit_price, vendor_vendor_id, products_product_id, vendor_sku } = newProduct
  const [editState, setEditState] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  console.log(editState, "editState")
  const [createVendorProductMutation, { error: createVpMutationError, isLoading: vp_Creating }] =
    useMutation(createVendor_product)
  const [updateVendorMutation, { error: updateVpMutationError, isLoading: vp_Updating }] =
    useMutation(updateVendor_product)
  const [deleteVendorProductMutation] = useMutation(deleteVendor_product)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const [productEditState, setProductEditState] = useState(false)

  const productOptions = products.map(({ product_id, products_sku, name }) => {
    return { name: ` ${products_sku} - ${name} `, value: product_id }
  })
  const vendorOptions = vendors.map(({ vendor, vendor_id }) => {
    return { name: vendor, vendor_id }
  })
  const clearupload = useRef(null)
  const [btnVisibility, setBtnVisibility] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)
  const [vendorSuggestions, setVendorSuggestions] = useState<any>(null)
  const [ErrorMsgs, setErrorMsgs] = useState([])
  const [storeData, setStoreData] = useState({})

  const columns = [
    { field: "vendor.vendor", header: "Vendor" },
    { field: "vendor.vendor_code", header: "Code" },
    { field: "products.name", header: "Products" },
    { field: "vendor_sku", header: "Vendor SKU" },
    { field: "products.products_sku", header: "SKU" },
    { field: "unit_price", header: "Unit Price" },
  ]

  const [selectedColumns, setSelectedColumns] = useState(columns)

  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    )
    setSelectedColumns(orderedSelectedColumns)
  }

  const header = (
    <div style={{ textAlign: "left" }}>
      <MultiSelect
        value={selectedColumns}
        options={columns}
        optionLabel="header"
        onChange={onColumnToggle}
        style={{ width: "20em" }}
      />
    </div>
  )

  const columnComponents = selectedColumns.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        filter
        filterPlaceholder="Search...."
      />
    )
  })

  useEffect(() => {
    const obj = {
      value: [
        { field: "products.products_sku", header: "SKU" },
        { field: "products.name", header: "Products" },
        { field: "vendor_sku", header: "Vendor SKU" },
        { field: "unit_price", header: "Unit Price" },
      ],
    }
    onColumnToggle(obj)
  }, [])

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

      "vendor.vendor": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "vendor.vendor_code": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "products.name": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      "products.products_sku": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor_sku: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    })
    setGlobalFilterValue("")
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <MultiSelect
          value={selectedColumns}
          options={columns}
          optionLabel="header"
          onChange={onColumnToggle}
          style={{ width: "20em" }}
        />
        <div className="flex gap-4">
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
        </div>
      </div>
    )
  }
  const header1 = renderHeader()

  const searchProducts = createSearchFunction(productOptions, setFilteredSuggestions)
  const searchVendor = createSearchFunction(vendorOptions, setVendorSuggestions)

  useEffect(() => {
    const ErrorArray = [
      createVpMutationError,
      updateVpMutationError,
      // vp_ProductsFetchingError,
      // vp_VendorFetchingError,
    ]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [
    createVpMutationError,
    updateVpMutationError,
    // vp_ProductsFetchingError,
    // vp_VendorFetchingError,
  ])

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }
  useEffect(() => {
    initFilters()
  }, [])

  // if (isLoading || isVendorsLoading || isProductsLoading) return <div>Loading</div>

  const tableVendorProducts = vendor_products.map(
    ({ products, unit_price, vendor, vp_id, vendor_sku }) => {
      return {
        vp_id,
        unit_price,
        item_name: products.name,
        sku_code: products.products_sku,
        vendor_code: vendor.vendor_code,
        vendor_sku: vendor_sku,
        vendor: vendor.vendor,
        vendor_id: vendor.vendor_id,
        product_id: products.product_id,
      }
    }
  )

  const onBasicUpload = async (e) => {
    setErrorProducts([])

    let index = 2
    papa.parse(e.files[0], {
      header: true,
      skipEmptyLines: true,
      step: async ({ data }, parser) => {
        const missingKey = ["VENDOR_ID", "PRODUCT_ID", "UNIT_PRICE", "SKU"].find(
          (key) => !(key in data)
        )

        if (missingKey) {
          setErrorProducts([...errorProducts, { message: `Column ${missingKey} missing.` }])
          parser.abort()
        }

        const result = await createVendorProductMutation(
          {
            vendor_vendor_id: Number(data["VENDOR_ID"]),
            products_product_id: Number(data["PRODUCT_ID"]),
            unit_price: Number(data["UNIT_PRICE"]),
            vendor_sku: data["SKU"],
          },
          {
            onSuccess: () => {
              toast?.current?.show(tsuccess(null, "Product created successfully."))
            },
            onError: (error) => {
              console.error("Product failed: ", data)
              setErrorProducts([
                ...errorProducts,
                { ...data, message: error.message, rowNum: index },
              ])
            },
          }
        )
        index += 1
        await refetch()
      },
    })
  }

  const vpCsvFormatDetails = {
    headers: ["VENDOR_ID", "PRODUCT_ID", "UNIT_PRICE", "SKU"],
    name: "Vendor-catalog-format.csv",
  }

  // console.log(btnVisibility)
  const formik = useFormik({
    initialValues: newProduct,
    validationSchema: Yup.object().shape({
      unit_price: Yup.number().required("*Required").typeError("Must be a Number"),
      vendor_vendor_id: Yup.string().required("*Required").typeError("*Required"),
      name: Yup.string().required("*Required").typeError("*Required"),
      // vendor_sku: Yup.string().required("*Required"),
    }),
    onSubmit: async (data) => {
      const { unit_price, vendor_sku } = data
      if (editState) {
        await updateVendorMutation(
          {
            vp_id: activeRow?.vp_id,
            unit_price,
            vendor_sku,
          },
          {
            onSuccess: () => {
              toast?.current?.show(tsuccess("Updated", "Vendor Product updated successfully"))
            },
          }
        )
        setVendorDialog(false)
      } else {
        await createVendorProductMutation(
          { ...data },
          {
            onSuccess: () => {
              toast?.current?.show(tsuccess(null, "Vendor Product created successfully"))
            },
          }
        )
      }
      await refetch()
      setVendorDialog(false)
      setNewProduct(initialProductState)
      formik.resetForm()
    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  console.log("Form Data", formik.values)

  return (
    <div className="grid w-full" ref={scrolToTop}>
      <Toast ref={toast} />
      {(vp_Creating || vp_Updating) && <LoaderFullScreen />}

      <div className="col-12 ">
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
        <div className="card flex justify-content-between align-items-center">
          <h4 className="mb-0">Vendor Catalog</h4>
          <div className="flex">
            <Button
              icon="pi pi-plus"
              className="ml-2"
              label="Add Vendor Products"
              onClick={() => {
                setVendorDialog(true)
                setNewProduct(initialProductState)
              }}
            ></Button>
            <span className=" flex justify-content-center align-items-center">
              <FileUpload
                accept=".csv"
                className="ml-2 inline-block "
                mode="basic"
                customUpload
                maxFileSize={1000000}
                uploadHandler={(e) => onBasicUpload(e)}
                ref={clearupload}
                onSelect={() => setBtnVisibility(true)}
                onBeforeSelect={() => setBtnVisibility(false)}
                onClear={() => setBtnVisibility(false)}
              />
              <Button
                visible={btnVisibility}
                style={{ backgroundColor: "var(--red-400)", border: "var(--red-400)" }}
                icon="pi pi-file-excel                "
                className=" ml-2"
                onClick={() => {
                  clearupload?.current.clear()
                  setErrorProducts([])
                  setErrorMsgs([])
                }}
                tooltip="Clear the File"
                tooltipOptions={{ position: "top" }}
              />
            </span>

            <Button
              icon="pi pi-download"
              className="ml-2"
              label="CSV format"
              onClick={() => createCSVFormat(vpCsvFormatDetails)}
            />
          </div>
        </div>
      </div>

      <div
        style={{ width: "99%" }}
        className={`col-12 card ${
          vendorDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        } ml-2`}
      >
        <form className="p-fluid p-5" onSubmit={formik.handleSubmit}>
          <div className="flex justify-content-between">
            {/* <h4 className="mb-3">{editState ? "Update " : "Create "}Vendor Product</h4> */}
            <h4 className="mb-3">
              {" "}
              {readOnly
                ? "Vendor Product"
                : editState
                ? "Update Vendor Product "
                : "Create Vendor Product "}
            </h4>

            {readOnly ? (
              <Button
                icon="pi pi-pencil"
                className="mr-1"
                onClick={async (e) => {
                  e.preventDefault()
                  setVendorDialog(true)
                  setReadOnly(false)
                  setEditState(true)
                  // setUpdateValue(!updateValue)
                  // setVendorEditState(!vendorEditState)
                }}
                tooltip="Edit Form"
                tooltipOptions={{ position: "top" }}
              />
            ) : null}
          </div>

          <div className="formgrid grid justify-content-around">
            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <div className="p-float-label">
                <AutoComplete
                  id="vendor_vendor_id"
                  disabled={readOnly || editState}
                  value={formik.values.vendor}
                  suggestions={vendorSuggestions}
                  completeMethod={searchVendor}
                  field="name"
                  onChange={async (e) => {
                    console.log(e.value)
                    let vendor_vendor_id = typeof e.value === "string" ? e.value : e.value.vendor_id
                    let vendor = typeof e.value === "string" ? e.value : e.value.name

                    await formik.setValues({
                      ...formik.values,
                      vendor_vendor_id,
                      vendor,
                    })
                    // formik.values = { ...formik.values, vendor_city, vendor_state }
                  }}
                  aria-label="products"
                  dropdownAriaLabel="Select Product"
                  className={classNames({ "p-invalid": isFormFieldValid("vendor_vendor_id") })}
                />

                <label
                  htmlFor="vendor_vendor_id"
                  className={classNames({ "p-error": isFormFieldValid("vendor_vendor_id") })}
                >
                  Select Vendor
                </label>
              </div>
              {getFormErrorMessage("vendor_vendor_id")}
            </div>

            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <div className="p-float-label">
                <AutoComplete
                  id="name"
                  disabled={readOnly || editState}
                  value={formik.values.name}
                  suggestions={filteredSuggestions}
                  completeMethod={searchProducts}
                  field="name"
                  onChange={async (e) => {
                    console.log(e.value)
                    let products_product_id =
                      typeof e.value === "string" ? e.value : e.value.product_id
                    let name = typeof e.value === "string" ? e.value : e.value.name
                    // let products_sku = typeof e.value === "string" ? e.value : e.value.products_sku
                    await formik.setValues({
                      ...formik.values,
                      products_product_id,
                      name,
                      // products_sku,
                    })
                  }}
                  aria-label="products"
                  dropdownAriaLabel="Select Product"
                  className={classNames({ "p-invalid": isFormFieldValid("name") })}
                />

                <label
                  htmlFor="name"
                  className={classNames({ "p-error": isFormFieldValid("name") })}
                >
                  Select Product
                </label>
              </div>
              {getFormErrorMessage("name")}
            </div>
            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <span className="p-float-label">
                <InputText
                  id="vendor_sku"
                  disabled={readOnly}
                  name="vendor_sku"
                  value={formik.values.vendor_sku}
                  onChange={formik.handleChange}
                  autoFocus
                  className={classNames({ "p-invalid": isFormFieldValid("vendor_sku") })}
                />
                <label
                  htmlFor="vendor_sku"
                  className={classNames({ "p-error": isFormFieldValid("vendor_sku") })}
                >
                  Vendor SKU
                </label>
              </span>
              {getFormErrorMessage("vendor_sku")}
            </div>
            <div className="field col-12 md:col-3 lg:col-3 mt-4">
              <span className="p-float-label">
                <InputNumber
                  id="unit_price"
                  name="unit_price"
                  disabled={readOnly}
                  value={formik.values.unit_price}
                  onChange={(e) => formik.setValues({ ...formik.values, unit_price: e.value })}
                  autoFocus
                  className={classNames({ "p-invalid": isFormFieldValid("unit_price") })}
                />
                <label
                  htmlFor="unit_price"
                  className={classNames({ "p-error": isFormFieldValid("unit_price") })}
                >
                  Unit Price
                </label>
              </span>
              {getFormErrorMessage("unit_price")}
            </div>
          </div>

          <div className="flex justify-content-end mt-3">
            <Button type="submit" className="mr-2" label={editState ? "UPDATE" : "ADD"} />
            <Button
              className="p-button-secondary"
              type="button"
              label="Cancel"
              onClick={() => {
                // ONHIDE
                formik.resetForm()
                setVendorDialog(false)
                setNewProduct(initialProductState)
                setEditState(false)
              }}
            />
          </div>
        </form>
      </div>

      <div
        className={`col-12 ${
          errorProducts.length
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <div className="card border-primary border-2 bg-primary-reverse">
          <h6>Following are a list of failed entries: </h6>
          <ul>
            {errorProducts.map(({ rowNum, message }, index) => {
              if (rowNum)
                return (
                  <li key={"error-" + index}>
                    Row Number {rowNum}:{" "}
                    <ul>
                      <li>{message}</li>
                    </ul>
                  </li>
                )
              return (
                <li key={"error-" + index}>
                  <li>{message}</li>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      {/*       
       <div className="col-12">
        <div className="card">
          <DataTable
            value={vendor_products}
            showGridlines
            stripedRows
            className="text-s datatable-responsive"
            filters={filters}
            header={header1}
            filterDisplay="menu"
          >
            <Column
              field="vendor.vendor"
              header="Vendor"
              filter
              filterPlaceholder="Search by Vendor"
            />
            <Column
              field="vendor.vendor_code"
              header="Vendor Code"
              filter
              filterPlaceholder="Search by Vendor Code"
            />
            <Column
              field="products.name"
              header="Products"
              filter
              filterPlaceholder="Search by Product"
            />
            <Column
              field="products.products_sku"
              header="SKU"
              filter
              filterPlaceholder="Search by SKU"
            />
            <Column
              field="vendor_sku"
              header="Vendor SKU"
              filter
              filterPlaceholder="Search by Vendor SKU"
            />
            <Column field="unit_price" header="Unit Price" />
            <Column
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      className="mr-1"
                      onClick={async () => {
                        console.log("rowData", rowData)
                        const {
                          vendor_vendor_id,
                          vendor_sku,
                          unit_price,
                          products_product_id,
                          products: { name },
                          vendor: { vendor },
                        } = rowData

                        scrolToTop.current?.scrollIntoView()
                        setActiveRow(rowData)
                        setEditState(true)
                        setVendorDialog(true)

                        await formik.setValues({
                          unit_price,
                          vendor_vendor_id,
                          products_product_id,
                          vendor_sku,
                          name,
                          vendor,
                        })
                      }}
                    />
                    <Button
                      disabled={true}
                      icon="pi pi-trash"
                      className="mr-1"
                      onClick={async () => {
                        await deleteVendorProductMutation({ vp_id: Number(rowData.vp_id) })
                        await refetch()
                      }}
                    />
                  </div>
                )
              }}
            />
          </DataTable>
        </div>
      </div> */}

      <div className="col-12">
        <div className="card">
          <DataTable
            value={vendor_products}
            showGridlines
            stripedRows
            className="text-s datatable-responsive"
            filters={filters}
            header={header1}
            filterDisplay="menu"
            onRowClick={async (e) => {
              setStoreData({ ...e.data })
              const {
                vendor_vendor_id,
                vendor_sku,
                unit_price,
                products_product_id,
                products: { name },
                vendor: { vendor },
              } = e.data

              await formik.setValues({
                unit_price,
                vendor_vendor_id,
                products_product_id,
                vendor_sku,
                name,
                vendor,
              })
              // setEditState(true)
              setReadOnly(true)
              setVendorDialog(true)
            }}
          >
            {columnComponents}

            <Column header="Priority" body={() => Math.floor(Math.random() * 5) + 1} />

            {/* <Column
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      className="mr-1"
                      onClick={async () => {
                        console.log("rowData", rowData)
                        const {
                          vendor_vendor_id,
                          vendor_sku,
                          unit_price,
                          products_product_id,
                          products: { name },
                          vendor: { vendor },
                        } = rowData

                        scrolToTop.current?.scrollIntoView()
                        setActiveRow(rowData)
                        setEditState(true)
                        setVendorDialog(true)

                        await formik.setValues({
                          unit_price,
                          vendor_vendor_id,
                          products_product_id,
                          vendor_sku,
                          name,
                          vendor,
                        })
                      }}
                    />
                    <Button
                      disabled={true}
                      icon="pi pi-trash"
                      className="mr-1"
                      onClick={async () => {
                        await deleteVendorProductMutation({ vp_id: Number(rowData.vp_id) })
                        await refetch()
                      }}
                    />
                  </div>
                )
              }}
            /> */}
          </DataTable>
        </div>
      </div>
    </div>
  )
}

const Vendor_productsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Vendor_productsList />
      </Layout>
    </Suspense>
  )
}

export default Vendor_productsPage
