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
import { createCSVFormat, createSearchFunction, filterExistingValues, tsuccess } from "app/constants"
import ErrorCard from "components/ErrorCard"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import Link from "next/link"
// import Creatable from "react-select/dist/declarations/src/Creatable"
import Creatable from "react-select/creatable"
import chroma from "chroma-js"
import { Dropdown } from "primereact/dropdown"
import { number } from "zod"
import getProduct_categories from "app/product_categories/queries/getProduct_categories"
import moment from "moment"
import createProduct_tag from "app/product_tags/mutations/createProduct_tag"



const ITEMS_PER_PAGE = 100

export const ProductsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ products }, { isLoading: isProductsLoading, refetch }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
  })
  const [{ product_categories },] = useQuery(getProduct_categories, {
    orderBy: { id: "asc" },
  })
  // const [prefix, { isLoading }] = useQuery(getPrefix, { name: "PRODUCT" })
  const [createProductMutation, { error: productCreationError, isLoading: creatingProduct }] =
    useMutation(createProduct)

  const [updateProductMutation, { error: productUpdationError, isLoading: updatingProduct }] =
    useMutation(updateProduct)

  const [createProductTags] = useMutation(createProduct_tag)





  const intialProductDetails = {
    name: "",
    productName: '',
    description: "",
    type: "",
    sku: "",
    unit: "",
    category: "",
    productCode: "",
    length: "",
    width: "",
    height: "",
    weight: "",
    color: "",
    brand: "",
    taxcode: "",
    gstcode: "",
    hsnCode: "",
    // tags: "",
    tags: [],
    imageurl: "",
    costPrice: "",
    mrp: "",
    basePrice: "",
    enabled: "",
    taxCalcuation: "",
  }
  const dateFormat = (dateObj: Date | string) =>
    moment(new Date(dateObj)).format("DD-MM-YYYY, hh:mm")




  const columns = [
    { field: "name", header: "Name" },
    // { field: "type", header: "Type" },
    { field: "description", header: "Description" },
    { field: "unit", header: "Unit" },
    { field: "category", header: "Category" },
    { field: "length", header: "Length" },
    { field: "width", header: "Width" },
    { field: "height", header: "Height" },
    { field: "weight", header: "Weight" },
    { field: "color", header: "Color" },
    { field: "brand", header: "Brand" },
    { field: "taxcode", header: "Tax code" },
    { field: "gstcode", header: "Gst Code" },
    { field: "hsnCode", header: "HSN Code" },
    // { field: "tags", header: "Tags" },
    { field: "costPrice", header: "Cost Price" },
    // { field: "mrp", header: "MRP" },
    // { field: "basePrice", header: "Base Price" },
    // { field: "enabled", header: "Enabled" },
    { field: "taxCalcuation", header: "Tax Calcuation" },
    {
      header: "Created On",
      body: (rowData) => <div>{dateFormat(rowData.createdAt)}</div>,
    },
  ]


  const styles4TagsComponent = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? "#A5B4FC" : "#040d19",
      backgroundColor: "#040d19",
      color: "white",
      opacity: state.isDisabled ? 0.4 : 1,
    }),
    menu: (baseStyles, state) => ({
      ...baseStyles,
      // borderColor: "red",
      backgroundColor: "#040d19",
    }),
    input: (baseStyles, state) => ({
      ...baseStyles,
      // borderColor: "red",
      backgroundColor: "#040d19",
      color: "white",
    }),
    // option: (baseStyles, state) => ({
    //   ...baseStyles,
    //   backgroundColor: state.isFocused ? "grey" : "#040d19",
    // }),
    placeholder: (baseStyles, state) => ({
      ...baseStyles,
      color: "rgba(255, 255, 255, 0.6)",
      zIndex: "1",
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      const color = chroma(data.color ?? "blue")

      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
            ? data.color
            : isFocused
              ? color.alpha(0.1).css()
              : undefined,
        color: isDisabled
          ? "#ccc"
          : isSelected
            ? chroma.contrast(color, "white") > 2
              ? "white"
              : "black"
            : data.color,
        cursor: isDisabled ? "not-allowed" : "default",

        ":active": {
          ...styles[":active"],
          backgroundColor: !isDisabled
            ? isSelected
              ? data.color
              : color.alpha(0.3).css()
            : undefined,
        },
      }
    },
    multiValue: (styles, { data }) => {
      const color = chroma(data.color ?? "black")
      return {
        ...styles,
        backgroundColor: color.alpha(0.1).css(),
      }
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    multiValueRemove: (styles, { data }) => ({
      ...styles,
      color: data.color,
      ":hover": {
        backgroundColor: data.color,
        color: "white",
      },
    }),
  }

  let tags
  const existingTags = tags?.map((ele) => ({
    value: ele.id,
    label: ele.name,
    color: ele.color,
    // color: getRandomColor(),
  }))

  const [categories_options, setCategoriesOption] = useState(product_categories)
  console.log('categories_options: ', categories_options);
  const [productDetails, setProductDetails] = useState(intialProductDetails)
  const [productDialog, setProductDialog] = useState(false)
  const [productEditState, setProductEditState] = useState(false)
  const [disableField] = useState(true)
  console.log('productEditState: ', productEditState);
  const [productForm, setProductForm] = useState(false)
  const [activeProduct, setActiveProduct] = useState(true)
  const [activeRowData, setActiveRowData] = useState({})
  const [errorProducts, setErrorProducts] = useState([])
  const [btnVisibility, setBtnVisibility] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)

  const productOptions = products.map(({ product_id, name, products_sku, description }) => {
    return {
      name: `${products_sku} - ${name}`,
      product_id,
      description,
    }
  })


  const productsId = products.map((ele, i) => ele.product_id)
  const inventoryProductsId = products.map((ele, i) => ele.products_product_id)

  const avilableProductsID = filterExistingValues(productsId, inventoryProductsId)

  const avilableProducts = productOptions.filter((ele, i) =>
    avilableProductsID.includes(ele.product_id)
  )

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

  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const clearUpload = useRef<FileUpload>(null)
  const [ErrorMsgs, setErrorMsgs] = useState([])
  const [unitSuggestions, setUnitSuggestions] = useState<any>(null)
  const [categorySuggestions, setCategorySuggestions] = useState<any>(null)
  const [filters, setFilters] = useState(null)
  const [globalFilterValue, setGlobalFilterValue] = useState("")

  const [showData, setShowData] = useState([])
  const [showProduct, setShowProduct] = useState([])
  // const [selectedColumns, setSelectedColumns] = useState(columns)
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
        { field: "sku", header: "SKU" },
        { field: "name", header: "Name" },
        { field: "image", header: "Image" },
        { field: "description", header: "Description" },
        { field: "color", header: "Color" },
        { field: "height", header: "Height" },
        { field: "hsnCode", header: "HSNCode" },



        // { field: "product_unit", header: "Unit" },
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

  const categorys = ["Display",
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
    "Cables & :ors",
    "M5 Stack",
    "Machine Tools",
    "Oscilloscope & Signal Generator",
  ]

  const categoryOptions = categorys.map((ele, i) => ({
    name: ele,
    id: i + 1,
  }))

  console.log('categoryOptions: ', categoryOptions);

  const searchUnits = createSearchFunction(unitOptions, setUnitSuggestions)

  const searchCategory = createSearchFunction(categories_options, setCategorySuggestions)

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
          'Image',
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

  const [editUpdateProduct, setEditUpdateProduct] = useState(false)
  console.log('editUpdateProduct: ', editUpdateProduct);
  const [createNewProduct] = useMutation(createProduct)
  const [updateActiveProduct] = useMutation(updateProduct)


  const formik = useFormik({
    initialValues: productDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required"),
      // product_category: Yup.mixed().required("*Required"),
      // product_sku: Yup.string().required("*Required"),
    }),
    onSubmit: async (data) => {
      console.log("++data", data)



      // setShowData(<pre>{JSON.stringify(data, null, 2)}</pre>)
      // setShowProduct(<pre>{JSON.stringify(inputs, null, 2)}</pre>)
      const { name, description, sku, length, width,
        hsnCode, imageurl, taxCalcuation,
        height, weight, gstcode, costPrice,
        category, brand, tags
        , color, } = data

      const tagsValue = tags.map(({ value }) => value)
      console.log('tagsVAlue: ', tagsValue);
      const { id: activeProductId } = activeRowData
      console.log('activeRowData: ', activeRowData);
      console.log('updatingProduct: ', updatingProduct);
      if (editUpdateProduct) {
        try {
          await updateActiveProduct({
            id: activeProductId,
            name: name,
            description: description,
            color,
            height: Number(height),
            weight: Number(weight),
            product_tags: {
              create: tagsValue.map((e) => ({ tags: e })),
              // deleteTags:tagsValue.map((e) => ({id}))
            }
          }, {
            onSuccess: () => {
              alert('Update Done')
            },
            onError: (data) => {
              alert(`error ${data}`)
              console.log('error', data)
            }
          })
          await refetch()

        } catch (error) {
          alert('Error', error)
          console.log('Error ', error);
        }
      }
      else {
        try {
          await createProductMutation(
            {
              name: name,
              description: description,
              sku,
              costPrice: Number(costPrice),
              color,
              length: Number(length),
              width: Number(width),
              height: Number(height),
              weight: Number(weight),
              hsnCode: hsnCode,
              product_tags: {
                create: tagsValue.map((e) => ({ tags: e })),
              }
              // imageUrl: imageurl,
              // gstTaxTypeCode: gstcode,
              // taxCalcType: taxCalcuation,
              // category: category,
              // brand: brand
            },
            {
              onSuccess: async (data) => {
                console.log('successdata: ', data);
              },
              onError: (data) => {
                // alert(`error ${data}`)
                console.log('error123', data)
              }
            }
          )
          // await refetch()
        } catch (err) {
          console.log('err: ', err);

        }
      }
      await refetch()
      setProductEditState(false)
      setProductDialog(false)
      formik.resetForm()



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
                  tsuccess("Product Created", `${data.sku} created successfully`)
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
                  tsuccess("Updated", `${data.sku} updated successfully`)
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
      'IMAGE',
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

  // useEffect(() => {
  //   const ErrorArray = [productUpdationError, productCreationError]

  //   const msg = []

  //   for (let err of ErrorArray) {
  //     if (err) {
  //       msg.push(err)
  //     }
  //   }
  //   setErrorMsgs(msg)
  // }, [productCreationError, productUpdationError])

  // if (isLoading || isProductsLoading) {
  //   return <Loading />
  // }

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  const [selectedStatus, setSelectedStatus] = useState(null);
  // console.log('selectedStatus: ', selectedStatus);
  const StatusCheck = [
    { name: 'Simple' },
    { name: 'Bundle' },
  ];
  // console.log('StatusCheck: ', StatusCheck);
  const ProductOption = products.map(({ products_sku, name }) => { return { name: `${products_sku} - ${name}` } })
  // const productOptions = products.map(({ product_id, name, products_sku, description }) => {
  //   return {
  //     name: `${products_sku} - ${name}`,
  //     // product_id,
  //     // description,
  //   }
  // })


  // = [
  //   'Pi', 'ESP', 'Waterproof Ultrasonic Sensor',
  //   'E18-D80NK Infrared Sensor Module',
  //   'MQ-135 gas sensor Module',
  //   'Turbidity Sensor',
  // ]

  const [inputs, setInputs] = useState([{ product: '', quantity: '' }]);
  console.log('inputs: ', inputs);

  // const [inputs,setInputs] = useState(products)
  // console.log('inputs: ', inputs.map((i) => i.name));

  // const handleAddInput = () => {
  //   const lastInput = inputs[inputs.length - 1];
  //   if (lastInput.product !== '' && lastInput.quantity !== '') {
  //     setInputs([...inputs, { product: '', quantity: '' }]);
  //   }
  // };

  const handleAddInput = () => {
    setInputs([...inputs, { product: '', quantity: '' }]);
  };


  const handleRemoveInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };


  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const newInputs = [...inputs];
    newInputs[index][name] = value;
    setInputs(newInputs);
  };
  // let category = typeof e.target.value === "string" ? e.value : e.value

  // await formik.setValues({
  //   ...formik.values,
  //   category,
  // })



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
                setProductEditState(false)
                setActiveProduct(false)
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
        className={`col-12 ${errorProducts.length
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
        className={`col-12 ${productDialog
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
          }`}
      >
        <div className="card">
          <div className="flex justify-content-between">
            {/* {activeProduct ? 'Create': productEditState ? 'Update' :'Details'} */}

            <h4>{activeProduct ? "Update" : "Create"} Product</h4>
            <h4>
              {/* {activeProduct ? 'Details' : productEditState ? 'Update' :'Create'} */}
            </h4>

            <h4>{productEditState ? <Button
              icon="pi pi-pencil"
              className="m-1"
              onClick={() => { setProductEditState(!productEditState); setEditUpdateProduct(!editUpdateProduct) }}
            /> : <Button
              icon="pi pi-pencil"
              className="m-1"
              onClick={() => setProductEditState(!productEditState)}
            />}</h4>
          </div>
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
              <div className="">
                <div style={{ fontSize: '12px', marginLeft: '15px' }}>sku</div>
                <InputText
                  disabled={disableField}
                  id={"sku"}
                  placeholder='SKU'
                  name={"sku"}
                  value={formik.values.sku}
                  autoFocus
                  style={{ marginTop: '8px', }}
                  className={classNames({ "p-invalid ": isFormFieldValid("description") })}
                />
              </div>
              {
                [
                  { type: 'text', label: "Name*", field: "name", header: "Name" },
                  // { type: "text", label: "SKU", field: "sku", header: "SKU" },
                  // { type: 'text', label: "Type", field: "product_type", header: "Type" },
                  // { type:'text', label:"Description", field: "description", header: "Description" },
                  // { type: 'text', label: "Unit", field: "unit", header: "Unit" },
                  // { type:'text', label:"Category", field: "category", header: "Category" },
                  { type: 'text', label: "Length", field: "length", header: "Length" },
                  { type: 'text', label: "Width", field: "width", header: "Width" },
                  { type: 'text', label: "Height", field: "height", header: "Height" },
                  { type: 'text', label: "Weight", field: "weight", header: "Weight" },
                  { type: 'text', label: "Color", field: "color", header: "Color" },
                  { type: 'text', label: "Brand", field: "brand", header: "Brand" },
                  { type: 'text', label: "Tax type code", field: "taxcode", header: "Tax code" },
                  { type: 'text', label: "Gst Tax type code", field: "gstcode", header: "Gst Code" },
                  { type: 'text', label: "HSN code", field: "hsnCode", header: "HSN Code" },
                  // { type: 'text', label: "Tags", field: "tags", header: "Tags" },
                  { type: 'text', label: "Cost Price", field: "costPrice", header: "Cost Price" },
                  // { type: 'text', label: "MRP", field: "mrp", header: "MRP" },
                  // { type: 'text', label: "Base Price", field: "basePrice", header: "Base Price" },
                  // { type: 'text', label: "Enabled", field: "enabled", header: "Enabled" },
                  { type: 'text', label: "Tax Calculation Type", field: "taxCalcuation", header: "Tax Calcuation" },
                ].map((ele, i) => {
                  if (ele.type === "text") {
                    return (
                      <div key={`${ele.field}${i}`} className="field col-12 lg:col-3 md:col-6 mt-4">
                        <span className="p-float-label">
                          <InputText
                            disabled={productEditState}
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

              <div className="field col-12 lg:col-3 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="category"
                    // disabled={editState}
                    disabled={productEditState}
                    value={formik?.values?.category?.name}
                    dropdown
                    forceSelection
                    suggestions={categorySuggestions}
                    completeMethod={searchCategory}
                    field="name"
                    onChange={async (e) => {
                      console.log('valueE ', e.value);

                      let sku = `TIF${e.value?.code}${products.length + 1}`
                      let category = typeof e.target.value === "string" ? e.value : e.value

                      await formik.setValues({
                        ...formik.values,
                        sku,
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
              <div className="mt-4">
                <Dropdown disabled={productEditState} value={selectedStatus} onChange={(e) => setSelectedStatus(e.value)} options={StatusCheck} optionLabel="name"
                  placeholder="Type" className="w-full md:w-14rem" />
              </div>
              <div className="field col-12  mt-4">

                {selectedStatus?.name === 'Bundle' ?
                  <div className="flex gap-3 flex-wrap">

                    {inputs.map((input, index) => (
                      <div key={index} className=''>
                        <AutoComplete
                          id="name"
                          value={input.name}
                          // value={formik.values.name}
                          // suggestions={filteredSuggestions}
                          // completeMethod={searchProducts}
                          suggestions={categorySuggestions}
                          completeMethod={searchCategory}
                          disabled={productEditState}
                          dropdown
                          forceSelection
                          field="name"
                          onChange={async (e) => {
                            console.log(e.value, 'event')

                            handleInputChange(e, index)
                            const test = [...inputs]
                            test[index] = { ...e.value }
                            setInputs(test)
                            // let name = typeof e.value === "string" ? e.value : e.value?.name
                            // let products_product_id = e.value?.product_id
                            // let product_description = e.value?.description

                            // await formik.setValues({
                            //   ...formik.values,
                            //   name,
                            //   products_product_id,
                            //   product_description,
                            // })
                            // formik.values = { ...formik.values,}
                          }}

                          aria-label="products"
                          dropdownAriaLabel="Select Product"
                          className={classNames({ "p-invalid": isFormFieldValid("name") })}
                          style={{ width: '400px' }}
                        />

                        <InputText
                          className='mt-3'
                          type='text'
                          placeholder='Quantity'
                          name='quantity'
                          value={input.quantity}
                          onChange={(event) => handleInputChange(event, index)}
                        />

                        <Button
                          icon="pi pi-minus"
                          className="p-2 m-1"
                          onClick={() => handleRemoveInput(index)}
                        />
                      </div>
                    ))}

                    <Button
                      icon="pi pi-plus"
                      className="m-1"
                      onClick={handleAddInput}
                      style={{ height: '40px' }}
                    />
                  </div>
                  : null}
              </div>



              <div className="field col-12  mt-4">
                <div className="p-float-label">
                  <Creatable
                    disabled={productEditState}
                    classNamePrefix="tags"
                    styles={styles4TagsComponent}
                    isMulti
                    options={existingTags}
                    onChange={async (value) => {
                      await formik.setValues({ ...formik.values, tags: value })
                    }}
                    value={formik.values.tags}
                    // placeholder="Tags"
                    isDisabled={productEditState}
                  />

                  <label htmlFor="tags" style={{ transform: "translateY(-230%)" }}>
                    Tags
                  </label>
                </div>
              </div>


              <div className="field col-12 mt-4">
                <span className="p-float-label">
                  <InputTextarea
                    disabled={productEditState}
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
                // label={productEditState ? "UPDATE" : "SUBMIT"}
                label={editUpdateProduct ? 'update' : 'Submit'}
              />
              <Button
                className="p-button-secondary"
                type="button"
                label="CANCEL"
                onClick={() => {
                  formik.resetForm()
                  setProductDialog(false)
                  setProductEditState(false)
                  setActiveProduct(false)

                  // setProductForm(false)
                  // setVendorDetails(initialVendorState)
                }}
              />
            </div>
          </form>
        </div>
      </div>

      <div>{showData}</div>
      {/* <div><pre>{JSON.stringify(inputs,null,2)}</pre></div> */}

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

            onRowClick={async (e) => {
              console.log(e.data, 'e.data')

              setActiveRowData({ ...e.data })
              setProductEditState(true)
              setActiveProduct(true)
              setProductDialog(true)
              await formik.setValues({
                ...e.data,
              })
              console.log('e.data: ', e.data);
              scrolToTop?.current && scrolToTop?.current.scrollIntoView()
            }}

          >

            {/* <Column header="Image" body={rowData => <img src={`${rowData.imageUrl}`} alt="imageData" style={{ width: '300px', height: '220px' }} />} /> */}
            <Column header="SKU" body={rowData => <a href='/products/id'>{rowData.sku} </a>} />

            {columnComponents}

            {/* <Column
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
                        setActiveProduct(true)
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
            /> */}

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
