import React, { useRef } from "react"
import { PanelMenu } from "primereact/panelmenu"

import { SlideMenu } from 'primereact/slidemenu';

// import Link from "next/link"
// import { Ripple } from "primereact/ripple"
// import "./RippleDemo.css"

const SideBarMenu = () => {
  const items = [
    {
      label: "Vendor",
      // icon: "pi pi-fw pi-file",
      items: [
        {
          label: "Lists",
          icon: "pi pi-fw pi-user",
          command: () => (window.location.href = "/vendors"),
        },
        {
          label: "Catalog",
          icon: "pi pi-fw pi-map",
          command: () => (window.location.href = "/vendor_products"),
        },
      ],
    },
    {
      label: "Procure",
      items: [
        {
          label: "RFQ",
          icon: "pi pi-fw pi-paperclip",
          command: () => (window.location.href = "/rfqs"),
        },
        {
          label: "PO",
          icon: "pi pi-fw pi-truck",
          command: () => (window.location.href = "/purchase_orders"),
        },
        {
          label: "Invoice",
          icon: "pi pi-fw  bi-journal-text",
          command: () => (window.location.href = "/#"),
        },
        {
          label: "GRN",
          icon: "pi pi-fw bi-receipt-cutoff",
          command: () => (window.location.href = "/grns"),
        },
      ],
    },
    {
      label: "Depository",
      items: [
        {
          label: "Warehouse",
          icon: "pi pi-fw bi-houses",
          command: () => (window.location.href = "/warehouses"),
        },
        {
          label: "Products",
          icon: "pi pi-fw pi-shopping-bag",
          command: () => (window.location.href = "/products"),
          dataPrTooltip: "test",
        },
        {
          label: "Inventory",
          icon: "pi pi-fw pi-cog",
          command: () => (window.location.href = "/inventory_products"),
        },

      ],
    },

  ]

  // return <SlideMenu model={items} style={{ width: "8rem", background: "transparent", border: "none" }} className="mt-4" />
  return <PanelMenu model={items} style={{ width: "8rem" }} className="mt-4" />
}

export default SideBarMenu

// custom menu
// const SideBarIcons = () => {
//   const menu = {
//     vendor: {
//       tittle: "Vendor",
//       items: [
//         {
//           lable: "Vendor",
//           link: "/vendors",
//           icon: "pi-user",
//         },
//         {
//           lable: "Vendor Catalog",
//           link: "/vendor_products",
//           icon: "pi-map",
//         },
//       ],
//     },
//     procure: {
//       tittle: "Procure",
//       items: [
//         {
//           lable: "RFQ",
//           link: "/rfqs",
//           icon: "pi-paperclip",
//         },
//         {
//           lable: "PO",
//           link: "/purchase_orders",
//           icon: "pi-truck",
//         },
//       ],
//     },
//     stock: {
//       tittle: "Stock",
//       items: [
//         {
//           lable: "Inventory",
//           link: "/inventory_products",
//           icon: "pi-cog",
//         },
//         {
//           lable: "Product List",
//           link: "/products",
//           icon: "pi-shopping-bag",
//         },
//       ],
//     },
//   }

//   const ToggleClass = (element, className) => {
//     if (element.classList) {
//       if (element.classList.contains(className)) {
//         element.classList.remove(className)
//       } else element.classList.add(className)
//     } else element.className += " " + className
//   }

//   const renderMenu = (obj, i) => {
//     const { tittle, items } = obj
//     return (
//       <div
//         className="layout-menu p-ripple py-2 hide-li"
//         id={`item${i}`}
//         onClick={(e) => ToggleClass(document.querySelector(`#${e.currentTarget.id}`), "hide-li")}
//       >
//         <h6 className="m-0 line-height-1">
//           <span className="pi pi-chevron-down p-1"></span>
//           {tittle}
//         </h6>
//         {items.map((ele, i) => (
//           <li key={i} className="scalein animation-duration-200">
//             <Link className="p-ripple" href={ele.link}>
//               <a data-pr-tooltip={ele.lable} data-pr-position="right">
//                 <i className={`pi pi-fw ${ele.icon}`}></i>
//               </a>
//             </Link>
//           </li>
//         ))}
//         <Ripple />
//       </div>
//     )
//   }

//   const renderMultipleMenu = (obj) => {
//     const data = Object.values(obj)
//     return data.map((ele, i) => renderMenu(ele, i))
//   }

//   return <div className="flex flex-column align-items-start">{renderMultipleMenu(menu)}</div>
// }
