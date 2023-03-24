import { Suspense, useState, useRef, useEffect } from "react"
import { invoke, useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import papa from "papaparse"

import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { MultiSelect } from "primereact/multiselect"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { InputTextarea } from "primereact/inputtextarea"
import { FileUpload } from "primereact/fileupload"
import { Toast } from "primereact/toast"

import createProduct from "app/products/mutations/createProduct"
import updateProduct from "app/products/mutations/updateProduct"
import uploadCsvForProcessing from "app/pipeline/mutations/uploadCsvForProcessing"

import getProducts from "app/products/queries/getProducts"

import Loading from "components/loading"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { createCSVFormat, createSearchFunction, filterExistingValues, tsuccess } from "app/constants"
import ErrorCard from "components/ErrorCard"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import Creatable from "react-select/creatable"
import chroma from "chroma-js"
import { Dropdown } from "primereact/dropdown"
import getProduct_categories from "app/product_categories/queries/getProduct_categories"
import moment from "moment"
import createProduct_tag from "app/product_tags/mutations/createProduct_tag"
import { getAntiCSRFToken } from "@blitzjs/auth"



const dateFormat = (dateObj: Date | string) =>
  moment(new Date(dateObj)).format("DD-MM-YYYY, hh:mm")

const columns = [
  { field: "name", header: "Name" },
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
  { field: "costPrice", header: "Cost Price" },
  { field: "taxCalcuation", header: "Tax Calcuation" },
  {
    header: "Created On",
    body: (rowData) => <div>{dateFormat(rowData.createdAt)}</div>,
  },
]

export const ProductsList = () => {
  const antiCSRFToken = getAntiCSRFToken()
  const [{ products }, { refetch }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
  })
  console.log('products: ', products);
  const [{ product_categories },] = useQuery(getProduct_categories, {
    orderBy: { id: "asc" },
  })

  const [createProductMutation, { isLoading: creatingProduct }] =
    useMutation(createProduct)

  const [uploadCsvMutation] = useMutation(uploadCsvForProcessing)

  const [updateProductMutation, { isLoading: updatingProduct }] =
    useMutation(updateProduct)

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
    tags: [],
    imageurl: "",
    costPrice: "",
    mrp: "",
    basePrice: "",
    enabled: "",
    taxCalcuation: "",
  }

  const [categories_options, setCategoriesOption] = useState(product_categories)

  const [productDetails, setProductDetails] = useState(intialProductDetails)
  const [productDialog, setProductDialog] = useState(false)
  const [productEditState, setProductEditState] = useState(false)
  const [disableField] = useState(true)

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


  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const clearUpload = useRef<FileUpload>(null)
  const [ErrorMsgs, setErrorMsgs] = useState([])
  const [unitSuggestions, setUnitSuggestions] = useState<any>(null)
  const [categorySuggestions, setCategorySuggestions] = useState<any>(null)
  const [filters, setFilters] = useState(null)
  const [globalFilterValue, setGlobalFilterValue] = useState("")

  const [showData, setShowData] = useState([])
  // const [selectedColumns, setSelectedColumns] = useState(columns)
  const [selectedColumns, setSelectedColumns] = useState(columns)


  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    )
    setSelectedColumns(orderedSelectedColumns)
  }

  const columnComponents = selectedColumns.map((col) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        filter
        filterPlaceholder="Search..."
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
      ],
    }
    onColumnToggle(obj)

    uploadCsvMutation(`eruid,description
batman,uses technology
superman,flies through the air
spiderman,uses a web
ghostrider, rides a motorcycle
#GROUP_OBJECT_PROFILE#accessgroupGroupProfile
cn,description
daredevil,this group represents daredevils
superhero,this group represents superheroes`)
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
              console.log('createProductMutation error: ', error);
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

  const [updateActiveProduct] = useMutation(updateProduct)


  const formik = useFormik({
    initialValues: productDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required")
    }),
    onSubmit: async (data) => {
      console.log('data: ', data);

      const { name, description, sku, length, width,
        hsnCode,
        height, weight, costPrice, tags
        , color } = data

      const tagsValue = tags.map(({ value }) => value)

      const { id: activeProductId } = activeRowData


      // const formData = new FormData();
      // if (imageUploadObject) {
      //   console.log('---imageUploadObject: ', imageUploadObject);
      //   formData.append("file", imageUploadObject);
      // }
      // console.log('formData: ', formData.get("file"));


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
            }
          })
          await refetch()

        } catch (error) {
          alert('Error', error)

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
                console.log('data: ', data);

              },
              onError: (error) => {
                // alert(`error ${data}`)
                console.log('createProductMutation error: ', error);
              }
            }
          )
          // await refetch()
        } catch (err) {


        }
      }
      await refetch()

      //TODO: @Varun dialog should close using onSucess not via formik submission
      // setProductEditState(false)
      // setProductDialog(false)
      // formik.resetForm()
    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const [imageUploadObject, setImageUpload] = useState(null)
  useEffect(() => {
    console.log('imageUploadObject: ', imageUploadObject);
  }, [imageUploadObject])


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

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  const [selectedStatus, setSelectedStatus] = useState(null);
  const StatusCheck = [
    { name: 'Simple' },
    { name: 'Bundle' },
  ];

  const [inputs, setInputs] = useState([{ product: '', quantity: '' }]);


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
    <div className="grid w-full">
      <Toast ref={toast} />
      {creatingProduct && <LoaderFullScreen />}
      {updatingProduct && <LoaderFullScreen />}
      <div ref={scrolToTop} className="col-12">
        <div className="card">
          <div className="flex flex justify-content-between align-items-center">
            <h2>Products</h2>
            <div className="flex">
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
              <span className="flex justify-content-center align-items-center">
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
            <h4>{activeProduct ? "Update" : "Create"} Product</h4>
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
            className="p-fluid"
          >
            <div className="formgrid grid">
              <div className="field col-12">
                {/* //TODO: @Varun: the below code will have to be adjusted for file upload */}
                {/* <FileUpload
                  cancelOptions={true}
                  name="product_image"
                  url="/api/upload"
                  accept="image/*"
                  maxFileSize={1000000}
                  onBeforeSend={(event) => {
                    event.xhr.setRequestHeader("anti-csrf", antiCSRFToken)
                  }}
                  auto={true}
                  onSelect={async (e) => {
                    setImageUpload(e.files[0])
                  }}
                /> */}
              </div>
              <div className="field col-12 lg:col-2 md:col-6 mt-4">
                <span className="p-float-label">
                  <InputText
                    disabled={disableField}
                    id={"sku"}
                    placeholder='SKU'
                    name={"sku"}
                    value={formik.values.sku}
                    autoFocus
                    className={classNames({ "p-invalid ": isFormFieldValid("description") })}
                  />
                  <label
                    htmlFor={"sku"}
                    className={classNames({ "p-error": isFormFieldValid("sku") })}
                  >
                    SKU
                  </label>
                </span>
                {getFormErrorMessage("sku")}
              </div>
              {
                [
                  { type: 'text', label: "Name*", field: "name", header: "Name" },
                  { type: 'text', label: "Length", field: "length", header: "Length" },
                  { type: 'text', label: "Width", field: "width", header: "Width" },
                  { type: 'text', label: "Height", field: "height", header: "Height" },
                  { type: 'text', label: "Weight", field: "weight", header: "Weight" },
                  { type: 'text', label: "Color", field: "color", header: "Color" },
                  { type: 'text', label: "Brand", field: "brand", header: "Brand" },
                  { type: 'text', label: "Tax type code", field: "taxcode", header: "Tax code" },
                  { type: 'text', label: "Gst Tax type code", field: "gstcode", header: "Gst Code" },
                  { type: 'text', label: "HSN code", field: "hsnCode", header: "HSN Code" },
                  { type: 'text', label: "Cost Price", field: "costPrice", header: "Cost Price" },
                  { type: 'text', label: "Tax Calculation Type", field: "taxCalcuation", header: "Tax Calcuation" },
                ].map((ele, i) => {
                  if (ele.type === "text") {
                    return (
                      <div key={`${ele.field}${i}`} className="field col-12 lg:col-2 md:col-6 mt-4">
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
                  }
                })
              }
              <div key={`category`} className="field col-12 lg:col-5 md:col-6 mt-4">
                <span className="p-float-label">
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
                    htmlFor={"category"}
                    className={classNames({ "p-error": isFormFieldValid("category") })}
                  >
                    Category
                  </label>
                </span>
                {getFormErrorMessage("category")}
              </div>
              <div key={`productType`} className="field col-12 lg:col-5 md:col-6 mt-4">
                <span className="p-float-label">
                  <Dropdown
                    disabled={productEditState}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.value)}
                    options={StatusCheck}
                    optionLabel="name"
                    placeholder="Type"
                    className="w-full"
                  />
                  <label
                    htmlFor={"type"}
                    className={classNames({ "p-error": isFormFieldValid("type") })}
                  >
                    Product Type
                  </label>
                </span>
                {getFormErrorMessage("category")}
              </div>
            </div>

            <div className="flex mt-4">
              <Button
                type="submit"
                className="mr-2 "
                label={editUpdateProduct ? 'UPDATE' : 'SUBMIT'}
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
            rowHover={true}
            onRowClick={async (e) => {
              setActiveRowData({ ...e.data })
              setProductEditState(true)
              setActiveProduct(true)
              setProductDialog(true)
              await formik.setValues({
                ...e.data,
              })
              scrolToTop?.current && scrolToTop?.current.scrollIntoView()
            }}
          >

            {/* <Column header="Image" body={rowData => <img src={`${rowData.imageUrl}`} alt="imageData" style={{ width: '300px', height: '220px' }} />} /> */}
            {/* <Column header="SKU" body={rowData => <a href='/products/id'>{rowData.sku} </a>} /> */}
            {/* <Link href="/product/[id]" as={`/product/${product.id}`}>
            {product.name}
          </Link> */}
            <Column header="SKU" body={rowData => <Link href="/products/[id]" as={`/products/${rowData.id}`} >{rowData.sku}</Link>} />
            {columnComponents}
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
ProductsPage.authenticate = true
export default ProductsPage
