import { Suspense, useEffect, useRef, useState, useReducer } from "react"
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
import { Chip } from "primereact/Chip"
import { MultiSelect } from "primereact/multiselect"
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

import {
  cities,
  filterExistingValues,
  isTrue,
  removeKeyFromObj,
  tError,
  tsuccess,
} from "app/constants"
import { createCSVFormat } from "app/constants"
import { AutoComplete } from "primereact/autocomplete"
import ErrorCard from "components/ErrorCard"
import { useFormik, Field, FieldArray, Formik, Form } from "formik"
import * as Yup from "yup"
import ErrorComponent from "components/ErrorComponent"
import LoaderFullScreen from "components/LoaderFullScreen"
import { FilterMatchMode, FilterOperator } from "primereact/api"
import { Dropdown } from "primereact/dropdown"
import createTag from "app/tags/mutations/createTag"
import { Chips } from "primereact/chips"
import { InputTextarea } from "primereact/inputtextarea"
import getTags from "app/tags/queries/getTags"
import Creatable from "react-select/creatable"
import chroma from "chroma-js"

const ITEMS_PER_PAGE = 100



export const VendorsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0

  const [{ vendors }, { refetch, error: getVendorError }] = useQuery(getVendors, {
    orderBy: { id: "desc" },
    skip: undefined,
    where: undefined,
    take: undefined
  })

  console.log("vendors", vendors)

  // let getVendorError

  const VendorAddress = (rowData) => {
    const addresses = rowData?.vendor_branches[0]?.addresses

    const addressString = `${addresses?.buildingNumber}${addresses?.landmarkName ? `, ${addresses?.landmarkName}` : ''}${addresses?.cityCountryProvince ? `, ${addresses?.cityCountryProvince}` : ''}${addresses?.state ? `, ${addresses?.state}` : ''}${addresses?.pincode ? ` - ${addresses?.pincode}` : ''}`;

    return addressString
  }

  const columns = [
    { field: "name", header: "Vendor", filter: true, filterPlaceholder: "Search bu Vendor name" },
    { field: "code", header: "Code" },
    { field: "", header: "Branch Code", body: (rowData) => rowData?.vendor_branches[0]?.branchCode },
    { field: "email", header: "Email", body: (rowData) => rowData?.vendor_branches[0]?.addresses?.emails_emails_addressesToaddresses[0]?.email },
    { field: "vendor_city", header: "City", body: (rowData) => rowData?.vendor_branches[0]?.addresses?.cityCountryProvince },
    { field: "vendor_state", header: "State", body: (rowData) => rowData?.vendor_branches[0]?.addresses?.state },
    {
      field: "vendor_state", header: "Country",
      body: (rowData) => rowData?.vendor_branches[0]?.addresses?.country_addresses_countryTocountry?.name
    },
    { field: "contact", header: "Contact", body: (rowData) => rowData?.vendor_branches[0]?.addresses?.contact_number[0]?.number },
    { field: "gstin", header: "GSTIN" },
    { field: "address", header: "Address", body: (rowData) => VendorAddress(rowData) },
    { field: "leadTime", header: "Lead Time" },
    { field: 'vendorScore', header: 'Vendor Score ' },
    { field: "creditPeriod", header: "Credit Peroid" },
    { field: "status", header: "Status" },
  ]
  // const [{ tags }, { refetch: refeatchTags }] = useQuery(getTags, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // })

  function getRandomColor() {
    // const array = [
    //   "#A1B5D8",
    //   "#B3CBB9",
    //   "#72B01D",
    //   "#E6C0E9",
    //   "#8D89A6",
    //   "#9BBEC7",
    //   "#F6E27F",
    //   "#9BBEC7",
    //   "#8491A3",
    //   "#8491A3",
    //   "#679436",
    //   "#427AA1",
    //   "#5D2E46",
    //   "#5E0035",
    //   "#005C69",
    //   "#EAC5D8",
    //   "#A9927D",
    //   "#D9F9A5",
    //   "#96C0B7",
    //   "#E43F6F",
    //   "#F56476",
    //   "#5E4352",
    //   "#50A2A7",
    //   "#E4D6A7",
    //   "#F1A208",
    //   "#06A77D",
    //   "#F0E100",
    //   "#FCFF4B",
    // ]

    const colors = tags?.map((ele) => ele.color)
    return colors[Math.floor(Math.random() * colors.length)]
  }
  let tags
  const existingTags = tags?.map((ele) => ({
    value: ele.id,
    label: ele.name,
    color: ele.color,
    // color: getRandomColor(),
  }))

  const initialVendorState = {
    name: "",
    code: "",
    vendorScore: '',
    email: "",
    contact: "",
    gstin: "",
    creditPeriod: "",
    leadTime: "",
    address: "",
    vendor_city: "",
    vendor_state: "",
    tags: [],
    status: "",
    branch_code: "",
    pincode: "",
    landmarkName: ""
    // addresses:
  }
  const styles4TagsComponent = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? "#A5B4FC" : "#040d19",
      backgroundColor: "#040d19",
      color: "white",
      opacity: state.isDisabled ? 0.4 : 1,
    }),
    menu: (baseStyles, state) => ({
      ...baseStyles,
      // borderColor: "red",
      backgroundColor: "#040d19",
    }),
    input: (baseStyles, state) => ({
      ...baseStyles,
      // borderColor: "red",
      backgroundColor: "#040d19",
      color: "white",
    }),
    // option: (baseStyles, state) => ({
    //   ...baseStyles,
    //   backgroundColor: state.isFocused ? "grey" : "#040d19",
    // }),
    placeholder: (baseStyles, state) => ({
      ...baseStyles,
      color: "rgba(255, 255, 255, 0.6)",
      zIndex: "1",
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      const color = chroma(data.color ?? "blue")

      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
            ? data.color
            : isFocused
              ? color.alpha(0.1).css()
              : undefined,
        color: isDisabled
          ? "#ccc"
          : isSelected
            ? chroma.contrast(color, "white") > 2
              ? "white"
              : "black"
            : data.color,
        cursor: isDisabled ? "not-allowed" : "default",

        ":active": {
          ...styles[":active"],
          backgroundColor: !isDisabled
            ? isSelected
              ? data.color
              : color.alpha(0.3).css()
            : undefined,
        },
      }
    },
    multiValue: (styles, { data }) => {
      const color = chroma(data.color ?? "black")
      return {
        ...styles,
        backgroundColor: color.alpha(0.1).css(),
      }
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    multiValueRemove: (styles, { data }) => ({
      ...styles,
      color: data.color,
      ":hover": {
        backgroundColor: data.color,
        color: "white",
      },
    }),
  }

  const [createVendorMutation, { error: vendorCreationError, isLoading: creatingVendor }] =
    useMutation(createVendor)
  const [updateVendorMutation, { error: vendorUpdationError, isLoading: updatingVendor }] =
    useMutation(updateVendor)

  const [createTags] = useMutation(createTag)

  const [deleteVendorMutation] = useMutation(deleteVendor)
  const [vendorDialog, setVendorDialog] = useState(false)
  const [vendorDetails, setVendorDetails] = useState(initialVendorState)
  const [errorProducts, setErrorProducts] = useState([])
  const [activeVendor, setActiveVendor] = useState(false)
  console.log("activeVendor", activeVendor)
  const [activeVendorData, setActiveVendorData] = useState({})
  const [vendorEditState, setVendorEditState] = useState(false)
  const [activeRowData, setActiveRowData] = useState({})
  const [productEditState, setProductEditState] = useState(false)
  const [productDialog, setProductDialog] = useState(false)
  const scrolToTop = useRef<HTMLDivElement>(null)
  const [showData, setShowData] = useState([])
  const [selectedColumns, setSelectedColumns] = useState([])
  console.log('selectedColumns: ', selectedColumns);

  const onColumnToggle = (event) => {
    let selectedColumns = event.value
    let orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some((sCol) => sCol.field === col.field)
    )
    setSelectedColumns(orderedSelectedColumns)
  }


  const [selectedStatus, setSelectedStatus] = useState(null);
  const StatusCheck = [
    { name: 'Active' },
    { name: 'Inactive' },
  ];

  const header = (
    <div style={{ textAlign: "left" }}>
      <MultiSelect
        value={selectedColumns}
        // options={columns}
        options={columns.map(({ header, field }) => ({
          label: header,
          value: field
        }))}
        // optionLabel="header"
        // onChange={onColumnToggle}
        // onChange={(e) => {
        //   setSelectedColumns(e.value)
        //   console.log("e.value", "e.value");
        // }}
        style={{ width: "20em" }}
      />
    </div>
  )

  // const columnComponents = selectedColumns.map((col) => {
  //   return (
  //     <Column
  //       key={col.field}
  //       field={col.field}
  //       header={col.header}
  //       body={col.body}
  //       filter
  //       filterPlaceholder="Search...."
  //     />
  //   )
  // })

  const columnComponents = columns.reduce((acc, curr) => {
    if (selectedColumns.includes(curr.field))
      return [
        ...acc,
        <Column
          key={curr.field}
          field={curr.field}
          header={curr.header}
          body={curr.body}
          filter={curr.filter}
          filterPlaceholder={curr?.filterPlaceholder}
        // className={curr.field === "address" ? "tooltip-pr" : null}
        />
      ];
    return acc;
  }, []);

  useEffect(() => {

    const defaultColumns = columns.filter(col => !["creditPeriod"].includes(col.field)).map(col => col.field)
    setSelectedColumns(defaultColumns)
  }, [])

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

      name: {
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
    return (
      <span className={`badge status-${option ? "active" : "inactive"}`}>
        {option ? "Active" : "Inactive"}
      </span>
    )
  }

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <MultiSelect
          value={selectedColumns}
          // options={columns}
          options={columns.map(({ header, field }) => ({
            label: header,
            value: field
          }))}
          // optionLabel="header"
          // onChange={onColumnToggle}
          onChange={(e) => setSelectedColumns(e.value)}
          style={{ width: "20em" }}
        />
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
        </div>
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

  const [createNewVendors] = useMutation(createVendor)
  const [updateActiveVender] = useMutation(updateVendor)


  const formik = useFormik({
    initialValues: vendorDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required"),
      // vendor_email: Yup.string().email("Enter valid email").required("*Required"),
      // vendor_contact: Yup.string()
      //   .min(10, "Enter Valid 10 digit Number")
      //   .max(10, "Enter Valid 10 digit Number")
      //   .required("*Required"),
      // vendor_gstin: Yup.string().min(15, "Enter correct GST No. ").max(15, "Enter correct GST No."),

      // address: Yup.string().required("*Required"),
      // vendor_city: Yup.string().required("*Required"),
      // vendor_state: Yup.string().required("*Required"),
    }),

    onSubmit: async (data) => {
      console.log("formData", data)
      console.log('activeVendorData: ', activeVendorData);

      const {
        id: activeVendorId,
        //   vendor_branches: [{ id: vendorBranchId, address: addressId }]
      } = activeVendorData 

      const { name, code, vendorScore, contact, creditPeriod, leadTime, gstin, email, address, vendor_city
        , vendor_state, branch_code, landmarkName, pincode, status } = data


      if (activeVendor) {
        // const vendor_branches = {
        //   update: [
        //     {
        //       where: {
        //         id: vendorBranchId,
        //       },
        //       data: {
        //         branchCode: branch_code,
        //         // addresses: {
        //         //   update: {
        //         //     where: {
        //         //       id: addressId
        //         //     },
        //         //     data: {
        //         //       areaStreet: address,
        //         //       landmarkName,
        //         //       cityCountryProvince: vendor_city,
        //         //       state: vendor_state,
        //         //       pincode,
        //         //       country: 1,
        //         //     }
        //         //   },
        //         // }

        //       }
        //     }
        //   ],
        // }

        try {
          await updateActiveVender({
            id: activeVendorId,
            name,
            code,
            gstin,
            creditPeriod: parseInt(creditPeriod),
            leadTime: parseInt(leadTime),
            status: status?.name,
            vendorScore: parseInt(vendorScore),
            // vendor_branches,

          }, {
            onSuccess: async () => {
              toast?.current?.show(tsuccess("Updtaed", "Vendor Updated"))
              await refetch()
              setVendorDialog(false)
              setActiveVendor(false)
            },
            onError: (data) => {
              console.log(data, 'dataError')
            }
          }
          )
        } catch (err) {
          alert('error+++')
          console.log(err, 'err')
        }
      } else {
        try {

          const mail = {
            create: [
              {
                email
              },
            ],
          }

          const contact_number = {
            create: [
              {
                type: "mobile",
                number: contact,
              },
            ],
          }



          const vendor_branches = {
            create: [
              {
                branchCode: branch_code,
                addresses: {
                  create: {
                    // buildingNumber: "1",
                    areaStreet: address,
                    landmarkName,
                    cityCountryProvince: vendor_city,
                    state: vendor_state,
                    pincode,
                    country: 1,
                    emails_emails_addressesToaddresses: mail,
                    contact_number,
                  },
                },
              },
            ],
          }


          const vendor = await createVendorMutation({
            name,
            code,
            gstin,
            creditPeriod: parseInt(creditPeriod),
            leadTime: parseInt(leadTime),
            status: status?.name,
            vendorScore: parseInt(vendorScore),
            vendor_branches,
          }, {
            onSuccess: async () => {

              setVendorDialog(false)
              formik.resetForm()
              await refetch()

              setVendorDialog(false)
              setVendorEditState(false)

            },
            onError: () => {
              toast?.current?.show(tError(null, "Could not create Vendor"))
            }
          })
        } catch (error) {
          console.log("vendorCreationError ", error)
        }
      }
    },
  })

  console.log('formik.errors: ', formik.errors);
  console.log('formik.values: ', formik.values);



  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

  useEffect(() => {
    initFilters()
  }, [])

  console.log("formik values", formik.values)

  {
    /*  for multiple inputs */
  }
  const [inputs, setInputs] = useState([{ id: 1, value: "" }])
  const [nextId, setNextId] = useState(2)
  console.log(inputs, "inputs")

  const handleAddInput = () => {
    const lastInput: any = inputs[inputs.length - 1]
    if (lastInput.value !== "") {
      const newInputs = [...inputs, { id: nextId, value: "" }]
      setInputs(newInputs)
      setNextId(nextId + 1)
    }
  }

  const handleInputChange = (id, value) => {
    const newInputs = inputs.map((input) => {
      if (input.id === id) {
        return { id, value }
      }
      return input
    })
    setInputs(newInputs)
  }
  {
    /* finish function for multiple inputs  */
  }

  const contactInfo = inputs.map((ele, i) => ({
    number: ele,
    id: i + 1,
  }))

  console.log("formik", formik.errors)

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
              onClick={async () => {

                setVendorDetails(initialVendorState)
                setVendorDialog(true)
                setVendorEditState(true)
              }}
            ></Button>
            {/* <span className=" flex justify-content-center align-items-center">
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
            /> */}
          </div>
        </div>
        {!errorProducts.length &&
          ErrorMsgs.map((ele, i) => (
            <ErrorCard ErrorMsgs={ele} closeErrorBox={removeErrorBox} value={i} key={i} />
          ))}
      </div>

      <div
        className={`col-12  ${vendorDialog
          ? "visible scalein animation-duration-200"
          : "hidden scaleout animation-duration-200"
          }`}
      >
        <div className="card p-4 mb-2 ">

          <form className="p-fluid" onSubmit={formik.handleSubmit}>

            <div className="mb2 flex justify-content-between">
              <h4 className="mb0 align-self-center">
                {<span>{activeVendor ? "Update " : "Create "}</span>}
                Vendor Details
              </h4>
              {activeVendor && (
                <div>
                  <Button
                    // label="Edit"
                    icon="pi pi-pencil"
                    className="m-1"
                    onClick={async (e) => {
                      e.preventDefault()
                      setActiveVendor(true)
                      setVendorEditState(!vendorEditState)
                    }}
                    tooltip="Edit Form"
                    tooltipOptions={{ position: "top" }}
                  />

                </div>
              )}
            </div>

            <div className="formgrid grid">
              {[
                { type: "text", label: "Name", field: "name" },
                { type: "text", label: "Code", field: "code" },
                { type: "text", label: "BranchCode", field: "branch_code" },
                { type: "text", label: "Vendor Score", field: "vendorScore" },
                { type: "email", label: "Email", field: "email" },
                { type: "text", label: "Contact Number", field: "contact" },
                { type: "text", label: "GSTIN", field: "gstin" },
                { type: "text", label: "Credit Period", field: "creditPeriod" },
                { type: "text", label: "Lead Time", field: "leadTime" },
                { type: "text", label: "Address", field: "address" },
                { type: "text", label: "Landmark", field: "landmarkName" },
                { type: "text", label: "pincode", field: "pincode" },
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
                        disabled={!vendorEditState}
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
                    disabled={!vendorEditState}
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
                    disabled={!vendorEditState}
                    onChange={formik.handleChange}
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
              <div className="field col-12 md:col-3 lg:col-2 mt-4">
                <span className="p-float-label">
                  <Dropdown
                    id="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    options={StatusCheck}
                    optionLabel="name"
                    disabled={!vendorEditState}
                    placeholder="Status" className="w-full md:w-14rem" />
                  <label
                    htmlFor="status"
                    className={classNames({ "p-error": isFormFieldValid("status") })}
                  >
                    Status
                  </label>
                </span>
                {getFormErrorMessage("status")}
              </div>


              {/* <div className="mt-4">
                <Dropdown
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.value)}
                  options={StatusCheck} optionLabel="name"
                  placeholder="Status" className="w-full md:w-14rem" />
              </div> */}
              {/* <div className="field col-12  mt-4">
                <div className="p-float-label">
                  <Creatable
                    classNamePrefix="tags"
                    styles={styles4TagsComponent}
                    isMulti
                    options={existingTags}
                    onChange={async (value) => {
                      await formik.setValues({ ...formik.values, tags: value })
                    }}
                    value={formik.values.tags}
                    // placeholder="Tags"
                    isDisabled={!vendorEditState}
                  />

                  <label htmlFor="tags" style={{ transform: "translateY(-230%)" }}>
                    Tags
                  </label>
                </div>
              </div> */}
            </div>


            <div className="flex justify-content-end">
              {vendorEditState && (
                <Button
                  type="submit"
                  className="mr-2"
                  label={activeVendor ? "UPDATE" : "SUBMIT"}
                />
              )}
              <Button
                className="p-button-secondary flex-grow-0"
                style={{ maxWidth: "50%" }}
                type="button"
                label="CANCEL"
                onClick={() => {
                  formik.resetForm()
                  setActiveVendor(false)
                  setVendorDialog(false)
                  setVendorDetails(initialVendorState)
                  setVendorEditState(false)
                }}
              />
            </div>
          </form>
        </div>
      </div>

      <div
        className={`col-12 ${errorProducts.length
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

      <div>{showData}</div>

      <div className="col-12">
        <div className="card">
          <DataTable
            value={vendors}
            showGridlines
            stripedRows
            className="text-s datatable-responsive"
            responsiveLayout="scroll"
            filters={filters}
            header={header1}
            filterDisplay="menu"
            onRowClick={async (e) => {

              const sampleform = {
                "name": "varun",
                "code": "XC",
                "vendorScore": "1",
                "email": "sacasdcas",
                "contact": "41324",
                "gstin": "fdasf423",
                "creditPeriod": "34",
                "leadTime": "34",
                "address": "zffszfds",
                "vendor_city": "Banganapalle",
                "vendor_state": "Andhra Pradesh",
                "tags": [],
                "status": {
                  "name": "Active"
                },
                "branch_code": "CX",
                "pincode": "fdsfdsf",
                "landmarkName": "dgsfd"
              }
              setActiveVendorData({ ...e.data })
              console.log("onrowclick", e.data)
              setVendorDialog(true)
              setActiveVendor(true)
              const rowObj = {
                "id": 166,
                "name": "vega",
                "code": "VG001",
                "gstin": "4142586967",
                "creditPeriod": 12,
                "leadTime": 11,
                "status": "Active",
                "vendorScore": 1,
                "vendor_products": [],
                "vendor_branches": [
                  {
                    "id": 27,
                    "branchCode": "VGA",
                    "address": 608,
                    "vendor": 166,
                    "addresses": {
                      "id": 608,
                      "buildingNumber": null,
                      "areaStreet": "#22 /1 lorem ipsum",
                      "landmarkName": "Egg Head",
                      "cityCountryProvince": "Bapatla",
                      "state": "Andhra Pradesh",
                      "pincode": "14258635",
                      "country": 1,
                      "contact_number": [
                        {
                          "id": 400,
                          "type": "mobile",
                          "number": "9785641356",
                          "address": 608
                        }
                      ],
                      "emails_emails_addressesToaddresses": [
                        {
                          "id": 132,
                          "email": "vga@gmail.com",
                          "addresses": 608
                        }
                      ],
                      "country_addresses_countryTocountry": {
                        "id": 1,
                        "name": "India"
                      }
                    }
                  }
                ]
              }

              const {
                status: vendorStatus,
                vendor_branches: [{
                  branchCode,
                  addresses: {
                    areaStreet,
                    landmarkName,
                    pincode,
                    cityCountryProvince,
                    state,
                    contact_number: [{ number }],
                    emails_emails_addressesToaddresses: [{ email: _mail }]
                  }
                }],
              } = e.data

              await formik.setValues({
                ...e.data,
                branch_code: branchCode,
                email: _mail,
                contact: number,
                address: areaStreet,
                landmarkName: landmarkName,
                pincode,
                vendor_city: cityCountryProvince,
                vendor_state: state,
                status: {
                  name: vendorStatus
                }

              })
              scrollToTop?.current.scrollIntoView()
            }}
          >
            {columnComponents}

            {/* <Column
              field="status"
              header="Status"
              body={(rowData) => {
                return (
                  <span className={`badge status-${rowData.status ? "active" : "inactive"}`}>
                    {rowData.status ? "Active" : "Inactive"}
                  </span>
                )
              }}
              filter
              filterElement={statusFilterTemplate}
            // className="text-center"
            /> */}
          </DataTable>
        </div>
      </div>

      {/* <div className="col-12">
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
            onRowClick={async (e) => {
              setActiveVendorData({ ...e.data })
              const tags = e.data.vendor_tags.map(({ tags }, i) => ({
                value: tags.id,
                label: tags.name,
                color: tags.color,
              }))
              console.log("tags", e.data)
              setVendorDialog(true)
              setActiveVendor(true)
              console.log(e.data)
              await formik.setValues({
                ...e.data,
                tags,
              })
              scrollToTop?.current.scrollIntoView()
            }}
          >
            <Column
          field="vendor_id"
          header="Vendor ID"
          // className="text-center"
        /> 
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
                // console.log("rowData", rowData.status)
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
              header="Action"
              body={(rowData) => {
                return (
                  <div className="flex">
                    <Button
                      icon="pi pi-pencil"
                      className="m-1"
                      onClick={async () => {
                        setActiveVendor(true)

                        await formik.setValues({ ...rowData })
                        setVendorDialog(true)
                        scrollToTop?.current.scrollIntoView()
                      }}
                    />

                    <Button
                      // label="Delete"
                      disabled={false}
                      icon="pi pi-info-circle"
                      className="m-1"
                      onClick={async () => {
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
            />
           </DataTable>
        </div> 
       </div>   */}
    </div >
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

export default VendorsPage
