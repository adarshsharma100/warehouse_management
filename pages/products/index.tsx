import { Suspense, useState, useRef, useEffect, useReducer, useCallback } from "react"
import { useMutation, useQuery, usePaginatedQuery } from "@blitzjs/rpc"
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import papa from "papaparse"
import Layout from "layouts/Layout"
import Head from "next/head"
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

import createImage from "app/images/mutations/createImage";

import getProducts from "app/products/queries/getProducts"

import Loading from "components/loading"
import { useFormik } from "formik"
import * as Yup from "yup"
import classNames from "classnames"
import { AutoComplete } from "primereact/autocomplete"
import { calenderDateFormat, createCSVFormat, createSearchFunction, dateFormat, filterExistingValues, initialFilterRules, tsuccess } from "app/constants"
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
import { InputTextarea } from "primereact/inputtextarea"
import { OverlayPanel } from "primereact/overlaypanel"
import { Divider } from "primereact/divider";
import { dateFilterTemplate } from "components/FilterTemplates"
import getProduct_brands from "app/product_brands/queries/getProduct_brands"
import { Paginator } from "primereact/paginator"
import { Image } from 'primereact/image';
import { Galleria } from "primereact/galleria";
import { object } from "zod"
import { connect } from "http2";

const constantTokens = {
  storageAccountName: process.env.NEXT_PUBLIC_STORAGERESOURCENAME,
  sasToken: process.env.NEXT_PUBLIC_STORAGESASTOKEN,
  containerName: 'manifests'
}

const initialState = {
  tableRowsCount: 10,
  skipCount: 0,
  // first: 0,
  // rows: 10,
  // itemsPerPage: 10,
};


const columns = [
  {
    field: "sku",
    header: "SKU",
    filter: true,
    filterPlaceholder: "Search by Sku",
    body: rowData => <a href='/products/id'>{rowData.sku} </a>
  },
  {
    field: "name",
    header: "Name",
    filter: true,
    filterPlaceholder: "Search by Name"
  },
  {
    field: "product_types.type",
    header: "Type",
    filter: true,
    filterPlaceholder: "Search by Type"
  },
  {
    field: "kit_products_kit_products_productIdToproducts",
    header: "Kit Products",
    body: ({ kit_products_kit_products_productIdToproducts }) => {
      const [showOverlay, setShowOverlay] = useState(false);
      const productDisplayRef = useRef(null);

      const handleMouseEnter = (event) => {
        if (productDisplayRef.current) {
          productDisplayRef.current.toggle(event);

        }

      };

      const handleMouseLeave = () => {
        setShowOverlay(false);
      };

      return (
        <>
          {kit_products_kit_products_productIdToproducts?.length > 2 ? (
            <div className="product-column">
              <div
                className="product-header"


              // onMouseLeave={handleMouseLeave}
              >
                <Button
                  label={`Kit-Products(${kit_products_kit_products_productIdToproducts.length})`}
                  className="p-button-link"
                  onMouseEnter={handleMouseEnter}
                />
              </div>
              {/* {showOverlay && ( */}
              <div className="overlay-panel">
                <OverlayPanel ref={productDisplayRef} showCloseIcon  >
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}>
                    {kit_products_kit_products_productIdToproducts.map((product, i) => {
                      const { quantity, products_kit_products_kitProductIdToproducts: { name, sku } } = product;
                      return (
                        <div key={i} className="pt-2 pb-2">
                          {[{ prop: "Name", value: name },
                          { prop: "SKU", value: sku },
                          { prop: "Quantity", value: quantity }
                          ].map(({ prop, value }, index) => (
                            <div key={index} className="grid">
                              <span className="font-semibold col-4">{prop}:</span>
                              <span className="col">
                                {value?.toString()}
                              </span>

                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>


                </OverlayPanel>

              </div>

            </div>


          ) : kit_products_kit_products_productIdToproducts?.length < 3 && kit_products_kit_products_productIdToproducts.length > 0 ?
            <div className="w-20rem">
              {kit_products_kit_products_productIdToproducts?.map((product, i) => {
                const { quantity, products_kit_products_kitProductIdToproducts: { name, sku } } = product;
                return (
                  <div key={i} className="pt-2 pb-2">
                    {[{ prop: "Name", value: name },
                    { prop: "SKU", value: sku },
                    { prop: "Quantity", value: quantity }
                    ].map(({ prop, value }, index) => (
                      <div key={index} className="grid">
                        <label className="font-semibold col-4">{prop}:</label>
                        <div className="col">
                          {value?.toString()}
                        </div>
                      </div>
                    ))}

                  </div>
                )
              })}
            </div>


            : <div className="hideLargeContent">-</div>

          }
        </>
      )
    },
  },
  {
    field: "length",
    header: "Length"
  },
  {
    field: "width",
    header: "Width"
  },
  {
    field: "height",
    header: "Height"
  },
  {
    field: "weight",
    header: "Weight"
  },
  {
    field: "color",
    header: "Color"
  },
  {
    field: "brand",
    header: "Brand"
  },
  {
    field: "customDuty",
    header: "Custom Duty"
  },
  {
    field: "gstTaxTypeCode",
    header: "Gst Code",
    filter: true,
    filterPlaceholder: "Search by GST",
  },
  {
    field: "hsnCode",
    header: "HSN Code"
  },
  {
    field: "product_prices.averageCostPrice",
    header: "Average Cost Price",
    filter: true,
    filterPlaceholder: "Search by Cost Price",
    body: (rowData) => <div className="hideLargeContent">{rowData.product_prices?.averageCostPrice !== null ? rowData.product_prices?.averageCostPrice : "N/A"}</div>
  },
  {
    field: "product_prices.sellingPrice",
    header: "Selling Price",
    filter: true,
    filterPlaceholder: "Search by Price",
    body: (rowData) => <div className="hideLargeContent">{rowData.product_prices?.sellingPrice !== null ? rowData.product_prices?.sellingPrice : "N/A"}</div>
  },
  {
    field: "taxCalcuation",
    header: "Tax Calcuation"
  },
  {
    field: "description",
    header: "Description",
    filter: true,
    filterPlaceholder: "Search by Description",
    body: ({ description }) => <div className="hideLargeContent">{description}</div>
  },

  {
    field: "updatedAT",
    header: "Updated On",
    filterField: "updatedAT",
    filter: true,
    filterElement: dateFilterTemplate,
    dataType: "date",
    body: (rowData) => <div>{dateFormat(rowData.updatedAT)}</div>,
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
  customDuty: undefined,
  gstTaxTypeCode: undefined,
  taxCalcType: undefined,
  category: undefined,
  brand: undefined,
  costPrice: 0,
  sellingPrice: 0,
  type: 1,

}

const productTypes = [
  { id: 1, type: 'SIMPLE' },
  { id: 2, type: 'BUNDLE' },
];

const initialColumnFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  sku: initialFilterRules.andContains,
  name: initialFilterRules.andContains,
  gstTaxTypeCode: initialFilterRules.andContains,
  description: initialFilterRules.andContains,
  updatedAT: initialFilterRules.dateIs,
  createdAT: initialFilterRules.dateIs,
  costPrice: initialFilterRules.andContains,
  agreement: initialFilterRules.andContains,
  status: initialFilterRules.andContains,
  "product_types.type": initialFilterRules.andContains,
  "product_prices.averageCostPrice": initialFilterRules.andContains,
  "product_prices.sellingPrice": initialFilterRules.andContains,
}

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'UPDATE_TABLE_ROWS_COUNT':
      return { ...state, tableRowsCount: payload }
    case 'UPDATE_SKIP_COUNT':
      return { ...state, skipCount: payload }
    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}


export const ProductsList = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  console.log("state", state);
  const { skipCount, tableRowsCount } = state;


  // USE QUERY
  // <===START===>
  const [{ products, count: totalProductsCount }, { refetch }] = usePaginatedQuery(getProducts,
    {
      orderBy: { id: "desc" },
      where: {},
      skip: skipCount,
      take: tableRowsCount

    })
  console.log('products: ', products);
  const [{ product_categories }] = useQuery(getProduct_categories, { orderBy: { id: "desc" } })
  const [{ product_brands }] = useQuery(getProduct_brands, { orderBy: { id: "asc" } })


  // <===STOP===>

  // USE MUTATIONS
  // <===START===>
  const [createProductMutation, { isLoading: creatingProduct }] = useMutation(createProduct)
  const [createImageMutation, { isLoading: creatingImage }] = useMutation(createImage);
  const [uploadCsvMutation] = useMutation(uploadCsvForProcessing)
  const [updateProductMutation, { isLoading: updatingProduct }] = useMutation(updateProduct)
  // const [updateActiveProduct] = useMutation(updateProduct)
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
  const [filters, setFilters] = useState<any>(initialColumnFilters)
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [selectedColumns, setSelectedColumns] = useState([])
  // const [editUpdateProduct, setEditUpdateProduct] = useState(false)
  const [filename, setFilename] = useState('');
  const [filteredKitId, setFilteredKitId] = useState([]);
  const [imageUploadObject, setImageUploadObject] = useState<any>({})
  const [imageUploadArray, setImageUploadArray] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [inputs, setInputs] = useState([{ product: '', quantity: '' }]);
  const [totalSize, setTotalSize] = useState(0);
  const [unitSuggestions, setUnitSuggestions] = useState<any>(null)
  const [categorySuggestions, setCategorySuggestions] = useState<any>(null)
  const [kitSuggestions, setKitSuggestions] = useState<any>(null)
  const [filteredKitSuggestions, setFilteredKitSuggestions] = useState<any>([]);
  const [brandSuggestions, setBrandSuggestions] = useState([])
  const [filteredKitProductId, setFilteredKitProductId] = useState([]);
  const disabledButtons = {
    basicUpload: true,
    choose: false,
    cancel: true,
    upload: true,
    retry: true,
    clear: true
  };

  // <===STOP===>

  const toast = useRef(null)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const clearUpload = useRef<FileUpload>(null)

  // === Add export code
  const dt = useRef(null);
  const exportColumns = columns.map((col) => ({ title: col.header, dataKey: col.field }));

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(products);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      saveAsExcelFile(excelBuffer, 'products');
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    import('file-saver').then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data = new Blob([buffer], {
          type: EXCEL_TYPE
        });

        module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
      }
    });
  };

  const columnComponents = columns.reduce((acc, curr) => {
    if (selectedColumns.includes(curr.field))
      return [
        ...acc,
        <Column
          key={curr?.field}
          field={curr?.field}
          header={curr?.header}
          body={curr?.body}
          filter={curr?.filter}
          filterPlaceholder={curr?.filterPlaceholder}
          dataType={curr?.dataType}
          filterElement={curr?.filterElement}

        />
      ];
    return acc;
  }, []);

  const clearFilter = () => {
    setFilters(initialColumnFilters)
    setGlobalFilterValue("")
  }
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters1 = { ...filters }
    _filters1["global"].value = value

    setFilters(_filters1)
    setGlobalFilterValue(value)
  }


  // USE Effect
  // <===START===>
  useEffect(() => {
    const defaultColumns = columns.filter(col => !["updatedAt", "length", "width", "height", "weight", "brand", "customDuty", "taxCalcuation", "color", "hsnCode"].includes(col.field)).map(col => col.field)

    setSelectedColumns(defaultColumns)

    setAntiCSRFToken(getAntiCSRFToken())

  }, [])
  // <===STOP===>



  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <MultiSelect
          value={selectedColumns}
          options={columns?.map(({ header, field }) => ({
            label: header,
            value: field
          }))}
          onChange={(e) => setSelectedColumns(e.value)}
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

          <Button
            type="button"
            icon="pi pi-file-excel"
            label="Export as XLSX"
            // severity="success"
            rounded onClick={exportExcel}
            tooltip="Export Data"
            tooltipOptions={{ position: 'top' }}
          />

        </div>
      </div>
    )
  }

  const productsTableHeader = renderHeader()
  const searchCategory = createSearchFunction(product_categories, setCategorySuggestions)
  const uploadOption = { style: { display: "none" } }

  const kitSearchCategory = createSearchFunction(
    products.filter(({ id }) => {
      if (!filteredKitProductId.includes(id)) {
        return true
      } else {
        return false
      }
    }).map(({ id, name, sku, description }) => {

      return {
        name: `${sku} - ${name}`,
        id,
      }


    }), setKitSuggestions)


  const searchBrand = createSearchFunction(product_brands, setBrandSuggestions)

  const uploadImage = async (e) => {
    const file = e.files[0]
    const response = await fetch("/api/upload", {
      method: "POST",
      body: file,
    })
    const { filename } = await response.json()
    setFilename(filename);
  }

  const handleOnRemoveImageArrayChange = (event) => {
    const newArray = Array.from(imageUploadArray);
    const _imageUploadArray = newArray.filter((eachItem) => eachItem.name !== event.file.name);
    setImageUploadArray(_imageUploadArray);

  }

  const uploadHandler = async (imageUploadArray) => {

    imageUploadArray.forEach(async (eachArray) => {
      const filename = uuidv4()
      const fileExtension = eachArray.name.slice(eachArray.name.lastIndexOf('.') + 1);
      if (eachArray) {
        // const newFileName = event.files[0].name.split('.').pop();
        const response = await uploadFileToBlob(eachArray, `${filename}.${fileExtension}`);
        console.log('response: ', response);
        if (response?.uploadResponse._response.status === 201) {
          const _tempString = response?.blockBlobClient.url.split("?")[0];
          console.log("_tempString ", _tempString);
          await createImageMutation({ imageUrl: _tempString }, {
            onSuccess: async () => {
              toast.current.show({ severity: 'info', summary: 'Image Creation Complete', detail: 'Image created successfully' });
            },
            onError: (error) => {
              console.log('error: ', error);
              toast.current.show({ severity: 'error', summary: 'Update Failed', detail: 'Product failed to update' });

            }
          })

        }

      }
    })
    // const filename = uuidv4()

    // console.log("fileName", filename);


    // const fileExtension = imageUploadObject.name.slice(imageUploadObject.name.lastIndexOf('.') + 1);
    // console.log("fileExtension", fileExtension);
    // if (imageUploadObject) {
    //   // const newFileName = event.files[0].name.split('.').pop();
    //   const response = await uploadFileToBlob(imageUploadObject, `${filename}.${fileExtension}`);
    //   console.log('response: ', response);
    //   if (response?.uploadResponse._response.status === 201) {
    //     const _tempString = response?.blockBlobClient.url.split("?")[0];
    //     console.log("_tempString ", _tempString);
    //     await createImageMutation({ imageUrl: _tempString }, {
    //       onSuccess: async () => {
    //         toast.current.show({ severity: 'info', summary: 'Image Creation Complete', detail: 'Image created successfully' });
    //       },
    //       onError: (error) => {
    //         console.log('error: ', error);
    //         toast.current.show({ severity: 'error', summary: 'Update Failed', detail: 'Product failed to update' });

    //       }
    //     })

    //   }

    // }

  };



  const formik = useFormik({
    initialValues: initialProductDetails,
    validate: validateZodSchema(Product),
    onSubmit: async (data) => {
      console.log(data);
      // alert(data);

      //function to create new kit products

      const createKitProducts = (products) =>
        products.map(({ product, quantity }) => ({
          products_kit_products_kitProductIdToproducts: {
            products_kit_products_kitProductIdToproducts: {
              connect: {
                id: product.id
              }
            },
            quantity,

          }
        }))


      const {
        name,
        description,
        category,
        brand,
        sku,
        length,
        width,
        hsnCode,
        height,
        weight,
        costPrice,
        sellingPrice,
        tags,
        color,
        type,
        kitProducts,
        customDuty,
        gstTaxTypeCode,
        taxCalcuation,
      } = data

      console.log("kitProducts", kitProducts);

      // const tagsValue = tags.map(({ value }) => value)

      // const productTypeValue = inputs?.map((i) => ({
      //   id: i?.id,
      //   quantity: i?.quantity
      // }))


      const filename = uuidv4();

      const { id: activeProductId, kit_products } = activeRowData

      const existingKitProducts = kitProducts?.
        filter(product => product?.kitId)

      const existingKitIds = existingKitProducts?.map(prod => prod.kitId)

      const newKitProducts = kitProducts?.
        filter(product => !product?.kitId)

      const removedKitProducts = kit_products?.filter(({ id }) => !existingKitIds?.includes(id))
      // console.log('removedKitProducts: ', removedKitProducts?.map(product => product.id),);


      if (activeProduct) {
        return await updateProductMutation({
          id: activeProductId,
          name: name,
          description,
          costPrice,
          length,
          width,
          height,
          weight,
          color,
          hsnCode,
          customDuty,
          gstTaxTypeCode,
          taxCalcType: taxCalcuation,
          kit_products_kit_products_productIdToproducts: {
            updateMany: existingKitProducts?.map(({ kitId, quantity }) => ({
              where: {
                id: kitId
              },
              data: {
                quantity,
              }
            })),
            create: createKitProducts(newKitProducts),
            deleteMany: {
              id: {
                in: removedKitProducts?.map(product => product?.id),
              },
            },

          }
        },
          {
            onSuccess: async () => {
              toast.current.show({ severity: 'info', summary: 'Update Complete', detail: 'Product updated successfully' });

              // await uploadHandler()
              await refetch()
              setProductDialog(false)
              setActiveProduct(false)
              formik.resetForm()
              setProductEditState(false)

            },
            onError: (error) => {
              console.log('error: ', error);
              toast.current.show({ severity: 'error', summary: 'Update Failed', detail: 'Product failed to update' });

            }
          })

      }

      await createProductMutation(
        {
          name,
          description,
          customDuty,
          gstTaxTypeCode,
          taxCalcType: taxCalcuation,
          sku: moment().format('x'),
          // category: category.id,
          product_categories: {
            connect: {
              id: category.id

            }
          },
          product_brand: {
            connect: {
              id: brand?.id
            }
          },
          // brand: brand?.id,
          // costPrice,
          product_prices: {
            create: {
              sellingPrice: sellingPrice,
              averageCostPrice: costPrice
            }
          },
          dimensions: {
            create: {
              length: length,
              width: width,
              height: height,
              weight: weight,
            }
          },
          color,
          hsnCode,
          product_types: {
            connect: {
              id: type

            }

          },
          // imageUrl: filename,
          // type,
          kit_products_kit_products_productIdToproducts: type === 2 ? {
            create: createKitProducts(kitProducts)
          } : undefined

        },
        {
          onSuccess: async () => {
            toast.current.show({ severity: 'info', summary: 'Product Creation Complete', detail: 'Product created successfully' });

            await uploadHandler(imageUploadArray)
            setImageUploadObject(null)
            setImageUploadArray([])

            await refetch()
            setProductDialog(false)
            formik.resetForm()
            setProductEditState(false)

          },
          onError: (error) => {
            console.log('error: ', error);
            toast.current.show({ severity: 'error', summary: 'Product Creation Failed', detail: 'Failed to create product' });
          }
        }
      )
    },
  })

  console.log("Formik Data", activeRowData);
  console.log('  formik.errors: ', formik.errors
  );

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik?.errors?.[name]}</small>
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

  const handlePageChange = async (event) => {
    console.log(event);
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
  }



  const onTemplateRemove = (file, callback) => {
    setTotalSize(totalSize - file.size);
    callback();
  }

  const uploadFileToBlob = useCallback(
    async (file: File | null, newFileName: string) => {
      if (!file) {
        console.log('No FILE');
      } else {
        const blobService = new BlobServiceClient(
          `https://${constantTokens.storageAccountName}.blob.core.windows.net/?${constantTokens.sasToken}`
        );

        const containerClient: ContainerClient =
          blobService.getContainerClient(constantTokens.containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(newFileName);
        console.log('file: ', file);
        const uploadResponse = await blockBlobClient.uploadBrowserData(file)
        return { uploadResponse, blockBlobClient }
      }
      console.log("done");
    },
    []
  );


  console.log("setFilteredKitSuggestions", filteredKitSuggestions);
  console.log("filteredKitId", filteredKitId);
  console.log("formik.value", formik.values)

  console.log("File Image", imageUploadArray);

  const pagination = () => <Paginator first={skipCount} rows={tableRowsCount} totalRecords={totalProductsCount} rowsPerPageOptions={[10, 20, 30]} onPageChange={handlePageChange} />

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
                  setInputs([{ product: null, quantity: null }])
                  formik.resetForm()
                  setSelectedStatus(null)
                  setProductEditState(true)
                  setActiveProduct(false)
                  setProductDialog(true)
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
              {/* <h4>{activeProduct ? "Update Product " : "Create Product"} </h4> */}
            {activeProduct ? <h3>Update Product - {formik.values.sku}</h3> : <h3>Create Product</h3>}

              <h4 className="mt-0">{activeProduct &&
                <Button
                  icon="pi pi-pencil"
                  className="m-1"
                  onClick={() => { setProductEditState(!productEditState) }}
                />}</h4>
            </div>


            {imageUploadArray && imageUploadArray.length > 0 ?
              <div className="selected-image-container flex justify-content-end" >
                {imageUploadArray.map((eachImage, index) => {
                  return (
                    <div key={index} className="m-3">
                      <Image src={eachImage.objectURL}
                        alt="Image"
                        width="100"
                        height="50" preview />
                    </div>
                  )
                })}
              </div>
              : null


            }


            {/* <div className="flex justify-content-center align-item-center">
              <FileUpload
                name="product_image"
                url="./upload.php"
                // onUpload={(event) => console.log("File Upload", event)}
                customUpload
                uploadHandler={uploadHandler}
                onSelect={async (e) => {
                  console.log("event", e.files[0]);
                  setImageUploadObject(e.files[0]);
                  setImageUploadArray([...imageUploadArray, e.files[0]]);
                }}

                onRemove={handleOnRemoveImageArrayChange}
                multiple
                accept="image/*"
                maxFileSize={1000000}
              />
            </div> */}
            <form
              onSubmit={formik.handleSubmit}
              className="p-fluid"
            >
              <div className="formgrid grid">
                {
                  [
                    { type: 'text', label: "Name*", field: "name", header: "Name" },
                    { type: 'number', label: "Length", field: "length", header: "Length" },
                    { type: 'number', label: "Width", field: "width", header: "Width" },
                    { type: 'number', label: "Height", field: "height", header: "Height" },
                    { type: 'number', label: "Weight", field: "weight", header: "Weight" },
                    { type: 'text', label: "Color", field: "color", header: "Color" },
                    // { type: 'text', label: "Brand", field: "brand", header: "Brand" },
                    { type: 'text', label: "Custom duty", field: "customDuty", header: "Tax code" },
                    { type: 'number', label: "Gst Tax type code", field: "gstTaxTypeCode", header: "Gst Code" },
                    { type: 'text', label: "HSN code", field: "hsnCode", header: "HSN Code" },
                    { type: 'number', label: "Cost Price", field: "costPrice", header: "Cost Price" },
                    { type: 'text', label: "Tax Calculation Type", field: "taxCalcuation", header: "Tax Calcuation" },
                    { type: 'number', label: "Selling Price", field: "sellingPrice", header: "Selling Price" },
                    { type: 'textArea', label: "Description", field: "description", header: "Name" },
                  ].map(({ field, type, label }, i) => {
                    return (
                      <div key={`${field}${i}`} className={`field col-12 lg:${type === "textArea" ? "col-12" : "col-2"} md:col-6 mt-4`}>
                        <span className="p-float-label">
                          {
                            type === "text" ? (<InputText
                              disabled={!productEditState}
                              id={field}
                              name={field}
                              value={formik.values[field] ?? ""}
                              onChange={formik.handleChange}
                              className={classNames({ "p-invalid": isFormFieldValid(field) })}
                            />) : type === "number" ? (<InputNumber
                              disabled={!productEditState}
                              id={field}
                              name={field}
                              value={formik.values[field] ?? undefined}
                              onChange={async (e) => {
                                await formik.setFieldValue(field, e.value)
                              }}
                              autoFocus
                              className={classNames({ "p-invalid": isFormFieldValid(field) })}
                            />) : (<InputTextarea
                              disabled={!productEditState}
                              id={field}
                              name={field}
                              value={formik.values[field] ?? ""}
                              onChange={async (e) => {
                                await formik.setFieldValue(field, e.target.value)
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
                <div key={`category`} className="field col-12 lg:col-4 mt-4">
                  <span className="p-float-label">
                    <AutoComplete
                      id="category"
                      disabled={!productEditState || activeProduct}
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
                <div key={`brand`} className="field col-12 lg:col-4 mt-4">
                  <span className="p-float-label">
                    <AutoComplete
                      id="brand"
                      disabled={!productEditState || activeProduct}
                      value={formik.values.brand}
                      dropdown
                      forceSelection
                      suggestions={brandSuggestions}
                      completeMethod={searchBrand}
                      field="name"
                      onChange={async (e) => {
                        await formik.setFieldValue("brand", e.value)
                      }}
                      aria-label="Product brand"
                      dropdownAriaLabel="Product brand"
                      className={classNames({ "p-invalid": isFormFieldValid("brand") })}
                    />
                    <label
                      htmlFor={"brand"}
                      className={classNames({ "p-error": isFormFieldValid("brand") })}
                    >
                      Brand
                    </label>
                  </span>
                  {getFormErrorMessage("brand")}
                </div>

                <div key="type" className="field col-12 lg:col-4 mt-4">
                  <span className="p-float-label">
                    <Dropdown
                      id="type"
                      disabled={!productEditState || activeProduct}
                      value={formik.values.type}
                      onChange={async (e) => {
                        if (e.value === 2) {
                          //Handle BUNDLE type
                          await formik.setValues({
                            ...formik.values,
                            type: e.value,
                            kitProducts: [{
                              product: undefined,
                              quantity: 1
                            }]
                          })
                        }
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
                {formik.values.type === 2 && <div key="kit_products" className="field col-12">
                  <div className="card surface-ground">
                    <div className="grid">
                      <div className="col-12">
                        <span className="text-lg">Kit Products</span>
                      </div>
                      {formik.values.kitProducts?.map(({ product, quantity }, index) => (
                        <>
                          <div key={`kit-product-${index}`} className="field col-12 lg:col-9 mt-5">
                            <span className="p-float-label">
                              <AutoComplete
                                id={`kitProducts[${index}]?.product`}
                                name={`kitProducts[${index}]?.product`}
                                suggestions={kitSuggestions}
                                completeMethod={kitSearchCategory}
                                disabled={!productEditState}
                                dropdown
                                forceSelection
                                field="name"
                                value={product}
                                onChange={async (e) => {
                                  await formik.setFieldValue("kitProducts", formik.values.kitProducts.map((kitProduct, i) => {
                                    const _filteredKitProductId = [...filteredKitProductId, e.value?.id];
                                    setFilteredKitProductId(_filteredKitProductId);
                                    if (i !== index)
                                      return kitProduct
                                    return {
                                      ...kitProduct,
                                      product: e.value,
                                    }
                                  }))
                                }}
                              />
                              <label
                                htmlFor={`kitProducts[${index}].product.`}
                                className={classNames({ "p-error": isFormFieldValid(`kitProducts.0.product.name`) })}
                              >
                                Kit Product
                              </label>
                            </span>
                            {
                              formik.errors.kitProducts?.[index]?.product &&
                              <small className="p-error">{formik.errors.kitProducts?.[index]?.product}</small>
                            }
                          </div>
                          <div key={`kit-product-quantity-${index}`} className="field col-12 lg:col-2 mt-5">
                            <span className="p-float-label">
                              <InputNumber
                                id={`kitProducts[${index}]?.quantity`}
                                name={`kitProducts[${index}]?.quantity`}
                                step={1}
                                showButtons
                                value={quantity}
                                disabled={!productEditState}
                                onChange={async (e) => {
                                  await formik.setFieldValue("kitProducts", formik.values.kitProducts.map((kitProduct, i) => {
                                    if (i !== index)
                                      return kitProduct
                                    return {
                                      ...kitProduct,
                                      quantity: e.value,
                                    }
                                  }))
                                }}
                              />
                              <label
                                htmlFor={"type"}
                                className={classNames({ "p-error": isFormFieldValid("type") })}
                              >
                                Quantity
                              </label>
                            </span>
                            {
                              formik.errors.kitProducts?.[index]?.quantity &&
                              <small className="p-error">{formik.errors.kitProducts?.[index]?.quantity}</small>
                            }
                          </div>
                          {productEditState && <div className="field col-1 p-buttonset mt-5" style={{ height: "fit-content" }}>
                            {index !== formik.values.kitProducts.length - 1 && <Button
                              className="p-button-secondary"
                              icon="pi pi-trash"
                              onClick={async (e) => {
                                e.preventDefault()
                                await formik.setFieldValue("kitProducts", formik.values.kitProducts.filter((data, i) => index !== i))
                              }}
                            />}
                            <Button icon="pi pi-plus-circle" onClick={async (event) => {
                              event.preventDefault()
                              await formik.setFieldValue("kitProducts", formik.values.kitProducts.reduce((acc, curr, i) => {
                                if (index !== i)
                                  return [...acc, curr]
                                return [...acc, curr, { product: undefined, quantity: 1 }]
                              }, []))
                            }} />
                          </div>}
                        </>
                      ))}
                    </div>
                  </div>
                </div>}

              </div>
              {productDialog ? <div className="flex justify-content-center align-item-center">
                <FileUpload
                  name="product_image"
                  url="./upload.php"
                  // onUpload={(event) => console.log("File Upload", event)}
                  customUpload
                  uploadHandler={uploadHandler}
                  onSelect={async (e) => {
                    console.log("event", e.files[0]);
                    setImageUploadObject(e.files[0]);
                    const newImageUploadArray = [...imageUploadArray, e.files[0]];
                    setImageUploadArray(newImageUploadArray);
                    // setImageUploadArray([...imageUploadArray, e.files[0]]);
                  }}
                  onClear={() => setImageUploadArray([])}

                  onRemove={handleOnRemoveImageArrayChange}
                  multiple
                  accept="image/*"
                  maxFileSize={1000000}
                  uploadOptions={uploadOption}



                />
              </div> : null}
              <div className="flex mt-4 justify-content-end">
                {productEditState && <Button
                  type="submit"
                  className="mr-2 "
                  label={activeProduct ? 'UPDATE' : 'SUBMIT'}

                />}
                <Button
                  className="p-button-secondary flex-grow-0"
                  style={{ maxWidth: "50%" }}
                  type="button"
                  label="CANCEL"
                  onClick={async () => {
                    formik.resetForm()
                    setProductDialog(false)
                    setProductEditState(false)
                    setActiveProduct(false)
                    setImageUploadArray([])
                  }}
                />
              </div>

            </form>
          </div>
        </div>
      </div >
      <div className="col-12" >
        <div className="card">
          <DataTable
            value={products}
            responsiveLayout="scroll"
            showGridlines
            footer={pagination}
            header={productsTableHeader}
            filters={filters}
            className="text-s datatable-responsive"
            filterDisplay="menu"
            emptyMessage="No Results found."
            rowHover={true}
            onRowClick={async (e) => {
              setActiveRowData({ ...e.data })
              setActiveProduct(true)
              setProductDialog(true)
              console.log("row data click", e.data);

              setSelectedStatus(e.data.product_types)


              const _kitData = e.data.kit_products_kit_products_productIdToproducts?.map((prod) => {
                const { products_kit_products_kitProductIdToproducts: product, quantity, id: kitId } = prod
                return ({
                  product: { name: `${product.sku}-${product.name}`, id: product?.id, },
                  quantity,
                  kitId,
                })
              });
              setInputs(_kitData)

              await formik.setValues({
                ...e.data,
                type: e?.data?.type,
                category: e.data.product_categories,
                gstTaxTypeCode: e?.data?.gstTaxTypeCode,
                taxCalcuation: e?.data?.taxCalcType,
                kitProducts: _kitData,
                brand: e?.data.product_brand,

              })
              scrolToTop?.current && scrolToTop?.current.scrollIntoView()
            }}
          >
            {columnComponents}
          </DataTable>

        </div>
      </div >
    </div >

  )
}


const ProductsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Products</title>
      </Head>
      <div>
        <Suspense fallback={<Loading />}>
          <ProductsList />
        </Suspense>
      </div>
    </Layout>
  )
}
ProductsPage.authenticate = true
export default ProductsPage
