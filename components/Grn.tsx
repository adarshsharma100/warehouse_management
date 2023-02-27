import moment from "moment"
import createGrn from "app/grns/mutations/createGrn"
import updateGrn from "app/grns/mutations/updateGrn"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import getGrns from "app/grns/queries/getGrns"

function GRN({ currentGrn, prefixes, poDetails, refetch }) {
  const [createGrnMutation] = useMutation(createGrn)
  const [updateGrnMutation] = useMutation(updateGrn)
  const [{ grns }] = useQuery(getGrns, {
    orderBy: { grn_id: "asc" },
  })
  const { po_code, purchase_order_products } = poDetails

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
            <strong> GRN ID :</strong>
          </p>
          <p>{currentGrn && `${prefixes[3].prefix}-${currentGrn?.grn_id}`}</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Batch Code :</strong>
          </p>
          <p>{currentGrn?.grn_batch_code}</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Created On :</strong>
          </p>
          {currentGrn && <p>{moment(currentGrn?.created_on).format("DD-MM-YYYY")}</p>}
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
          <p>{currentGrn?.grn_status}</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>Recevie Person :</strong>
          </p>
          <p>User 1</p>
        </div>
        <div className=" field col-12 lg:col-4 md:col-3 flex gap-3">
          <p className="mb-1 fb-50">
            <strong>QC Person :</strong>
          </p>
          <p>User 2</p>
        </div>
      </div>
      <div>
        <div className="flex justify-content-between">
          <h5>Items</h5>
          <span>
            <Button
              className="mr-3"
              label="Start QC"
              onClick={async () => {
                await updateGrnMutation({
                  grn_id: currentGrn.grn_id,
                  grn_status: "QC-Started",
                })
                refetch()
              }}
            />
            <Button
              label="QC Completed"
              onClick={async () => {
                await updateGrnMutation({
                  grn_id: currentGrn.grn_id,
                  grn_status: "QC-Completed",
                })
                refetch()
              }}
            />
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
            field="vendor_products.products.description"
            header="Item-description"
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
    </>
  )
}

export default GRN
