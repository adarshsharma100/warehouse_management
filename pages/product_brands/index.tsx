import { Suspense, useState } from "react";
import Head from "next/head";
import { useMutation, useQuery } from "@blitzjs/rpc";
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
const initialproductBrand = {
  name: '',
}
const columns = [
  { field: "id", header: "ID" },
  { field: "name", header: "Name" },
]
export const Product_brandsList = () => {
  const [{ product_brands }] = useQuery(getProduct_brands, {
    orderBy: { id: "asc" },
    skip: undefined,
    where: undefined,
    take: undefined
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
        <title>ProductBrands</title>
      </Head>

      <div className='card'>
        <h2 className='mb-0'>Product Brands</h2>
      </div>

      <form className="p-fluid" onSubmit={formik.handleSubmit}>
        {productBrandDiolog &&
          <div className="card">
            {updateBrand ? <h3>Update Product Brand</h3> : <h3>Create Product Brand</h3>}
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

      <div className="flex justify-content-end ">
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

      <div className="col-12 card mt-4">
        <DataTable
          value={product_brands}
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
          />
        </DataTable>

      </div>

    </div>
  );
};

const Product_brandsPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Layout>
          <Product_brandsList />
        </Layout>
      </Suspense>
    </div>


  );
};

export default Product_brandsPage;
