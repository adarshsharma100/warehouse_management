import { Suspense, useState, useRef, useEffect } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router"; useRef
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";
import Layout from 'layouts/Layout'
import getWarehouse from "app/warehouses/queries/getWarehouse";
import { Button } from "primereact/button";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { useFormik } from "formik";
import * as Yup from "yup"
import CreateArea from 'app/areas/mutations/createArea';
import UpdateArea from 'app/areas/mutations/updateArea';
import getAreas from "app/areas/queries/getAreas";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { tsuccess } from "app/constants";

// import deleteWarehouse from "src/warehouses/mutations/deleteWarehouse";


const initialAreas = {
  name: '',
  description: ''
}
const columns = [
  { field: "name", header: "Name" },
  { field: "description", header: "Description" },
]

export const Warehouse = () => {
  const router = useRouter();
  const warehouseId = useParam("warehouseId", "number");
  const [warehouse, { refetch: refetchWarehouse }] = useQuery(getWarehouse, { id: warehouseId, orderBy: "desc" });
  const [areas, setAreas] = useState(warehouse?.areas_areas_warehouseTowarehouse)
  const [active, setActive] = useState(false)
  const [areasData, setAreasData] = useState(initialAreas)
  const [createArea] = useMutation(CreateArea)
  const [updateAreass] = useMutation(UpdateArea)
  const [selectedColumns, setSelectedColumns] = useState(columns)
  const [editAreas, setEditAreas] = useState(false)
  const [updateAreas, setUpdateAreas] = useState(false)
  const [activeAreas, setActiveAreas] = useState({})

  const toast = useRef(null)

  const formik = useFormik({
    initialValues: areasData,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required")
    }),
    onSubmit: async (data) => {
      console.log('data: ', data);
      const { name, description } = data
      const { id: activeAreasID } = activeAreas
      if (updateAreas) {
        try {
          await updateAreass({
            id: activeAreasID,
            name,
            description,
          }, {
            onSuccess: async (data) => {
              await refetchWarehouse()
              toast?.current.show(tsuccess("Updated", `Area is  updated `))
              setActive(!active)

            },
            onError: (error) => {
              alert("Not updated :(")
              console.log('error: ', error);
            }
          })
        } catch (error) {
          console.log('error: ', error);
        }
      } else {
        try {
          await createArea({
            name,
            warehouse: warehouse.id,
            description,
          }, {
            onSuccess: async (data) => {
              alert('Created!')
              toast?.current.show(tsuccess("Created", `Area is  Created `))
              setActive(!active)
              await refetchWarehouse()
              console.log('data: ', data);
            },
            onError: (error) => {

              console.log('error: ', error);
            }
          }
          )
        } catch (error) {
          alert('err')
          console.log('error: ', error);
        }
      }
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

  const handleRowClick = (e) => {
    const areasId = e.data.id;
    router.push(`/areas/${areasId}`);
  };


  useEffect(() => {
    setAreas(warehouse?.areas_areas_warehouseTowarehouse)
  }, [warehouse])


  return (
    <div>
      <Head>
        <title>{warehouse.name}</title>
      </Head>
      <div className='card flex justify-content-between align-content-center'>
        <Toast ref={toast} />
        <h2 className='m-0'>{warehouse?.name}</h2>
        <Button
          onClick={() => {
            formik.resetForm();
            setEditAreas(false);
            setUpdateAreas(false);
            setActive(!active)
          }}
          icon='pi pi-plus'
          label="Add Areas">
        </Button>

      </div>

      <form className="p-fluid" onSubmit={formik.handleSubmit}>
        {active &&
          <div className="card ">
            {editAreas ? <h2>Update Areas</h2> : <h2>Create Areas</h2>}
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
                // label="SUBMIT"
                label={editAreas ? "UPDATE" : "SUBMIT"}
              />
              <Button
                className="p-button-secondary flex-grow-0"
                style={{ maxWidth: "50%" }}
                type="button"
                label="CANCEL"
                onClick={() => {
                  formik.resetForm()
                  setActive(!active);
                  setUpdateAreas(false);
                  setEditAreas(false);
                }}
              />

            </div>
          </div>

        }


      </form>

      <div className="flex justify-content-end">

      </div>

      <div className="col-12 card mt-5">
        <h3>Areas</h3>
        <DataTable
          value={areas}
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
                      setActiveAreas({ ...rowData })
                      setActive(true)
                      setEditAreas(true)
                      setUpdateAreas(true)
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

const ShowWarehousePage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Warehouse />
      </Suspense>
    </div>
  );
};

ShowWarehousePage.authenticate = true;
ShowWarehousePage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowWarehousePage;
