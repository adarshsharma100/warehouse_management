import { Suspense, useState, useRef, useEffect } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";
import Layout from "layouts/Layout";
import getArea from "app/areas/queries/getArea";
import deleteArea from "app/areas/mutations/deleteArea";
import { Button } from "primereact/button";
import { useFormik } from "formik";
import * as Yup from "yup"
import { InputText } from "primereact/inputtext";
import classNames from "classnames";
import { AutoComplete } from "primereact/autocomplete";
import getShelf_types from "app/shelf_types/queries/getShelf_types";
import createShelf from "app/shelves/mutations/createShelf";
import { DataTable } from "primereact/datatable";
import getShelves from "app/shelves/queries/getShelves";
import { Column } from "primereact/column";
import { createSearchFunction, initialFilterRules, tError, tsuccess } from "app/constants";
import updateShelf from "app/shelves/mutations/updateShelf";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import { shelves_reach, shelves_loadingStrength } from "@prisma/client";
import { Dropdown } from "primereact/dropdown";
import { L } from "@blitzjs/auth/dist/index-c7aa9db2";


const initialShelf = {
  sellable: '',
  number: '',
  length: '',
  width: '',
  height: '',
  loadingStrength: '',
  reach: '',
  area: '',
  shelfType: '',
}

const columns = [
  { field: "number", header: "Number" },
  { field: "length", header: "Length" },
  { field: "width", header: "Width" },
  { field: "height", header: "Height" },
  { field: "loadingStrength", header: "Loading Strength" },
  { field: "reach", header: "Reach" },
  { field: "shelf_type.name", header: "Shelf Type" },
  { field: "sellable", header: "Sellable" },

]
export const Area = () => {
  const [{ shelf_types }] = useQuery(getShelf_types, {
    orderBy: { id: "asc" },
    // skip: undefined,
    // where: undefined,
    // take: undefined
  })
  const [{ shelves, }] = useQuery(getShelves, {
    orderBy: { id: "asc" },
    skip: undefined,
    where: undefined,
    take: undefined
  })


  const [createShelfMutation,] = useMutation(createShelf)
  const [updateShelfsMutation] = useMutation(updateShelf)

  console.log('shelf_types: ', shelf_types);
  const router = useRouter();
  const areaId = useParam("areaId", "number");
  console.log('areaId: ', areaId);
  // const [deleteAreaMutation] = useMutation(deleteArea);
  const [selectedColumns, setSelectedColumns] = useState(columns)
  const [rowDataStore, setRowDataStore] = useState({})

  const [checkUpdate, setCheckUpdate] = useState(false)

  const [area, { refetch }] = useQuery(getArea, { id: areaId });
  console.log('area: ', area);


  const [shelvesList, setShelvesList] = useState(area?.shelves)
  const [active, setActive] = useState(false)
  const [shelfData, setShelfData] = useState(initialShelf)
  const [editAreas, setEditAreas] = useState(false)
  const [values, setValues] = useState('');
  const [items, setItems] = useState(shelf_types);
  console.log('items: ', items);
  const [updateShelfs, setUpdateShelfs] = useState(false);
  console.log('items: ', items);
  const [status, setStatus] = useState()
  const search = (event) => {
    let _items = shelf_types;
    setItems(shelf_types.map((i) => i.name));
  }




  const [sellableValue, setSellableValue] = useState(null);
  const [sellableSuggestions, setSellableSuggestions] = useState(null)
  const [shelfTypeSuggestions, setShelfTypeSuggestions] = useState(null)

  const toast = useRef(null)

  console.log('sellableValue: ', sellableValue);
  const boolOptions = [
    { label: 'True', value: true },
    { label: 'False', value: false },
  ];
  const searchSellable = createSearchFunction(boolOptions, setSellableSuggestions)

  const searchShelfType = createSearchFunction(items, setShelfTypeSuggestions)

  const formik = useFormik({
    initialValues: shelfData,
    validationSchema: Yup.object().shape({
      number: Yup.string().required("*Required")
    }),

    onSubmit: async (data) => {
      const { number, length, width, loadingStrength, reach, area, shelfType, sellable, height, } = data
      const { id: areaRowId } = rowDataStore
      if (checkUpdate) {
        try {
          await updateShelfsMutation({
            id: areaRowId,
            number,
            length: Number(length),
            width: Number(width),
            height: Number(height),
            loadingStrength,
            reach,
            sellable: sellable?.value,
            shelfType: shelfType?.id

          }, {
            onSuccess: async (data) => {
              toast?.current.show(tsuccess("Updated", `Shelf is  updated`))
              setActive(!active)
              await refetch()
              

            },
            onError: async (error) => {
              console.log('error: ', error);
              toast?.current.show(tsuccess("Not Updated", `Shelf is not updated`))

              await refetch()
            }
          })

        } catch (error) {
          console.log('error:++ ', error);
        }

      } else {
        try {
          await createShelfMutation({
            sellable: sellable?.value,
            number,
            length: Number(length),
            width: Number(width),
            height: Number(height),
            loadingStrength,
            reach,
            area: areaId,
            shelfType: shelfType?.id
          }, {
            onSuccess: (data) => {
              toast?.current.show(tsuccess("Created", `Shelf is  created`))
              setActive(!active)
              refetch()
            },
            onError: (error) => {
              console.log('error: ', error);
              toast?.current.show(tError("Not Created", `Shelf is  not created`))
            }
          })

        } catch (error) {
          console.log('error: ', error);
        }
      }

    }
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }
  console.log(formik.values, "formik.values")



  const dt = useRef(null);
  const exportColumns = columns.map((col) => ({ title: col.header, dataKey: col.field }));

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(area?.shelves);
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

  useEffect(() => {
    setShelvesList(area?.shelves)
  }, [area])



  const initialColumnFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: initialFilterRules.andContains,
    length: initialFilterRules.andContains,
    width: initialFilterRules.andContains,
    loadingStrength: initialFilterRules.andContains,
    reach: initialFilterRules.andContains,
    "shelf_type.name": initialFilterRules.andContains,
    sellable: initialFilterRules.andContains,
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
  const areasTableHeader = renderHeader()


  //  Add Dropdown in reach and loading strength 
  const shelve_Reach = shelves_reach

  const shelves_LoadingStrength = shelves_loadingStrength
  const [selectedReach, setSelectedReach] = useState(null);
  const [selectedLoadingStrength, setSelectedLoadingStrength] = useState(null);

  const shelvesLoadingStrength = Object.entries(shelves_loadingStrength).map(([label, value]) => ({
    label,
    value,
  }));

  const shelveReach = Object.entries(shelves_reach).map(([label, value]) => ({
    label,
    value,
  }));


  return (
    <>
      <Head>
        <title>{area?.name}-Area</title>
      </Head>

      <div className='card flex justify-content-between align-content-center '>
        <Toast ref={toast} />
        <h2 className='m-0'>{area?.name}-Area</h2>
        <Button
          onClick={() => {
            formik.resetForm()
            setUpdateShelfs(false)
            setActive(!active)
            setEditAreas(false)
            setCheckUpdate(false)
          }}
          icon='pi pi-plus' label="Add Shelf">

        </Button>
      </div>

      <form className="p-fluid" onSubmit={formik.handleSubmit}>
        {active &&
          <div className="card">
            {checkUpdate ? <h2>Update Shelf - {formik.values.number}</h2> : <h2>Create Shelf</h2>}
            <div className="formgrid grid">
              {[
                // { type: 'text', label: 'Sellable', field: 'sellable' },
                { type: 'text', label: 'Number', field: 'number' },
                { type: 'text', label: 'Length', field: 'length' },
                { type: 'text', label: 'Height', field: 'height' },
                { type: 'text', label: 'Width', field: 'width' },
                // { type: 'text', label: 'Loading Strength', field: 'loadingStrength' },
                // { type: 'text', label: 'Reach', field: 'reach' },
              ].map((ele, i) => {
                return (
                  <div key={i} className='field col-10 md:col-3 lg:col-3 mt-4'>
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

            <div className="flex">

              <div className="field col-12 md:col-3 lg:col-3">
                <span className="p-float-label">
                  <Dropdown
                    value={formik.values.loadingStrength}
                    onChange={(e) => {
                      formik.setFieldValue('loadingStrength', e.value); // Update loadingStrength field in Formik
                    }}
                    // value={selectedLoadingStrength}
                    // onChange={(e) => setSelectedLoadingStrength(e.target.value)}
                    options={shelvesLoadingStrength}
                    optionLabel="value"
                   
                  />
                  <label>Loading Strength</label>
                </span>
              </div>

              <div className="field col-12 md:col-3 lg:col-3">
                <span className="p-float-label">
                  <Dropdown
                    value={formik.values.reach}
                    onChange={(e) => {
                      formik.setFieldValue('reach', e.value); // Update loadingStrength field in Formik
                    }}
                    // value={selectedReach}
                    // onChange={(e) => setSelectedReach(e.target.value)}
                    options={shelveReach}
                    optionLabel="value"
                   

                  />
                  <label>Reach</label>
                </span>
              </div>
              <div className="field col-12 md:col-3 lg:col-3">
                <span className="p-float-label">
                  <AutoComplete
                    
                    value={formik.values?.shelfType}
                    // completeMethod={search}
                    completeMethod={searchShelfType}
                    // suggestions={items}
                    field='name'
                    suggestions={shelfTypeSuggestions}
                    
                    onChange={async (e) => {
                      await formik.setValues({
                        ...formik.values,
                        shelfType: e.value
                      })
                    }}
                    dropdown
                  />
                  <label>Shelf Type</label>
                </span>
              </div>
              <div className="field col-12 md:col-3 lg:col-3">
                <span className="p-float-label">
                  <AutoComplete
                    value={formik.values?.sellable}
                    suggestions={sellableSuggestions}
                    completeMethod={searchSellable}
                    field="label"

                    onChange={async (e) => {
                      console.log('e: ', e);

                      await formik.setValues({
                        ...formik.values,
                        sellable: e.value
                      })
                    }}
                    
                    dropdown
                  />
                  <label>Sellable</label>
                </span>

              </div>

            </div>
            <div className="flex justify-content-end">

              <Button
                type="submit"
                className="mr-2"
                label="SUBMIT"

              />
              <Button
                className="p-button-secondary flex-grow-0"
                style={{ maxWidth: "50%" }}
                type="button"
                label="CANCEL"
                onClick={() => {
                  formik.resetForm()
                  setUpdateShelfs(false)
                  setActive(!active)
                  setEditAreas(false)
                  setCheckUpdate(false)
                }}
              />

            </div>
          </div>

        }


      </form>



      <div className="card col-12">
        <DataTable
          value={area?.shelves}
          showGridlines
          stripedRows
          className="text-s datatable-responsive"
          responsiveLayout="scroll"
          filterDisplay="menu"
          filters={filters}
          header={areasTableHeader}
          onRowClick={async (e) => {
            setRowDataStore({ ...e.data })
            setCheckUpdate(true)
            setActive(true);
            setEditAreas(true);
            setUpdateShelfs(true);
            const _sellable = e.data.sellable ? { label: 'True', value: true } : { label: 'False', value: false }
            console.log('_sellable: ', _sellable);
            await formik.setValues({
              ...e.data,
              sellable: _sellable,
              shelfType: e.data.shelf_type
            })
          }}

        >
          {columnComponents}
          {/* <Column
            header="Action"
            body={(rowData) => {
              console.log('rowData: ', rowData)

              return (
                <div>
                  <Button
                    icon="pi pi-pencil"
                    onClick={async () => {
                      setRowDataStore({ ...rowData })
                      setCheckUpdate(true)
                      setActive(true);
                      setEditAreas(true);
                      setUpdateShelfs(true);
                      const _sellable = rowData.sellable ? { label: 'True', value: true } : { label: 'False', value: false }
                      console.log('_sellable: ', _sellable);
                      await formik.setValues({
                        ...rowData,
                        sellable: _sellable,
                        shelfType: rowData.shelf_type
                      })
                    }}
                  />
                </div>
              )
            }}
          /> */}
        </DataTable>
      </div>
    </>
  );
};

const ShowAreaPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Area />
      </Suspense>
    </div>
  );
};

ShowAreaPage.authenticate = true;
ShowAreaPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowAreaPage;
