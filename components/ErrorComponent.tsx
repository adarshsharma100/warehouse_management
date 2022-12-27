import { Button } from "primereact/button"
import React, { useEffect, useState } from "react"

const ErrorComponent = ({ errors }) => {
  const [ErrorMsgs, setErrorMsgs] = useState([])
  useEffect(() => {
    const ErrorArray = [...errors]

    const msg = []

    for (let err of ErrorArray) {
      // console.log(err?.message)
      if (err) {
        msg.push(err)
      }
    }
    setErrorMsgs(msg)
  }, [errors])

  const removeErrorCard = (i) => {
    const msgArray = [...ErrorMsgs]
    msgArray.splice(i, 1)
    setErrorMsgs(msgArray)
  }

  return (
    <div className="error-card flex justify-content-center align-items-center">
      {ErrorMsgs.map((error, i) => (
        <div className="error-card flex justify-content-center align-items-center" key={i}>
          <span style={{ width: "fit-content" }} className="flex-grow-1">
            {error.message}
          </span>
          <Button
            icon="pi pi-times"
            className="p-button-rounded p-button-danger p-button-outlined "
            aria-label="Cancel"
            onClick={() => removeErrorCard(i)}
          />
        </div>
      ))}
    </div>
  )
}

export default ErrorComponent
