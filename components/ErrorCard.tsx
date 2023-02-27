import { Button } from "primereact/button"
import React from "react"

function ErrorCard({ closeErrorBox, ErrorMsgs, value }) {
  return (
    <div className="error-card flex justify-content-center align-items-center">
      <span style={{ width: "fit-content" }} className="flex-grow-1">
        {ErrorMsgs.message}
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
