import { Suspense, useState, useRef, useEffect } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import papa from "papaparse"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { MultiSelect } from "primereact/multiselect"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { FileUpload } from "primereact/fileupload"
import { Toast } from "primereact/toast"
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';

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
import { Dropdown } from "primereact/dropdown"
import getProduct_categories from "app/product_categories/queries/getProduct_categories"
import moment from "moment"
import { getAntiCSRFToken } from "@blitzjs/auth"
import CreateKit_product from 'app/kit_products/mutations/createKit_product'
import { Tooltip } from "primereact/tooltip"
import { validateZodSchema } from "blitz"
import { Product } from "app/auth/validations"
import { InputSwitch } from "primereact/inputswitch"
import { InputNumber } from "primereact/inputnumber"


const dateFormat = (dateObj: Date | string) =>
  moment(new Date(dateObj)).format("DD-MM-YYYY, hh:mm")

const columns = [
  { field: "name", header: "Name" },
  { field: "description", header: "Description" },
  { field: "unit", header: "Unit" },
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

const initialProductDetails = {
  name: undefined,
  description: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
  weight: undefined,
  color: undefined,
  hsnCode: undefined,
  imageUrl: undefined,
  gstTaxTypeCode: undefined,
  taxCalcType: undefined,
  category: undefined,
  brand: undefined,
  costPrice: 0,
  type: 1,
}

const productTypes = [
  { id: 1, type: 'SIMPLE' },
  { id: 2, type: 'BUNDLE' },
];



export const ProductsList = () => {

  // USE QUERY
  // <===START===>
  useEffect(() => {
    const obj = {
      value: [
        { field: "imageUrl", header: "Image" },
        { field: "sku", header: "SKU" },
        { field: "name", header: "Name" },
        { field: "category", header: "Category" },
        { field: "description", header: "Description" },
        { field: "color", header: "Color" },
        { field: "height", header: "Height" },
        { field: "hsnCode", header: "HSNCode" },
      ],
    }
    onColumnToggle(obj)
    setAntiCSRFToken(getAntiCSRFToken())
    initFilters()
  }, [])
  // <===STOP===>


  // USE QUERY
  // <===START===>
  const [{ products }, { refetch }] = useQuery(getProducts, { orderBy: { id: "asc" } })
  const [{ product_categories }] = useQuery(getProduct_categories, { orderBy: { id: "desc" } })
  // <===STOP===>

  // USE MUTATIONS
  // <===START===>
  const [createProductMutation, { isLoading: creatingProduct }] = useMutation(createProduct)
  const [uploadCsvMutation] = useMutation(uploadCsvForProcessing)
  const [updateProductMutation, { isLoading: updatingProduct }] = useMutation(updateProduct)
  const [updateActiveProduct] = useMutation(updateProduct)
  const [kitCreateMutaton] = useMutation(CreateKit_product)
  // <===STOP===>

  //USE STATE
  // <===START===>
  const [antiCSRFToken, setAntiCSRFToken] = useState<any>(null)
  const [productDialog, setProductDialog] = useState(false)
  const [productEditState, setProductEditState] = useState(false)
  const [activeProduct, setActiveProduct] = useState(true)
  const [activeRowData, setActiveRowData] = useState({})
  const [errorProducts, setErrorProducts] = useState([])
  const [ErrorMsgs, setErrorMsgs] = useState([])
  const [filters, setFilters] = useState<any>(null)
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [selectedColumns, setSelectedColumns] = useState(columns)
  const [editUpdateProduct, setEditUpdateProduct] = useState(false)
  const [filename, setFilename] = useState('');
  const [imageUploadObject, setImageUploadObject] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [inputs, setInputs] = useState([{ product: '', quantity: '' }]);
  const [totalSize, setTotalSize] = useState(0);
  const [unitSuggestions, setUnitSuggestions] = useState<any>(null)
  const [categorySuggestions, setCategorySuggestions] = useState<any>(null)
  const [kitSuggestions, setKitSuggestions] = useState<any>(null)
  // <===STOP===>

  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const clearUpload = useRef<FileUpload>(null)

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
  const productsTableHeader = renderHeader()
  const searchCategory = createSearchFunction(product_categories, setCategorySuggestions)
  const kitSearchCategory = createSearchFunction(products.map(({ id, name, sku, description }) => {
    return {
      name: `${sku} - ${name}`,
      id,
      description,
    }
  }), setKitSuggestions)

  const uploadImage = async (e) => {
    const file = e.files[0]
    const response = await fetch("/api/upload", {
      method: "POST",
      body: file,
    })
    const { filename } = await response.json()
    setFilename(filename);
  }

  const formik = useFormik({
    initialValues: initialProductDetails,
    validate: validateZodSchema(Product),
    onSubmit: async (data) => {
      const {
        name,
        description,
        category,
        sku,
        length,
        width,
        hsnCode,
        height,
        weight,
        costPrice,
        tags,
        color,
        type
      } = data

      // const tagsValue = tags.map(({ value }) => value)

      const productTypeValue = inputs?.map((i) => ({
        id: i?.id,
        quantity: i?.quantity
      }))
      const { id: activeProductId } = activeRowData
      if (editUpdateProduct)
        return await updateActiveProduct({
          id: activeProductId,
          name: name,
        },
          {
            onSuccess: async () => {
              toast.current.show({ severity: 'info', summary: 'Update Complete', detail: 'Product updated successfully' });
              await refetch()
            },
            onError: (error) => {
              toast.current.show({ severity: 'error', summary: 'Update Failed', detail: 'Product failed to update' });
            }
          })

      await createProductMutation(
        {
          name,
          description,
          sku: moment().format('x'),
          category: category.id,
          costPrice,
          color,
          length,
          width,
          height,
          weight,
          hsnCode,
          // imageUrl: filename,
          type,
          kit_products: type === 2 ? {
            create: productTypeValue.map((e) => ({
              kitProductID: e.id,
              quantity: Number(e.quantity)
            }))
          } : undefined
        },
        {
          onSuccess: async () => {
            toast.current.show({ severity: 'info', summary: 'Product Creation Complete', detail: 'Product created successfully' });
            // const uploadImage = async (e) => {
            //   const file = e.files[0]
            //   const response = await fetch("/api/upload", {
            //     method: "POST",
            //     body: file,
            //   })
            //   const { filename } = await response.json()
            // }
            await refetch()
          },
          onError: (error) => {
            console.log('error: ', error);
            toast.current.show({ severity: 'error', summary: 'Product Creation Failed', detail: 'Failed to create product' });
          }
        }
      )

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

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  const handleAddInput = () => {
    setInputs([...inputs, { product: '', quantity: '' }]);
  };


  const handleRemoveInput = (index) => {
    if (inputs.length === 1) {
      return; // don't remove the only input
    }
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

  const fileUploadRef = useRef(null);

  const onTemplateUpload = (e) => {

    let _totalSize = 0;

    e.files.forEach((file) => {
      _totalSize += file.size || 0;
    });

    setTotalSize(_totalSize);
    toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  };

  const onTemplateRemove = (file, callback) => {
    setTotalSize(totalSize - file.size);
    callback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const headerTemplate = (options) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 10000;
    const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

    return (
      <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formatedValue} / 1 MB</span>
          <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
        </div>
      </div>
    );
  };
  const itemTemplate = (file, props) => {
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: '40%' }}>
          <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
          <span className="flex flex-column text-left ml-3">
            {file.name}
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>
        <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
        <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
      </div>
    );
  };
  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
        <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
          Drag and Drop Image Here
        </span>
      </div>
    );
  };

  const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
  const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' };
  const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

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
                  refetch()
                  setInputs([{ product: null, quantity: null }])
                  formik.resetForm()
                  setSelectedStatus(null)
                  setProductEditState(false)
                  setActiveProduct(false)
                  setProductDialog(!productDialog)
                }}
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

          <div>
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
                    setImageUploadObject(e.files[0])
                  }}
                /> */}
                </div>
                {
                  [
                    { type: 'text', label: "Name*", field: "name", header: "Name" },
                    { type: 'number', label: "Length", field: "length", header: "Length" },
                    { type: 'number', label: "Width", field: "width", header: "Width" },
                    { type: 'number', label: "Height", field: "height", header: "Height" },
                    { type: 'number', label: "Weight", field: "weight", header: "Weight" },
                    { type: 'text', label: "Color", field: "color", header: "Color" },
                    // { type: 'text', label: "Brand", field: "brand", header: "Brand" },
                    { type: 'text', label: "Tax type code", field: "taxcode", header: "Tax code" },
                    { type: 'text', label: "Gst Tax type code", field: "gstcode", header: "Gst Code" },
                    { type: 'text', label: "HSN code", field: "hsnCode", header: "HSN Code" },
                    { type: 'number', label: "Cost Price", field: "costPrice", header: "Cost Price" },
                    { type: 'text', label: "Tax Calculation Type", field: "taxCalcuation", header: "Tax Calcuation" },
                  ].map(({ field, type, label }, i) => {
                    return (
                      <div key={`${field}${i}`} className="field col-12 lg:col-2 md:col-6 mt-4">
                        <span className="p-float-label">
                          {
                            type === "text" ? (<InputText
                              disabled={productEditState}
                              id={field}
                              name={field}
                              value={formik.values[field] ?? ""}
                              onChange={formik.handleChange}
                              className={classNames({ "p-invalid": isFormFieldValid(field) })}
                            />) : (<InputNumber
                              disabled={productEditState}
                              id={field}
                              name={field}
                              value={formik.values[field]}
                              onChange={async (e) => {
                                await formik.setFieldValue(field, e.value)
                              }}
                              autoFocus
                              className={classNames({ "p-invalid": isFormFieldValid(field) })}
                            />)
                          }
                          <label
                            htmlFor={field}
                            className={classNames({ "p-error": isFormFieldValid(field) })}
                          >
                            {label}
                          </label>
                        </span>
                        {getFormErrorMessage(field)}
                      </div>
                    )
                  })
                }
                <div key={`category`} className="field col-12 lg:col-6 mt-4">
                  <span className="p-float-label">
                    <AutoComplete
                      id="category"
                      disabled={productEditState}
                      value={formik.values.category}
                      dropdown
                      forceSelection
                      suggestions={categorySuggestions}
                      completeMethod={searchCategory}
                      field="name"
                      onChange={async (e) => {
                        await formik.setFieldValue("category", e.value)
                      }}
                      aria-label="Product Category"
                      dropdownAriaLabel="Product Category"
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

                <div key="type" className="field col-12 lg:col-6 mt-4">
                  <span className="p-float-label">
                    <Dropdown
                      id="type"
                      disabled={productEditState}
                      value={formik.values.type}
                      onChange={async (e) => {
                        await formik.setFieldValue("type", e.value);
                      }}
                      options={productTypes}
                      optionLabel="type"
                      optionValue="id"
                      placeholder="Product Type"
                      className="w-full"
                    />
                    <label
                      htmlFor={"type"}
                      className={classNames({ "p-error": isFormFieldValid("type") })}
                    >
                      Product Type
                    </label>
                  </span>
                  {getFormErrorMessage("type")}
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
      </div>
      <div className="col-12" >
        <div className="card">
          <DataTable
            value={products}
            responsiveLayout="scroll"
            showGridlines
            header={productsTableHeader}
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

              setSelectedStatus(e.data.product_types)


              const _kitData = e.data.kit_products.map((prod) => {
                const { products_kit_products_kitProductIDToproducts: product, quantity } = prod
                return ({
                  product: { ...product, name: `${product.sku}-${product.name}` },
                  quantity,
                })
              });
              setInputs(_kitData)


              await formik.setValues({
                ...e.data,
                type: e.data.product_types.type,
                category: e.data.product_categories,
              })
              scrolToTop?.current && scrolToTop?.current.scrollIntoView()
            }}
          >
            <Column header="SKU" body={rowData => <a href='/products/id'>{rowData.sku} </a>} />
            {columnComponents}
          </DataTable>

        </div>
      </div >
    </div >

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
