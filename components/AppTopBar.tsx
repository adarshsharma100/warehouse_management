import React, { useEffect, useState } from "react"
// import { Link } from "react-router-dom"
import classNames from "classnames"
import logout from "app/auth/mutations/logout"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
// import logo from "../Assets/Images/tif.png"
// import Image from "next/image"

import { Badge } from "primereact/badge"

export const AppTopbar = (props) => {
  const [logoutMutation] = useMutation(logout)
  const ITEMS_PER_PAGE = 100
  // const [newAlerts, setNewAlerts] = useState(1)
  const [oldAlerts, setOldAlerts] = useState(0)
  const [alertCount, setAlertCount] = useState(0)

  const router = useRouter()
  return (
    <div className="layout-topbar " style={{ zIndex: "1002" }}>
      <button
        type="button"
        className="p-link  layout-menu-button layout-topbar-button"
        onClick={props.onToggleMenuClick}
      >
        <i className="pi pi-bars" />
      </button>

      <div className="layout-topbar-logo">
        {/* <Image src={logo} height="40px" width="40px" alt="logo" /> */}
        {/* <span className="ml-3">Inventory Management</span> */}
      </div>

      <button
        type="button"
        className="p-link layout-topbar-menu-button layout-topbar-button"
        onClick={props.onMobileTopbarMenuClick}
      >
        <i className="pi pi-ellipsis-v" />
      </button>

      <ul
        className={classNames("layout-topbar-menu lg:flex origin-top", {
          "layout-topbar-menu-mobile-active": props.mobileTopbarMenuActive,
        })}
      >
        {/* <li>
          <button
            className="p-link layout-topbar-button"
            onClick={props.onMobileSubTopbarMenuClick}
          >
            <i className="pi pi-calendar" />
            <span>Events</span>
          </button>
        </li>
        <li>
          <button
            className="p-link layout-topbar-button"
            onClick={props.onMobileSubTopbarMenuClick}
          >
            <i className="pi pi-cog" />
            <span>Settings</span>
          </button>
        </li> */}
        <li className="flex justify-content end align-items-center">
          {/* <button
            className="p-link layout-topbar-button"
            onClick={async () => {
              // await logoutMutation()
              // await router.push(Routes.Home())
            }}
          > */}
          <div className="flex justify-content end align-items-center">
            <i
              className="  pi pi-bell mr-4 p-text-secondary p-overlay-badge"
              onClick={async () => {
                setAlertCount(0)
                await router.push("/alerts")
              }}
              style={{ fontSize: "1.5rem", cursor: "pointer" }}
            >
              {alertCount !== 0 && <Badge value={alertCount} severity="danger"></Badge>}
              {/* {alertCount !== 0 && <BadgeField value={alertCount} />} */}
            </i>
          </div>

          {/* <span>Profile</span> */}
          {/* </button> */}
        </li>
        <li>
          <button
            className="p-link layout-topbar-button"
            onClick={async () => {
              await logoutMutation()
              await router.push(Routes.Home())
            }}
          >
            <i className="pi pi-sign-out" />
            <span>Profile</span>
          </button>
        </li>
      </ul>
    </div>
  )
}
