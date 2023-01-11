import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
// import Layout from "app/core/layouts/Layout"
import getPurchase_order from "app/purchase_orders/queries/getPurchase_order"
import deletePurchase_order from "app/purchase_orders/mutations/deletePurchase_order"
import Loading from "components/loading"
import Layout from "layouts/Layout"
import getGrns from "app/grns/queries/getGrns"
import moment from "moment"
import getVendors from "app/vendors/queries/getVendors"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Accordion, AccordionTab } from "primereact/accordion"
import { TabPanel, TabView } from "primereact/tabview"
import getPrefixes from "app/prefixes/queries/getPrefixes"
import Invoice from "components/Invoice"
import { Button } from "primereact/button"
import Grn from "components/Grn"
import createGrn from "app/grns/mutations/createGrn"

export const Purchase_order = () => {
  const router = useRouter()
  const purchase_orderId = useParam("purchase_orderId", "number")
  console.log("purchase_orderId", purchase_orderId)
  // const [deletePurchase_orderMutation] = useMutation(deletePurchase_order)
  const [purchase_order] = useQuery(getPurchase_order, {
    po_id: purchase_orderId,
  })
  const [{ vendors }, { error: getVenorsError }] = useQuery(getVendors, {
    orderBy: { vendor_id: "asc" },
  })
  const [{ grns }, { refetch: refetchGrn }] = useQuery(getGrns, {
    orderBy: { grn_id: "asc" },
  })
  const [{ prefixes }, { error: getPrefixesError }] = useQuery(getPrefixes, {
    orderBy: { id: "asc" },
  })
  const [createGrnMutation, { error: grnCreationError }] = useMutation(createGrn)

  const findVendor = (id) => vendors.find((ele, i) => (ele.vendor_id = id)).vendor

  const {
    po_id,
    po_type,
    updated_on,
    approved_on,
    created_at,
    from_party,
    expiry_date,
    expected_delivery,
    agreement,
    purchase_order_status_pos_id,
    vendor_vendor_id,
    po_description,
    po_code,
    rfq_id,
    grn_grn_id,
    agreement_status,
    purchase_order_products,
  } = purchase_order

  const currentGrn = grns?.filter((ele) => ele.grn_id === grn_grn_id)[0]

  return (
    <>
      <Head>
        <title>{po_code}</title>
      </Head>

      <div>
        <h1>{po_code}</h1>
        <div className="lg:flex m-3 p-1 border-1 border-round border-primary">
          <section className="lg:w-3 p-3 m-2 border-1 border-round border-primary">
            <h3 className="text-center">Details</h3>
            <div className="flex flex-column justify-content-center text-lg">
              {[
                { field: "Code", value: po_code },
                { field: "Description", value: po_description },
                { field: "From Party", value: from_party },
                { field: "Expected Delivery", value: expected_delivery },
                { field: "Expiry Date", value: expiry_date },
                { field: "Agreement", value: agreement_status || `-` },
                { field: "Vendor", value: findVendor(vendor_vendor_id) },
              ].map((ele, i) => (
                <div className="grid align-items-center py-2" key={i}>
                  <p className="flex-1 m-0">{ele.field}</p>
                  <span>: &nbsp; </span>
                  <p className="flex-1">
                    {typeof ele.value === "string"
                      ? ele.value
                      : moment(ele.value).format("DD-MM-YYYY, HH:MM")}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="flex-1 p-3 m-2 border-1 border-round border-primary  ">
            <h3 className="text-center">Products</h3>
            <div className="">
              <DataTable
                value={purchase_order_products}
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
                  field="pop_id"
                  header="ID"
                  // className="text-center"
                />
                <Column
                  field="vendor_products.products.products_sku"
                  header="Product SKU"
                  // className="text-center"
                />

                <Column
                  field="vendor_products.products.name"
                  header="Name"
                  // className="text-center"
                />
                <Column
                  field="price_per_unit"
                  header="Price / Unit"
                  // className="text-center"
                />
                <Column
                  field="quantity"
                  header="Quantity"
                  // className="text-center"
                />
              </DataTable>
            </div>
          </section>
        </div>

        <Accordion className="px-3">
          <AccordionTab header="Invoice I">
            <TabView>
              <TabPanel header="  Invoice">
                <Invoice
                  currentGrn={currentGrn}
                  prefixes={prefixes}
                  poDetails={purchase_order}
                  refetch={refetchGrn}
                />
              </TabPanel>
              <TabPanel header="GRN">
                {!currentGrn && (
                  <div className="flex justify-content-center pt-3 flex-column">
                    <p className="m-auto mb-3 text-xl">
                      GRN not yet created for this PO yet, you can create it using below button.
                    </p>
                    <Button
                      className="m-auto mb-3"
                      icon="pi pi-plus"
                      label="Create GRN"
                      onClick={async () => {
                        try {
                          const newgrn = await createGrnMutation({
                            grn_batch_code: `GRN-4-${po_code}`,
                            purchase_order: {
                              connect: {
                                po_id,
                              },
                            },
                          })
                        } catch (error) {
                          console.log("createGrnMutation", error)
                        }

                        await refetchGrn()
                        console.log("refeatched")
                      }}
                    ></Button>
                  </div>
                )}
                {currentGrn && (
                  <Grn
                    currentGrn={currentGrn}
                    prefixes={prefixes}
                    poDetails={purchase_order}
                    refetch={refetchGrn}
                  />
                )}
              </TabPanel>
            </TabView>
          </AccordionTab>
          <AccordionTab header="Invoice II">Content II</AccordionTab>
          <AccordionTab header="Invoice III">Content III</AccordionTab>
        </Accordion>

        {/* <pre>{JSON.stringify(purchase_order, null, 2)}</pre> */}
      </div>
    </>
  )
}

const ShowPurchase_orderPage = () => {
  return (
    // <div>
    //   <p>
    //     <Link href={Routes.Purchase_ordersPage()}>
    //       <a>Purchase_orders</a>
    //     </Link>
    //   </p>

    <Suspense fallback={<Loading />}>
      <Layout>
        <Purchase_order />
      </Layout>
    </Suspense>
    // </div>
  )
}

// ShowPurchase_orderPage.authenticate = true
// ShowPurchase_orderPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowPurchase_orderPage
