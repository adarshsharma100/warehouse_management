import React from "react"

export const AppFooter = (props) => {
  return (
    <div className="layout-footer sticky bottom-0">
      {/* <img
        src={
          props.layoutColorMode === "light"
            ? "assets/layout/images/logo-dark.svg"
            : "assets/layout/images/logo-white.svg"
        }
        alt="Logo"
        height="20"
        className="mr-2"
      /> */}
      {/* {"Made with <3 by"} */}
      {/* By */}
      <span className="font-medium m-2"> © 2022 TIF Labs</span>
    </div>
  )
}
