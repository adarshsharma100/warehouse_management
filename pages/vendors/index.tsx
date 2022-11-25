import { Suspense, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getVendors from "app/vendors/queries/getVendors"
import Layout from "layouts/Layout"
import { Button } from "primereact/button"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Dialog } from "primereact/dialog"
import classNames from "classnames"
import { InputText } from "primereact/inputtext"
import { useFormik } from "formik"
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
const ITEMS_PER_PAGE = 100

export const VendorsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ vendors, hasMore }, { refetch }] = usePaginatedQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  // const [mutation_function] = useQuery(getMutations_functions, { name:""})
  console.log("vendors: ", vendors)
  const [createVendorMutation] = useMutation(createVendor)
  const [updateVendorMutation] = useMutation(updateVendor)
  const [deleteVendorMutation] = useMutation(deleteVendor)
  const [vendorDialog, setVendorDialog] = useState(false)
  const [vendorDetails, setVendorDetails] = useState({
    vendor_code: "",
    // vendor_sku: "",
    vendor_email: "",
    vendor_city: "",
    vendor_contact: "",
    vendor_gstin: "",
    vendor: "",
    address: "",
    credit_period: "",
    lead_time: "",
  })
  console.log("vendorDetails: ", vendorDetails)
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

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      date: null,
      country: null,
      accept: false,
    },
    validate: (data) => {
      let errors: any = {}

      if (!data.name) {
        errors.name = "Name is required."
      }

      if (!data.email) {
        errors.email = "Email is required."
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
        errors.email = "Invalid email address. E.g. example@email.com"
      }

      if (!data.password) {
        errors.password = "Password is required."
      }

      if (!data.accept) {
        errors.accept = "You need to agree to the terms and conditions."
      }

      return errors
    },
    onSubmit: (data) => {
      // setFormData(data)
      // setShowMessage(true)

      formik.resetForm()
    },
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }
  const onBasicUpload = async (e) => {
    console.log("FileUpload", e)
    // await papa.parse(e.files[0], (data) => {
    //   console.log("FileUpload", data)
    // })
    const csv = [] // this will contain all the data of imported csv file
    papa.parse(e.files[0], {
      header: true,
      step: function (result) {
        csv.push(result.data)
      },
      complete: async function (results, file) {
        console.log("Complete", csv.length, "records.  ", results, "csvVendor", csv)
        csv.pop() // to remove the last index value from csv (empty object)
        const finalResults = csv.map(async (el) => {
          console.log("testing", el)

          // checking for null values
          let flag = true // flag true means we are ready to call vendor mutation and vice-versa
          let a = {}

          // function to validate the csv file
          const checkError = () => {
            let errors = " " // this will contain all the error

            // checking if the vendor code, vendor email and vendor gstin are unique or not
            vendors.forEach(({ vendor_code, vendor_email, vendor_gstin }) => {
              vendor_code.toString() === el["vendor_code"].toString()
                ? (errors += "vendor_code should be unique. ")
                : ""
              vendor_email.toString() === el["vendor_email"].toString()
                ? (errors += "vendor_email should be unique. ")
                : ""
              vendor_gstin.toString() === el["vendor_gstin"].toString()
                ? (errors += "vendor_gstin should be unique. ")
                : ""
            })

            // checking for null values
            Object.keys(el).forEach((e) => {
              if (!el[e]) {
                errors += `${e} is empty. `
              }
            })

            // destructuring el
            const {
              vendor,
              vendor_city,
              vendor_code,
              vendor_contact,
              vendor_email,
              vendor_gstin,
              address,
              credit_period,
              lead_time,
            } = el

            let a = {
              vendor,
              vendor_city,
              vendor_code,
              vendor_contact,
              vendor_email,
              vendor_gstin,
              address,
              credit_period,
              lead_time,
              error: errors,
            }

            return a
          }

          // if any of the column is empty in csv file
          Object.keys(el).forEach((e) => {
            if (!el[e]) {
              flag = false
              a = checkError()
            }
          })

          try {
            // flag && const adminsEmails = await createVendorMutation(el)
            if (flag) {
              const adminsEmails = await createVendorMutation(el)
              if (adminsEmails.adminsEmails.length > 0) {
                const data = JSON.stringify({
                  to: adminsEmails.adminsEmails,
                  subject: "testing",
                  message: "Hey!! I don't know the message.",
                })
                var config = {
                  method: "post",
                  url: "http://localhost:3000/api/vendor",
                  headers: {
                    "Content-Type": "application/json",
                    // Cookie:
                    //   "industrial-poc_sAnonymousSessionToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJibGl0empzIjp7ImlzQW5vbnltb3VzIjp0cnVlLCJoYW5kbGUiOiJqckZqQ2MwblE5UEVvYV92d25teEs3WGU0bjRoeDhySTphand0IiwicHVibGljRGF0YSI6eyJ1c2VySWQiOm51bGx9LCJhbnRpQ1NSRlRva2VuIjoiZGRWaTNNU1M3WE1GLWlBS1E5YTFJRmtkWnJMdThfWlUifSwiaWF0IjoxNjY0NzcyNTk2LCJhdWQiOiJibGl0empzIiwiaXNzIjoiYmxpdHpqcyIsInN1YiI6ImFub255bW91cyJ9.tn2TauSX_KSb4BbavfsXnOkn_m1fe_x0UCx8woCYZdk; industrial-poc_sAntiCsrfToken=ddVi3MSS7XMF-iAKQ9a1IFkdZrLu8_ZU; industrial-poc_sPublicDataToken=eyJ1c2VySWQiOm51bGx9",
                  },
                  data: data,
                }

                // uncomment it when you need

                // axios(config)
                //   .then(function (response) {
                //     console.log("response: ", response)
                //     console.log(JSON.stringify(response.data))
                //   })
                //   .catch(function (error) {
                //     console.log(error)
                //   })
              }
            }
            flag && (await refetch())
            return a
          } catch (error) {
            console.log("error: ", error)
            return checkError()
          }
        })
        let failedCsv = await Promise.all(finalResults)

        // removing the empty object from failedCsv
        failedCsv = failedCsv.filter((ele) => {
          return Object.getOwnPropertyNames(ele).length !== 0
        })

        console.log("failedCsv: ", failedCsv)

        // exporting failed csv file as downloadable
        const columns = {
          vendor: "vendor",
          vendor_city: "vendor_city",
          vendor_code: "vendor_code",
          vendor_contact: "vendor_contact",
          vendor_email: "vendor_email",
          vendor_gstin: "vendor_gstin",
          address: "address",
          credit_period: "credit_period",
          lead_time: "lead_time",
          error: "error",
        }
        await downloadCsv(failedCsv, columns, "failed vendors")
      },
    })
  }
  return (
    <div>
      <Dialog
        header="Add Vendors"
        // visible={vendorDialog}
        style={{ width: "50vw" }}
        // footer={renderFooter}
        onHide={() => setVendorDialog(false)}
      >
        <form
          // onSubmit={formik.handleSubmit}
          onSubmit={async () => {
            if (!activeVendor) {
              await createVendorMutation({
                ...vendorDetails,
              })
              // const rules=mutation_function.filter(({name})=>{
              //       return name=="createVendor"
              //     })[0].id
            } else {
              await updateVendorMutation({ ...vendorDetails })
            }
            await refetch()
            setActiveVendor(false)
          }}
          className="p-fluid"
        >
          <div className="formgrid grid">
            {[
              { type: "text", label: "Vendor", field: "vendor" },
              { type: "text", label: "Vendor Code", field: "vendor_code" },
              // { type: "text", label: "Vendor SKU", field: "vendor_sku" },
              { type: "email", label: "Vendor Email", field: "vendor_email" },
              { type: "text", label: "Vendor City", field: "vendor_city" },
              { type: "text", label: "Vendor Contact", field: "vendor_contact" },
              { type: "text", label: "Vendor GSTIN", field: "vendor_gstin" },
              { type: "text", label: "Address", field: "address" },
              { type: "text", label: "Credit Period", field: "credit_period" },
              { type: "text", label: "Lead Time", field: "lead_time" },
            ].map((ele, i) => {
              return (
                <div key={`${ele.field}${i}`} className="field col-6 mt-4">
                  <span className="p-float-label">
                    <InputText
                      id={ele.field}
                      name={ele.field}
                      value={vendorDetails[ele.field]}
                      onChange={(e) => {
                        setVendorDetails({ ...vendorDetails, [ele.field]: e.target.value })
                      }}
                      // value={formik.values.name}
                      // onChange={formik.handleChange}
                      // value=
                      autoFocus
                      // className={classNames({ "p-invalid": isFormFieldValid("name") })}
                    />
                    <label
                      htmlFor={ele.field}
                      className={classNames({ "p-error": isFormFieldValid("name") })}
                    >
                      {ele.label}
                    </label>
                  </span>
                  {/* {getFormErrorMessage("name")} */}
                </div>
              )
            })}
          </div>
          <div className="flex justify-content-end">
            <Button type="submit" className="mr-2 mt-2" label="ADD" />
          </div>
        </form>
      </Dialog>
      <h2>Vendor List</h2>
      <div className="flex justify-content-end mb-2 ">
        <FileUpload
          mode="basic"
          accept=".csv"
          customUpload
          // name="demo[]"
          // url="https://primefaces.org/primereact/showcase/upload.php"
          // accept="image/*"
          maxFileSize={1000000}
          uploadHandler={(e) => onBasicUpload(e)}
          // onUpload={(e) => onBasicUpload(e)}
        />
        <Button
          icon="pi pi-plus"
          label="Add Vendors"
          className="ml-1"
          onClick={() => {
            setVendorDetails({
              vendor_code: "",
              // vendor_sku: "",
              vendor_email: "",
              vendor_city: "",
              vendor_contact: "",
              vendor_gstin: "",
              vendor: "",
            })
            setVendorDialog(!vendorDialog)
          }}
        ></Button>
      </div>
      <div
        className={`card ${
          vendorDialog
            ? "visible scalein animation-duration-200"
            : "hidden scaleout animation-duration-200"
        }`}
      >
        <VendorForm />
      </div>
      <DataTable
        value={vendors}
        showGridlines
        // scrollable
        // scrollHeight="60vh"
        // header={renderHeader}
        stripedRows
        className="text-s datatable-responsive"
        // paginator
        // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
        // rows={PAGINATION_VARIABLES.rows}
        // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
        // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
      >
        {/* <Column
          field="vendor_id"
          header="Vendor ID"
          // className="text-center"
        /> */}
        <Column
          field="vendor"
          header="Vendor"
          // className="text-center"
        />
        <Column
          field="vendor_code"
          header="Vendor Code"
          // className="text-center"
        />
        {/* <Column
          field="vendor_sku"
          header="Vendor Sku"
          // className="text-center"
        /> */}
        <Column
          field="vendor_email"
          header="Vendor Email"
          // className="text-center"
        />
        <Column
          field="vendor_city"
          header="Vendor City"
          // className="text-center"
        />
        <Column
          field="vendor_contact"
          header="Vendor Contact"
          // className="text-center"
        />
        <Column
          field="vendor_gstin"
          header="Vendor GSTIN"
          // className="text-center"
        />
        <Column
          field="address"
          header="Address"
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
          // field="vendor_gstin"
          header="Action"
          body={(rowData) => {
            return (
              <div>
                <Button
                  // label="Edit"
                  icon="pi pi-pencil"
                  className="m-1"
                  onClick={() => {
                    setActiveVendor(true)
                    setVendorDetails({ ...rowData })
                    setVendorDialog(true)
                  }}
                />
                <Button
                  // label="Delete"
                  disabled={false}
                  icon="pi pi-trash"
                  className="m-1"
                  onClick={async () => {
                    await deleteVendorMutation({ vendor_id: rowData.vendor_id })
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
