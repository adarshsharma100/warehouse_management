import { Suspense, useState } from "react";
import Head from "next/head";
import Layout from 'layouts/Layout'
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
const initialproductCategories = {
  name: '',
  code: ''
}
const columns = [
  { field: "id", header: "ID" },
  { field: "name", header: "Name" },
  { field: "code", header: "Code" },
]


export const Product_categoriesList = () => {
  const [{ product_categories }] = useQuery(getProduct_categories, {
    orderBy: { id: "asc" },
    skip: undefined,
    where: undefined,
    take: undefined
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

  return (
    <div>
      <Head>
        <title>ProductCategories</title>
      </Head>

      <div className='card'>
        <h2 className='mb-0'>ProductCategories</h2>
      </div>

      <form className="p-fluid" onSubmit={formik.handleSubmit}>
        {productCategoriesDiolog &&
          <div className="card">
            {checkUpdate ? <h3>Update ProductCategories</h3> : <h3>Create ProductCategories</h3>}
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

      <div className="flex justify-content-end ">
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

      <div className="col-12 card mt-4">
        <DataTable
          value={product_categories}
          showGridlines
          stripedRows
          className="text-s datatable-responsive"
          responsiveLayout="scroll"
          filterDisplay="menu"
        >
          {columnComponents}
          <Column
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
          />
        </DataTable>
      </div>



    </div>
  );
};



const Product_categoriesPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Layout>
          <Product_categoriesList />
        </Layout>
      </Suspense>

    </div>
  );
};

export default Product_categoriesPage;


