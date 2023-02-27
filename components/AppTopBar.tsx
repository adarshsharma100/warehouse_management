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
  // const [{ notifications_sents: notifications }, { error: getNotificationsError, refetch }] =
  //   useQuery(getNotifications_sents, {
  //     orderBy: { id: "desc" },
  //   })

  const notifications = [
    {
      id: 5,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Nov 30 2022 16:23:13 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 6,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Nov 30 2022 16:37:04 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 7,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Nov 30 2022 16:57:11 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 8,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Nov 30 2022 17:14:39 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 9,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Nov 30 2022 17:23:43 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 10,
      user_name: "Dylan Alisson",
      user_email: "mdatif796@gmail.com",
      mutations: "createPurchase_order",
      created_at: "Thu Dec 01 2022 16:18:10 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 11,
      user_name: "Dylan Alisson",
      user_email: "mdatif796@gmail.com",
      mutations: "createPurchase_order",
      created_at: "Thu Dec 01 2022 17:47:32 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 12,
      user_name: "Dylan Alisson",
      user_email: "mdatif796@gmail.com",
      mutations: "createPurchase_order",
      created_at: "Thu Dec 01 2022 17:58:09 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 13,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Mon Dec 26 2022 18:05:39 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 14,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Mon Dec 26 2022 18:05:48 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 48,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Dec 27 2022 12:47:16 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 49,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Mon Jan 02 2023 16:20:12 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 50,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "undefined is Created",
      created_at: "z.string()",
      user_id: 1,
    },
    {
      id: 51,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#92 is Created",
      created_at: "Mon Jan 02 2023 17:48:10 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 52,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "22 is Updated",
      created_at: "Mon Jan 02 2023 17:50:36 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 53,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "sdf is Updated",
      created_at: "Mon Jan 02 2023 18:00:18 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 54,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Mon Jan 02 2023 18:36:24 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 55,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#86 is Created",
      created_at: "Mon Jan 02 2023 18:40:13 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 56,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "TEST is now Inactive",
      created_at: "Mon Jan 02 2023 18:44:18 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 57,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 08:59:23 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 58,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 09:04:02 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 59,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:26:25 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 60,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:29:02 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 61,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:29:35 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 62,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:30:49 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 63,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:31:07 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 64,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:31:43 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 65,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:38:38 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 66,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:44:05 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 67,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:45:16 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 68,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:47:43 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 69,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:49:43 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 70,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:49:46 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 71,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:51:44 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 72,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:52:27 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 73,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:52:27 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 74,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:52:27 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 75,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:54:41 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 76,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:54:41 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 77,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 10:54:41 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 78,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 11:00:46 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 79,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 11:00:46 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 80,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 11:01:24 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 81,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 03 2023 11:01:24 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 82,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "ser is Created",
      created_at: "Tue Jan 03 2023 12:34:22 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 83,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "tets13 is Updated",
      created_at: "Tue Jan 03 2023 12:46:03 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 84,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#92 is Updated",
      created_at: "Tue Jan 03 2023 12:46:44 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 85,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "sdf is Updated",
      created_at: "Tue Jan 03 2023 13:07:30 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 86,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#94 is Created",
      created_at: "Tue Jan 03 2023 13:11:27 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 87,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#95 is Created",
      created_at: "Tue Jan 03 2023 17:15:25 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 88,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#45 is Updated",
      created_at: "Tue Jan 03 2023 17:26:32 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 89,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is now Inactive",
      created_at: "Tue Jan 03 2023 18:32:16 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 90,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is now Active",
      created_at: "Tue Jan 03 2023 22:02:35 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 91,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Tue Jan 03 2023 22:03:47 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 92,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Tue Jan 03 2023 22:04:12 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 93,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ009 is now Inactive",
      created_at: "Wed Jan 04 2023 10:33:46 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 94,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ009 is now Active",
      created_at: "Wed Jan 04 2023 10:38:28 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 95,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "QUID is now Inactive",
      created_at: "Wed Jan 04 2023 10:49:59 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 96,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "testtif is now Inactive",
      created_at: "Wed Jan 04 2023 10:54:17 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 97,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ009 is now Inactive",
      created_at: "Wed Jan 04 2023 10:55:30 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 98,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is now Inactive",
      created_at: "Wed Jan 04 2023 13:05:07 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 99,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#96 is Created",
      created_at: "Wed Jan 04 2023 14:11:19 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 100,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "esdd is Updated",
      created_at: "Wed Jan 04 2023 14:45:18 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 101,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#57 is Updated",
      created_at: "Wed Jan 04 2023 14:49:02 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 102,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "1 is Updated",
      created_at: "Wed Jan 04 2023 14:49:27 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 103,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "12345 is Updated",
      created_at: "Wed Jan 04 2023 14:55:56 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 104,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#97 is Created",
      created_at: "Wed Jan 04 2023 14:59:31 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 105,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#98 is Created",
      created_at: "Wed Jan 04 2023 15:20:53 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 106,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#99 is Created",
      created_at: "Wed Jan 04 2023 15:37:18 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 107,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Jan 04 2023 17:39:00 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 108,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Jan 04 2023 17:40:31 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 109,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Jan 04 2023 17:42:51 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 110,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Jan 04 2023 17:50:35 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 111,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Wed Jan 04 2023 17:56:01 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 112,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is now Active",
      created_at: "Thu Jan 05 2023 17:07:35 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 113,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#87 is Created",
      created_at: "Mon Jan 09 2023 15:41:44 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 114,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Tue Jan 10 2023 13:19:59 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 115,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "test code is Updated",
      created_at: "Wed Jan 11 2023 15:38:42 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 116,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Wed Jan 11 2023 16:27:07 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 117,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "123 is Updated",
      created_at: "Thu Jan 12 2023 11:16:57 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 118,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "asadd is Updated",
      created_at: "Wed Jan 18 2023 16:39:02 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 119,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#87 is Updated",
      created_at: "Thu Jan 19 2023 11:48:59 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 120,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Thu Jan 19 2023 14:57:38 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 121,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Fri Jan 20 2023 11:31:41 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 122,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#57 is Updated",
      created_at: "Fri Jan 20 2023 13:25:17 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 123,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#57 is Updated",
      created_at: "Fri Jan 20 2023 13:25:52 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 124,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "TEST is Updated",
      created_at: "Wed Jan 25 2023 17:00:01 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 125,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "TEST is Updated",
      created_at: "Wed Jan 25 2023 17:00:21 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 126,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Wed Jan 25 2023 17:21:18 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 127,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Wed Jan 25 2023 17:21:29 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 128,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Wed Jan 25 2023 17:21:49 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 129,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "esdd is Updated",
      created_at: "Fri Jan 27 2023 15:04:04 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 130,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "po code is Updated",
      created_at: "Sun Jan 29 2023 11:58:44 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 131,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "po code is Updated",
      created_at: "Sun Jan 29 2023 11:58:55 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 132,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "1 is Updated",
      created_at: "Sun Jan 29 2023 21:45:38 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 133,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "PO#57 is Updated",
      created_at: "Sun Jan 29 2023 23:42:24 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 134,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is now Inactive",
      created_at: "Wed Feb 08 2023 22:07:24 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 135,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is now Active",
      created_at: "Thu Feb 09 2023 05:12:10 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 136,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is now Inactive",
      created_at: "Thu Feb 09 2023 05:22:50 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 137,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#88 is Created",
      created_at: "Thu Feb 09 2023 16:18:35 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 138,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#89 is Created",
      created_at: "Thu Feb 09 2023 17:09:06 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 139,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Thu Feb 09 2023 17:11:50 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 140,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Thu Feb 09 2023 17:13:18 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 141,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#79 is Updated",
      created_at: "Thu Feb 09 2023 17:15:13 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 142,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "TEST is Updated",
      created_at: "Thu Feb 09 2023 17:15:36 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 143,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#13 is Updated",
      created_at: "Thu Feb 09 2023 17:15:50 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 144,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#793 is now Inactive",
      created_at: "Tue Feb 14 2023 11:26:44 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 145,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "RFQ#793 is now Active",
      created_at: "Thu Feb 16 2023 18:21:33 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
    {
      id: 146,
      user_name: "atif",
      user_email: "mdatif796@gmail.com",
      mutations: "createInventory_product",
      created_at: "Fri Feb 17 2023 12:02:11 GMT+0530 (India Standard Time)",
      user_id: 1,
    },
  ]

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
