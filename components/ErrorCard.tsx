import { Button } from "primereact/button"
import React from "react"

function ErrorCard({ closeErrorBox, rfqErrorMsgs, value }) {
  return (
    <div className="error-card flex">
      <span style={{ width: "fit-content" }}>
        {rfqErrorMsgs?.message}
        {`${value}`}
      </span>
      <Button
        icon="pi pi-times"
        className="p-button-rounded p-button-danger p-button-outlined "
        aria-label="Cancel"
        onClick={() => closeErrorBox(value)}
      />
    </div>
  )
}

export default ErrorCard
