import { Suspense, useEffect, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getVendors from "app/vendors/queries/getVendors"
import Layout from "layouts/Layout"
import { Toast } from "primereact/toast"
import { Button } from "primereact/button"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Dialog } from "primereact/dialog"
import classNames from "classnames"
import { InputText } from "primereact/inputtext"
import createVendor from "app/vendors/mutations/createVendor"
import updateVendor from "app/vendors/mutations/updateVendor"
import deleteVendor from "app/vendors/mutations/deleteVendor"
import { FileUpload } from "primereact/fileupload"
import papa from "papaparse"
import downloadCsv from "download-csv"
import { VendorForm } from "app/vendors/components/VendorForm"
import Loading from "components/loading"
import nodemailer from "nodemailer"
import { mail } from "helperFunctions/mail"
import axios from "axios"

import { cities, tsuccess } from "app/constants"
import { createCSVFormat } from "app/constants"
import { AutoComplete } from "primereact/autocomplete"
import ErrorCard from "components/ErrorCard"
import { useFormik } from "formik"
import * as Yup from "yup"
import ErrorComponent from "components/ErrorComponent"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { Dropdown } from "primereact/dropdown"
const ITEMS_PER_PAGE = 100

export const VendorsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ vendors, hasMore }, { refetch, error: getVendorError }] = usePaginatedQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const initialVendorState = {
    vendor: "",
    vendor_code: "",
    vendor_email: "",
    vendor_contact: "",
    vendor_gstin: "",
    credit_period: "",
    lead_time: "",
    address: "",
    vendor_city: "",
    vendor_state: "",
  }

  const [createVendorMutation, { error: vendorCreationError, isLoading: creatingVendor }] =
    useMutation(createVendor)
  const [updateVendorMutation, { error: vendorUpdationError, isLoading: updatingVendor }] =
    useMutation(updateVendor)
  const [deleteVendorMutation] = useMutation(deleteVendor)
  const [vendorDialog, setVendorDialog] = useState(false)
  const [vendorDetails, setVendorDetails] = useState(initialVendorState)
  const [errorProducts, setErrorProducts] = useState([])
  const [activeVendor, setActiveVendor] = useState(false)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const renderFooter = () => {
    return (
      <div className="flex justify-content-end">
        <Button className="mr-2" label="ADD" />
      </div>
    )
  }

  const [filters, setFilters] = useState({})
  const [globalFilterValue, setGlobalFilterValue] = useState("")

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

      vendor: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor_code: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor_email: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor_city: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor_state: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor_contact: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      vendor_gstin: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      address: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
      },
      status: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
    })
    setGlobalFilterValue("")
  }
  const statuses = [true, false]

  const statusFilterTemplate = (options) => {
    console.log(options)
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
  const statusItemTemplate = (option) => {
    console.log("option-temp", option)
    return (
      <span className={`badge status-${option ? "active" : "inactive"}`}>
        {option ? "Active" : "Inactive"}
      </span>
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
  const toast = useRef(null)
  const scrollToTop = useRef<HTMLDivElement>(null)

  const vCsvFormatDetails = {
    headers: [
      "CODE",
      "EMAIL",
      "CITY",
      "STATE",
      "CONTACT",
      "GSTIN",
      "NAME",
      "ADDRESS",
      "CREDIT_PERIOD",
      "LEAD_TIME",
    ],
    name: "Vendor-format.csv",
  }
  const [btnVisibility, setBtnVisibility] = useState(false)
  const clearUpload = useRef<FileUpload>(null)
  const onBasicUpload = async (e) => {
    const csv = [] // this will contain all the data of imported csv file
    papa.parse(e.files[0], {
      header: true,
      skipEmptyLines: true,
      step: async ({ data }, parser) => {
        let index = 2
        setErrorProducts([])
        const missingKey = [
          "CODE",
          "EMAIL",
          "CITY",
          "STATE",
          "CONTACT",
          "GSTIN",
          "NAME",
          "ADDRESS",
          "CREDIT_PERIOD",
          "LEAD_TIME",
        ].find((key) => !(key in data))
        if (missingKey) {
          setErrorProducts([...errorProducts, { message: `Column ${missingKey} missing.` }])
          parser.abort()
        }
        await createVendorMutation(
          {
            vendor_code: data["CODE"],
            vendor_email: data["EMAIL"],
            vendor_city: data["CITY"],
            vendor_state: data["STATE"],
            vendor_contact: data["CONTACT"],
            vendor_gstin: data["GSTIN"],
            vendor: data["NAME"],
            address: data["ADDRESS"],
            credit_period: data["CREDIT_PERIOD"],
            lead_time: data["LEAD_TIME"],
          },
          {
            onSuccess: () => {
              toast?.current?.show({
                severity: "success",
                summary: "Product Created",
                detail: "Product created successfully.",
                life: 3000,
              })
            },
            onError: (error) => {
              console.log("Product failed: ", data)
              console.log("error: ", error)
              setErrorProducts([
                ...errorProducts,
                { ...data, message: error.message, rowNum: index },
              ])
            },
          }
        )
        await refetch()
      },
    })
  }

  const [filteredSuggestions, setFilteredSuggestions] = useState<any>(null)

  const searchCities = (event: { query: string }) => {
    setTimeout(() => {
      let _filteredSuggestions
      if (!event.query.trim().length) {
        _filteredSuggestions = [...cities]
      } else {
        _filteredSuggestions = cities.filter((element) => {
          return element.city.toLowerCase().startsWith(event.query.toLowerCase())
        })
      }

      setFilteredSuggestions(_filteredSuggestions)
    }, 50)
  }
  const [ErrorMsgs, setErrorMsgs] = useState([])
  useEffect(() => {
    const ErrorArray = [vendorCreationError, vendorUpdationError, getVendorError]

    const msg = []

    for (let err of ErrorArray) {
      // console.log(err?.message)
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [vendorUpdationError, vendorCreationError, getVendorError])

  const removeErrorBox = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  // console.log("ErrorMsgs", ErrorMsgs[0])
  const formik = useFormik({
    initialValues: vendorDetails,
    validationSchema: Yup.object().shape({
      vendor: Yup.string().required("*Required"),
      vendor_code: Yup.string().required("*Required"),
      vendor_email: Yup.string().email("Enter valid email").required("*Required"),
      vendor_contact: Yup.string()
        .min(10, "Enter Valid 10 digit Number")
        .max(10, "Enter Valid 10 digit Number")
        .required("*Required"),
      vendor_gstin: Yup.string()
        .min(15, "Enter correct GST No. ")
        .max(15, "Enter correct GST No.")
        .required("*Required"),
      credit_period: Yup.number().required("*Required").typeError("Must be a Number"),
      lead_time: Yup.number().required("*Required").typeError("Must be a Number"),
      address: Yup.string().required("*Required"),
      vendor_city: Yup.string().required("*Required"),
      vendor_state: Yup.string().required("*Required"),
    }),
    onSubmit: async (data) => {
      console.log("data", data)

      if (!activeVendor) {
        await createVendorMutation(
          { ...data },
          {
            onSuccess: () => {
              toast?.current?.show(tsuccess(null, "Vendor Created successfully"))
            },
          }
        )
      } else {
        console.log(data)
        await updateVendorMutation(
          { ...data },
          {
            onSuccess: () => {
              toast?.current?.show(tsuccess("Updated", "Vendor updated successfully"))
            },
          }
        )
      }
      await refetch()
      setActiveVendor(false)
      setVendorDialog(false)
      formik.resetForm()
    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  useEffect(() => {
    initFilters()
  }, [])

  return (
    <div className="grid w-full mr-0" ref={scrollToTop}>
      {(creatingVendor || updatingVendor) && <LoaderFullScreen />}
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card flex justify-content-between mb-2  ">
          <h2 className="mb-0">Vendor</h2>
          <div className="flex">
            <Button
              icon="pi pi-plus"
              label="Add Vendors"
              className="ml-1"
              onClick={() => {
                setVendorDetails(initialVendorState)
                setVendorDialog(true)
              }}
            ></Button>
            <span className=" flex justify-content-center align-items-center">
              <FileUpload
                className="ml-2 inline-block "
                mode="basic"
                accept=".csv"
                customUpload
                maxFileSize={1000000}
                uploadHandler={(e) => onBasicUpload(e)}
                ref={clearUpload}
                onSelect={() => setBtnVisibility(true)}
                onBeforeSelect={() => setBtnVisibility(false)}
                onClear={() => setBtnVisibility(false)}
              />
              <Button
                visible={btnVisibility}
                style={{ backgroundColor: "var(--red-400)", border: "var(--red-400)" }}
                icon="pi pi-file-excel                "
                className=" ml-2"
                onClick={() => {
                  clearUpload?.current.clear()
                  setErrorProducts([])
                  setErrorMsgs([])
                }}
                tooltip="Clear the File"
                tooltipOptions={{ position: "top" }}
              />
            </span>
            <Button
              icon="pi pi-download"
              className="ml-2"
              label="CSV format"
              onClick={() => createCSVFormat(vCsvFormatDetails)}
            />
          </div>
        </div>
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
      </div>
      <div
        className={`col-12  ${
          vendorDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <div className="card p-4 mb-2 ">
          <form className="p-fluid" onSubmit={formik.handleSubmit}>
            <h4 className="mb-3">{activeVendor ? "Update " : "Create "}Vendor</h4>
            <div className="formgrid grid">
              {[
                { type: "text", label: "Name", field: "vendor" },
                { type: "text", label: "Code", field: "vendor_code" },
                { type: "email", label: "Email", field: "vendor_email" },
                { type: "text", label: "Contact Number", field: "vendor_contact" },
                { type: "text", label: "GSTIN", field: "vendor_gstin" },
                { type: "text", label: "Credit Period", field: "credit_period" },
                { type: "text", label: "Lead Time", field: "lead_time" },
                { type: "text", label: "Address", field: "address" },
              ].map((ele, i) => {
                return (
                  <div
                    key={`create-${ele.field}-${i}`}
                    className="field col-12 md:col-3 lg:col-2 mt-4"
                  >
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
              })}
              <div className="field col-12 md:col-3 lg:col-2 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="vendor_city"
                    value={formik.values.vendor_city}
                    suggestions={filteredSuggestions}
                    completeMethod={searchCities}
                    field="city"
                    onChange={async (e) => {
                      let vendor_city = typeof e.value === "string" ? e.value : e.value.city
                      let vendor_state = typeof e.value === "string" ? " " : e.value.state

                      await formik.setValues({ ...formik.values, vendor_city, vendor_state })
                    }}
                    aria-label="cities"
                    dropdownAriaLabel="Select City"
                    className={classNames({ "p-invalid": isFormFieldValid("vendor_city") })}
                  />

                  <label
                    htmlFor="vendor_city"
                    className={classNames({ "p-error": isFormFieldValid("vendor_city") })}
                  >
                    City
                  </label>
                </div>
                {getFormErrorMessage("vendor_city")}
              </div>
              <div className="field col-12 md:col-3 lg:col-2 mt-4">
                <span className="p-float-label">
                  <InputText
                    id="vendor_state"
                    value={formik.values.vendor_state}
                    className={classNames({ "p-invalid": isFormFieldValid("vendor_state") })}
                  />
                  <label
                    htmlFor="vendor_state"
                    className={classNames({ "p-error": isFormFieldValid("vendor_state") })}
                  >
                    State
                  </label>
                </span>
                {getFormErrorMessage("vendor_state")}
              </div>
            </div>
            <div className="flex justify-content-end">
              <Button type="submit" className="mr-2" label={activeVendor ? "UPDATE" : "ADD"} />
              <Button
                className="p-button-secondary"
                type="button"
                label="Cancel"
                onClick={() => {
                  formik.resetForm()
                  setActiveVendor(false)
                  setVendorDialog(false)
                  setVendorDetails(initialVendorState)
                }}
              />
            </div>
          </form>
        </div>
      </div>
      <div
        className={`col-12 ${
          errorProducts.length
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <div className="card border-primary border-2 bg-primary-reverse">
          <h6>Following are a list of failed entries: </h6>
          <ul>
            {errorProducts.map(({ rowNum, message }, index) => {
              if (rowNum)
                return (
                  <li key={"error-" + index}>
                    Row Number {rowNum}:{" "}
                    <ul>
                      <li>{message}</li>
                    </ul>
                  </li>
                )
              return (
                <li key={"error-" + index}>
                  <li>{message}</li>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="col-12">
        <div className="card">
          <DataTable
            value={vendors}
            showGridlines
            // scrollable
            // scrollHeight="60vh"
            // header={renderHeader}
            stripedRows
            className="text-s datatable-responsive"
            responsiveLayout="scroll"
            // paginator
            // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
            // rows={PAGINATION_VARIABLES.rows}
            // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
            // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
            filters={filters}
            header={header1}
            filterDisplay="menu"
          >
            {/* <Column
          field="vendor_id"
          header="Vendor ID"
          // className="text-center"
        /> */}
            <Column
              field="vendor"
              header="Vendor"
              filter
              filterPlaceholder="Search by Vendor"
              // className="text-center"
              // className="hidden"
            />
            <Column
              field="vendor_code"
              header="Code"
              filter
              filterPlaceholder="Search by Code"
              // className="text-center"
            />

            <Column
              field="vendor_email"
              header="Vendor Email"
              filter
              filterPlaceholder="Search by Email"
              // className="text-center"
            />
            <Column
              field="vendor_city"
              header="Vendor City"
              filter
              filterPlaceholder="Search by City"
              // className="text-center"
            />
            <Column
              field="vendor_state"
              header="Vendor State"
              filter
              filterPlaceholder="Search by State"
              // className="text-center"
            />
            <Column
              field="vendor_contact"
              header="Vendor Contact"
              filter
              filterPlaceholder="Search by Contact"
              // className="text-center"
            />
            <Column
              field="vendor_gstin"
              header="Vendor GSTIN"
              filter
              filterPlaceholder="Search by GSTIN No."
              // className="text-center"
            />
            <Column
              field="address"
              header="Address"
              filter
              filterPlaceholder="Search by Address"
              // className="text-center"
            />
            <Column
              field="lead_time"
              header="Lead Time"
              // className="text-center"
            />
            <Column
              field="credit_period"
              header="Credit Period"
              // className="text-center"
            />
            <Column
              field="status"
              header="Status"
              body={(rowData) => {
                console.log("rowData", rowData.status)
                return (
                  <span className={`badge status-${rowData.status ? "active" : "inactive"}`}>
                    {rowData.status ? "Active" : "Inactive"}
                  </span>
                )
              }}
              filter
              filterElement={statusFilterTemplate}
              // className="text-center"
            />
            <Column
              // field="vendor_gstin"
              header="Action"
              body={(rowData) => {
                return (
                  <div className="flex">
                    <Button
                      // label="Edit"
                      icon="pi pi-pencil"
                      className="m-1"
                      onClick={async () => {
                        setActiveVendor(true)
                        // setVendorDetails({ ...rowData })
                        await formik.setValues({ ...rowData })
                        setVendorDialog(true)
                        scrollToTop?.current.scrollIntoView()
                      }}
                    />
                    {/* <Button
                      // label="Delete"
                      disabled={false}
                      icon="pi pi-trash"
                      className="m-1"
                      onClick={async () => {
                        await deleteVendorMutation({ vendor_id: rowData.vendor_id })
                        await refetch()
                      }}
                    /> */}
                    <Button
                      // label="Delete"
                      disabled={false}
                      icon="pi pi-info-circle"
                      className="m-1"
                      onClick={async () => {
                        console.log("rowData", rowData)

                        await updateVendorMutation({
                          vendor_id: rowData.vendor_id,
                          status: rowData.status === false ? true : false,
                        })

                        await refetch()
                      }}
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

const VendorsPage = () => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Layout>
          <VendorsList />
        </Layout>
      </Suspense>
    </div>
  )
}
// *-----------------------------------------------------*
// Vendor form befor Formik
{
  /* <div className="card">
  <form
    className="p-fluid"
    onSubmit={async (e) => {
      e.preventDefault()
      console.log(vendorDetails)
      console.log("vendorDetails: ", vendorDetails)
      if (!activeVendor) {
        await createVendorMutation({
          ...vendorDetails,
        })
      } else {
        await updateVendorMutation({ ...vendorDetails })
      }
      await refetch()
      setActiveVendor(false)
      setVendorDialog(false)
    }}
  >
    <h4 className="mb-3">{activeVendor ? "Update " : "Create "}Vendor</h4>
    <div className="formgrid grid">
      {[
        { type: "text", label: "Name", field: "vendor" },
        { type: "text", label: "Code", field: "vendor_code" },
        { type: "email", label: "Email", field: "vendor_email" },
        // { type: "text", label: "City", field: "vendor_city" },
        { type: "text", label: "Contact Number", field: "vendor_contact" },
        { type: "text", label: "GSTIN", field: "vendor_gstin" },
        { type: "text", label: "Credit Period", field: "credit_period" },
        { type: "text", label: "Lead Time", field: "lead_time" },
        { type: "text", label: "Address", field: "address" },
      ].map((ele, i) => {
        return (
          <div key={`create-${ele.field}-${i}`} className="field col-12 md:col-3 lg:col-2 mt-4">
            <span className="p-float-label">
              <InputText
                id={ele.field}
                name={ele.field}
                value={vendorDetails[ele.field]}
                onChange={(e) => {
                  setVendorDetails({ ...vendorDetails, [ele.field]: e.target.value })
                }}
              />
              <label htmlFor={ele.field}>{ele.label}</label>
            </span>
          </div>
        )
      })}
      <div className="field col-12 md:col-3 lg:col-2 mt-4">
        <div className="p-float-label">
          <AutoComplete
            value={vendorDetails.vendor_city}
            suggestions={filteredSuggestions}
            completeMethod={searchCities}
            field="city"
            onChange={(e) => {
              let vendor_city = typeof e.value === typeof "s" ? e.value : e.value.city
              let vendor_state = typeof e.value === typeof "s" ? " " : e.value.state
              setVendorDetails({ ...vendorDetails, vendor_city, vendor_state })
            }}
            aria-label="cities"
            dropdownAriaLabel="Select City"
          />

          <label
          // htmlFor={ele.field}
          // className={classNames({ "p-error": isFormFieldValid("name") })}
          >
            City
          </label>
        </div>
      </div>
      <div className="field col-12 md:col-3 lg:col-2 mt-4">
        <span className="p-float-label">
          <InputText
            id="state"
            name="state"
            value={vendorDetails.vendor_state}
            onChange={(e) => {
              setVendorDetails({ ...vendorDetails, vendor_state: e.value })
            }}
          />
          <label htmlFor="state">State</label>
        </span>
      </div>
    </div>
    <div className="flex justify-content-end">
      <Button type="submit" className="mr-2" label={activeVendor ? "UPDATE" : "ADD"} />
      <Button
        className="p-button-secondary"
        type="button"
        label="Cancel"
        onClick={() => {
          setActiveVendor(false)
          setVendorDialog(false)
          setVendorDetails(initialVendorState)
        }}
      />
    </div>
  </form>
</div> */
}
// *-----------------------------------------------------*

export default VendorsPage
