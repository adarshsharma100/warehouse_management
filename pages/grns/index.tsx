import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "layouts/Layout"
import getGrns from "app/grns/queries/getGrns"
import getGrn_statuses from "app/grn_statuses/queries/getGrn_statuses"
import Loading from "components/loading"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import moment from "moment"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { Calendar } from "primereact/calendar"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { Menu } from "primereact/menu"
import classNames from "classnames"
import { useFormik } from "formik"
import * as Yup from "yup"
import { Checkbox } from "primereact/checkbox"
import { e } from "@blitzjs/auth/dist/index-c7aa9db2"
import { AutoComplete } from "primereact/autocomplete"
import { createSearchFunction, removeErrorBox, tsuccess } from "app/constants"
import updateGrn from "app/grns/mutations/updateGrn"
import { Toast } from "primereact/toast"
import ErrorCard from "components/ErrorCard"

const ITEMS_PER_PAGE = 100

export const GrnsList = () => {
  const router = useRouter()
  // const page = Number(router.query.page) || 0
  const [{ grns }, { error: getGrnsError, refetch: refetchGrn }] = useQuery(getGrns, {
    orderBy: { grn_id: "asc" },
  })
  const [{ grn_statuses }] = useQuery(getGrn_statuses, {
    orderBy: { id: "asc" },
  })

  const [updateGrnMutation, { error: grnCreationError }] = useMutation(updateGrn)

  const items = [
    {
      label: "Options",
      items: [
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: async () => {
            const grn_status = (activeRow as any)?.grn_status_grnTogrn_status?.name
            await formik.setValues({ ...activeRow, grn_status })
            setGrnEditState(true)
            scrollToTop?.current?.scrollIntoView()
          },
        },
      ],
    },
  ]
  const initialGrnDetails = {
    grn_id: "",
    grn_batch_code: "",
    grn_status: "",
    grn_status_id: "",
    grn_desc: "",
    grn_invoice_id: "",
  }
  // const [grnDetails, setGrnDetails] = useState(initialGrnDetails)
  const [expandedRows, setExpandedRows] = useState()
  const [activeRow, setActiveRow] = useState({})
  const [filters, setFilters] = useState({})
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [grnEditState, setGrnEditState] = useState(false)
  const [filterStatus, setFilterStatus] = useState([])
  const [grnErrorMsg, setGrnErrorMsg] = useState([])

  const searchStatus = createSearchFunction(filterStatus, setFilterStatus)

  const menu = useRef<Menu>(null)
  const scrollToTop = useRef<HTMLDivElement>(null)
  const toast = useRef(null)

  const removeGrnError = (i) => removeErrorBox(i, grnErrorMsg, setGrnErrorMsg)

  const clearFilter = () => {
    initFilters()
  }
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters1 = { ...filters }
    _filters1["global"].value = value

    setFilters(_filters1)
    setGlobalFilterValue(value)
  }
  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },

      grn_batch_code: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      grn_desc: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      created_on: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      "grn_status_grnTogrn_status.name": {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
    })
    setGlobalFilterValue("")
  }
  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="dd/mm/yy"
        placeholder="dd/mm/yyyy"
        mask="99/99/9999"
      />
    )
  }

  const statuses = grn_statuses.map((ele) => ele.name)
  const statusItemTemplate = (option) => {
    return option
  }

  const statusFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={statusItemTemplate}
        placeholder="Select a Status"
        className="p-column-filter"
        showClear
      />
    )
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          className="p-button-outlined"
          onClick={clearFilter}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </span>
      </div>
    )
  }
  const header1 = renderHeader()

  const rowExpansionTemplate = (data) => {
    return (
      <div className="w-full expandTable">
        <h3>Products List:</h3>

        <DataTable
          // value={purchase_order_products}
          responsiveLayout="scroll"
          showGridlines
          // header={renderHeader}
          stripedRows
          className="text-s datatable-responsive w-full mt-5"
          // paginator
          // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
          // rows={PAGINATION_VARIABLES.rows}
          // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
          // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
        >
          <Column
            field="vendor_products.products.description"
            header="Item-description"
            // className="text-center"
          />

          <Column
            // field="quantity"
            header="QC-Status"
            // className="text-center"
          />

          <Column
            field="quantity"
            header="Recevied"
            // className="text-center"
          />
          <Column
            field=""
            header="Good-Stock"
            // className="text-center"
          />
          <Column
            field=""
            header="Bad-stock"
            // className="text-center"
          />
          <Column
            field=""
            header="Rejection Reason"
            // className="text-center"
          />
        </DataTable>
      </div>
    )
  }

  const formik = useFormik({
    initialValues: initialGrnDetails,
    validationSchema: Yup.object().shape({
      grn_status: Yup.string().required("*Required"),
      grn_desc: Yup.string().required("*Required").typeError("*Required"),
    }),
    onSubmit: async (data) => {
      console.log("data", data)
      console.log("activeRow", activeRow)
      const { grn_id, grn_batch_code, grn_status, grn_status_id, grn_desc, grn_invoice_id } = data

      if (grnEditState) {
        try {
          const updateGrn = await updateGrnMutation(
            { grn_id, grn_status_id, grn_desc },
            {
              onSuccess: async (data) => {
                toast?.current.show(
                  tsuccess("Updated", `${grn_batch_code} is updated successfully`)
                )
                await refetchGrn()
                formik.resetForm()
                setGrnEditState(false)
              },
            }
          )
        } catch (error) {
          console.log("GRN-Updation-Error", error)
        }
      }
    },
  })
  // console.log(formik.values)

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  useEffect(() => {
    const ErrorArray = [grnCreationError]

    const msg = []

    for (let err of ErrorArray) {
      if (err) {
        msg.push(err)
      }
    }
    setGrnErrorMsg(msg)
  }, [grnCreationError])

  useEffect(() => {
    initFilters()
    setFilterStatus(grn_statuses)
  }, [])

  console.log("Formik", formik.values)

  return (
    <div className="grid w-full mr-0" ref={scrollToTop}>
      <Toast ref={toast} />
      {/* <pre>{JSON.stringify(activeRow, null, 2)}</pre> */}
      <div className="col-12">
        <div className="card flex justify-content-between align-items-center mb-2">
          <h4 className="mb-0">Goods Received Note</h4>
          <div className="flex justify-content-end align-items-center"></div>
        </div>
        {grnErrorMsg.map((ele, i) => (
          <ErrorCard ErrorMsgs={ele} closeErrorBox={removeGrnError} value={i} key={i} />
        ))}
      </div>
      <div
        className={`col-12 ${
          grnEditState
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        } `}
      >
        <div className={` card `}>
          <form className="p-fluid" onSubmit={formik.handleSubmit}>
            <h5 className="mb-3">{`${grnEditState ? "Update" : "Create"} GRN`}</h5>
            <div className="formgrid grid p-4">
              <div className="col-12">
                <h6>GRN Details:</h6>
              </div>

              <div className="field col-12 lg:col-4 mt-2">
                <span className="p-float-label">
                  <InputText
                    id="grn_batch_code"
                    name="grn_batch_code"
                    disabled={true}
                    value={formik.values.grn_batch_code}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": isFormFieldValid("grn_batch_code") })}
                  />
                  <label
                    htmlFor="grn_batch_code"
                    className={classNames({ "p-error": isFormFieldValid("grn_batch_code") })}
                  >
                    GRN Code
                  </label>
                </span>
                {getFormErrorMessage("grn_batch_code")}
                {/* <div className="field-checkbox mt-3">
                  <Checkbox
                    id="poCode"
                    onChange={(e) => setPoCodeChecked(e.checked)}
                    checked={poCodeChecked}
                    disabled={poEditState}
                  />
                  <label htmlFor="poCode">Un-check to add custom code.</label>
                </div> */}
              </div>
              <div className="field col-12 lg:col-4 mt-2">
                <span className="p-float-label">
                  <InputText
                    id="grn_invoice_id"
                    name="grn_invoice_id"
                    disabled={true}
                    value={formik.values.grn_invoice_id}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": isFormFieldValid("grn_invoice_id") })}
                  />
                  <label
                    htmlFor="grn_invoice_id"
                    className={classNames({ "p-error": isFormFieldValid("grn_invoice_id") })}
                  >
                    Invoice
                  </label>
                </span>
                {getFormErrorMessage("grn_invoice_id")}
              </div>
              <div className="field col-12 lg:col-4 mt-2">
                <span className="p-float-label">
                  <InputText
                    id="grn_desc"
                    name="grn_desc"
                    value={formik.values.grn_desc}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": isFormFieldValid("grn_desc") })}
                  />
                  <label
                    htmlFor=" grn_desc"
                    className={classNames({ "p-error": isFormFieldValid("grn_desc") })}
                  >
                    Description
                  </label>
                </span>
                {getFormErrorMessage("grn_desc")}
              </div>
              <div className="field col-12 lg:col-4 mt-2">
                <div className="p-float-label">
                  <AutoComplete
                    value={formik.values.grn_status}
                    suggestions={filterStatus}
                    completeMethod={searchStatus}
                    // forceSelection
                    dropdown
                    field="name"
                    onChange={async (e) => {
                      console.log(e.value)
                      let grn_status = typeof e.value === "string" ? e.value : e.value.name
                      let grn_status_id = typeof e.value === "string" ? e.value : e.value.id

                      await formik.setValues({
                        ...formik.values,
                        grn_status,
                        grn_status_id,
                      })
                    }}
                    aria-label="agreementStatusOptions"
                    dropdownAriaLabel="Select Status"
                    className={classNames({ "p-invalid": isFormFieldValid("grn_status") })}
                  />

                  <label
                    htmlFor="grn_status"
                    className={classNames({ "p-error": isFormFieldValid("grn_status") })}
                  >
                    GRN Status
                  </label>
                </div>
                {getFormErrorMessage("grn_status")}
              </div>
            </div>

            <div className="flex mx-4 ">
              <Button
                type="submit"
                className="mr-2"
                label={grnEditState ? "UPDATE" : "ADD"}
                // onClick={async (e) => {
                //   e.preventDefault()
                // }}
              />
              <Button
                className="mr-2 p-button-secondary"
                label="Cancel"
                onClick={(e) => {
                  e.preventDefault()
                  formik.resetForm()
                  setGrnEditState(false)
                }}
              />
            </div>
          </form>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <DataTable
            value={grns}
            // scrollable
            // scrollHeight="60vh"
            showGridlines
            // header={renderHeader}
            stripedRows
            className="text-s datatable-responsive"
            responsiveLayout="scroll"
            // paginator
            // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
            // rows={PAGINATION_VARIABLES.rows}
            // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
            // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            filters={filters}
            header={header1}
            filterDisplay="menu"
            emptyMessage="No Results found."
          >
            <Column expander={true} style={{ width: "3em" }} />
            <Column
              field="grn_batch_code"
              header="Code"
              filter
              filterPlaceholder="Search by Code"
              // className="text-center"
            />
            <Column
              field="invoice"
              header="Invoice No."
              filter
              filterPlaceholder="Search by Invoice"
              // className="text-center"
            />
            <Column
              field="grn_desc"
              header="Description"
              filter
              filterPlaceholder="Search by Description"
              // className="text-center"
            />

            <Column
              // field="created_on"
              header="Created on"
              filterField="created_on"
              dataType="date"
              body={(rowData) => moment(rowData.created_on).format("DD-MM-YYYY, HH:MM")}
              filter
              filterElement={dateFilterTemplate}

              // className="text-center"
            />

            <Column
              field="grn_status_grnTogrn_status.name"
              header="Status"
              filter
              filterElement={statusFilterTemplate}
            />
            <Column
              // field="vendor_gstin"
              header="Action"
              body={(rowData) => {
                return (
                  <div>
                    <Menu model={items} popup ref={menu} id="popup_menu" />
                    <Button
                      // label="Show"
                      icon="pi pi-ellipsis-v"
                      onClick={(event) => {
                        setActiveRow(rowData)
                        menu.current.toggle(event)
                      }}
                      aria-controls="popup_menu"
                      aria-haspopup
                    />
                  </div>
                )
              }}
              // className="text-center"
            />
          </DataTable>
        </div>
      </div>
    </div>
  )
}

const GrnsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <GrnsList />
      </Layout>
    </Suspense>
  )
}

export default GrnsPage
