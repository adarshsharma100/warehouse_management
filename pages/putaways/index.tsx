import { Suspense, useEffect, useRef, useState } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import * as Yup from "yup";
import Layout from "layouts/Layout";
import getPutaways from "app/putaways/queries/getPutaways";
import Loading from "components/loading";
import { TabPanel, TabView } from "primereact/tabview";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import getPutaway_types from "app/putaway_types/queries/getPutaway_types";
import CreatePutaway from 'app/putaways/mutations/createPutaway';
import UpdatePutaway from 'app/putaways/mutations/updatePutaway';
import { InputText } from "primereact/inputtext";
import classNames from "classnames";
import { useFormik } from "formik";
import { tError, tsuccess } from "app/constants";
import { Dropdown } from "primereact/dropdown";
import { connect } from "http2";
import { Dialog } from "primereact/dialog";



const ITEMS_PER_PAGE = 100;
const randomPutawayNumber = `Putaway#${Math.floor(Math.random() * 100000)}`;

const initialPutaway = {
  putawayNumber: randomPutawayNumber,
  pendingQuantity: "",
  quantity: "",
  status: "",
  grnId: '',
  putawayTypeId: '',
  createdBy: "",
  user: [{}],
  grn: [{}],
}

export const PutawaysList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const toast = useRef(null)
  // const [{  hasMore }] = usePaginatedQuery(getPutaways, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  //   where: undefined
  // });

  const [{ putaways }] = useQuery(getPutaways, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })

  const [{ putaway_types }] = useQuery(getPutaway_types, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })
  console.log('putaway_types: ', putaway_types);

  const [putawayDetails, setPutawayDetails] = useState(initialPutaway)
  const [activeUpdatePutaways, setActiveUpdatePutaways] = useState(false)
  console.log('activeUpdatePutaways: ', activeUpdatePutaways);
  const [createPutaway] = useMutation(CreatePutaway)
  const [updatePutaway] = useMutation(UpdatePutaway)
  const [editPutaway, setEditPutaway] = useState(false)
  const [activePutawayData, setActivePutawayData] = useState({})

  const column = [
    { field: 'putawayNumber', header: 'Putaway Number' },
    { field: 'pendingQuantity', header: 'Pending Quantity' },
    { field: 'quantity', header: 'Quantity' },
    { field: 'status', header: 'Status' },
    { field: 'putawaytypeId', header: 'Putways Type' },
    { field: 'grnId', header: 'Grn ID' },
    { field: 'createdBy', header: 'Created By' },


  ]


  const [createDialog, setCreateDialog] = useState(false);
  const [selectedPutawayType, setSelectedPutawayType] = useState(null);
  console.log('selectedPutawayType: ', selectedPutawayType);

  const [selectedPutawayColumn, setSelectedPutawayColumn] = useState([])

  // const columnComponents = column.reduce((acc, curr) => {
  //   if (selectedPutawayColumn.includes(curr.field))
  //     return [
  //       ...acc,
  //       <Column
  //         key={curr.field}
  //         field={curr.field}
  //         header={curr.header}
  //         body={curr.body}
  //         filter
  //         filterPlaceholder="Search...."
  //       />
  //     ];
  //   return acc;
  // }, []);


  const columnComponents = column.reduce((acc, curr) => {
    if (selectedPutawayColumn.includes(curr.field)) {
      if (curr.field === 'putawaytypeId') {
        return [
          ...acc,
          <Column
            key={curr.field}
            field={curr.field}
            header={curr.header}
            body={(rowData) => {
              const selectedPutawayType = putaway_types.find((type) => type.id === rowData.putawaytypeId);
              return selectedPutawayType ? selectedPutawayType.name : '';
            }}
            filter
            filterPlaceholder="Search...."
          />
        ];
      } else {
        return [
          ...acc,
          <Column
            key={curr.field}
            field={curr.field}
            header={curr.header}
            body={curr.body}
            filter
            filterPlaceholder="Search...."
          />
        ];
      }
    }
    return acc;
  }, []);


  useEffect(() => {
    const defaultColumns = column.filter(col => !["creditPeriod"].includes(col.field)).map(col => col.field)
    setSelectedPutawayColumn(defaultColumns)
  }, [])

  const handleClick = () => {
    router.push(`/putaways/1`);
  };

  // Filter putaways based on status
  const pendingPutaways = putaways.filter((putaway) => putaway.status === "Pending");
  const allPutaways = putaways;

  // Formik 
  const formik = useFormik({
    initialValues: putawayDetails,
    validationSchema: Yup.object().shape({
      // putawayNumber: Yup.string().required("*Required"),
    }),
    onSubmit: async (data) => {
      console.log('onSubmit data: ', data);

      const { putawayNumber, pendingQuantity, quantity, status, grnId, createdBy, putawayTypeId, user, grn, } = data

      const { id: avtivePutawayID } = activePutawayData

      if (activeUpdatePutaways) {
        try {
          await updatePutaway({
            id: avtivePutawayID,
            putawayNumber,
            pendingQuantity: Number(pendingQuantity),
            quantity: Number(quantity),
            status,
            user: {
              connect: {
                id: Number(createdBy)
              }
            },
            grn: {
              connect: {
                id: Number(grnId)
              }
            },

          }, {
            onSuccess: () => {
              alert('Updated')
              toast?.current?.show(tError("updated", 'Putaway is now Updated'))

              // formik.resetForm()
              // setActiveUpdatePutaways(false)
            },
            onError: (error) => {
              console.log('update error: ', error);
              alert("update error")
              toast?.current?.show(tError("update error", 'Putaway is not Updated'))
            }
          })

        } catch (error) {

        }
      } else {
        try {
          await createPutaway({
            // putawayNumber: `Putaway#${Math.floor(Math.random() * 100000)}`,
            
            putawayNumber,
            pendingQuantity: Number(pendingQuantity),
            quantity: Number(quantity),
            status:'Pending',

            putaway_types: {
              connect: {
                id: selectedPutawayType.id
              }
            },
            user: {
              connect: {
                // id: Number(createdBy)
                id:9
              }
            },
            // grn: {
            //   connect: {
            //     // id: Number(grnId)
            //     // id:10
            //   }
            // },
            
          }, {
            onSuccess: async (data) => {
              console.log('data: onSuccess', data);
              alert("Created")
              toast?.current?.show(tsuccess("Created", `Putaway is now Created`))
              router.push(`/putaways/${data.id}`)
            },
            onError: (error) => {
              alert('Error')
              toast?.current?.show(tError("Error", `Putaway is not Created`))
              console.log('error: onError', error)
            }
          })
        } catch (error) {
          alert('err')
          toast?.current?.show(tError("Created", `Putaway is not Created`))
          console.log('error: catch', error)
        }
      }
    }
  })

  console.log('formik.errors', formik.errors)
  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  return (
    <div>
      <div className="col-12 card flex justify-content-between align-items-center m-0">
        <h2 className="mt-2">Putaway</h2>
        <Button
          icon="pi pi-plus"
          label="Create Putaway"
          onClick={() => {
            setCreateDialog(true)
            setEditPutaway(false)
          }}
        />
      </div>

      <form onSubmit={formik.handleSubmit} className="p-fluid">
        {/* Create Putaway form  */}

        {createDialog &&
          // <Dialog header="Create Putaway" visible={createDialog} style={{ width: '50vw', height: '40vh' }} onHide={() => setCreateDialog(false)}>
          <>
            <h3>Create Putaways</h3>

            <div className="field mt-4">
              <div className="p-float-label">
                <Dropdown
                  value={selectedPutawayType}
                  onChange={(e) => {
                    formik.setFieldValue("putawayTypeId", e.value);
                    setSelectedPutawayType(e.value);
                  }}
                  options={putaway_types} optionLabel="name"
                  placeholder="Select a Putaway type"
                  className="w-full" />
                <label
                  htmlFor="putaway_types"
                  className={classNames({ "p-error": isFormFieldValid("putaway_types") })}
                >

                  * Putaway Types
                </label>
              </div>
              {getFormErrorMessage("putaway_types")}

            </div>
            <div className="flex justify-content-end" style={{ marginTop: '10rem' }}>
              <Button
                type="submit"
                onClick={() => console.log('log')}
                className="mr-2"
                label="Create Putaway"
              />
            </div>
          </>
          // </Dialog>
        }

        {/* Update Putaways */}
        {activeUpdatePutaways &&
          <div className="col-12 card mt-4">
            <h3>{activeUpdatePutaways ? 'Update Putaways' : 'Create Putaways'}</h3>
            <div className="formgrid grid">

              {[
                { field: 'putawayNumber', header: 'Putaway Number' },
                { field: 'pendingQuantity', header: 'Pending Quantity' },
                { field: 'quantity', header: 'Quantity' },
                { field: 'status', header: 'Status' },
                { field: 'grnId', header: 'Grn ID' },
                { field: 'createdBy', header: 'Created By' },
              ].map((ele, i) => {
                return (
                  <div key={`${ele.header}`} className="field col-12 lg:col-2 md:col-6 mt-4">
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
                        htmlFor={ele.header}
                        className={classNames({ "p-error": isFormFieldValid(ele.field) })}
                      >
                        {ele.header}
                      </label>
                    </span>
                    {getFormErrorMessage(ele.field)}
                  </div>
                )
              })}

              <div className="field col-12 md:col-3 lg:col-2 mt-4">
                <div className="p-float-label">
                  <Dropdown
                    value={selectedPutawayType}
                    onChange={(e) => {
                      formik.setFieldValue("putawayTypeId", e.value);
                      setSelectedPutawayType(e.value);
                    }}

                    options={putaway_types} optionLabel="name"
                    placeholder="Select a Putaway type"
                    className="w-full" />
                  <label
                    htmlFor="putaway_types"
                    className={classNames({ "p-error": isFormFieldValid("putaway_types") })}
                  >

                    * Putaway Types
                  </label>
                </div>
                {getFormErrorMessage("putaway_types")}

              </div>

            </div>


            <div className="flex justify-content-end">
              <Button
                type="submit"
                className="mr-2"
                label={editPutaway ? "UPDATE" : "SUBMIT"}
              />
              <Button
                className="p-button-secondary flex-grow-0"
                style={{ maxWidth: "50%" }}
                type="button"
                label="CANCEL"
                onClick={() => {
                  formik.resetForm()
                  setCreateDialog(false)
                  setActiveUpdatePutaways(false)
                  // setActive(!active)
                  // setEditWarehouse(false)
                  // setUpdateWareHouse(false)
                }}
              />
            </div>
          </div>
        }

      </form>






      <div className="mt-2">
        {/* Filter putaways based on status  */}

        <TabView>
          <TabPanel header="All">
            <div className="col-12 card">
              <DataTable
                value={allPutaways}
                responsiveLayout="scroll"
                showGridlines
                stripedRows
                className="text-s datatable-responsive"
                onRowClick={async (e) => {
                  setActivePutawayData({ ...e.data })
                  console.log('onRow', e.data)
                  setActiveUpdatePutaways(true)
                  const selectedPutawayType = putaway_types.find((type) => type.id === e.data.putawaytypeId);
                  console.log('selectedPutawayType: ', selectedPutawayType.name);

                  await formik.setValues({
                    ...e.data,
                    putaway_types: selectedPutawayType ? { value: selectedPutawayType.name, label: selectedPutawayType.id }
                      : null,
                  })
                }}
              >
                {columnComponents}
              </DataTable>
            </div>
          </TabPanel>

          <TabPanel header="Pending">
            <div className="col-12 card">
              <DataTable
                value={pendingPutaways}
                responsiveLayout="scroll"
                showGridlines
                stripedRows
                className="text-s datatable-responsive"
              >
                {columnComponents}
                <Column field="putawayNumber" header="Putaway Number" />
              </DataTable>
            </div>
          </TabPanel>
        </TabView>



      </div>
    </div >
  );
};

const PutawaysPage = () => {
  return (
    <Layout>
      <Head>
        <title>Putaways</title>
      </Head>

      <div>
        <Suspense fallback={<Loading />}>
          <PutawaysList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default PutawaysPage;
