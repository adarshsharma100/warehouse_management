import { Suspense, useEffect, useState } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

// import Layout from "src/core/layouts/Layout";
import Layout from "layouts/Layout";
import getPutaway from "app/putaways/queries/getPutaway";
import deletePutaway from "app/putaways/mutations/deletePutaway";
import Loading from "components/loading";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Checkbox } from "primereact/checkbox";
import getPutaway_types from "app/putaway_types/queries/getPutaway_types";
import { AutoComplete } from "primereact/autocomplete";
import getGrns from "app/grns/queries/getGrns";
import getPurchase_order from "app/purchase_orders/queries/getPurchase_order";
import getPurchase_orders from "app/purchase_orders/queries/getPurchase_orders";
import getGrn_statuses from "app/grn_statuses/queries/getGrn_statuses";
import { set } from "zod";
import getCurrentUser from "app/users/queries/getCurrentUser";
import { useFormik } from "formik";
import CreatePutaway from 'app/putaways/mutations/createPutaway';
import UpdatePutaway from 'app/putaways/mutations/updatePutaway';
import { Dropdown } from "primereact/dropdown";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import getPutaways from "app/putaways/queries/getPutaways";
import { log } from "console";

const putawayData = [
  {
    'S No.': '123',
    'Name': 'putawayData',
    'UniwareSKU': 'sku',
    'Quantity': '123',
    'ShelfCode': '00982',
    'BatchCode': 'awq1123',
    "InventoryCode": '1009123',
  },
  {
    'S No.': '123',
    'Name': 'putawayData',
    'UniwareSKU': 'sku',
    'Quantity': '123',
    'ShelfCode': '00982',
    'BatchCode': 'awq1123',
    "InventoryCode": '1009123',
  },
]



export const Putaway = () => {

  const putawayId = useParam("putawayId", "number");
  console.log('putawayId: ', putawayId);
  const [putaway] = useQuery(getPutaway, { id: putawayId });
  console.log('putaway: +++', putaway);

  const [{ putaway_types }] = useQuery(getPutaway_types, {
    where: undefined,
    orderBy: undefined,
    take: undefined,
    skip: undefined
  })

  const [{ grn_statuses },] = useQuery(getGrn_statuses, {
    orderBy: { id: "asc" },
  })

  // const [{users}] = useQuery(getCurrentUser, {})
  // console.log('user: ', users);

  console.log('grn_statuses: ', grn_statuses);

  const [{ grns }] = useQuery(getGrns, {});
  console.log('grns: ', grns);

  const initialPutawayDetails = {
    id: putawayId,
    quantity: "",
    status: "",
    grnId: '',
    putawayTypeId: '',
    createdBy: "",
    user: [{}],
    grn: [{}],
  }

  const putawayDetails = {
    putawayNumber: `Putaway#${Math.floor(Math.random() * 100000)}`,
    pendingQuantity: "",
    quantity: "",
    status: "",
    grnId: '',
    putawayTypeId: '',
    createdBy: "",
    user: [{}],
    grn: [{}],
  }
  const [createPutaway] = useMutation(CreatePutaway)
  const [updatePutaway] = useMutation(UpdatePutaway)
  const [activeUpdatePutaways, setActiveUpdatePutaways] = useState(false)
  const [selectedPutawayType, setSelectedPutawayType] = useState(null);
  const [activePutawayData, setActivePutawayData] = useState({})
  console.log('activePutawayData: ', activePutawayData);

  const formik = useFormik({
    initialValues: putawayDetails,
    onSubmit: async (data) => {
      console.log('data: ', data);
      const { putawayNumber, pendingQuantity, quantity, status, grnId, createdBy, putawayTypeId, user, grn, } = data

      if (activeUpdatePutaways) {
        try {
          await updatePutaway({
            id: putawayId,
            status: 'Completed',

            putaway_products: {
              update: putawayItemDetails?.map(({id, quantity }) => ({
                id,
                data: {
                  quantity: 23,
                },
              })),
            },

            // quantity: putawayItemDetails?.map(({quantity}) => { Number(quantity)})

            // quantity: Number(quantity),
            // grn: {
            //   connect: {
            //     // id: Number(grnId)
            //     id: selectedGRN?.id
            //   }
            // },
          }, {
            onSuccess: (data) => {
              alert("Update")
            },
            onError: (error) => {
              console.log('error: ', error);
              alert('Error update')
            }
          })
        } catch (error) {
          console.log('error: ', error);
          alert('Update Error')
        }
      }
      else {
        console.log('error', 'Comming in else')
      }

    }
  })

  console.log('formik.errors', formik.errors)
  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  const [putawayItemDetails] = useState([initialPutawayDetails])
  console.log('putawayItemDetails: ', putawayItemDetails);


  const onCellEditComplete = (e) => {
    const { rowData, newValue, field, originalEvent: event } = e;
    console.log('rowData:! ', rowData);
    console.log('newValue: ', typeof newValue, rowData, field);
    if (['quantity'].includes(field)) {
      if (newValue?.trim().length > 0) {
        if (field === 'quantity') {
          const intValue = parseInt(newValue, 10);
          rowData[field] = intValue
        } else {
          rowData[field] = newValue
        }

        const updatedPutawayProducts = putaway.putaway_products.map((product) => {
          console.log('here:@ ', product.id, rowData.id);
          if (product.id === rowData.id) {
            return { ...product, quantity: rowData[field] };
          }

          return product;
        });
        console.log('updatedPutawayProducts: ', updatedPutawayProducts);

        // const updatedPutaway = { ...putaway, putaway_products: updatedPutawayProducts };

        // const updatePutawayItems = putawayItemDetails.map((item) => {
        //   console.log('item:@@ ', item.id, rowData.id);

        //   if (item.id === rowData.id) {
        //     return { ...item, [field]: rowData[field] };
        //   }
        //   return item;
        // })
        // console.log('updatedPutaway: ', updatePutawayItems);

        formik.setValues({
          ...formik.values,
          // putawayItemDetails: updatePutawayItems
        });
      } else {
        event.preventDefault();
      }

    }
  };







  const textEditor = (options) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}

      />
    );
  };


  const grnColumns = [
    // { field: "qcComplete", header: "QC Complete", body: (rowData) => rowData.qcComplete === 1 ? 'True' : 'False' },
    // { field: "receivedQuantity", header: "Received Quantity" },
    // { field: "qcRejectedQuantity", header: "QC Rejected Quantity" },
    { field: "quantity", header: "Quantity", body: (rowData) => rowData.quantity || "-" },
    { field: "shelfCode", header: "Shelf Code" },
    { field: "inventoryType", header: "Inventory Type" },
  ]

  const [selectedColumns] = useState(grnColumns)

  const columnsComponents = selectedColumns?.map((key) => (
    <Column
      key={key.field}
      field={key.field}
      header={key.header}
      body={key.body}
      filter
      filterPlaceholder="Search...."
    />
  ));


  const findPutawayTypeNameById = (putawayTypeId, putawayTypes) => {
    const putawayType = putawayTypes.find((type) => type.id === putawayTypeId);
    return putawayType ? putawayType.displayName : 'Unknown Putaway Type';
  };


  const formatCreatedAt = (createdAt) => {
    const dateObject = new Date(createdAt);
    return dateObject.toLocaleString();
  }


  // GRN dropdown 

  const [grnValue, setGrnValue] = useState([])
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [filteredPutawayData, setFilteredPutawayData] = useState([]);
  const [selectGrn, setSelectGrn] = useState({})
  console.log('selectGrn: ', selectGrn);

  console.log('filteredPutawayData: ', filteredPutawayData);
  console.log('selectedGRN: ', selectedGRN);

  const grnSearch = () => {
    setGrnValue(grns?.map((val) => val.grnNumber))
  }

  const handelGrnChange = (e) => {
    const selectGrn = grns.find((val) => val.grnNumber === e.value)
    setSelectGrn(selectGrn)
    setSelectedGRN(selectGrn);
  }


  useEffect(() => {
    if (selectedGRN) {
      setFilteredPutawayData([selectedGRN]);
    } else {
      setFilteredPutawayData([]);
    }
  }, [selectedGRN]);

  // Status 5 means qcCompleted
  const [selectGrnProducts, setSelectGrnProducts] = useState([])
  console.log('selectGrnProducts: ', selectGrnProducts);

  const handleSelectionChange = (e) => {
    console.log('e:++ ', e);
    if (e && Array.isArray(e)) {
      console.log('is it here !!')
      const filteredSelection = e.filter((row) => row.qcComplete === 1);
      setSelectGrnProducts(filteredSelection);
    } else {
      setSelectGrnProducts([]);
      console.log('is it here in else!!')
    }
  };



  const [pendingData, setPendingData] = useState([]);
  const [completeData, setCompleteData] = useState([])
  console.log('pendingData: ', pendingData);

  const handleAddToPutaway = () => {
    if (selectGrnProducts.length > 0) {
      const allQcCompleted = selectGrnProducts.every((product) => product.qcComplete === 1);
      if (allQcCompleted) {

        setPendingData((prevPendingData) => [...prevPendingData, ...selectGrnProducts]);
        setSelectGrnProducts([]);
        setFilteredPutawayData([]);
        setSelectGrn({})
      } else {
        alert('not QC_Completed ')
      }
    } else {
      alert('QC_Completed--')
    }
  };

  // const handleAddToPutaway = () => {
  //   if (selectGrnProducts.length > 0) {
  //     const allQcCompleted = selectGrnProducts.every((product) => product.qcComplete === 1);
  //     if (allQcCompleted) {
  //       const completedItems = selectGrnProducts.filter(item => item.status === "Completed");
  //       const pendingItems = selectGrnProducts.filter(item => item.status !== "Completed");

  //       setPendingData(prevPendingData => [...prevPendingData, ...pendingItems]);
  //       setCompleteData(prevPutawayData => [...prevPutawayData, ...completedItems]);

  //       setSelectGrnProducts([]);
  //       setFilteredPutawayData([]);
  //       setSelectGrn({});
  //     } else {
  //       alert('Not QC Completed');
  //     }
  //   } else {
  //     alert('QC Completed');
  //   }
  // };


  const getStatusName = (statusId) => {
    const status = grn_statuses.find((s) => s.id === statusId);
    return status ? status.name : '-';
  };



  //  Editable Datatable 

  const [update, setUpdate] = useState(false)
  const putawayArray = Object.entries(putaway).map(([key, value]) => ({ key, value }));
  console.log('putawayArray: ', putawayArray);

  return (
    <div>
      <Head>
        {/* <title>Putaway {putaway.id}</title> */}
      </Head>

      <div className="col-12 card flex justify-content-between align-items-center m-0">
        {/* <h2 className="mt-2">Putaway / PT0035</h2> */}
        <h2 className="mt-2">{putaway.putawayNumber}</h2>


      </div>


      <div className="flex gap-3 card mt-3">
        <div className="left" style={{ width: '83%' }}>
          <div className="mt-2">
            <div className="flex justify-content-end">
              <form onSubmit={formik.handleSubmit}>
                <Button
                  label="Click here!"
                  type="submit"
                  // onClick={() => { setUpdate(true); setActiveUpdatePutaways(true) }}
                />
              </form>
            </div>

            {/* <div className="col-12">
              {update &&
                <form onSubmit={formik.handleSubmit}>

                  <div className="col-12 card mt-4">
                    <h3>{activeUpdatePutaways ? 'Update Putaways' : 'Create Putaways'}</h3>
                    <div className="formgrid grid">

                      {[
                        { field: 'quantity', header: 'Quantity' },
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



                    </div>


                    <div className="flex justify-content-end">
                      <Button
                        type="submit"
                        className="mr-2"
                        label="UPDATE"
                      />
                      <Button
                        className="p-button-secondary flex-grow-0"
                        style={{ maxWidth: "50%" }}
                        type="button"
                        label="CANCEL"
                        onClick={() => {
                          formik.resetForm()
                          // setCreateDialog(false)
                          setActiveUpdatePutaways(false)
                          // setActive(!active)
                          // setEditWarehouse(false)
                          // setUpdateWareHouse(false)
                        }}
                      />
                    </div>
                  </div>


                </form>
              }
            </div> */}



            <TabView>
              <TabPanel header="Pending">
                <DataTable
                  value={pendingData}
                  responsiveLayout="scroll"
                  showGridlines
                  stripedRows
                  editMode="cell"
                  className="text-s datatable-responsive"
                  onRowClick={async (e) => {
                    console.log('onRow', e.data)
                    setActivePutawayData({ ...e.data })
                    setActiveUpdatePutaways(true)
                    const selectedPutawayType = putaway_types.find((type) => type.id === e.data.putawaytypeId);
                    await formik.setValues({
                      ...e.data,
                      putaway_types: selectedPutawayType ? { value: selectedPutawayType.name, label: selectedPutawayType.id }
                        : null,
                    })
                  }}
                >

                  <Column
                    header='Sl No'
                    body={(ele, { rowIndex }) => (
                      <div key={rowIndex} className=" ">
                        <span className="bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center ">{rowIndex + 1}</span>
                      </div>

                    )}
                  />
                  <Column field="po_products.vendor_products.products.name" header="Name" />
                  <Column field="po_products.vendor_products.products.sku" header="SKU" />
                  {/* {columnsComponents} */}
                  {grnColumns.map((i) => {
                    return (
                      <Column
                        key={i.field}
                        field={i.field}
                        header={i.header}
                        // body={i.body}
                        editor={i.field === 'quantity' ? textEditor : null}
                        onCellEditComplete={i.field === 'quantity' ? onCellEditComplete : null}
                      />
                    )
                  })}

                </DataTable>
              </TabPanel>

              <TabPanel header="Completed">
                <DataTable
                  // value={completeData}
                  value={pendingData}
                  responsiveLayout="scroll"
                  showGridlines
                  stripedRows
                  className="text-s datatable-responsive"
                >
                  <Column
                    header='Sl No'
                    // className="reduce-column"
                    body={(ele, { rowIndex }) => (
                      <div key={rowIndex} className=" ">
                        <span className="bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center ">{rowIndex + 1}</span>
                      </div>

                    )}
                  />
                  <Column field="po_products.vendor_products.products.name" header="Name" />
                  <Column field="po_products.vendor_products.products.sku" header="SKU" />
                  {columnsComponents}

                </DataTable>
              </TabPanel>

            </TabView>
          </div>

          <div className="card" style={{ marginTop: '4rem' }}>
            <div className="flex justify-content-between">
              <h3>Putaway Summary</h3>
              {/* <Button icon='pi pi-minus' /> */}
            </div>

            <div className="flex gap-3">
              <div className="left mt-3" style={{ width: '82%' }}>

                <DataTable
                  value={filteredPutawayData.length > 0 ? filteredPutawayData[0]?.grn_products || [] : []}
                  responsiveLayout="scroll"
                  showGridlines
                  stripedRows
                  className="text-s datatable-responsive"
                  selectionMode='multiple'
                  selection={selectGrnProducts}
                  onSelectionChange={(e) => handleSelectionChange(e.value)}

                >
                  <Column
                    selectionMode="multiple"
                    headerStyle={{ width: '3rem' }}
                  />
                  <Column
                    header='Sl No'
                    // className="reduce-column"
                    body={(ele, { rowIndex }) => (
                      <div key={rowIndex} className=" ">
                        <span className="bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center ">{rowIndex + 1}</span>
                      </div>

                    )}
                  />
                  <Column field="po_products.vendor_products.products.name" header="Name" />
                  <Column field="po_products.vendor_products.products.sku" header="SKU" />
                  {columnsComponents}

                </DataTable>
              </div>
              <div className="right mt-3 p-2" style={{ width: '18%', border: 'solid 2px' }}>
                <div className="flex justify-content-between">
                  <div>
                    <p>Grn Number</p>
                    <p>PO Number </p>
                    <p>GRN Status</p>
                  </div>
                  <div>
                    <p>{filteredPutawayData.map((ele) => ele.grnNumber)}</p>
                    <p> x{filteredPutawayData.map((ele) => ele.purchaseOrder)}</p>
                    <p>{getStatusName(filteredPutawayData[0]?.status)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <span className="p-float-label">
                <AutoComplete
                  value={selectGrn ? selectGrn.grnNumber : ''}
                  suggestions={grnValue}
                  completeMethod={grnSearch}
                  onChange={handelGrnChange}
                  dropdown
                />
                <label>
                  Select GRN
                </label>
              </span>
            </div>


            <div className="flex align-items-center justify-content-end gap-4">
              <div>Cancle</div>
              <div>
                <Button
                  label="Add to Putaway"
                  onClick={handleAddToPutaway}
                />
              </div>
            </div>
          </div>


        </div>
        <div className="right mt-2 " style={{ width: '18%', border: 'solid 2px' }}>
          <div className="p-2">
            <h4 className="font-bold">General Informatiton</h4>
            <div className="flex justify-content-between">
              <div>
                <p>PutawayNumber  </p>
                <p>PutawayType </p>
                <p>Status  </p>
                <p>Generated By</p>
                <p>Created At</p>
              </div>
              <div>
                <p>{putaway.putawayNumber}</p>
                <p>{findPutawayTypeNameById(putaway.putawaytypeId, putaway_types)}</p>
                <p>{putaway.status}</p>
                <p>{putaway.createdBy}</p>
                <p>{formatCreatedAt(putaway.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

      </div>



    </div >
  );
};

const ShowPutawayPage = () => {
  return (
    <div>
      <p>
        <title>Putaway Id</title>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Putaway />
      </Suspense>
    </div>

  );
};

ShowPutawayPage.authenticate = true;
ShowPutawayPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowPutawayPage;
