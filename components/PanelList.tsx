import React from "react"
import { Panel } from "primereact/panel"
import Link from "next/link"
import { Routes } from "@blitzjs/next"
const PanelList = ({ values, type, asset }) => {
  console.log('values:242 ', type, values);

  return (
    <div className="grid">
      {values.map((data, index) => {
        return (
          <div key={index} className="col-12 ">
            <Link href={type === "asset" ? Routes.ShowAssetPage({ assetId: data.slno }) : ""}>


              <div
                className={`${type === "incidents" && data?.is_acknowledged === "no" ? "blink-text-incident" : ""} alarms align-items-center card m-0 ${type === "incidents" && "p-2"} grid ${data === "online" ? "online" : ""
                  }`}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex align-items-center justify-content-center">
                  #{data?.slno ?? index + 1}
                </div>
                <div className="col flex align-items-center pl-5">
                  {data.asset ?? `Alarm #${index + 1}`}
                </div>


                {type === "asset" ? <span className={`status ${asset[data.asset_name] === "crit" ? "online offline" : asset[data.asset_name] === "warn" ? "warn" : ""}  `}></span> : <div className="col flex align-items-center justify-content-end text-base font-bold">
                  {data.time ?? ""}
                </div>
                }
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default PanelList
