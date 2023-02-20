import { Suspense, useState, useRef, useEffect } from "react"
import { Routes } from "@blitzjs/next"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import papa from "papaparse"

import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { MultiSelect } from "primereact/multiselect"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { FileUpload } from "primereact/fileupload"
import { Toast } from "primereact/toast"

import createProduct from "app/products/mutations/createProduct"
import updateProduct from "app/products/mutations/updateProduct"
import getProducts from "app/products/queries/getProducts"
import getPrefix from "app/prefixes/queries/getPrefix"
import createInventory_product from "app/inventory_products/mutations/createInventory_product"

import Loading from "components/loading"
import { useFormik } from "formik"
import { InputNumber } from "primereact/inputnumber"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { createCSVFormat, createSearchFunction, tsuccess } from "app/constants"
import ErrorCard from "components/ErrorCard"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"
const ITEMS_PER_PAGE = 100

export const ProductsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  // const [{ products }, { isLoading: isProductsLoading, refetch }] = useQuery(getProducts, {
  //   orderBy: { product_id: "asc" },
  // })
  // const [prefix, { isLoading }] = useQuery(getPrefix, { name: "PRODUCT" })
  const [createProductMutation, { error: productCreationError, isLoading: creatingProduct }] =
    useMutation(createProduct)
  const [updateProductMutation, { error: productUpdationError, isLoading: updatingProduct }] =
    useMutation(updateProduct)

  const intialProductDetails = {
    name: "",
    description: "",
    Type: "",
    sku: "",
    unit: "",
    category: "",
    productCode: "",
    length: "",
    width: "",
    height: "",
    weight: "",
    Color: "",
    brand: "",
    taxcode: "",
    gstcode: "",
    hsnCode: "",
    tags: "",
    imageurl: "",
    costPrice: "",
    mrp: "",
    basePrice: "",
    enabled: "",
    taxCalcuation: "",
  }

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
  const columns = [
    { field: "products_sku", header: "SKU" },
    { field: "name", header: "Name" },
    { field: "product_type", header: "Type" },
    { field: "description", header: "Description" },
    { field: "product_unit", header: "Unit" },
    { field: "product_category", header: "Category" },
    // { field: 'product_productCode', header: 'Code' },
    { field: "product_length", header: "Length" },
    { field: "product_width", header: "Width" },
    { field: "product_height", header: "Height" },
    { field: "product_weight", header: "Weight" },
    { field: "product_Color", header: "Color" },
    { field: "product_brand", header: "Brand" },
    { field: "product_taxcode", header: "Tax code" },
    { field: "product_gstcode", header: "Gst Code" },
    { field: "product_hsnCode", header: "HSN Code" },
    { field: "product_tags", header: "Tags" },
    { field: "product_costPrice", header: "Cost Price" },
    { field: "product_mrp", header: "MRP" },
    { field: "product_basePrice", header: "Base Price" },
    { field: "product_enabled", header: "Enabled" },
    { field: "product_taxCalcuation", header: "Tax Calcuation" },
  ]

  const [productDetails, setProductDetails] = useState(intialProductDetails)
  const [productDialog, setProductDialog] = useState(false)
  const [productEditState, setProductEditState] = useState(false)
  const [activeRowData, setActiveRowData] = useState({})
  const [errorProducts, setErrorProducts] = useState([])
  const [btnVisibility, setBtnVisibility] = useState(false)
  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const clearUpload = useRef<FileUpload>(null)
  const [ErrorMsgs, setErrorMsgs] = useState([])
  const [unitSuggestions, setUnitSuggestions] = useState<any>(null)
  const [categorySuggestions, setCategorySuggestions] = useState<any>(null)
  const [filters, setFilters] = useState(null)
  const [globalFilterValue, setGlobalFilterValue] = useState("")

  const [showData, setShowData] = useState([])
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
        { field: "products_sku", header: "SKU" },
        { field: "name", header: "Name" },
        { field: "product_type", header: "Type" },
        { field: "product_unit", header: "Unit" },
      ],
    }
    onColumnToggle(obj)
  }, [])
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
      description: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      product_unit: {
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

  const units = ["Pc", "Combo", "set", "kit"]
  const unitOptions = units.map((ele) => ({
    name: ele,
  }))

  const categorys = [
    "Display",
    "3D Printer",
    "Controllers",
    "Wireless Communication",
    "Wireless",
    "Cables/Wires",
    "Covid",
    "Quadcopter",
    "Power Supply",
    "Electronics",
    "Mechanical",
    "Sensors",
    "Kits",
    "Humanoid",
    "Accessories",
    "Data Converters",
    "Magnets",
    "Glue Gun",
    "Camera",
    "Multimeter",
    "Soldering",
    "eBike",
    "Relay",
    "Covid5",
    "Covid12",
    "Displays",
    "Combos",
    "IC",
    "Tools/Safety",
    "LEDs",
    "ICs_18",
    "Cables & Connectors",
    "M5 Stack",
    "Machine Tools",
    "Oscilloscope & Signal Generator",
  ]
  const categoryOptions = categorys.map((ele, i) => ({
    name: ele,
    id: i + 1,
  }))

  const searchUnits = createSearchFunction(unitOptions, setUnitSuggestions)

  const searchCategory = createSearchFunction(categoryOptions, setCategorySuggestions)

  const onBasicUpload = async (e) => {
    let index = 2
    setErrorProducts([])
    papa.parse(e.files[0], {
      header: true,
      skipEmptyLines: true,
      step: async ({ data }, parser) => {
        const missingKey = [
          "NAME",
          "Description",
          "SKU",
          "Type",
          "Unit",
          "Product Code",
          "Product Length",
          "Product Width",
          "Product Height",
          "Product Weight",
          "Product Color",
          "Product Brand",
          "Tax type code",
          "Gst Tax type code",
          "Product HSN code",
          "Product Tags",
          "Product Cost Price",
          "Product MRP",
          "Product Base Price",
          "Product Enabled",
          "Product Tax Calculation Type",
        ].find((key) => !(key in data))

        if (missingKey) {
          setErrorProducts([...errorProducts, { message: `Column ${missingKey} missing.` }])
          parser.abort()
        }
        // setErrorProducts([
        //   ...errorProducts,
        //   { ...data, message: error.message, rowNum: index },
        // ])
        const result = await createProductMutation(
          {
            name: data?.["NAME"],
            description: data?.["DESCRIPTION"],
            products_sku: data?.["SKU"],
            product_type: data?.["TYPE"],
            product_unit: data?.["UNIT"],
            // product_code:data?.['Product Code'],
          },
          {
            onSuccess: () => {
              toast?.current?.show({
                severity: "success",
                summary: "Product Created",
                detail: "Product created successfully.",
                life: 3000,
              })
            },
            onError: (error) => {
              console.log("Product failed: ", data)
              setErrorProducts([
                ...errorProducts,
                { ...data, message: error.message, rowNum: index },
              ])
            },
          }
        )
        index += 1
      },
    })

    await refetch()
  }

  const formik = useFormik({
    initialValues: productDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required"),
      category: Yup.mixed().required("*Required"),
      sku: Yup.string().required("*Required"),
    }),
    onSubmit: async (data) => {
      console.log("data", data)
      setShowData(<pre>{JSON.stringify(data, null, 2)}</pre>)

      return

      if (!productEditState) {
        try {
          const result = await createProductMutation(
            {
              ...data,
            },
            {
              onSuccess: () => {
                toast?.current?.show(
                  tsuccess("Product Created", `${data.products_sku} created successfully`)
                )
              },
            }
          )
          console.log("result", result)
        } catch (error) {
          console.log("Creatiion", error)
          return
        }
      } else {
        try {
          await updateProductMutation(
            { ...data },
            {
              onSuccess: (data) => {
                toast?.current?.show(
                  tsuccess("Updated", `${data.products_sku} updated successfully`)
                )
              },
            }
          )
        } catch (error) {
          // console.log("Updation", error)
          return
        }
      }

      await refetch()
      setProductEditState(false)
      setProductDialog(false)
      formik.resetForm()
    },
  })
  // console.log(activeRowData)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const pCsvFormatDetails = {
    headers: [
      "NAME",
      "DESCRIPTION",
      "SKU",
      "TYPE",
      "UNIT",
      "CODE",
      "LENGTH",
      "WIDTH",
      "HEIGHT",
      "WEIGHT",
      "COLOR",
      "BRAND",
      "TAX TYPE CODE",
      "GST TAX TYPE CODE",
      "HSN CODE",
      "TAGS",
      "PRICE",
      "MRP",
      "BASE PRICE",
      "ENABLED",
      "PRODUCT TAX CALCULATION TYPE",
    ],
    name: "Product-format.csv",
  }
  useEffect(() => {
    initFilters()
  }, [])

  useEffect(() => {
    const ErrorArray = [productUpdationError, productCreationError]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [productCreationError, productUpdationError])

  // if (isLoading || isProductsLoading) {
  //   return <Loading />
  // }

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  return (
    <div className="grid w-full mr-0">
      <Toast ref={toast} />
      {creatingProduct && <LoaderFullScreen />}
      {updatingProduct && <LoaderFullScreen />}
      <div ref={scrolToTop} className="col-12 ">
        <div className="card flex justify-content-between align-items-center">
          <h2 className="mb-0">Products</h2>
          <div className="flex">
            {/* <FileUpload
              mode="basic"
              name="products"
              // url="https://primefaces.org/primereact/showcase/upload.php"
              accept=".csv"
              maxFileSize={1000000}
              customUpload
              uploadHandler={(e) => {
                let index = 2
                setErrorProducts([])
                papa.parse(e.files[0], {
                  header: true,
                  skipEmptyLines: true,
                  step: async ({ data }, parser) => {
                    const missingKey = ["NAME", "DESCRIPTION", "SKU", "TYPE"].find(
                      (key) => !(key in data)
                    )

                    if (missingKey) {
                      setErrorProducts([
                        ...errorProducts,
                        { message: `Column ${missingKey} missing.` },
                      ])
                      parser.abort()
                    }
                    // setErrorProducts([
                    //   ...errorProducts,
                    //   { ...data, message: error.message, rowNum: index },
                    // ])
                    const result = await createProductMutation(
                      {
                        name: data?.["NAME"],
                        description: data?.["DESCRIPTION"],
                        products_sku: data?.["SKU"],
                        product_type: data?.["TYPE"],
                      },
                      {
                        onSuccess: () => {
                          toast?.current?.show({
                            severity: "success",
                            summary: "Product Created",
                            detail: "Product created successfully.",
                            life: 3000,
                          })
                        },
                        onError: (error) => {
                          console.log("Product failed: ", data)
                          setErrorProducts([
                            ...errorProducts,
                            { ...data, message: error.message, rowNum: index },
                          ])
                        },
                      }
                    )
                    index += 1
                  },
                })
              }}
              chooseLabel="Upload Products (.csv)"
            /> */}
            <Button
              icon="pi pi-plus"
              label="Add Products"
              className="ml-1"
              onClick={() => {
                setProductDetails(intialProductDetails)
                setProductDialog(!productDialog)
              }}
            />
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
              onClick={() => createCSVFormat(pCsvFormatDetails)}
            />
          </div>
        </div>
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
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
        className={`col-12 ${
          productDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <div className="card">
          <h4>{productEditState ? "Update" : "Create"} Product</h4>
          <form
            onSubmit={formik.handleSubmit}
            // onSubmit={async () => {
            //   const result = await createProductMutation(productDetails, {
            //     onSuccess: () => {
            //       setProductDialog(false)
            //     },
            //   })

            //   // try {
            //   //   const all = await createInventoryProductMutation({
            //   //     products_product_id: Number(result.product_id),
            //   //     quantity: 0,
            //   //   })
            //   //
            //   // } catch (error) {
            //   //
            //   // }
            // }}
            className="p-fluid"
          >
            <div className="formgrid grid ">
              {[
                { type: "text", label: "Name*", field: "name" },
                { type: "text", label: "SKU", field: "sku" },
                { type: "text", label: "Type", field: "type" },
                { type: "text", label: "Length", field: "length" },
                { type: "text", label: "Width", field: "width" },
                { type: "text", label: "Height", field: "height" },
                { type: "text", label: "Weight", field: "weight" },
                { type: "text", label: "Color", field: "Color" },
                { type: "text", label: "Brand", field: "brand" },
                { type: "text", label: "Tax type code", field: "taxcode" },
                { type: "text", label: "Gst Tax type code", field: "gstcode" },
                { type: "text", label: "HSN code", field: "hsnCode" },
                { type: "text", label: "Tags", field: "tags" },
                { type: "text", label: "Cost Price", field: "costPrice" },
                { type: "text", label: "MRP", field: "mrp" },
                { type: "text", label: "Base Price", field: "basePrice" },
                { type: "text", label: "Enabled", field: "enabled" },
                { type: "text", label: "Tax Calculation Type", field: "taxCalcuation" },

                // { type: "text", label: "Product Unit", field: "product_unit" },
                // { type: "area", label: "Description", field: "description" },
              ].map((ele, i) => {
                if (ele.type === "text") {
                  return (
                    <div key={`${ele.field}${i}`} className="field col-12 lg:col-3 md:col-6 mt-4">
                      <span className="p-float-label">
                        <InputText
                          id={ele.field}
                          name={ele.field}
                          value={formik.values[ele.field]}
                          onChange={formik.handleChange}
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
                  )
                } else {
                  // return (
                  //   <div key={`${ele.field}${i}`} className="field col-12 mt-4">
                  //     <span className="p-float-label">
                  //       <InputTextarea
                  //         id={ele.field}
                  //         rows={5}
                  //         name={ele.field}
                  //         value={formik.values.description}
                  //         onChange={formik.handleChange}
                  //         autoFocus
                  //         className={classNames({ "p-invalid": isFormFieldValid(ele.field) })}
                  //       />
                  //       <label
                  //         htmlFor={ele.field}
                  //         className={classNames({ "p-error": isFormFieldValid(ele.field) })}
                  //       >
                  //         {ele.label}
                  //       </label>
                  //     </span>
                  //     {getFormErrorMessage(ele.field)}
                  //   </div>
                  // )
                }
              })}

              {/* 
              <div className="field col-12 lg:col-3 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="product_unit"
                    // disabled={editState}
                    value={formik.values.product_unit}
                    dropdown
                    forceSelection
                    suggestions={unitSuggestions}
                    completeMethod={searchUnits}
                    field="name"
                    onChange={async (e) => {
                      let product_unit = typeof e.value === "string" ? e.value : e.value?.name

                      await formik.setValues({
                        ...formik.values,
                        product_unit,
                      })
                    }}
                    aria-label="Product Unit"
                    dropdownAriaLabel="Product Units"
                    className={classNames({ "p-invalid": isFormFieldValid("product_unit") })}
                  />

                  <label
                    htmlFor="product_unit"
                    className={classNames({ "p-error": isFormFieldValid("product_unit") })}
                  >
                    Product Unit
                  </label>
                </div>
                {getFormErrorMessage("product_unit")}
              </div> */}

              <div className="field col-12 lg:col-3 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="category"
                    // disabled={editState}
                    value={formik?.values?.category?.name}
                    dropdown
                    forceSelection
                    suggestions={categorySuggestions}
                    completeMethod={searchCategory}
                    field="name"
                    onChange={async (e) => {
                      let category = typeof e.target.value === "string" ? e.value : e.value

                      await formik.setValues({
                        ...formik.values,
                        category,
                      })
                    }}
                    aria-label="Product Category"
                    dropdownAriaLabel="Product Categorys"
                    className={classNames({ "p-invalid": isFormFieldValid("category") })}
                  />

                  <label
                    htmlFor="category"
                    className={classNames({ "p-error": isFormFieldValid("category") })}
                  >
                    Category*
                  </label>
                </div>
                {getFormErrorMessage("category")}
              </div>

              <div className="field col-12 mt-4">
                <span className="p-float-label">
                  <InputTextarea
                    id={"description"}
                    rows={5}
                    name={"description"}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    autoFocus
                    className={classNames({ "p-invalid": isFormFieldValid("description") })}
                  />
                  <label
                    htmlFor={"description"}
                    className={classNames({ "p-error": isFormFieldValid("description") })}
                  >
                    Description
                  </label>
                </span>
                {getFormErrorMessage("description")}
              </div>
            </div>

            <div className="flex mt-4">
              <Button
                type="submit"
                className="mr-2 "
                label={productEditState ? "UPDATE" : "SUBMIT"}
              />
              <Button
                className="p-button-secondary"
                type="button"
                label="CANCLE"
                onClick={() => {
                  formik.resetForm()
                  setProductDialog(false)
                  setProductEditState(false)
                  // setProductForm(false)
                  // setVendorDetails(initialVendorState)
                }}
              />
            </div>
          </form>
        </div>
      </div>

      <div>{showData}</div>

      {/* <div className="col-12">
        <div className="card">
          <DataTable
            value={products}
            showGridlines
            scrollable
            // scrollHeight="60vh"
            stripedRows
            className="text-s datatable-responsive"
            filters={filters}
            header={header1}
            filterDisplay="menu"
            // globalFilterFields={["products_sku"]}
            emptyMessage="No Results found."
          >


            {/* {prefix?.prefix && (
              <Column
                header="ID"
                body={({ product_id }) => (
                  <span>
                    {prefix.prefix}_{product_id}
                  </span>
                )}
              />
            )} */}

      {/* <Column field="products_sku" header="SKU" filter filterPlaceholder="Search by SKU" />
      <Column field="name" header="Name" filter filterPlaceholder="Search by Name" />
      <Column field="product_type" header="Type" filter filterPlaceholder="Search by Type" />
      <Column
        field="description"
        header="Product Description"
        filter
        filterPlaceholder="Search by Description"
      />
      <Column field="product_unit" header="Unit" filter filterPlaceholder="Search by Unit" />
      <Column
        header="Action"
        body={(rowData) => {
          return (
            <div>
              <Button
                icon="pi pi-pencil"
                className="m-1"
                onClick={async () => {
                  setActiveRowData(rowData)
                  setProductEditState(true)
                  setProductDialog(true)
                  await formik.setValues({
                    ...rowData,
                  })
                  scrolToTop?.current && scrolToTop?.current.scrollIntoView()
                }}
              />
              <Button
                disabled={true}
                icon="pi pi-trash"
                className="m-1"
                onClick={async () => {
                  await deleteVendorMutation({ vendor_id: rowData.vendor_id })
                  await refetch()
                }}
              />
            </div>
          )
        }
        }
      />
    

      {/* </DataTable>
        </div>
      </div> */}

      {/* <DataTable value={products} header={header} responsiveLayout="scroll">
        
        {columnComponents}
      </DataTable> */}

      <div className="col-12">
        <div className="card">
          <DataTable
            value={products}
            responsiveLayout="scroll"
            showGridlines
            header={header1}
            filters={filters}
            className="text-s datatable-responsive"
            filterDisplay="menu"
            emptyMessage="No Results found."
          >
            {columnComponents}
            <Column
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Button
                      icon="pi pi-pencil"
                      className="m-1"
                      onClick={async () => {
                        setActiveRowData(rowData)
                        setProductEditState(true)
                        setProductDialog(true)
                        await formik.setValues({
                          ...rowData,
                        })
                        scrolToTop?.current && scrolToTop?.current.scrollIntoView()
                      }}
                    />
                    <Button
                      disabled={true}
                      icon="pi pi-trash"
                      className="m-1"
                      onClick={async () => {
                        await deleteVendorMutation({ vendor_id: rowData.vendor_id })
                        await refetch()
                      }}
                    />
                  </div>
                )
              }}
            />
          </DataTable>
        </div>
      </div>
    </div>
  )
}

const ProductsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
      <ProductsList />
      </Layout>
    </Suspense>
  )
}
ProductsPage.authenticate = false
export default ProductsPage
