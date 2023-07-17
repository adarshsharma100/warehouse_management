import { Suspense, useState, useReducer, useRef } from "react";
import Head from "next/head";
import Layout from 'layouts/Layout'
import Loading from "components/loading";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useFormik } from "formik";
import * as Yup from "yup"
import { classNames } from "primereact/utils";
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import CreateProduct_category from 'app/product_categories/mutations/createProduct_category';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import getProduct_categories from "app/product_categories/queries/getProduct_categories";
import UpdateProduct_category from 'app/product_categories/mutations/updateProduct_category'
import { Paginator } from "primereact/paginator";
import { FilterMatchMode } from "primereact/api";
import { initialFilterRules } from "app/constants";

const initialproductCategories = {
  name: '',
  code: ''
}
const columns = [
  { field: "id", header: "ID" },
  { field: "name", header: "Name" },
  { field: "code", header: "Code" },
]

const initialState = {
  tableRowsCount: 10,
  skipCount: 0,

};

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


export const Product_categoriesList = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { tableRowsCount, skipCount } = state
  const [{ product_categories, count: total_product_categories }] = usePaginatedQuery(getProduct_categories, {
    orderBy: { id: "asc" },
    skip: skipCount,
    where: {},
    take: tableRowsCount
  })
  const [productCategories] = useState(initialproductCategories)
  console.log('productCategories: ', productCategories);
  const [createMutations] = useMutation(CreateProduct_category);
  const [updateMutations] = useMutation(UpdateProduct_category)
  const [selectedColumns] = useState(columns);
  const [activeProductCategories, setActiveProductCategories] = useState({})
  const [productCategoriesDiolog, setProductCategoriesDiolog] = useState(false);
  const [checkUpdate, setCheckUpdate] = useState(false)

  const formik = useFormik({
    initialValues: productCategories,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required")
    }),
    onSubmit: async (data) => {

      const { name, code } = data
      const { id: rowId } = activeProductCategories

      if (checkUpdate) {
        try {
          await updateMutations({
            id: rowId,
            name,
            code
          }, {
            onSuccess: (data) => {

              alert("Updated")
            },
            onError: (error) => {
              alert('Updated Error')
            }
          }
          )
        } catch (error) {

        }

      } else {
        try {
          await createMutations({
            name,
            code,
          }, {
            onSuccess: (data) => {

              alert('created!')
            },
            onError: (error) => {

              alert('OnError')
            }
          }
          )
        } catch (error) {

        }
      }
      setProductCategoriesDiolog(false)
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
      const worksheet = xlsx.utils.json_to_sheet(product_categories);
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


  const pagination = () => <Paginator first={skipCount} rows={tableRowsCount} totalRecords={total_product_categories} rowsPerPageOptions={[10, 20, 30]} onPageChange={handlePageChange} />




  const initialColumnFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: initialFilterRules.andContains,
    code: initialFilterRules.andContains,
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
  const productsCategoriesTableHeader = renderHeader()

  return (
    <div>
      <Head>
        <title>ProductCategories</title>
      </Head>

      <div className='card flex justify-content-between'>
        <h2 className='mb-0'>ProductCategories</h2>
        <Button
          icon='pi pi-plus'
          label="Add Product Category"
          onClick={() => {
            formik.resetForm()
            setCheckUpdate(false)
            setProductCategoriesDiolog(!productCategoriesDiolog)
          }}
        />
      </div>

      <form className="p-fluid" onSubmit={formik.handleSubmit}>
        {productCategoriesDiolog &&
          <div className="card">
            {checkUpdate ? <h3>Update ProductCategories - {formik.values.name}</h3> : <h3>Create ProductCategories</h3>}
            <div className="formgrid grid">
              {[
                { type: 'text', label: 'Name', field: 'name' },
                { type: 'text', label: 'Code', field: 'code' },
              ].map((ele, i) => {
                return (
                  <div key={ele.field} className='field col-12 md:col-3 lg:col-2 mt-4'>
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
                label={checkUpdate ? "UPDATE" : "SUBMIT"}
              />
              <Button
                className="p-button-secondary flex-grow-0"
                style={{ maxWidth: "50%" }}
                type="button"
                label="CANCEL"
                onClick={() => {
                  formik.resetForm()
                  setProductCategoriesDiolog(false)
                  setCheckUpdate(false)

                }}
              />

            </div>


          </div>
        }
      </form>

      <div className="col-12 card mt-4">
        <DataTable
          value={product_categories}
          showGridlines
          stripedRows
          className="text-s datatable-responsive"
          responsiveLayout="scroll"
          filterDisplay="menu"
          filters={filters}
          header={productsCategoriesTableHeader}
          scrollable
          scrollHeight="400px"
          footer={pagination}
          onRowClick={async (e) => {
            setActiveProductCategories({ ...e.data })
            setProductCategoriesDiolog(true)
            setCheckUpdate(true)
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
                      setActiveProductCategories({ ...rowData })
                      setProductCategoriesDiolog(true)
                      setCheckUpdate(true)
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



const Product_categoriesPage = () => {
  return (
    <Layout>
      <Head>
        <title>Product Categories</title>
      </Head>
      <div>
        <Suspense fallback={<Loading />}>
          <Product_categoriesList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default Product_categoriesPage;


