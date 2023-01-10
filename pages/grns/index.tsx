import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc"
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

  const items = [
    {
      label: "Options",
      items: [
        {
          label: "Edit",
          icon: "pi pi-pencil",
          command: () => {
            setGrnEditState(true)
            scrollToTop?.current?.scrollIntoView()
          },
        },
      ],
    },
  ]

  const [expandedRows, setExpandedRows] = useState()
  const [activeRow, setActiveRow] = useState({})
  const [filters, setFilters] = useState({})
  const [globalFilterValue, setGlobalFilterValue] = useState("")
  const [grnEditState, setGrnEditState] = useState(false)

  const menu = useRef<Menu>(null)
  const scrollToTop = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    initFilters()
  }, [])

  console.log("activedata", activeRow)

  return (
    <div className="grid w-full mr-0" ref={scrollToTop}>
      <div className="col-12">
        <div className="card flex justify-content-between align-items-center mb-2">
          <h4 className="mb-0">Goods Received Note</h4>
          <div className="flex justify-content-end align-items-center"></div>
        </div>
      </div>
      <div
        className={`col-12 ${
          grnEditState
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        } `}
      >
        <div className={` card `}>
          <form className="p-fluid">
            <h5 className="mb-3">{`${grnEditState ? "Update" : "Create"} GRN`}</h5>
            <div className="formgrid grid p-4">
              <div className="col-12">
                <h6>GRN Details:</h6>
              </div>
              {/* <div className="field col-12 lg:col-4 mt-2 ">
                <span className="p-float-label ">
                  <InputText
                    id="rfq_code"
                    name="rfq_code"
                    value={formik.values.rfq_code}
                    onChange={formik.handleChange}
                    disabled={RFQCodechecked}
                    autoFocus
                    className={classNames({ "p-invalid": isFormFieldValid("rfq_code") })}
                  />
                  <label
                    htmlFor="rfq_code"
                    className={classNames({ "p-error": isFormFieldValid("rfq_code") })}
                  >
                    RFQ Code
                  </label>
                </span>
                {getFormErrorMessage("rfq_code")}

                <div className="field-checkbox my-2">
                  <Checkbox
                    // style={{ width: "0.1rem", height: "0rem" }}
                    onChange={(e) => setRFQCodeChecked(e.checked)}
                    checked={RFQCodechecked}
                    disabled={rfqEditState}
                  />
                  <label
                    // htmlFor="binary"
                    className="text-sm	"
                  >
                    Un-check to add custom code.
                  </label>
                </div>
              </div>
              <div className="field col-12 lg:col-4 my-2">
                <span className="p-float-label">
                  <InputText
                    id="rfq_description"
                    name="rfq_description"
                    value={formik.values.rfq_description}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": isFormFieldValid("rfq_description") })}
                    autoFocus
                  />
                  <label
                    htmlFor="rfq_description"
                    className={classNames({ "p-error": isFormFieldValid("rfq_description") })}
                  >
                    RFQ Description
                  </label>
                </span>
                {getFormErrorMessage("rfq_description")}
              </div>
              <div className="field col-12 lg:col-4 mt-2 ">
                <span className="p-float-label">
                  <Calendar
                    id="expected_dod"
                    minDate={new Date()}
                    // // value={(rfqDetails.expected_dod)}
                    // onChange={(e) =>
                    //   setRfqDetails({ ...rfqDetails, expected_dod: e.target.value?.toString() })
                    value={formik.values.expected_dod}
                    onChange={async (e) => {
                      await formik.setValues({
                        ...formik.values,
                        expected_dod: e.value,
                      })
                    }}
                    className={classNames({ "p-invalid": isFormFieldValid("expected_dod") })}
                  />
                  <label
                    style={{ zIndex: 10 }}
                    htmlFor="expected_dod"
                    className={classNames({ "p-error": isFormFieldValid("expected_dod") })}
                  >
                    Expected Delivery
                  </label>
                </span>
                {getFormErrorMessage("expected_dod")}
                  </div> */}
            </div>

            <div className="flex mx-4 ">
              <Button
                type="submit"
                className="mr-2"
                label={grnEditState ? "UPDATE" : "ADD"}
                onClick={async (e) => {}}
              />
              <Button
                className="mr-2 p-button-secondary"
                label="Cancel"
                onClick={(e) => {
                  e.preventDefault()
                  setGrnEditState(false)
                }}
              />
            </div>
          </form>
        </div>
      </div>
      {JSON.stringify(grns[0], null, 2)}
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
