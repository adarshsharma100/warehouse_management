import { Suspense, useState, useReducer, useRef } from "react";
import Head from "next/head";
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import Layout from 'layouts/Layout'
import getProduct_brands from "app/product_brands/queries/getProduct_brands";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useFormik } from "formik";
import * as Yup from "yup"
import { classNames } from "primereact/utils";
import CreateProduct_brand from 'app/product_brands/mutations/createProduct_brand'
import UpdateProduct_brand from 'app/product_brands/mutations/updateProduct_brand'
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import Loading from "components/loading";
import { MultiSelect } from "primereact/multiselect";
import { initialFilterRules } from "app/constants";
import { FilterMatchMode } from "primereact/api";

const initialproductBrand = {
  name: '',
}
const initialState = {
  tableRowsCount: 10,
  skipCount: 0,
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

const columns = [
  { field: "id", header: "ID" },
  { field: "name", header: "Name" },
]
export const Product_brandsList = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { skipCount, tableRowsCount } = state;
  const [{ product_brands, count: total_product_brands }] = usePaginatedQuery(getProduct_brands, {
    orderBy: { id: "asc" },
    skip: skipCount,
    where: {},
    take: tableRowsCount
  })

  const [productBrand] = useState(initialproductBrand)
  const [selectedColumns] = useState(columns);
  const [productBrandDiolog, setProductBrandDiolog] = useState(false);
  const [updateBrand, setUpdateBrand] = useState(false)
  const [createMutations] = useMutation(CreateProduct_brand);
  const [updateMutations] = useMutation(UpdateProduct_brand)
  const [activeProductBrand, setActiveProductBrand] = useState({})

  const formik = useFormik({
    initialValues: productBrand,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required")
    }),
    onSubmit: async (data) => {
      console.log('data: ', data);
      const { name } = data
      const { id: rowID } = activeProductBrand

      if (updateBrand) {
        await updateMutations({
          id: rowID,
          name,
        }, {
          onSuccess: (data) => {
            alert('Updated')
            console.log('data: ', data);

          },
          onError: (error) => {
            alert('Update Error')
            console.log('error: ', error);
          }
        })
      } else {
        try {
          await createMutations({
            name
          }, {
            onSuccess: (data) => {
              alert('Created')
              console.log('data: ', data);
            },
            onError: (error) => {
              console.log('error: ', error);
              alert('onError')
            }
          }
          )

        } catch (error) {
          console.log('error: ', error);
        }
      }
      setProductBrandDiolog(false)
    }
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }


  // === Add export code
  const dt = useRef(null);
  const exportColumns = columns.map((col) => ({ title: col.header, dataKey: col.field }));

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(product_brands);
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

  const handlePageChange = async (event) => {
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
  }


  const pagination = () => <Paginator first={skipCount} rows={tableRowsCount} totalRecords={total_product_brands} rowsPerPageOptions={[5, 10, 15]} onPageChange={handlePageChange} />

  // const [filters, setFilters] = useState<any>()
  // const [globalFilterValue, setGlobalFilterValue] = useState("")



  const initialColumnFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: initialFilterRules.andContains,
  }

  const [filters, setFilters] = useState(initialColumnFilters);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

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


  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
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

  const productsBrandsTableHeader = renderHeader()

  return (
    <div>
      <Head>
        <title>ProductBrands</title>
      </Head>

      <div className='card flex justify-content-between '>
        <h2 className='mb-0'>Product Brands</h2>
        <Button
          icon='pi pi-plus'
          label="Add Product Brands"
          onClick={() => {
            formik.resetForm()
            setUpdateBrand(false)
            setProductBrandDiolog(!productBrandDiolog)
          }}
        />
      </div>

      <form className="p-fluid" onSubmit={formik.handleSubmit}>
        {productBrandDiolog &&
          <div className="card">
            {updateBrand ? <h3>Update Product Brand - {formik.values.name}</h3> : <h3>Create Product Brand</h3>}
            <div className="formgrid grid">
              {[
                { type: 'text', label: 'Name', field: 'name' },
              ].map((ele, i) => {
                return (
                  <div key={ele.field} className='field col-12 md:col-3 lg:col-2 mt-4' >
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
                      {getFormErrorMessage(ele.field)}
                    </span>

                  </div>
                )
              })}

            </div>

            <div className="flex ">
              <Button
                type="submit"
                className="mr-2"
                // label="SUBMIT"
                label={updateBrand ? "UPDATE" : "SUBMIT"}
              />
              <Button
                className="p-button-secondary flex-grow-0"
                style={{ maxWidth: "50%" }}
                type="button"
                label="CANCEL"
                onClick={() => {
                  formik.resetForm()
                  setProductBrandDiolog(false)
                  setUpdateBrand(false)
                }}
              />

            </div>

          </div>
        }
      </form>

      <div className="col-12 card mt-4">
        <DataTable
          value={product_brands}
          showGridlines
          stripedRows
          className="text-s datatable-responsive"
          responsiveLayout="scroll"
          filterDisplay="menu"
          filters={filters} 
          header={productsBrandsTableHeader}
          footer={pagination}
          onRowClick={async (e) => {
            setActiveProductBrand({ ...e.data })
            setProductBrandDiolog(true)
            setUpdateBrand(true)
            await formik.setValues({
              ...e.data
            })
          }}
        >
          {columnComponents}

          {/* <Column
            header="Action"
            body={(rowData) => {
              return (
                <div>
                  <Button
                    icon="pi pi-pencil"
                    onClick={async () => {
                      setActiveProductBrand({ ...rowData })
                      setProductBrandDiolog(true)
                      setUpdateBrand(true)
                      await formik.setValues({
                        ...rowData
                      })
                    }}
                  />
                </div>
              )
            }}
          /> */}
        </DataTable>

      </div>

    </div>
  );
};

const Product_brandsPage = () => {
  return (
    // <div>
    //   <Suspense fallback={<div>Loading...</div>}>
    //     <Layout>
    //       <Product_brandsList />
    //     </Layout>
    //   </Suspense>
    // </div>
    <Layout>
      <Head>
        <title>Product Brands</title>
      </Head>

      <div>
        <Suspense fallback={<Loading />}>
          <Product_brandsList />
        </Suspense>
      </div>
    </Layout>

  );
};

export default Product_brandsPage;
