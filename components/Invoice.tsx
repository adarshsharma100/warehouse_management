import moment from "moment"

import { useMutation, useQuery } from "@blitzjs/rpc"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import createGrn from "app/grns/mutations/createGrn"
import getGrns from "app/grns/queries/getGrns"

function Invoice({ currentGrn, prefixes, poDetails, refetch, setFetchGrn }) {
  const { po_id, po_code, purchase_order_products, vendor } = poDetails

  const [{ grns }, { error: getGrnsError, refetch: refetchGrn }] = useQuery(getGrns, {
    orderBy: { grn_id: "asc" },
  })
  const [createGrnMutation] = useMutation(createGrn)

  // console.log("poDetails", poDetails)

  //   const [grnDetails, setGrnDetails] = useState({
  //     grn_id: "",
  //     grn_batch_code: "",
  //     grn_status: "",
  //     created_on: "",
  //     grn_desc: "",
  //     grn_status_id: "",
  //   })

  return (
    <>
      <div className="formgrid grid mt-3 card " style={{ backgroundColor: "#05101e" }}>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong> Vendor :</strong>
          </p>
          <p>{vendor}</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong> Invoice No :</strong>
          </p>
          <p>ABCD567</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Terms/Agreement :</strong>
          </p>
          <p>Regarding payment</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Created On :</strong>
          </p>
          {/* {currentGrn && <p>{moment(currentGrn?.created_on).format("DD-MM-YYYY")}</p>} */}
          <p>14-12-2022</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Delivered On :</strong>
          </p>
          {/* {currentGrn && <p>{moment(currentGrn?.created_on).format("DD-MM-YYYY")}</p>} */}
          <p>-</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Description :</strong>
          </p>
          <p>{currentGrn?.grn_desc}</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Status :</strong>
          </p>
          <p>Waiting_For_Approval</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Contact Person :</strong>
          </p>
          <p>User 1</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Value in Rs. :</strong>
          </p>
          <p>14,256</p>
        </div>
      </div>
      <div>
        <div className="flex justify-content-between">
          <h5>Items</h5>
          <span>
            {/* <Button className="mr-3" label="Create GRN" onClick={async () => {}} /> */}
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
                        po_id: po_id,
                      },
                    },
                  })
                } catch (error) {
                  console.log("createGrnMutation", error)
                }
                await refetch()
                console.log("refeatched")
              }}
            ></Button>
          </span>
        </div>
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
            field="vendor_products.vendor_sku"
            header="Vendor-SKU"
            // className="text-center"
          />

          <Column
            field="vendor_products.products.name"
            header="Product"
            // className="text-center"
          />
          <Column
            field="vendor_products.products.description"
            header="Description"
            // className="text-center"
          />
          <Column
            field="quantity"
            header="Qty."
            // className="text-center"
          />
          <Column
            field="price_per_unit"
            header="Price"
            // className="text-center"
          />
          <Column
            // field=""
            header="Total"
            body={(rowData) => {
              const { quantity, price_per_unit } = rowData
              console.log("rowData", rowData)
              return quantity * price_per_unit
            }}
            // className="text-center"
          />
        </DataTable>
      </div>
    </>
  )
}

export default Invoice
