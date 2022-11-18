import { usePaginatedQuery } from "@blitzjs/rpc"
// import getAssets from "app/assets/queries/getAssets"
import { AppConfig } from "components/AppConfig"
import { AppFooter } from "components/AppFooter"
import { AppMenu } from "components/AppMenu"
import { AppTopbar } from "components/AppTopBar"
import { useRouter } from "next/router"
import { useState, useRef, useEffect, ReactDOM } from "react"
import { CSSTransition } from "react-transition-group"
import { Tooltip } from "primereact/tooltip"
import Image from "next/image"
import logo from "../Assets/Images/tif.png"

const Layout = ({ children }) => {
  const [layoutMode, setLayoutMode] = useState("static")
  const [layoutColorMode, setLayoutColorMode] = useState("dark")
  const [inputStyle, setInputStyle] = useState("outlined")
  const [ripple, setRipple] = useState(true)
  const [staticMenuInactive, setStaticMenuInactive] = useState(false)
  const [overlayMenuActive, setOverlayMenuActive] = useState(false)
  const [mobileMenuActive, setMobileMenuActive] = useState(false)
  const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false)
  const copyTooltipRef = useRef()
  // const location = useLocation();
  const router = useRouter()
  const page = Number(router.query.page) || 0
  // const [{ assets, hasMore }] = usePaginatedQuery(getAssets, {
  //   orderBy: { id: "asc" },
  // })
  // PrimeReact.ripple = true;

  let menuClick = false
  let mobileTopbarMenuClick = false

  useEffect(() => {
    if (mobileMenuActive) {
      addClass(document.body, "body-overflow-hidden")
    } else {
      removeClass(document.body, "body-overflow-hidden")
    }
  }, [mobileMenuActive])

  // useEffect(() => {
  //     copyTooltipRef && copyTooltipRef.current && copyTooltipRef.current.updateTargetEvents();
  // }, [location]);

  const onInputStyleChange = (inputStyle) => {
    setInputStyle(inputStyle)
  }

  const onRipple = (e) => {
    // PrimeReact.ripple = e.value;
    setRipple(e.value)
  }

  const onLayoutModeChange = (mode) => {
    setLayoutMode(mode)
  }

  const onColorModeChange = (mode) => {
    setLayoutColorMode(mode)
  }

  const onWrapperClick = (event) => {
    if (!menuClick) {
      setOverlayMenuActive(false)
      setMobileMenuActive(false)
    }

    if (!mobileTopbarMenuClick) {
      setMobileTopbarMenuActive(false)
    }

    mobileTopbarMenuClick = false
    menuClick = false
  }

  const onToggleMenuClick = (event) => {
    menuClick = true

    if (isDesktop()) {
      if (layoutMode === "overlay") {
        if (mobileMenuActive === true) {
          setOverlayMenuActive(true)
        }

        setOverlayMenuActive((prevState) => !prevState)
        setMobileMenuActive(false)
      } else if (layoutMode === "static") {
        setStaticMenuInactive((prevState) => !prevState)
      }
    } else {
      setMobileMenuActive((prevState) => !prevState)
    }

    event.preventDefault()
  }

  const onSidebarClick = () => {
    menuClick = true
  }

  const onMobileTopbarMenuClick = (event) => {
    mobileTopbarMenuClick = true

    setMobileTopbarMenuActive((prevState) => !prevState)
    event.preventDefault()
  }

  const onMobileSubTopbarMenuClick = (event) => {
    mobileTopbarMenuClick = true

    event.preventDefault()
  }

  const onMenuItemClick = (event) => {
    if (!event.item.items) {
      setOverlayMenuActive(false)
      setMobileMenuActive(false)
    }
  }
  const isDesktop = () => {
    return window.innerWidth >= 992
  }

  const menu = [
    {
      label: "Home",
      items: [
        {
          label: "Vendor",
          icon: "pi pi-fw pi-home",
          to: "/vendors",
        },
        // {
        //   label: "Assets",
        //   icon: "pi pi-fw pi-home",
        //   to: "/asset",
        // },
        {
          label: "Vendor Catalog",
          icon: "pi pi-fw pi-map",
          to: "/vendor_products",
        },

        {
          label: "Request for Quotations",
          icon: "pi pi-fw pi-paperclip",
          to: "/rfqs",
          // items: assets.map(({ display_name, id }) => {
          //   return { label: display_name, to: `/assets/${id}` }
          // }),
          // to: "#",
          // [
          //   { label: "Submenu 1.1.1", icon: "pi pi-fw pi-bookmark" },
          //   { label: "Submenu 1.1.2", icon: "pi pi-fw pi-bookmark" },
          //   { label: "Submenu 1.1.3", icon: "pi pi-fw pi-bookmark" },
          // ],
        },
        {
          label: "Purchase Orders",
          icon: "pi pi-fw pi-truck",
          to: "/purchase_orders",
        },
        {
          label: "Inventory",
          icon: "pi pi-fw pi-cog",
          to: "/inventory_products",
        },
        {
          label: "Products",
          icon: "pi pi-fw pi-shopping-bag",
          to: "/products",
        },
      ],
    },
    // {
    //   label: "UI Components",
    //   icon: "pi pi-fw pi-sitemap",
    //   items: [
    //     { label: "Form Layout", icon: "pi pi-fw pi-id-card", to: "/formlayout" },
    //     { label: "Input", icon: "pi pi-fw pi-check-square", to: "/input" },
    //     { label: "Float Label", icon: "pi pi-fw pi-bookmark", to: "/floatlabel" },
    //     { label: "Invalid State", icon: "pi pi-fw pi-exclamation-circle", to: "invalidstate" },
    //     { label: "Button", icon: "pi pi-fw pi-mobile", to: "/button" },
    //     { label: "Table", icon: "pi pi-fw pi-table", to: "/table" },
    //     { label: "List", icon: "pi pi-fw pi-list", to: "/list" },
    //     { label: "Tree", icon: "pi pi-fw pi-share-alt", to: "/tree" },
    //     { label: "Panel", icon: "pi pi-fw pi-tablet", to: "/panel" },
    //     { label: "Overlay", icon: "pi pi-fw pi-clone", to: "/overlay" },
    //     { label: "Media", icon: "pi pi-fw pi-image", to: "/media" },
    //     { label: "Menu", icon: "pi pi-fw pi-bars", to: "/menu" },
    //     { label: "Message", icon: "pi pi-fw pi-comment", to: "/messages" },
    //     { label: "File", icon: "pi pi-fw pi-file", to: "/file" },
    //     { label: "Chart", icon: "pi pi-fw pi-chart-bar", to: "/chart" },
    //     { label: "Misc", icon: "pi pi-fw pi-circle-off", to: "/misc" },
    //   ],
    // },
    // {
    //   label: "UI Blocks",
    //   items: [
    //     { label: "Free Blocks", icon: "pi pi-fw pi-eye", to: "/blocks", badge: "NEW" },
    //     {
    //       label: "All Blocks",
    //       icon: "pi pi-fw pi-globe",
    //       url: "https://www.primefaces.org/primeblocks-react",
    //     },
    //   ],
    // },
    // {
    //   label: "Icons",
    //   items: [{ label: "PrimeIcons", icon: "pi pi-fw pi-prime", to: "/icons" }],
    // },
    // {
    //   label: "Pages",
    //   icon: "pi pi-fw pi-clone",
    //   items: [
    //     { label: "Crud", icon: "pi pi-fw pi-user-edit", to: "/crud" },
    //     { label: "Timeline", icon: "pi pi-fw pi-calendar", to: "/timeline" },
    //     { label: "Empty", icon: "pi pi-fw pi-circle-off", to: "/empty" },
    //   ],
    // },
    // {
    // label: "Menu Hierarchy",
    //   icon: "pi pi-fw pi-search",
    //   items: [
    //     {
    //       label: "Submenu 1",
    //       icon: "pi pi-fw pi-bookmark",
    //       items: [
    //         {
    //           label: "Submenu 1.1",
    //           icon: "pi pi-fw pi-bookmark",
    //           items: [
    //             { label: "Submenu 1.1.1", icon: "pi pi-fw pi-bookmark" },
    //             { label: "Submenu 1.1.2", icon: "pi pi-fw pi-bookmark" },
    //             { label: "Submenu 1.1.3", icon: "pi pi-fw pi-bookmark" },
    //           ],
    //         },
    //         {
    //           label: "Submenu 1.2",
    //           icon: "pi pi-fw pi-bookmark",
    //           items: [
    //             { label: "Submenu 1.2.1", icon: "pi pi-fw pi-bookmark" },
    //             { label: "Submenu 1.2.2", icon: "pi pi-fw pi-bookmark" },
    //           ],
    //         },
    //       ],
    //     },
    //     {
    //       label: "Submenu 2",
    //       icon: "pi pi-fw pi-bookmark",
    //       items: [
    //         {
    //           label: "Submenu 2.1",
    //           icon: "pi pi-fw pi-bookmark",
    //           items: [
    //             { label: "Submenu 2.1.1", icon: "pi pi-fw pi-bookmark" },
    //             { label: "Submenu 2.1.2", icon: "pi pi-fw pi-bookmark" },
    //             { label: "Submenu 2.1.3", icon: "pi pi-fw pi-bookmark" },
    //           ],
    //         },
    //         {
    //           label: "Submenu 2.2",
    //           icon: "pi pi-fw pi-bookmark",
    //           items: [
    //             { label: "Submenu 2.2.1", icon: "pi pi-fw pi-bookmark" },
    //             { label: "Submenu 2.2.2", icon: "pi pi-fw pi-bookmark" },
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   label: "Get Started",
    //   items: [
    //     {
    //       label: "Documentation",
    //       icon: "pi pi-fw pi-question",
    //       command: () => {
    //         window.location = "#/documentation"
    //       },
    //     },
    //     {
    //       label: "View Source",
    //       icon: "pi pi-fw pi-search",
    //       command: () => {
    //         window.location = "https://github.com/primefaces/sakai-react"
    //       },
    //     },
    //   ],
    // },
  ]

  const addClass = (element, className) => {
    if (element.classList) element.classList.add(className)
    else element.className += " " + className
  }

  const removeClass = (element, className) => {
    if (element.classList) element.classList.remove(className)
    else
      element.className = element.className.replace(
        new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
        " "
      )
  }

  // const wrapperClass = classNames("layout-wrapper", {
  //   "layout-overlay": layoutMode === "overlay",
  //   "layout-static": layoutMode === "static",
  //   "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
  //   "layout-overlay-sidebar-active": overlayMenuActive && layoutMode === "overlay",
  //   "layout-mobile-sidebar-active": mobileMenuActive,
  //   "p-input-filled": inputStyle === "filled",
  //   "p-ripple-disabled": ripple === false,
  //   "layout-theme-light": layoutColorMode === "light",
  // })

  return (
    <div
      className={`layout-wrapper layout-static ${
        staticMenuInactive && "layout-static-sidebar-inactive"
      }`}
      onClick={onWrapperClick}
    >
      <Tooltip target=".layout-menu li a" />
      <AppTopbar
        onToggleMenuClick={onToggleMenuClick}
        layoutColorMode={layoutColorMode}
        mobileTopbarMenuActive={mobileTopbarMenuActive}
        onMobileTopbarMenuClick={onMobileTopbarMenuClick}
        onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick}
      />
      <div className="layout-sidebar" onClick={onSidebarClick}>
        <Image src={logo} height="35px" width="35px" alt="logo" />
        <AppMenu model={menu} onMenuItemClick={onMenuItemClick} layoutColorMode={layoutColorMode} />
      </div>

      <div className="layout-main-container">
        <div className="layout-main">{children}</div>

        <AppFooter layoutColorMode={layoutColorMode} />
        {/* <AppConfig
          rippleEffect={ripple}
          onRippleEffect={onRipple}
          inputStyle={inputStyle}
          onInputStyleChange={onInputStyleChange}
          layoutMode={layoutMode}
          onLayoutModeChange={onLayoutModeChange}
          layoutColorMode={layoutColorMode}
          onColorModeChange={onColorModeChange}
        /> */}

        <CSSTransition
          classNames="layout-mask"
          timeout={{ enter: 200, exit: 200 }}
          in={mobileMenuActive}
          unmountOnExit
        >
          <div className="layout-mask p-component-overlay"></div>
        </CSSTransition>
      </div>
    </div>
  )
}
// const LayoutPage

export default Layout
Layout.authenticate = false
