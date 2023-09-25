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
import { initialFilterRules, tsuccess } from "app/constants";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";

const ITEMS_PER_PAGE = 100;
const initialWarehouse = {
  name: '',
  description: ''
}
const columns = [
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
  const [{ warehouses }, { refetch: refetchWarehouses, }] = useQuery(getWarehouses, {
    orderBy: { id: "desc" },
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
  const [selectedColumns] = useState(columns)
  const [activeWarehouse, setActiveWarehouse] = useState({})
  console.log('activeWarehouse: ', activeWarehouse);
  const [updateWareHouse, setUpdateWareHouse] = useState(false)
  const [editWarehouse, setEditWarehouse] = useState(false)
  const toast = useRef(null)

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
            onSuccess: async (data) => {
              toast?.current.show(tsuccess("Updated", `Warehouse is now updated`))
              setActive(!active)
              await refetchWarehouses()

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
            onSuccess: async (data) => {
              toast?.current.show(tsuccess("Created", `Warehouse is now Created`))
              setActive(!active)
              await refetchWarehouses();
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




  const dt = useRef(null);
  const exportColumns = columns.map((col) => ({ title: col.header, dataKey: col.field }));

  // const exportExcel = () => {
  //   import('xlsx').then((xlsx) => {
  //     const worksheet = xlsx.utils.json_to_sheet(warehouses);
  //     const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  //     const excelBuffer = xlsx.write(workbook, {
  //       bookType: 'xlsx',
  //       type: 'array'
  //     });

  //     saveAsExcelFile(excelBuffer, 'products');
  //   });
  // };


  {/* Remove key which not have data */}
  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const filteredWarehouses = warehouses.map((warehouse) => {
        const filteredWarehouse = { ...warehouse };
        delete filteredWarehouse.areas_areas_warehouseTowarehouse;
        if (filteredWarehouse.addressesId === null) {
          delete filteredWarehouse.addressesId;
        }
        return filteredWarehouse;
      });
  
      const worksheet = xlsx.utils.json_to_sheet(filteredWarehouses);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
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



  const initialColumnFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: initialFilterRules.andContains,
    description: initialFilterRules.andContains,
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
  const warehouseTableHeader = renderHeader()


  return (
    <div>
      <Head>
        <title>Warehouses</title>
      </Head>


      <div className='card flex justify-content-between align-content-center'>
        <Toast ref={toast} />
        <h2 className='m-0'>Warehouse</h2>
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

      <form className="p-fluid" onSubmit={formik.handleSubmit}>
        {active &&
          <div className="card">
            {editWarehouse ? <h2>Update Warehouse - {formik.values.name}</h2> : <h2>Create Warehouse</h2>}

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


      <div className="col-12 card mt-3">
        <DataTable
          value={warehouses}
          showGridlines
          stripedRows
          className="text-s datatable-responsive"
          responsiveLayout="scroll"
          // filterDisplay="menu"
          filters={filters}
          header={warehouseTableHeader}
          onRowClick={async (e) => {
            setActiveWarehouse({ ...e.data })
            setActive(true)
            setEditWarehouse(true)
            setUpdateWareHouse(true)
            await formik.setValues({
              ...e.data
            })
          }}
        >
          <Column
            header='Name'
            field="name"
            filter
            filterPlaceholder="Search by Name"
            body={(rowData) => (
              <Link href={`/warehouses/${rowData.id}`}>
                <a>{rowData.name}</a>
              </Link>
            )}
          />
          {columnComponents}

          {/* <Column
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
          /> */}
        </DataTable>
      </div>

    </div>

  );
}


const Warehouses = () => {
  return (
    <Layout>
      <Head>
        <title>Product Categories</title>
      </Head>
      <div>
        <Suspense fallback={<Loading />}>
          <WarehousesList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default Warehouses







