import { Suspense, useEffect, useRef, useState } from "react";
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
import { createSearchFunction, tError, tWarn, tsuccess } from "app/constants";
import { Toast } from "primereact/toast";
import { useCurrentUser } from "app/core/hooks/useCurrentUser";
import { OverlayPanel } from "primereact/overlaypanel";

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
  const toast = useRef(null)
  const user = useCurrentUser()
  const { id, role, name, email } = user
  console.log('user:@ ', user.id);


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
              create: pendingData?.map(({ id, quantity }) => ({
                quantity: Number(quantity),
              })),
            },
            grn: {
              connect: {
                id: selectedGRN?.id
              }
            },
          }, {
            onSuccess: (data) => {
              toast?.current?.show(tsuccess("Updated", `Putaway is now Updated`))

            },
            onError: (error) => {
              console.log('error: ', error);
              toast?.current?.show(tError("Error", `Putaway is not Updated`))

            }
          })
        } catch (error) {
          console.log('error: ', error);
          toast?.current?.show(tError("Error", `Putaway is not Updated`))
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


  //  Editable Datatable 

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
        formik.setValues({
          ...formik.values,
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
    { field: "qcComplete", header: "QC Complete", body: (rowData) => rowData.qcComplete === 1 ? 'True' : 'False' },
    // { field: "quantity", header: "Quantity", body: (rowData) => rowData.quantity || "-" },
    // { field: "shelfCode", header: "Shelf Code" },
    // { field: "inventoryType", header: "Inventory Type" },
    { field: "finalQuantity", header: "Total Quantity", body: (rowData) => rowData.finalQuantity || "-" },
    { field: "qcRejectedQuantity", header: "QC Rejected Quantity" },
  ]

  const pendingColumn = [
    { field: "quantity", header: "Quantity", body: (rowData) => rowData.quantity || "-" },
    // { field: "availableQuantity", header: "Available Quantity", },
    // { field: "shelfCode", header: "Shelf Code" },
    { field: "inventoryType", header: "Inventory Type" },
  ]

  const completeColumn = [
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
    // setGrnValue(grns?.map((val) => val.grnNumber))
    const grn_number = grns?.map((val) => val.grnNumber)
    setGrnValue(grn_number)
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

  const grn_numbers = grns.map(grn => grn.grnNumber);
  console.log('grn_numbers: ', grn_numbers);


  const [selectGrnProducts, setSelectGrnProducts] = useState([])


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
        toast?.current?.show(tWarn("Warning", `not QC_Completed`))

      }
    } else {
      toast?.current?.show(tWarn("Warning", `select checkbox for QC_Completed--`))

    }
  };
  const getStatusName = (statusId) => {
    const status = grn_statuses.find((s) => s.id === statusId);
    return status ? status.name : '-';
  };

  // Completed Tab
  const [completeData, setCompleteData] = useState([])
  console.log('completeData: ', completeData);

  useEffect(() => {
    if (putaway.status === 'Completed') {
      // Assuming you have an array of completed putaway products in the putaway object
      const completedProducts = putaway.putaway_products;

      // Update the completeData state with the completed products
      setCompleteData(completedProducts);
    }
  }, [putaway.status, putaway.putaway_products]);



  const [selectedValues, setSelectedValues] = useState({});

  return (
    <div>
      <Toast ref={toast} />
      <Head>
        {/* <title>Putaway {putaway.id}</title> */}
      </Head>

      <div className="col-12 card flex justify-content-between align-items-center m-0">
        {/* <h2 className="mt-2">Putaway / PT0035</h2> */}
        <h2 className="mt-2">{putaway.putawayNumber}</h2>

        <form onSubmit={formik.handleSubmit}>
          <Button
            label="Update Putaway"
            type="submit"
            onClick={() => { setActiveUpdatePutaways(true) }}
          />
        </form>
      </div>


      <div className="flex gap-3 card mt-3">
        <div className="left" style={{ width: '83%' }}>
          <div className="mt-2">
            <div className="flex justify-content-end">

            </div>
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
                  <Column
                    field="inventory_products"
                    header="Avliable Quantity"
                    body={(rowData) => {
                      const inventoryRef = useRef(null);
                      const handleMouseEnter = (event) => {
                        if (inventoryRef.current) {
                          inventoryRef.current.toggle(event);
                        }
                      };
                      if (
                        rowData.po_products &&
                        rowData.po_products.vendor_products &&
                        rowData.po_products.vendor_products.products &&
                        rowData.po_products.vendor_products.products.inventory_products &&
                        rowData.po_products.vendor_products.products.inventory_products.length > 0
                      ) {
                        const inventoryProducts = rowData.po_products.vendor_products.products.inventory_products;
                        if (inventoryProducts.length <= 2) {
                          return inventoryProducts
                            .map((item) => `Shelves: ${item.shelves?.number} , Quantity: ${item.quantity}`)
                            .join("; ");
                        }
                        return (
                          <div>
                            <Button
                              className="p-button-link"
                              onMouseEnter={handleMouseEnter}
                              label={`Avaliable Quantity (${inventoryProducts.length})`}
                            />

                            <div className="overlay-panel">
                              <OverlayPanel ref={inventoryRef} showCloseIcon>
                                <div style={{
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  overflowX: 'hidden'
                                }}>
                                  {inventoryProducts.map((item, index) => {
                                    return (
                                      <div key={index} style={{ fontSize: '15px', marginTop: '8px' }}>
                                        <div className="flex gap-3">
                                          Shelves: {item.shelves?.number},
                                          Quantity: {item.quantity}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </OverlayPanel>

                            </div>
                          </div>
                        );
                      } else {
                        return "-";
                      }
                    }}
                  />

                  <Column
                    header="Shelf Code"
                    body={(rowData) => {
                      if (
                        rowData.po_products &&
                        rowData.po_products.vendor_products &&
                        rowData.po_products.vendor_products.products &&
                        rowData.po_products.vendor_products.products.inventory_products
                      ) {
                        const inventoryProducts = rowData.po_products.vendor_products.products.inventory_products;

                        const dropdownOptions = inventoryProducts.map((item) => ({
                          label: `${item.shelves?.number} -  ${item.quantity}`,
                          value: `${item.shelves?.number} -  ${item.quantity}`,
                        }));

                        return (
                          <Dropdown
                            value={selectedValues[rowData.id] || dropdownOptions[0].value} 
                            options={dropdownOptions}
                            style={{ width: '100%' }}
                            onChange={(e) => {
                              const updatedValues = { ...selectedValues };
                              updatedValues[rowData.id] = e.value; 
                              setSelectedValues(updatedValues);
                            }}
                          />
                        );
                      } else {
                        return "-";
                      }
                    }}
                  />
                







                  {/* {columnsComponents} */}
                  {pendingColumn.map((i) => {
                    return (
                      <Column
                        key={i.field}
                        field={i.field}
                        header={i.header}
                        body={i.body}
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
                  value={completeData}
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
                  {/* {columnsComponents} */}

                  {completeColumn.map((i) => {
                    return (
                      <Column
                        key={i.field}
                        field={i.field}
                        header={i.header}
                        body={i.body}
                      />
                    )
                  })}

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
                  <Column field="po_products.vendor_products.sku" header="Vendor SKU" />


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
                    <p>{filteredPutawayData.map((ele) => ele.purchaseOrder)}</p>
                    <p>{getStatusName(filteredPutawayData[0]?.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <span className="p-float-label">
                <AutoComplete
                  value={selectGrn ? selectGrn.grnNumber : ''}
                  dropdown
                  suggestions={grnValue}
                  completeMethod={grnSearch}
                  onChange={handelGrnChange}
                />
                <label>
                  Select GRN
                </label>
              </span>
            </div>
            {/* <div className="mt-5">
              <span className="p-float-label">
                <AutoComplete
                  value={selectedGrn}
                  dropdown
                  suggestions={categorySuggestions}
                  // suggestions={selectGrnNumber}
                  completeMethod={searchCategory}
                  // completeMethod={(e) => {
                  //   const filteredGrns = grn_numbers.filter(grn => grn.toLowerCase().includes(e.query.toLowerCase()));
                  //   console.log('filteredGrns: ', filteredGrns);
                  //   return filteredGrns;
                  // }}
                  field="grnNumber"
                  placeholder="Search for GRN..."
                  // onChange={(e) => {
                  //   // const filteredGrns = grn_numbers.filter(grn => grn.toLowerCase().includes(e.query.toLowerCase()));
                  //   //   console.log('filteredGrns: ', filteredGrns);
                  //   //   return filteredGrns;
                  // }}
                 
                />
              </span>

            </div> */}


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
