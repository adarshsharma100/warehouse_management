import React, { useEffect, useRef, useState } from "react"
// import { Link } from "react-router-dom"
import classNames from "classnames"
import logout from "app/auth/mutations/logout"
import { useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
// import logo from "../Assets/Images/tif.png"
// import Image from "next/image"
import { ConfirmPopup } from "primereact/confirmpopup"
import { Badge } from "primereact/badge"
import getNotifications_sent from "app/notifications_sents/queries/getNotifications_sent"
import getNotifications_sents from "app/notifications_sents/queries/getNotifications_sents"
import moment from "moment"
import { Button } from "primereact/button"
import { DataScroller } from "primereact/datascroller"

export const AppTopbar = (props) => {
  const [logoutMutation] = useMutation(logout)
  const ITEMS_PER_PAGE = 100
  // const [newAlerts, setNewAlerts] = useState(1)
  const [oldAlerts, setOldAlerts] = useState(0)
  const [alertCount, setAlertCount] = useState(0)
  const [visible, setVisible] = useState<boolean>(false)
  const [{ notifications_sents: notifications }, { error: getNotificationsError, refetch }] =
    useQuery(getNotifications_sents, {
      orderBy: { id: "desc" },
    })

  const moreData = useRef(null)

  // console.log("notifications", notifications)

  const notificationTemplate = (ele) => {
    return (
      <div className="border-solid border-1 border-round-lg mb-2 p-2">
        <p className="m-0">{`${ele.mutations} by ${ele.user_name} `}</p>
        <p className="text-xs align-content-end text-right mt-2	">
          {moment(ele.created_at).format("DD-MM-YYYY, HH:MM")}
        </p>
      </div>
    )
  }

  const notificationFooter = (
    <Button
      type="text"
      icon="pi pi-plus"
      label="Load"
      onClick={(e) => {
        e.stopPropagation()
        moreData.current.load()
      }}
    />
  )
  const hideNotification = () => setVisible(false)

  useEffect(() => {
    window.addEventListener("click", hideNotification)
    return () => {
      window.removeEventListener("click", hideNotification)
    }
  }, [])

  useEffect(() => {
    ;(async () => await refetch())().catch((error) =>
      console.log("fecthNotifications-Error", error)
    )
  }, [notifications, visible])

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
            {/* <ConfirmPopup
              target={document.querySelector(".pi-bell")}
              visible={visible}
              onHide={() => setVisible((prev) => !prev)}
              message="Alert Message"
              icon="pi pi-exclamation-triangle"
            /> */}
            <div
              className={`card lg:w-3 md:w-24rem absolute ${
                visible ? "visible " : "hidden"
              } max-h-30rem overflow-scroll	`}
              style={{
                transform: "translate(-90%,54%)",
              }}
            >
              <DataScroller
                ref={moreData}
                value={notifications}
                itemTemplate={notificationTemplate}
                rows={5}
                loader
                footer={notificationFooter}
                header="Notifications"
              />
            </div>

            <i
              className="  pi pi-bell mr-4 p-text-secondary p-overlay-badge"
              onClick={(e) => {
                e.stopPropagation()
                setVisible((prev) => !prev)
              }} // {async () => {
              //   setAlertCount(0)
              //   await router.push("/alerts")
              // }}
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
