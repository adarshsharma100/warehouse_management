import { Routes } from "@blitzjs/next"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import updateAlert from "app/alerts/mutations/updateAlert"
import updateAlerts from "app/alerts/mutations/updateAlerts"
import createMessage from "app/messages/mutations/createMessage"
import getMessages from "app/messages/queries/getMessages"
import { PAGINATION_VARIABLES } from "constants/index"
import moment from "moment"
import { useRouter } from "next/router"
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Timeline } from 'primereact/timeline';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { useState, useRef, Suspense } from "react"
import InputTextField from "app/core/components/InputTextField"
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { DataTable } from 'primereact/datatable';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
const Alltable = ({ value, type, refetch }) => {
  // console.log("value231", value)
  const toast: any = useRef(null);
  const router = useRouter()
  const [updateAlertMutation] = useMutation(updateAlert)
  const [createMessageMutation] = useMutation(createMessage)
  const [updateAlertsMutation] = useMutation(updateAlerts)
  const [messageValue, setMessageValue] = useState({
    incident_id: 1,
    // message_cause: "",
    message_for: "",
    // message_from: null,
    // message_consequence: "",
    // messages_actions: "",
    // message_information: "",
    message_time: "",
    message_title: "",
    message_content: ""
  })

  const [messageDialog, setMessageDialog] = useState(false)
  const [activeIncidents, setActiveIncidents] = useState("")
  const dt = useRef(null);
  const [{ messages, hasMore, }, { refetch: refetchMessages, setQueryData }] = usePaginatedQuery(getMessages, {
    orderBy: { id: "asc" },
    // skip: ITEMS_PER_PAGE * page,
    take: 100,
  })
  // const exportCSV = () => {
  //   dt.current.exportCSV();
  // }
  // console.log("messages", messages)
  const rowClass = (data) => {
    console.log('data:1323 ', data);
    return {
      'blinking-border': data.checked === 0 && data.is_acknowledged === "no"
    }
  }
  const finalValue = value.filter((ele) => {
    if (type === "all") {
      return true
    }
    else if (type === "check") {
      return ele.checked === 1
    }
    else {
      // return ele.is_acknowledged === type && ele.checked === 0
      return ele.checked === 0
    }
  }).map((ele) => {
    return {
      ...ele,
      status: ele.is_acknowledged === "yes" && ele.checked === 1 ? "Closed" : ele.is_acknowledged === "yes" && ele.checked !== 1 ? "In-progress" : "Opened"
    }
  })
  console.log('finalValue: ', finalValue);
  const statusFilterTemplate = (options) => {
    return <Dropdown value={options.value} options={["crit", "warn", "offline"]} onChange={(e) => options.filterCallback(e.value, options.index)}
      // itemTemplate={statusItemTemplate}
      placeholder="Select a State" className="p-column-filter" showClear />;
  }

  const dateFilterTemplate = (options) => {
    console.log('options:213 ', options);
    return <Calendar value={options.value} onChange={(e) => {

      options.filterCallback(e.value, options.index)
    }}
      dateFormat="dd/mm/yy " placeholder="dd/mm/yyyy" mask="99/99/9999"
    // showTime showSeconds
    />
  }
  // [...new Set(myArray)];
  const assetFilterOption = [...new Set(finalValue.map(({ asset_name, is_acknowledged, checked }) => {
    const sample = is_acknowledged === "yes" && checked === 1 ? "Closed" : is_acknowledged === "yes" && checked !== 1 ? "In-progress" : "Opened"
    return sample
  }))].map((ele) => {
    return { name: ele, value: ele }
  })

  console.log('assetFilterOption: ', assetFilterOption);
  const representativeFilterTemplate = (options) => {
    return <Dropdown value={options.value} options={["Opened", "In-progress", "Closed"]} onChange={(e) => options.filterCallback(e.value, options.index)}
      // itemTemplate={statusItemTemplate}
      placeholder="Select a State" className="p-column-filter" showClear />
    // <MultiSelect value={options.value} options={assetFilterOption} onChange={(e) => options.filterCallback(e.value)} optionLabel="name" placeholder="Any" className="p-column-filter" />;
  }
  const acknowledgedFilterTemplate = (options) => {
    return <Dropdown value={options.value} options={["yes", "no",]} onChange={(e) => options.filterCallback(e.value, options.index)}
      // itemTemplate={statusItemTemplate}
      placeholder="Select a State" className="p-column-filter" showClear />
    // <MultiSelect value={options.value} options={assetFilterOption} onChange={(e) => options.filterCallback(e.value)} optionLabel="name" placeholder="Any" className="p-column-filter" />;
  }
  // const stateFilterTemplate = (options) => {
  //   return <MultiSelect value={options.value} options={assetFilterOption} onChange={(e) => options.filterCallback(e.value)} optionLabel="name" placeholder="Any" className="p-column-filter" />;
  // }

  const verifiedFilterTemplate = (options) => {
    return <TriStateCheckbox value={options.value} onChange={(e) => options.filterCallback(e.value)} />
  }
  const messagesOption = [{ name: "Likely cause of incident", value: "Likely cause of incident" }, { name: "Likely consequence of incident", value: "Likely consequence of incident" }, { name: "Corrective Actions", value: "Corrective Actions" }, { name: "Incident basis information", value: "Incident basis information" }]
  return (

    <div>
      <Dialog header="Notes" visible={messageDialog} style={{ width: '60vw' }}

        footer={() => (<Button className="p-2" icon="pi pi-send" onClick={async () => {
          const result = await createMessageMutation({
            ...messageValue,
            message_time: new Date()
          })
          // await setQueryData(result)
          await refetchMessages()

          // setMessageDialog(false)
          await toast?.current?.show({ severity: 'success', summary: 'Success Message', detail: 'Note added' });
          await setMessageValue({
            ...messageValue,
            // message_cause: "",
            message_for: "",
            // message_from: null,
            // message_consequence: "",
            // messages_actions: "",
            // message_information: "",
            message_time: "",
            message_content: "",
            message_title: ""
          })
        }}>Add</Button>)}
        onHide={() => setMessageDialog(false)}>

        <div className="grid"  >

          <div className="card col-7 message-output pt-3 mt-3 " style={{ overflowY: "scroll", height: "50vh" }}>
            <Timeline className="p-fluid" value={messages.filter(({ incident_id }: any) => {
              return incident_id == activeIncidents
            })} opposite={(item) => moment(item.message_time).format("DD-MM-YY,HH:MM").toString()} content={(item) => <div className="card shadow-5 " >
              <div className="flex justify-content-between"><div><span style={{ color: "#6ABD6E" }}>From:</span>{item.message_from}</div> <div>{item.message_for && <div><span style={{ color: "#6ABD6E" }}>To:</span>{item.message_for}</div>}</div></div>
              {item.message_cause &&

                <div><div style={{ color: "#6ABD6E" }}>Likely cause of incident</div>
                  <div>{item.message_cause} </div></div>}
              {item.message_consequence &&

                <div><div style={{ color: "#6ABD6E" }}>Likely consequence of incident</div>
                  <div>{item.message_consequence} </div></div>}
              {item.messages_actions && <div><div style={{ color: "#6ABD6E" }}>Corrective Actions</div>
                <div>{item.messages_actions} </div></div>}
              {item.message_information && <div><div style={{ color: "#6ABD6E" }}>Incident basis information</div>
                <div>{item.message_information}</div> </div>}
              <div><div style={{ color: "#6ABD6E" }}>{item.message_title}</div>
                <div>{item.message_content}</div> </div>
            </div>} />
          </div>
          <div className="col-5 ">
            <div className="m-1 p-1">
              <label className="mb-4">To </label>
              <InputTextField className="w-full" value={messageValue.message_for} onChange={(e) => setMessageValue({
                ...messageValue,
                message_for: e.target.value,
              })} />
            </div>
            <div className="m-2 p-0" ><Dropdown className="col-12" optionLabel="name" value={messageValue.message_title} options={messagesOption} onChange={(e) => setMessageValue({ ...messageValue, message_title: e.value })} placeholder="Select a message topic" /></div>
            <div className="m-2 p-0">
              <InputTextarea rows={12} className=" col-12" value={messageValue.message_content} onChange={(e) => setMessageValue({
                ...messageValue,
                message_content: e.target.value
              })} />
            </div>

            {/* <div className="m-1 p-1">
              <div>
                <span>Likely cause of incident</span>
              </div>

              <InputTextFieldArea value={messageValue.message_cause} onChange={(e) => setMessageValue({
                ...messageValue,
                message_cause: e.target.value
              })} className="w-full" />
            </div> */}
            {/* <div className="m-1 p-1">
              <div>
                <span>Likely consequence of incident</span>
              </div>

              <InputTextFieldArea value={messageValue.message_consequence} onChange={(e) => setMessageValue({
                ...messageValue,
                message_consequence: e.target.value
              })} className="w-full" />
            </div>
            <div className="m-1 p-1">
              <div>
                <span>Corrective Actions</span>
              </div>

              <InputTextFieldArea value={messageValue.messages_actions} onChange={(e) => setMessageValue({
                ...messageValue,
                messages_actions: e.target.value
              })} className="w-full" />
            </div>
            <div className="m-1 p-1">
              <div>
                <span>Incident basis information</span>
              </div>

              <InputTextFieldArea value={messageValue.message_information} onChange={(e) => setMessageValue({
                ...messageValue,
                message_information: e.target.value
              })} className="w-full" />
            </div> */}
          </div>
        </div>

      </Dialog>

      <DataTable
        value={finalValue}

        rowClassName={rowClass}
        className="datatable-responsive "
        paginator
        ref={dt}
        currentPageReportTemplate={
          PAGINATION_VARIABLES.currentPageReportTemplate
        }
        rows={10}
        rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
        paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
        // header={() => (<div className="flex justify-content-between"><div className="text-xl">Incidents</div><div>{type === "yes" && <Button className="ack mr-2" onClick={async () => {
        //   await updateAlertsMutation({
        //     id: value.map(({ id }) => {
        //       return id
        //     }),
        //     is_acknowledged: "yes"
        //   })
        //   await refetch()
        // }} icon="pi pi-check" data-pr-tooltip="Acknowledge All" ></Button>}

        // </div></div>)}
        showGridlines stripedRows >

        <Column field="id" header="Id" sortable filter filterPlaceholder="Search by ID" />
        <Column
          field="created_at"
          header="Alarm time"
          body={({ created_at }) => moment(created_at).format("DD/MM/YY HH:mm:ss:SSS")}
          sortable
          dataType="date"
          filterField="created_at"
          filter filterElement={dateFilterTemplate}
        />
        <Column
          sortable
          field="state" header="State" className="text-center"
          body={(rowData) => (<i className={"pi pi-exclamation-triangle"} style={{ 'fontSize': '1.5em', color: rowData.state === "offline" ? "grey" : rowData.state === "warn" ? "#d0d040" : "#ff3131" }}></i>)}
          filter filterElement={statusFilterTemplate}
        />
        {/* <Column field="state" header="State" /> */}
        <Column
          sortable
          filter filterPlaceholder="Search by Asset"
          field="asset_name" header="Asset Name" body={(rowData) => (<div style={{ cursor: "pointer" }} onClick={() => router.push(`/assets/${rowData.asset_id}`)}>{rowData.asset_name}</div>)} />
        <Column
          sortable
          filter filterPlaceholder="Search by Aspect"
          field="name" header="Aspect Name" />
        <Column sortable field="description" header="Description" filter filterPlaceholder="Search by Description" />
        <Column field="incident_value" header="Value" filter filterPlaceholder="Search by Value" />
        <Column sortable header="Status" field="status" showFilterMatchModes={false}
          filter
          filterElement={representativeFilterTemplate}
        // body={(rowData) => (rowData.is_acknowledged === "yes" && rowData.checked === 1 ? "Closed" : rowData.is_acknowledged === "yes" && rowData.checked !== 1 ? "In-progress" : "Opened")}
        />
        {/* <Column field="condition" header="Condition" /> */}
        {/* <Column field="current_value" header="Current Value" /> */}
        <Column
          field="is_acknowledged"
          header="Ack"
          filter
          filterElement={acknowledgedFilterTemplate}
          body={(rowData) => (
            <Checkbox disabled={rowData.is_acknowledged === "yes"} checked={rowData.is_acknowledged === "yes"} onChange={async (e) => {
              try {

                const updated: any = await updateAlertMutation({
                  ...rowData,
                  is_acknowledged: e.checked ? "yes" : "no",
                  updated_at: new Date(),
                })
                console.log("required", updated)
                refetch()
                // await refetch()
              }
              catch (error: any) {
                console.log("error123", error)
              }
            }} />
          )}
          dataType="boolean"
        // filter filterElement={verifiedFilterTemplate}
        />
        <Column field="action" header="Action"
          body={(rowData) => (<Button className={messages.filter(({ incident_id }) => incident_id === rowData.id).length > 0 ? "" : "p-button-outlined"} icon="pi pi-file-edit "

            label="Notes" onClick={() => {
              setActiveIncidents(rowData.id)
              setMessageValue({
                ...messageValue,
                incident_id: rowData.id
              })
              setMessageDialog(true)
            }}
          />)}

        />
        <Column
          field="checked"
          header="Check"
          body={(rowData) => (
            <Checkbox inputId="binary" disabled={rowData.checked === 1} checked={rowData.checked === 1}
              onChange={async (e) => {
                confirmDialog({
                  message: 'Are you sure you want to proceed?',
                  header: 'Confirmation',
                  icon: 'pi pi-exclamation-triangle',
                  accept: async () => {
                    try {
                      const updated: any = await updateAlertMutation({
                        ...rowData,
                        is_acknowledged: "yes",
                        checked: e.checked ? 1 : 0,
                        updated_at: new Date(),
                      })
                      console.log("required", updated)
                      await refetch()
                      // await refetch()
                    }
                    catch (error: any) {
                      console.log("error", error)
                    }
                  },
                  reject: () => { }
                });

              }} />
          )}
          dataType="boolean"
        // filter filterElement={verifiedFilterTemplate}
        />

      </DataTable>
      <ConfirmDialog />
      <Toast ref={toast} />
      <Tooltip target=".ack" position="top" />
    </div>

  )
}
export default Alltable;

