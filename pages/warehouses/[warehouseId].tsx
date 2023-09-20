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
import { initialFilterRules, tError, tsuccess } from "app/constants";
import { FilterMatchMode } from "primereact/api";
import { AutoComplete } from "primereact/autocomplete";

// import deleteWarehouse from "src/warehouses/mutations/deleteWarehouse";


const initialAreas = {
  name: '',
  description: ''
}
const columns = [
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
              toast?.current.show(tError("Area is ", `Not Updated `))
              console.log('error: ', error);
            }
          })
        } catch (error) {
          console.log('error: ', error);
          toast?.current.show(tError("Area is ", `Not Updated `))
        }
      } else {
        try {
          await createArea({
            name,
            warehouse: warehouse.id,
            description,
          }, {
            onSuccess: async (data) => {
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
          toast?.current.show(tError("Error", `Area is  Not Created `))
          console.log('error: ', error);
        }
      }
    }
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }




  const dt = useRef(null);
  const exportColumns = columns.map((col) => ({ title: col.header, dataKey: col.field }));

  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(areas);
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

  const handleRowClick = (e) => {
    const areasId = e.data.id;
    router.push(`/areas/${areasId}`);
  };


  useEffect(() => {
    setAreas(warehouse?.areas_areas_warehouseTowarehouse)
  }, [warehouse])





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
  const warehouseIDTableHeader = renderHeader()


  // Dropdown Filter 
  const areaDropdownOptions = [
    { id: 1, label: 'Good' },
    { id: 2, label: 'Bad' },
    { id: 3, label: 'Blocked' },
    { id: 4, label: 'E-waste' },
    { id: 5, label: 'Inbound' },
    { id: 6, label: 'main' },
  ];
  const [areaValue, setAreaValue] = useState('');
  const [areaItems, setAreaItems] = useState([]);

  const search = (event) => {
    let _items = areaDropdownOptions.map(option => option.label); // Use labels from areaDropdownOptions
    setAreaItems(event.query ? _items.filter(item => item.toLowerCase().includes(event.query.toLowerCase())) : _items);
  }



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
            {editAreas ? <h2>Update Areas - {formik.values.name}</h2> : <h2>Create Areas</h2>}
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
              {/* <div className="mt-4">
                <span className="p-float-label">
                  <AutoComplete
                    dropdown
                    value={areaValue}
                    suggestions={areaItems}
                    completeMethod={search}
                    onChange={(e) => setAreaValue(e.value)}
                  />
                  <label >
                    Shelf types
                  </label>
                </span>
              </div> */}
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
          // onRowClick={handleRowClick}
          filters={filters}
          header={warehouseIDTableHeader}
          onRowClick={async (e) => {
            setActiveAreas({ ...e.data })
            setActive(true)
            setEditAreas(true)
            setUpdateAreas(true)
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
              <Link href={`/areas/${rowData.id}`}>
                <a>{rowData.name}</a>
              </Link>
            )}
          />
          {columnComponents}

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
