import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import getWarehouses from "app/warehouses/queries/getWarehouses";
import Layout from 'layouts/Layout'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import Loading from "components/loading";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import classNames from "classnames";
import { useFormik } from "formik";
import * as Yup from "yup"
import CreateWarehouse from 'app/warehouses/mutations/createWarehouse';
import UpdateWarehouse from 'app/warehouses/mutations/updateWarehouse';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const ITEMS_PER_PAGE = 100;
const initialWarehouse = {
  name: '',
  description: ''
}
const columns = [
  { field: "name", header: "Name" },
  { field: "description", header: "Description" },
]

export const WarehousesList = () => {
  const router = useRouter();
  const scrollToTop = useRef<HTMLDivElement>(null)
  const page = Number(router.query.page) || 0;
  // const [{ warehouses, hasMore }] = usePaginatedQuery(getWarehouses, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // });
  const [{ warehouses }, { refetch, }] = useQuery(getWarehouses, {
    orderBy: { id: "asc" },
    skip: undefined,
    where: undefined,
    take: undefined
  })
  console.log('warehouses: ', warehouses);
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });
  const [createWareHouse] = useMutation(CreateWarehouse)
  const [updateWarehouse] = useMutation(UpdateWarehouse)
  const [active, setActive] = useState(false)
  const [warehouse, setWareHouse] = useState(initialWarehouse)
  const [selectedColumns, setSelectedColumns] = useState(columns)
  const [activeWarehouse, setActiveWarehouse] = useState({})
  console.log('activeWarehouse: ', activeWarehouse);
  const [updateWareHouse, setUpdateWareHouse] = useState(false)
  const [editWarehouse, setEditWarehouse] = useState(false)

  const formik = useFormik({
    initialValues: warehouse,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required")
    }),
    onSubmit: async (data) => {
      console.log('data: ', data);
      const { name, description } = data
      const { id: activeWarehouseID } = activeWarehouse
      console.log(activeWarehouseID, 'activeWarehouseID')
      if (updateWareHouse) {
        try {
          await updateWarehouse({
            id: activeWarehouseID,
            name,
            description,
          }, {
            onSuccess: (data) => {
              alert("Updated!")
              console.log('data: ', data);
            },
            onError: (error) => {
              alert("not updated :(")
              console.log('error: ', error);
            }
          }
          )
        } catch (error) {
          console.log('error: ', error);
        }
      } else {
        try {
          await createWareHouse({
            name,
            description,
          }, {
            onSuccess: (data) => {
              alert("Created!")
              console.log('data: ', data);
            },
            onError: (error) => {
              alert('OnError')
              console.log('error: ', error);
            }
          }
          )
        } catch (error) {
          alert('err:')
          console.log('error: ', error);

        }
      }
    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }
  console.log("formik.values", formik.values)
  console.log("formik.errors", formik.errors)



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
  const handleRowClick = (e) => {
    const warehouseId = e.data.id;
    router.push(`/warehouses/${warehouseId}`);
  };

  return (
    <div>
      <Head>
        <title>Warehouses</title>
      </Head>


      <div className='card'>
        <h2 className='mb-0'>Warehouse</h2>
      </div>

      <form className="p-fluid" onSubmit={formik.handleSubmit}>
        {active &&
          <div className="card">
            {editWarehouse ? <h2>Update Warehouse</h2> : <h2>Create Warehouse</h2>}

            <div className="formgrid grid">
              {[
                { type: 'text', label: 'Name', field: 'name' },
                { type: 'text', label: 'Description', field: 'description' },
              ].map((ele, i) => {
                return (
                  <div key={i} className='field col-12 md:col-3 lg:col-2 mt-4'>
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
              })
              }

            </div>

            <div className="flex justify-content-end">

              <Button
                type="submit"
                className="mr-2"
                label={editWarehouse ? "UPDATE" : "SUBMIT"}
              />
              <Button
                className="p-button-secondary flex-grow-0"
                style={{ maxWidth: "50%" }}
                type="button"
                label="CANCEL"
                onClick={() => {
                  formik.resetForm()
                  setActive(!active)
                  setEditWarehouse(false)
                  setUpdateWareHouse(false)
                }}
              />

            </div>
          </div>}
      </form>

      <div className="flex justify-content-end">
        <Button

          onClick={() => {
            formik.resetForm();
            setActive(!active);
            setUpdateWareHouse(false);
            setEditWarehouse(false)
          }}
          icon='pi pi-plus'
          label="Add Warehouse"
        >

        </Button>
      </div>
      <div className="col-12 card">
        <DataTable
          value={warehouses}
          showGridlines
          stripedRows
          className="text-s datatable-responsive"
          responsiveLayout="scroll"
          filterDisplay="menu"
          onRowClick={handleRowClick}
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
                      setActiveWarehouse({ ...rowData })
                      setActive(true)
                      setEditWarehouse(true)
                      setUpdateWareHouse(true)
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
}


const Warehouses = () => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Layout>
          <WarehousesList />
        </Layout>
      </Suspense>
    </div>
  )
}

export default Warehouses







