import React from "react"
import { ProgressSpinner } from "primereact/progressspinner"

const LoaderFullScreen = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.7)",
        transition: "opacity 0.2s",
      }}
    >
      <span style={{ position: "absolute", top: "50%", left: "50%" }}>
        <ProgressSpinner />{" "}
      </span>
    </div>
  )
}

export default LoaderFullScreen
