import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getInventory_products from "app/inventory_products/queries/getInventory_products"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import Loading from "components/loading"
import { FileUpload } from "primereact/fileupload"
import papa from "papaparse"
import downloadCsv from "download-csv"
import createInventory_product from "app/inventory_products/mutations/createInventory_product"
import updateInventory_product from "app/inventory_products/mutations/updateInventory_product"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import getProducts from "app/products/queries/getProducts"
import deleteInventory_product from "app/inventory_products/mutations/deleteInventory_product"
import axios from "axios"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { createCSVFormat, exportExcel, filterExistingValues, tsuccess } from "app/constants"
import { Toast } from "primereact/toast"
import ErrorCard from "components/ErrorCard"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"

const ITEMS_PER_PAGE = 100

export const Inventory_productsList = () => {
  const [
    createInventory_productMutation,
    { error: createInventoryError, isLoading: creatingInventory },
  ] = useMutation(createInventory_product)
  const [
    updateInventory_productMutation,
    { error: updateInventoryError, isLoading: updatingInventory },
  ] = useMutation(updateInventory_product)
  const [deleteInventory_productsMutation] = useMutation(deleteInventory_product)
  const [createNotifications_sentMutation] = useMutation(createNotifications_sent)

  const router = useRouter()

  const page = Number(router.query.page) || 0
  // const [{ inventory_products, hasMore }, { refetch }] = usePaginatedQuery(getInventory_products, {
  //   orderBy: { inventory_product_id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })

  // console.log("inventory_products", inventory_products)

  // const [{ products }] = usePaginatedQuery(getProducts, {
  //   orderBy: { product_id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })
  const products = [
    {
      product_id: 1,
      name: "Pi",
      product_category: "3D Printer",
      product_length: "40",
      product_width: "80",
      product_height: "08",
      product_weight: "30",
      product_Color: "Black",
      product_brand: "brand",
      product_taxcode: "12365479885",
      product_gstcode: "08742784574",
      product_hsnCode: "84439940",
      product_tags: "tags",
      product_costPrice: "200/-",
      product_mrp: "400/-",
      product_basePrice: "320/-",
      product_enabled: "yes",
      product_taxCalcuation: "tax calculation type",

      description: "Pi-descasw",
      product_type: "Electronics",
      products_sku: "TIF001",
      Price: 11,
      product_unit: "pc",
      vendor_products: [
        {
          vp_id: 1,
          unit_price: 424,
          vendor_vendor_id: 1,
          products_product_id: 1,
          enabled: 1,
          priority: 1,
          vendor_sku: "DA1002",
        },
        {
          vp_id: 36,
          unit_price: 756,
          vendor_vendor_id: 4,
          products_product_id: 1,
          enabled: 1,
          priority: 1,
          vendor_sku: "TE417",
        },
        {
          vp_id: 37,
          unit_price: 454,
          vendor_vendor_id: 5,
          products_product_id: 1,
          enabled: 1,
          priority: 1,
          vendor_sku: "TE420",
        },
        {
          vp_id: 116,
          unit_price: 85,
          vendor_vendor_id: 3,
          products_product_id: 1,
          enabled: 1,
          priority: 1,
          vendor_sku: "TH4568",
        },
      ],
    },
    {
      product_id: 2,
      name: "ESP",
      description: "esp-desc",
      product_type: "Electronics",
      products_sku: "TIF002",
      Price: 142,
      product_unit: "2pc set",
      vendor_products: [
        {
          vp_id: 2,
          unit_price: 10,
          vendor_vendor_id: 1,
          products_product_id: 2,
          enabled: 1,
          priority: 2,
          vendor_sku: "DA1001",
        },
        {
          vp_id: 33,
          unit_price: 25,
          vendor_vendor_id: 123,
          products_product_id: 2,
          enabled: 1,
          priority: 1,
          vendor_sku: "VJ338",
        },
        {
          vp_id: 114,
          unit_price: 41,
          vendor_vendor_id: 147,
          products_product_id: 2,
          enabled: 1,
          priority: 1,
          vendor_sku: "FK490",
        },
      ],
    },
    {
      product_id: 3,
      name: "Waterproof Ultrasonic Sensor",
      description: "water-desp",
      product_type: "Sensors",
      products_sku: "TIF003",
      Price: 24,
      product_unit: "combo",
      vendor_products: [
        {
          vp_id: 5,
          unit_price: 50,
          vendor_vendor_id: 3,
          products_product_id: 3,
          enabled: 1,
          priority: 4,
          vendor_sku: "TE103",
        },
        {
          vp_id: 79,
          unit_price: 142,
          vendor_vendor_id: 4,
          products_product_id: 3,
          enabled: 1,
          priority: 1,
          vendor_sku: "KA146",
        },
      ],
    },
    {
      product_id: 4,
      name: "E18-D80NK Infrared Sensor Module",
      description: "description",
      product_type: "Sensors",
      products_sku: "TIF004",
      Price: 42,
      product_unit: null,
      vendor_products: [
        {
          vp_id: 11,
          unit_price: 83,
          vendor_vendor_id: 1,
          products_product_id: 4,
          enabled: 1,
          priority: 1,
          vendor_sku: "DA102",
        },
        {
          vp_id: 83,
          unit_price: 0,
          vendor_vendor_id: 3,
          products_product_id: 4,
          enabled: 1,
          priority: 1,
          vendor_sku: "TE104",
        },
        {
          vp_id: 108,
          unit_price: 45,
          vendor_vendor_id: 123,
          products_product_id: 4,
          enabled: 1,
          priority: 1,
          vendor_sku: "VJ12345",
        },
        {
          vp_id: 113,
          unit_price: 40,
          vendor_vendor_id: 147,
          products_product_id: 4,
          enabled: 1,
          priority: 1,
          vendor_sku: "FK491",
        },
      ],
    },
    {
      product_id: 5,
      name: "MQ-135 gas sensor Module",
      description: "description 135",
      product_type: "Sensors",
      products_sku: "TIF005",
      Price: 56,
      product_unit: null,
      vendor_products: [
        {
          vp_id: 20,
          unit_price: 120,
          vendor_vendor_id: 3,
          products_product_id: 5,
          enabled: 1,
          priority: 1,
          vendor_sku: "TE105",
        },
        {
          vp_id: 105,
          unit_price: 123,
          vendor_vendor_id: 2,
          products_product_id: 5,
          enabled: 1,
          priority: 1,
          vendor_sku: "ssWW",
        },
        {
          vp_id: 106,
          unit_price: 111,
          vendor_vendor_id: 170,
          products_product_id: 5,
          enabled: 1,
          priority: 1,
          vendor_sku: "qqq",
        },
      ],
    },
    {
      product_id: 6,
      name: "Turbidity Sensor",
      description: "description sensor",
      product_type: "Sensors",
      products_sku: "TIF006",
      Price: 67,
      product_unit: null,
      vendor_products: [
        {
          vp_id: 6,
          unit_price: 905,
          vendor_vendor_id: 3,
          products_product_id: 6,
          enabled: 1,
          priority: 5,
          vendor_sku: "TE106",
        },
        {
          vp_id: 9,
          unit_price: 88,
          vendor_vendor_id: 4,
          products_product_id: 6,
          enabled: 1,
          priority: 3,
          vendor_sku: "KM106",
        },
        {
          vp_id: 34,
          unit_price: 120,
          vendor_vendor_id: 5,
          products_product_id: 6,
          enabled: 1,
          priority: 1,
          vendor_sku: "TE1564",
        },
      ],
    },
    {
      product_id: 7,
      name: "Heat Flame Sensor",
      description: "description heat",
      product_type: "Sensors",
      products_sku: "TIF007",
      Price: 56,
      product_unit: null,
      vendor_products: [
        {
          vp_id: 8,
          unit_price: 45,
          vendor_vendor_id: 3,
          products_product_id: 7,
          enabled: 1,
          priority: 2,
          vendor_sku: "TE107",
        },
        {
          vp_id: 10,
          unit_price: 47,
          vendor_vendor_id: 4,
          products_product_id: 7,
          enabled: 1,
          priority: 2,
          vendor_sku: "KM107",
        },
        {
          vp_id: 35,
          unit_price: 11,
          vendor_vendor_id: 5,
          products_product_id: 7,
          enabled: 1,
          priority: 1,
          vendor_sku: "TE571",
        },
      ],
    },
    {
      product_id: 8,
      name: "Eye Blink Sensor",
      description: "eye description",
      product_type: "Sensors",
      products_sku: "TIF008",
      Price: 53,
      product_unit: null,
      vendor_products: [
        {
          vp_id: 29,
          unit_price: 11,
          vendor_vendor_id: 1,
          products_product_id: 8,
          enabled: 1,
          priority: 1,
          vendor_sku: "qws",
        },
      ],
    },
    {
      product_id: 9,
      name: "Laser Module",
      description: "description laser",
      product_type: "Sensors",
      products_sku: "TIF009",
      Price: 856,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 10,
      name: "Sound Sensor Module",
      description: "sound description",
      product_type: "Sensors",
      products_sku: "TIF010",
      Price: 56,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 11,
      name: "Servo Motor Pan-Tilt Setup",
      description: "servo description",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF011",
      Price: 5657,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 12,
      name: "Micro Vibration Motor",
      description: "micro  ",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF012",
      Price: 65,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 13,
      name: "A4988 Stepper Motor Driver",
      description: "description pump",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF013",
      Price: 346,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 14,
      name: "R385 DC PUMP",
      description: "R385 ",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF014",
      Price: 787,
      product_unit: null,
      vendor_products: [
        {
          vp_id: 104,
          unit_price: 12,
          vendor_vendor_id: 4,
          products_product_id: 14,
          enabled: 1,
          priority: 1,
          vendor_sku: "dewa",
        },
      ],
    },
    {
      product_id: 15,
      name: "Solenoid valve 12V",
      description: "valve 12V",
      product_type: "Motors and mechanical devices",
      products_sku: "TIF015",
      Price: 343,
      product_unit: null,
      vendor_products: [
        {
          vp_id: 81,
          unit_price: 85,
          vendor_vendor_id: 1,
          products_product_id: 15,
          enabled: 1,
          priority: 1,
          vendor_sku: "DA10456",
        },
      ],
    },
    {
      product_id: 16,
      name: "Neo 6M GPS Module",
      description: "Neo 6M GPS",
      product_type: "IOT & wireless devices",
      products_sku: "TIF016",
      Price: 657,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 17,
      name: "NRF24L01+PA+LNA",
      description: "NRF24L01+PA+LNA",
      product_type: "IOT & wireless devices",
      products_sku: "TIF017",
      Price: 786,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 18,
      name: "test",
      description: "tes0123",
      product_type: "IOT & wireless devices",
      products_sku: "TIF018",
      Price: 657,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 19,
      name: "ESP12E ESP8266 Wireless Transceiver Module",
      description: "ESP12E ",
      product_type: "IOT & wireless devices",
      products_sku: "TIF019",
      Price: 53,
      product_unit: null,
      vendor_products: [],
    },
    {
      product_id: 20,
      name: "dummy name",
      description: "dummy name",
      product_type: "dummy product type",
      products_sku: "TIF000",
      Price: 4,
      product_unit: null,
      vendor_products: [],
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
      vendor_products: [
        {
          vp_id: 102,
          unit_price: 15,
          vendor_vendor_id: 123,
          products_product_id: 21,
          enabled: 1,
          priority: 1,
          vendor_sku: "VJW1001",
        },
        {
          vp_id: 112,
          unit_price: 45,
          vendor_vendor_id: 147,
          products_product_id: 21,
          enabled: 1,
          priority: 1,
          vendor_sku: "FK489",
        },
      ],
    },
    {
      product_id: 23,
      name: "Test CSV",
      description: "Test CSV",
      product_type: "CSV",
      products_sku: "TestSKU",
      Price: 67,
      product_unit: null,
      vendor_products: [
        {
          vp_id: 86,
          unit_price: 12,
          vendor_vendor_id: 1,
          products_product_id: 23,
          enabled: 1,
          priority: 1,
          vendor_sku: "aws",
        },
      ],
    },
    {
      product_id: 64,
      name: "boat",
      description: "asdddasd",
      product_type: "eleectric",
      products_sku: "TI-100",
      Price: 0,
      product_unit: "Pc",
      vendor_products: [],
    },
  ]

  const inventory_products = [
    {
      inventory_product_id: 1,
      product_description: "grade one",
      price: 45622,
      quantity: 150,
      products_product_id: 4,
      created_at: "2022-12-15T15:52:03.000Z",
      good_stock: 121,
      bad_stock: 50,

      block_stock: 3,
      available_stock: 71,
      shelf: 60,
      shelf_attributes: {
        InventoryAlloction: "InventoryAlloction: true",
        InventorySync: "Inventory Sync: true",
        SkuMixing: "SKU Mixing: true",
        ShelfHold: "Shelf on hold: false",
      },
      size: 70,
      color: "Black",
      brand: "Robodo",

      products: {
        product_id: 4,
        name: "E18-D80NK Infrared Sensor Module",
        description: "description",
        product_type: "Sensors",
        products_sku: "TIF004",
        Price: 42,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 2,
      product_description: "tester",
      price: 3223,
      quantity: 121,
      products_product_id: 2,
      created_at: "2022-12-15T15:52:52.000Z",
      good_stock: 100,
      bad_stock: 0,
      products: {
        product_id: 2,
        name: "ESP",
        description: "esp-desc",
        product_type: "Electronics",
        products_sku: "TIF002",
        Price: 142,
        product_unit: "2pc set",
      },
    },
    {
      inventory_product_id: 3,
      product_description: "sensor",
      price: 22,
      quantity: 3434,
      products_product_id: 3,
      created_at: "2022-12-15T10:23:09.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 3,
        name: "Waterproof Ultrasonic Sensor",
        description: "water-desp",
        product_type: "Sensors",
        products_sku: "TIF003",
        Price: 24,
        product_unit: "combo",
      },
    },
    {
      inventory_product_id: 18,
      product_description: "sound description",
      price: 12,
      quantity: 123,
      products_product_id: 10,
      created_at: "2022-12-26T12:48:16.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 10,
        name: "Sound Sensor Module",
        description: "sound description",
        product_type: "Sensors",
        products_sku: "TIF010",
        Price: 56,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 38,
      product_description: "valve 12V",
      price: 11,
      quantity: 11,
      products_product_id: 15,
      created_at: "2022-12-27T06:41:16.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 15,
        name: "Solenoid valve 12V",
        description: "valve 12V",
        product_type: "Motors and mechanical devices",
        products_sku: "TIF015",
        Price: 343,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 40,
      product_description: "e",
      price: 0,
      quantity: 23,
      products_product_id: 1,
      created_at: "2022-12-27T07:17:16.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 1,
        name: "Pi",
        description: "Pi-descasw",
        product_type: "Electronics",
        products_sku: "TIF001",
        Price: 11,
        product_unit: "pc",
      },
    },
    {
      inventory_product_id: 42,
      product_description: "water-desp",
      price: 123,
      quantity: 12,
      products_product_id: 3,
      created_at: "2023-01-03T03:29:23.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 3,
        name: "Waterproof Ultrasonic Sensor",
        description: "water-desp",
        product_type: "Sensors",
        products_sku: "TIF003",
        Price: 24,
        product_unit: "combo",
      },
    },
    {
      inventory_product_id: 43,
      product_description: "Pi-descasw",
      price: 123,
      quantity: 2,
      products_product_id: 1,
      created_at: "2023-01-03T03:34:02.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 1,
        name: "Pi",
        description: "Pi-descasw",
        product_type: "Electronics",
        products_sku: "TIF001",
        Price: 11,
        product_unit: "pc",
      },
    },
    {
      inventory_product_id: 46,
      product_description: "servo description",
      price: 234,
      quantity: 123,
      products_product_id: 11,
      created_at: "2023-01-03T04:59:35.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 11,
        name: "Servo Motor Pan-Tilt Setup",
        description: "servo description",
        product_type: "Motors and mechanical devices",
        products_sku: "TIF011",
        Price: 5657,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 47,
      product_description: "Test CSV",
      price: 123,
      quantity: 12,
      products_product_id: 23,
      created_at: "2023-01-03T05:00:49.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 23,
        name: "Test CSV",
        description: "Test CSV",
        product_type: "CSV",
        products_sku: "TestSKU",
        Price: 67,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 49,
      product_description: "eye description",
      price: 3,
      quantity: 34,
      products_product_id: 8,
      created_at: "2023-01-03T05:01:43.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 8,
        name: "Eye Blink Sensor",
        description: "eye description",
        product_type: "Sensors",
        products_sku: "TIF008",
        Price: 53,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 50,
      product_description: "micro  ",
      price: 897,
      quantity: 657,
      products_product_id: 12,
      created_at: "2023-01-03T05:08:38.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 12,
        name: "Micro Vibration Motor",
        description: "micro  ",
        product_type: "Motors and mechanical devices",
        products_sku: "TIF012",
        Price: 65,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 72,
      product_description: "R385 ",
      price: 879,
      quantity: 13,
      products_product_id: 14,
      created_at: "2023-01-04T12:10:31.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 14,
        name: "R385 DC PUMP",
        description: "R385 ",
        product_type: "Motors and mechanical devices",
        products_sku: "TIF014",
        Price: 787,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 73,
      product_description: "Neo 6M GPS",
      price: 563,
      quantity: 60,
      products_product_id: 16,
      created_at: "2023-01-04T12:12:51.000Z",
      good_stock: null,
      bad_stock: 0,
      products: {
        product_id: 16,
        name: "Neo 6M GPS Module",
        description: "Neo 6M GPS",
        product_type: "IOT & wireless devices",
        products_sku: "TIF016",
        Price: 657,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 74,
      product_description: "NRF24L01+PA+LNA",
      price: 14,
      quantity: 60,
      products_product_id: 17,
      created_at: "2023-01-04T12:20:35.000Z",
      good_stock: 56,
      bad_stock: 4,
      products: {
        product_id: 17,
        name: "NRF24L01+PA+LNA",
        description: "NRF24L01+PA+LNA",
        product_type: "IOT & wireless devices",
        products_sku: "TIF017",
        Price: 786,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 75,
      product_description: "dummy name",
      price: 21,
      quantity: 21,
      products_product_id: 20,
      created_at: "2023-01-04T12:26:01.000Z",
      good_stock: 20,
      bad_stock: 1,
      products: {
        product_id: 20,
        name: "dummy name",
        description: "dummy name",
        product_type: "dummy product type",
        products_sku: "TIF000",
        Price: 4,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 76,
      product_description: "ESP12E ",
      price: 123,
      quantity: 123,
      products_product_id: 19,
      created_at: "2023-01-10T07:49:59.000Z",
      good_stock: 100,
      bad_stock: 0,
      products: {
        product_id: 19,
        name: "ESP12E ESP8266 Wireless Transceiver Module",
        description: "ESP12E ",
        product_type: "IOT & wireless devices",
        products_sku: "TIF019",
        Price: 53,
        product_unit: null,
      },
    },
    {
      inventory_product_id: 77,
      product_description: "asdddasd",
      price: 111,
      quantity: 20,
      products_product_id: 64,
      created_at: "2023-01-19T09:27:38.000Z",
      good_stock: 19,
      bad_stock: 0,
      products: {
        product_id: 64,
        name: "boat",
        description: "asdddasd",
        product_type: "eleectric",
        products_sku: "TI-100",
        Price: 0,
        product_unit: "Pc",
      },
    },
    {
      inventory_product_id: 78,
      product_description: "greate",
      price: 12,
      quantity: 12,
      products_product_id: 12,
      created_at: "2023-01-20T06:01:41.000Z",
      good_stock: 10,
      bad_stock: 0,
      products: {
        product_id: 12,
        name: "Micro Vibration Motor",
        description: "micro  ",
        product_type: "Motors and mechanical devices",
        products_sku: "TIF012",
        Price: 65,
        product_unit: null,
      },
    },
  ]

  const productOptions = products.map(({ product_id, name, products_sku, description }) => {
    return {
      name: `${products_sku} - ${name}`,
      product_id,
      description,
    }
  })

  const productInitialState = {
    name: "",
    price: null,
    quantity: null,
    products_product_id: "",
    product_description: "",
    good_stock: null,
  }

  const [productForm, setProductForm] = useState<boolean>(false)
  const [productEditState, setProductEditState] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)
  const [productDetails, setProductDetails] = useState(productInitialState)
  const [activeRowData, setActiveRowData] = useState({})
  const [btnVisibility, setBtnVisibility] = useState(false)
  const [errorProducts, setErrorProducts] = useState([])
  const [filters, setFilters] = useState({})
  const [globalFilterValue, setGlobalFilterValue] = useState("")

  const clearUpload = useRef<FileUpload>(null)
  const toast = useRef(null)
  const scroolToTop = useRef<HTMLDivElement>(null)

  // console.log("activeRowData", activeRowData)
  // const productsList =  products.map
  // console.log(products)

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
      products_sku: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      price: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      product_type: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    })
    setGlobalFilterValue("")
  }

  const createExcelExportData = () => {
    const excelData = inventory_products.map((ele) => {
      const {
        products: { products_sku, name, product_type },
        good_stock,
        quantity,
      } = ele

      return {
        SKU: products_sku,
        Product: name,
        Type: product_type,
        "Good-Stock": good_stock,
        "Bad-Stock": quantity - good_stock,
        "Total-Stock": quantity,
      }
    })
    exportExcel(excelData)
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-">
        <span
          className="flex justify-content-between flex-grow-1 pr-3"
          style={{ display: "inline-block" }}
        >
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
        </span>
        <Button
          type="button"
          icon="pi pi-file-excel"
          onClick={createExcelExportData}
          className="p-button-success mr-2"
          // data-pr-tooltip="XLS"
          tooltip="Export-XLS"
          tooltipOptions={{ position: "bottom" }}
        />
      </div>
    )
  }
  const header1 = renderHeader()

  const productsId = products.map((ele, i) => ele.product_id)
  const inventoryProductsId = inventory_products.map((ele, i) => ele.products_product_id)
  // console.log("inventoryProductsId", inventoryProductsId)
  // console.log("productsId", productsId)
  const avilableProductsID = filterExistingValues(productsId, inventoryProductsId)

  const avilableProducts = productOptions.filter((ele, i) =>
    avilableProductsID.includes(ele.product_id)
  )
  // console.log("avilableProducts", avilableProducts)

  const searchProducts = (event: { query: string }) => {
    setTimeout(() => {
      let _filteredSuggestions
      if (!event.query.trim().length) {
        _filteredSuggestions = [...avilableProducts]
      } else {
        _filteredSuggestions = avilableProducts.filter((element) => {
          return element.name.toLowerCase().includes(event.query.toLowerCase())
        })
      }

      setFilteredSuggestions(_filteredSuggestions)
    }, 50)
  }
  // console.log("products: ", products)
  // console.log("inventory_products", inventory_products)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const tableInventory = inventory_products.map(
    ({
      quantity,
      bad_stock,
      products,
      color,
      brand,
      price,
      size,
      shelf_attributes,
      shelf,
      available_stock,
      inventory_product_id,
      good_stock,
      block_stock,
    }) => {
      return {
        products_sku: products?.products_sku,
        name: products?.name,
        product_type: products?.product_type,
        quantity,
        price,
        inventory_product_id,
        good_stock,
        block_stock,
        available_stock,
        shelf,
        shelf_attributes,
        size,
        color,
        bad_stock,
        brand,
      }
    }
  )

  const onBasicUpload = async (e) => {
    const csv = [] // this will contain all the data of imported csv file

    setErrorProducts([])
    let index = 2
    papa.parse(e.files[0], {
      header: true,
      skipEmptyLines: true,
      step: async ({ data }, parser) => {
        console.log(`${index}-data`, data)
        const missingKey = ["PRODUCT_ID", "PRICE", "QUANTITY", "DESCRIPTION", "GOOD-STOCK"].find(
          (key) => !(key in data)
        )
        console.log("missingKey", missingKey)
        if (missingKey) {
          setErrorProducts([...errorProducts, { message: `Column ${missingKey} missing.` }])
          parser.abort()
        }
        try {
          const result = await createInventory_productMutation(
            {
              price: Number(data["PRICE"]),
              quantity: Number(data["QUANTITY"]),
              products_product_id: Number(data["PRODUCT_ID"]),
              product_description: data["DESCRIPTION"],
              good_stock: Number(data["GOOD-STOCK"]),
            },
            {
              onSuccess: (data) => {
                toast?.current?.show(tsuccess("Products Created", `Products created successfully.`))
              },
              onError: (error) => {
                console.log("Product failed: ", data)
                console.log("error: ", error)
                setErrorProducts([
                  ...errorProducts,
                  { ...data, message: error.message, rowNum: index },
                ])
              },
            }
          )
          index += 1
          // console.log(result)
        } catch (error) {
          console.log(error)
        }
        await refetch()
      },
    })
  }

  // console.log("error-products", errorProducts)
  const vpCsvFormatDetails = {
    headers: ["PRODUCT_ID", "PRICE", "QUANTITY", "DESCRIPTION", "GOOD-STOCK"],
    name: "Inventory-Product-format.csv",
  }

  const formik = useFormik({
    initialValues: productDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required"),
      price: Yup.number().required("*Required").typeError("Must be a Number"),
      quantity: Yup.number().required("*Required").typeError("Must be a Number"),
      good_stock: Yup.number().required("*Required").typeError("Must be a Number"),
    }),
    onSubmit: async (data) => {
      // console.log("data", data)

      const { name, price, quantity, products_product_id, product_description, good_stock } = data

      if (!productEditState) {
        try {
          await createInventory_productMutation(
            {
              product_description: product_description,
              price: price,
              quantity: Number(quantity),
              products_product_id: Number(products_product_id),
              good_stock,
            },
            {
              onSuccess: () => {
                toast?.current?.show(
                  tsuccess("Product Created", `${data.name} created successfully.`)
                )
              },
            }
          )
        } catch (error) {
          console.log("Creatiion", error)
          return
        }
      } else {
        const inventory_product_id = activeRowData.inventory_product_id

        try {
          await updateInventory_productMutation(
            {
              inventory_product_id,
              price: Number(price),
              quantity: Number(quantity),
              good_stock,
            },
            {
              onSuccess: () => {
                toast?.current?.show(
                  tsuccess("Product Updated", `${data.name} updated successfully.`)
                )
              },
            }
          )
        } catch (error) {
          console.log("Updation", error)
        }
      }
      await refetch()
      setProductEditState(false)
      setProductForm(false)
      formik.resetForm()
    },
  })
  // console.log(formik.values)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const [ErrorMsgs, setErrorMsgs] = useState([])
  useEffect(() => {
    const ErrorArray = [createInventoryError, updateInventoryError]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [createInventoryError, updateInventoryError])

  useEffect(() => {
    initFilters()
  }, [])

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  console.log("formik.values", formik.values)

  return (
    <div className="grid w-full mr-0" ref={scroolToTop}>
      {creatingInventory && <LoaderFullScreen />}
      {updatingInventory && <LoaderFullScreen />}
      <Toast ref={toast} />

      <div className="col-12">
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
        <div className="card flex justify-content-between align-items-center">
          <h2 className="mb-0">Inventory</h2>
          <div className="flex">
            <Button
              icon="pi pi-plus"
              className="ml-2"
              label="Add Products"
              onClick={() => {
                setProductForm(true)
              }}
            ></Button>
            <span className=" flex justify-content-center align-items-center">
              <FileUpload
                className="ml-2 inline-block "
                mode="basic"
                accept=".csv"
                customUpload
                maxFileSize={1000000}
                uploadHandler={(e) => onBasicUpload(e)}
                ref={clearUpload}
                onSelect={() => setBtnVisibility(true)}
                onBeforeSelect={() => setBtnVisibility(false)}
                onClear={() => setBtnVisibility(false)}
                chooseLabel="Import"
                chooseOptions={{
                  label: "Uplaod",
                  icon: "pi pi-upload",
                }}
              />
              <Button
                visible={btnVisibility}
                style={{ backgroundColor: "var(--red-400)", border: "var(--red-400)" }}
                icon="pi pi-file-excel                "
                className=" ml-2"
                onClick={() => {
                  clearUpload?.current.clear()
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
      <div
        className={`col-12  ${
          productForm
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <div className="card p-4">
          <form className="p-fluid" onSubmit={formik.handleSubmit}>
            <h4 className="mb-3">{productEditState ? "Update " : "Create "}Product</h4>
            <div className="formgrid grid justify-content-flex-start">
              <div className="field col-12 md:col-3 lg:col-3 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="name"
                    value={formik.values.name}
                    suggestions={filteredSuggestions}
                    completeMethod={searchProducts}
                    disabled={productEditState}
                    dropdown
                    forceSelection
                    field="name"
                    onChange={async (e) => {
                      // console.log(e.value)
                      let name = typeof e.value === "string" ? e.value : e.value?.name
                      let products_product_id = e.value?.product_id
                      let product_description = e.value?.description

                      await formik.setValues({
                        ...formik.values,
                        name,
                        products_product_id,
                        product_description,
                      })
                      // formik.values = { ...formik.values, vendor_city, vendor_state }
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
              {/* <div className="field col-12 md:col-3 lg:col-3 mt-4">
                <span className="p-float-label">
                  <InputNumber
                    id="price"
                    name="price"
                    value={formik.values.price}
                    // onChange={formik.handleChange}
                    onChange={(e) => formik.setValues({ ...formik.values, price: e.value })}
                    autoFocus
                    className={classNames({ "p-invalid": isFormFieldValid("price") })}
                  />
                  <label
                    htmlFor="price"
                    className={classNames({ "p-error": isFormFieldValid("price") })}
                  >
                    Price
                  </label>
                </span>
                {getFormErrorMessage("price")}
              </div> */}
              {/* <div className="field col-12 md:col-3 lg:col-3 mt-4">
                <span className="p-float-label">
                  <InputNumber
                    id="quantity"
                    name="quantity"
                    value={formik.values.quantity}
                    // onChange={formik.handleChange}
                    onChange={(e) => formik.setValues({ ...formik.values, quantity: e.value })}
                    autoFocus
                    className={classNames({ "p-invalid": isFormFieldValid("quantity") })}
                  />

                  <label
                    htmlFor="quantity"
                    className={classNames({ "p-error": isFormFieldValid("quantity") })}
                  >
                    Quantity
                  </label>
                </span>
                {getFormErrorMessage("quantity")}
              </div> */}
              {[
                { type: "text", label: "Price", field: "price" },
                { type: "text", label: "Good Stock", field: "good_stock" },
                { type: "text", label: "Total", field: "quantity" },
              ].map((ele, i) => (
                <div key={i} className="field col-12 md:col-3 lg:col-3 mt-4">
                  <span className="p-float-label">
                    <InputNumber
                      id={ele.field}
                      name={ele.field}
                      value={formik.values[ele.field]}
                      // onChange={formik.handleChange}
                      onChange={(e) => formik.setValues({ ...formik.values, [ele.field]: e.value })}
                      autoFocus
                      className={classNames({ "p-invalid": isFormFieldValid(ele.field) })}
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
              ))}
            </div>
            <div className="flex mt-4">
              <Button type="submit" className="mr-2" label={productEditState ? "UPDATE" : "ADD"} />
              <Button
                className="p-button-secondary"
                type="button"
                label="Cancel"
                onClick={() => {
                  formik.resetForm()
                  setProductEditState(false)
                  setProductForm(false)
                  // setVendorDetails(initialVendorState)
                }}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <DataTable
            value={tableInventory}
            showGridlines
            // header={renderHeader}
            // scrollable
            // scrollHeight="60vh"
            stripedRows
            className="text-s datatable-responsive"
            filters={filters}
            header={header1}
            filterDisplay="menu"
            // globalFilterFields={["products_sku"]}
            emptyMessage="No Results found."
          >
            <Column
              field="products_sku"
              header="SKU"
              filter
              filterPlaceholder="Search by SKU"
              // className="text-center"
            />
            <Column
              field="name"
              header="Products"
              filter
              filterPlaceholder="Search by Products"
              // className="text-center"
            />
            <Column
              field="price"
              header="Price"
              filter
              filterPlaceholder="Search by Price"
              // className="text-center"
            />
            <Column
              field="product_type"
              header="Type"
              filter
              filterPlaceholder="Search by Type"
              // className="text-center"
            />
            {/* <Column
          field="vendor_sku"
          header="Vendor Sku"
          // className="text-center"
        /> */}
            <Column
              field="good_stock"
              header="Good-Stock"
              // className="text-center"
            />
            <Column
              field="bad_stock"
              header="Bad-Stock"
              // body={(rowdata) => rowdata.quantity - rowdata.good_stock}
              // className="text-center"
            />
            {/* <Column
              field="quantity"
              header="Total-Stock"
              // className="text-center"
            /> */}

            <Column
              field="block_stock"
              header="Block-Stock"
              // className="text-center"
            />

            <Column
              field="available_stock"
              header="Available-Stock"
              // className="text-center"
            />

            <Column
              field="shelf"
              header="Shelf"
              // className="text-center"
            />

            <Column
              field="shelf_attributes"
              header="Shelf Attributes"
              body={(rowdata) => {
                const attributes = rowdata.shelf_attributes
                console.log(attributes, "attributes")
                return (
                  <>
                    <p>{attributes?.InventoryAlloction}</p>
                    <p>{attributes?.InventorySync}</p>
                    <p>{attributes?.SkuMixing}</p>
                    <p>{attributes?.ShelfHold}</p>
                  </>
                )
              }}
              // className="text-center"
            />

            <Column
              field="size"
              header="Size"
              // className="text-center"
            />

            <Column
              field="color"
              header="Color"
              // className="text-center"
            />

            <Column
              field="brand"
              header="Brand"
              // className="text-center"
            />

            <Column
              // field="vendor_gstin"
              header="Action"
              body={(rowData) => {
                // console.log("rowData: ", rowData)
                return (
                  <div>
                    <Button
                      // label="Edit"
                      icon="pi pi-pencil"
                      className="m-1"
                      onClick={async () => {
                        console.log("rowData", rowData)
                        setActiveRowData({ ...rowData })
                        setProductEditState(true)
                        setProductForm(true)
                        await formik.setValues({ ...rowData })
                        scroolToTop?.current?.scrollIntoView()
                      }}
                    />
                    <Button
                      // label="Delete"
                      disabled={true}
                      icon="pi pi-trash"
                      className="m-1"
                      onClick={async () => {
                        // console.log("rowData: ", rowData.products_sku)
                        const productSku = await rowData.products_sku
                        // console.log("productSku: ", productSku)
                        const inventoryProductId = inventory_products.filter(({ products }) => {
                          return products.products_sku === productSku
                        })
                        // console.log("inventoryProductId: ", inventoryProductId)

                        await deleteInventory_productsMutation({
                          inventory_product_id: Number(inventoryProductId[0]?.inventory_product_id),
                        })
                        await refetch()
                      }}
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

const Inventory_productsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      {/* <Layout> */}
      <Inventory_productsList />
      {/* </Layout> */}
    </Suspense>
  )
}

export default Inventory_productsPage
