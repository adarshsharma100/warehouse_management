import React from "react"
import moment from "moment"

export const AppFooter = (props) => {
  return (
    <div className="layout-footer sticky card pr-3">
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
      <span className="font-small m-2"> © {moment().format("Y")}</span>
      <span className="font-small m-2 text-gray-500">
        Made with <img style={{ width: "0.8rem" }} src="/heart.svg" /> by TIF Labs Pvt Ltd
      </span>
    </div>
  )
}
