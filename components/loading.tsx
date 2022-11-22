import Image from "next/image"
import React from "react"
import loading from "Assets/Images/loading_shark.gif"

const Loading = () => {
  return (
    <div
      style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Image src={loading} height="90vh" width="90vw" alt="logo" />
    </div>
  )
}

export default Loading
