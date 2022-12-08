// import Image from "next/image"
import React from "react"
// import loading from "Assets/Images/loading_shark.gif"
// import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoaderFullScreen = () => {
  return (
   

      <div style={{position: "fixed",width: "100vw",height: "100vh", zIndex: 9999,background: "rgba(0, 0, 0, 0.7)",transition: "opacity 0.2s"}}> 
      <span style={{ position: "absolute", top: "40%" , left: "40%",transform:" translate(-50%)" }}><ProgressSpinner/> </span>
      </div>

  )
}

export default LoaderFullScreen
