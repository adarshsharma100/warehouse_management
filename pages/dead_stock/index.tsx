/* eslint-disable react/no-unknown-property */
/* eslint-disable @next/next/no-page-custom-font */
import React, { Suspense, useMemo, useState } from "react"
import Head from "next/head"
import Layout from "layouts/Layout"
import Loading from "components/loading"
import papa from "papaparse"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"

interface InventoryItem {
  sku: string;
  product_name: string;
  current_stock: number;
  sales_last3m: number;
  dead_qty: number;
  unit_cost: number;
  dead_value: number;
  abc_category: string;
}

// --- Sub-component: File Upload Card ---
interface FileUploadCardProps {
  label: string;
  fileName?: string;
  iconClass: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
}

function FileUploadCard({ label, fileName, iconClass, onChange, isSelected }: FileUploadCardProps) {
  return (
    <label className="relative cursor-pointer block h-full select-none">
      <div 
        className="h-full p-5 border-2 border-dashed border-round-2xl transition-all transition-duration-200 surface-card"
        style={{ 
          borderColor: isSelected ? 'var(--green-500)' : 'var(--surface-border)',
          backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.05)' : '',
        }}
      >
        <div 
          className="w-3rem h-3rem border-round-xl flex align-items-center justify-content-center mb-4 transition-all"
          style={{
            backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.1)' : 'var(--surface-hover)',
            color: isSelected ? 'var(--green-500)' : 'var(--text-color-secondary)'
          }}
        >
          <i className={`${iconClass} text-2xl`}></i>
        </div>
        <h4 className="font-bold text-900 mb-1 mt-0">{label}</h4>
        <p className="text-xs text-500 mb-4 uppercase font-mono m-0" style={{ letterSpacing: '1px' }}>
          {isSelected ? 'Sync validated' : 'Ready to upload'}
        </p>
        
        {isSelected ? (
          <div className="flex align-items-center gap-2 text-green-500 font-semibold text-xs">
            <i className="pi pi-check-circle"></i>
            <span className="truncate" style={{ maxWidth: '180px' }}>{fileName}</span>
          </div>
        ) : (
          <div className="text-xs text-400 italic flex align-items-center gap-2">
            <i className="pi pi-upload"></i>
            Browse CSV / Excel
          </div>
        )}
      </div>
      <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onChange} style={{ display: 'none' }} />
    </label>
  )
}

// --- Sub-component: KPI Card Premium ---
interface KpiCardPremiumProps {
  label: string;
  value: string;
  sub: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  iconClass: string;
}

function KpiCardPremium({ label, value, sub, color, iconClass }: KpiCardPremiumProps) {
  const colorMap = {
    red: { text: 'var(--red-500)', bg: 'rgba(239, 68, 68, 0.1)' },
    orange: { text: 'var(--orange-500)', bg: 'rgba(249, 115, 22, 0.1)' },
    yellow: { text: 'var(--yellow-500)', bg: 'rgba(234, 179, 8, 0.1)' },
    green: { text: 'var(--green-500)', bg: 'rgba(34, 197, 94, 0.1)' },
    blue: { text: 'var(--blue-500)', bg: 'rgba(59, 130, 246, 0.1)' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className="relative overflow-hidden p-4 border-round-2xl border-1 surface-border surface-card shadow-1">
      <div 
        className="absolute" 
        style={{ 
          top: '12px', 
          right: '12px', 
          opacity: 0.15, 
          fontSize: '2.5rem', 
          color: c.text 
        }}
      >
        <i className={iconClass}></i>
      </div>
      <div className="text-xs font-mono tracking-2 uppercase text-500 mb-2" style={{ letterSpacing: '1.5px' }}>{label}</div>
      <div className="text-2xl font-bold mb-2" style={{ color: c.text }}>{value}</div>
      <div className="text-xs text-500 flex align-items-center gap-2 font-medium m-0">
        <div 
          className="border-circle flex-shrink-0" 
          style={{ 
            width: '6px', 
            height: '6px', 
            backgroundColor: c.text 
          }} 
        />
        {sub}
      </div>
    </div>
  )
}

// --- Main Page Component ---
const DeadStockComponent = () => {
  // --- File Upload State ---
  const [invFile, setInvFile] = useState<File | null>(null)
  const [attrFile, setAttrFile] = useState<File | null>(null)
  const [salesFile, setSalesFile] = useState<File | null>(null)
  const [cutoffDate, setCutoffDate] = useState<string>("2026-01-08")
  
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // --- Calculated Data State ---
  const [allData, setAllData] = useState<InventoryItem[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [generatedDate, setGeneratedDate] = useState<Date | null>(null)

  // --- View Settings State ---
  const [viewMode, setViewMode] = useState<'deadstock' | 'all'>('deadstock')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // --- Helper: Parse Date in DD-MM-YYYY HH:mm or general format ---
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null
    const parts = dateStr.trim().split(" ")
    if (parts.length > 0) {
      const dateParts = parts[0].split("-")
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10)
        const month = parseInt(dateParts[1], 10) - 1
        const year = parseInt(dateParts[2], 10)
        if (parts[1]) {
          const timeParts = parts[1].split(":")
          const hour = parseInt(timeParts[0], 10)
          const minute = parseInt(timeParts[1], 10)
          return new Date(year, month, day, hour, minute)
        }
        return new Date(year, month, day)
      }
    }
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
  }

  // --- Helper: Parse File (Excel/CSV) to JSON ---
  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const fileName = file.name.toLowerCase()
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

      if (isExcel) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const data = e.target?.result
            const XLSX = await import('xlsx')
            const workbook = XLSX.read(data, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName!]
            const json = XLSX.utils.sheet_to_json(worksheet!)
            resolve(json)
          } catch (err) {
            reject(new Error(`Failed to parse Excel file: ${err?.message || err}`))
          }
        }
        reader.onerror = () => reject(new Error("Error reading file"))
        reader.readAsBinaryString(file)
      } else {
        // Parse CSV
        papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data)
          },
          error: (err) => {
            reject(new Error(`Failed to parse CSV file: ${err.message}`))
          }
        })
      }
    })
  }

  // --- Run Dead Stock Analysis ---
  const runAnalysis = async () => {
    setError(null)
    if (!invFile || !attrFile || !salesFile) {
      setError("Please upload all three files (Inventory, Product Attributes, and Sales Data) before running the analysis.")
      return
    }

    setLoading(true)

    try {
      const inventoryRaw = await parseFile(invFile)
      const productAttrRaw = await parseFile(attrFile)
      const salesRaw = await parseFile(salesFile)

      const cleanSku = (sku: any) => String(sku || '').replace(/`/g, '').trim()

      // Process Inventory
      const invMap = new Map<string, { sku: string; name: string; current_stock: number }>()
      inventoryRaw.forEach((row: any) => {
        const rawSku = row.Sku || row.SKU || row.sku
        if (!rawSku) return
        const sku = cleanSku(rawSku)
        if (sku.startsWith("TIFCB")) return

        const qty = parseInt(row.Quantity || row.quantity || row.current_stock || row.Stock || row.stock || 0, 10)
        if (qty <= 0) return

        const name = row["Product Name"] || row.ProductName || row.name || row.Name || "—"
        invMap.set(sku, { sku, name, current_stock: qty })
      })

      // Process Sales Data
      const salesMap = new Map<string, { sales_last3m: number; total_revenue: number }>()
      const cutoff = new Date(cutoffDate)

      salesRaw.forEach((row: any) => {
        const rawSku = row.SKU || row.Sku || row.sku
        if (!rawSku) return
        const sku = cleanSku(rawSku)

        const rawDate = row["Order Date"] || row.OrderDate || row.date || row.Date
        const orderDate = parseDate(String(rawDate))

        const qty = parseInt(row["Item Quantity"] || row.Quantity || row.quantity || row.qty || 0, 10)
        const price = parseFloat(row["Selling Price"] || row.SellingPrice || row.price || row.Price || 0)

        let record = salesMap.get(sku)
        if (!record) {
          record = { sales_last3m: 0, total_revenue: 0 }
          salesMap.set(sku, record)
        }

        record.total_revenue += (isNaN(price) ? 0 : price)

        if (orderDate && orderDate >= cutoff) {
          record.sales_last3m += (isNaN(qty) ? 0 : qty)
        }
      })

      // Calculate ABC Classes
      const sortedSales = Array.from(salesMap.entries())
        .map(([sku, record]) => ({ sku, total_revenue: record.total_revenue }))
        .sort((a, b) => b.total_revenue - a.total_revenue)

      const totalRevenueSum = sortedSales.reduce((sum, item) => sum + item.total_revenue, 0)
      const abcMap = new Map<string, string>()
      let runningSum = 0

      sortedSales.forEach((item) => {
        if (totalRevenueSum > 0) {
          runningSum += item.total_revenue
          const cumPct = runningSum / totalRevenueSum
          if (cumPct <= 0.80) {
            abcMap.set(item.sku, "A")
          } else if (cumPct <= 0.95) {
            abcMap.set(item.sku, "B")
          } else {
            abcMap.set(item.sku, "C")
          }
        } else {
          abcMap.set(item.sku, "C")
        }
      })

      // Process Cost
      const costMap = new Map<string, number>()
      productAttrRaw.forEach((row: any) => {
        const rawSku = row.SKU || row.Sku || row.sku
        if (!rawSku) return
        const sku = cleanSku(rawSku)
        const costVal = parseFloat(row.COST || row.Cost || row.cost || row.price || 0)
        costMap.set(sku, isNaN(costVal) ? 0 : costVal)
      })

      // Merge and flag
      const calculatedItems: InventoryItem[] = []

      invMap.forEach((item, sku) => {
        const salesRecord = salesMap.get(sku)
        const sales_last3m = salesRecord ? salesRecord.sales_last3m : 0
        const abc_category = abcMap.get(sku) || "C"
        const unit_cost = costMap.get(sku) || 0

        const isDeadstock = sales_last3m <= 0.5 * item.current_stock
        const dead_qty = isDeadstock ? item.current_stock : 0
        const dead_value = dead_qty * unit_cost

        calculatedItems.push({
          sku,
          product_name: item.name,
          current_stock: item.current_stock,
          sales_last3m,
          dead_qty,
          unit_cost,
          dead_value,
          abc_category,
        })
      })

      // Sort items descending by dead_value, then by current_stock (matching reference main.py)
      calculatedItems.sort((a, b) => {
        if (b.dead_value !== a.dead_value) {
          return b.dead_value - a.dead_value
        }
        return b.current_stock - a.current_stock
      })

      setAllData(calculatedItems)
      setGeneratedDate(new Date())
      setShowResults(true)
    } catch (err) {
      setError(`Analysis Failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // --- Reset analysis view ---
  const updateCSVs = () => {
    setInvFile(null)
    setAttrFile(null)
    setSalesFile(null)
    setAllData([])
    setShowResults(false)
    setGeneratedDate(null)
  }

  // --- ABC Metrics and Filters ---
  const abcMetrics = useMemo(() => {
    return allData.reduce((acc, item) => {
      const deadVal = item.dead_value || 0
      const invVal = (item.current_stock || 0) * (item.unit_cost || 0)
      const cat = item.abc_category || 'C'
      
      if (cat === 'A') acc.deadA += deadVal
      if (cat === 'C') acc.deadC += deadVal
      
      acc.totalInvValue += invVal
      if (cat === 'A') { acc.invA += invVal; acc.countA++; }
      if (cat === 'B') { acc.invB += invVal; acc.countB++; }
      if (cat === 'C') { acc.invC += invVal; acc.countC++; }
      acc.totalUnits += (item.current_stock || 0)
      
      if (item.dead_qty > 0) acc.totalDeadSkus++
      acc.totalDeadValue += deadVal
      if (item.sales_last3m === 0) acc.zeroSaleSkus++

      return acc
    }, { 
      deadA: 0, 
      deadC: 0, 
      totalInvValue: 0, 
      invA: 0, 
      invB: 0, 
      invC: 0, 
      countA: 0, 
      countB: 0, 
      countC: 0, 
      totalUnits: 0,
      totalDeadSkus: 0,
      totalDeadValue: 0,
      zeroSaleSkus: 0
    })
  }, [allData])

  const filteredItems = useMemo(() => {
    let data = [...allData]
    
    // View Mode Filter
    if (viewMode === 'deadstock') {
      data = data.filter(item => (item.dead_qty || 0) > 0)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      data = data.filter(item => 
        item.sku?.toLowerCase().includes(q) || 
        item.product_name?.toLowerCase().includes(q)
      )
    }

    return data
  }, [allData, searchQuery, viewMode])

  const formatNum = (n: number): string => {
    if (n == null) return '—'
    if (n >= 1e7) return (n / 1e7).toFixed(2) + 'Cr'
    if (n >= 1e5) return (n / 1e5).toFixed(2) + 'L'
    return Math.round(n).toLocaleString('en-IN')
  }

  // --- Export Table to CSV ---
  const downloadCSV = () => {
    const headers = ['SKU', 'Product Name', 'Current Stock', 'Sales (3M)', 'ABC Class', 'Dead Qty', 'Unit Cost', 'Dead Value']
    const rows = filteredItems.map(r => [
      r.sku,
      `"${r.product_name.replace(/"/g, '""')}"`,
      r.current_stock,
      r.sales_last3m,
      r.abc_category,
      r.dead_qty,
      r.unit_cost,
      r.dead_value
    ].join(','))

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `DeadStock_Intel_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // --- Column Templates ---
  const skuTemplate = (rowData: InventoryItem) => {
    return (
      <span className="font-mono font-semibold px-2 py-1 border-round border-1 text-xs" style={{ color: 'var(--red-500)', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        {rowData.sku}
      </span>
    )
  }

  const abcTemplate = (rowData: InventoryItem) => {
    const cat = rowData.abc_category
    let style = { backgroundColor: 'var(--surface-hover)', color: 'var(--text-color-secondary)', borderColor: 'var(--surface-border)' }
    if (cat === "A") {
      style = { backgroundColor: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', borderColor: 'rgba(255, 215, 0, 0.2)' }
    } else if (cat === "B") {
      style = { backgroundColor: 'rgba(0, 255, 255, 0.1)', color: '#00FFFF', borderColor: 'rgba(0, 255, 255, 0.2)' }
    }

    return (
      <span className="font-bold border-round border-1 px-2 py-0.5 text-xs" style={style}>
        {cat}
      </span>
    )
  }

  const moneyTemplate = (rowData: InventoryItem, field: 'unit_cost' | 'dead_value') => {
    const val = rowData[field]
    return val != null ? '₹' + formatNum(val) : '—'
  }

  const statusTemplate = (rowData: InventoryItem) => {
    const isDead = rowData.dead_qty > 0
    const bg = isDead ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)"
    const color = isDead ? "var(--red-500)" : "var(--green-500)"
    const text = isDead ? "Dead Stock" : "Healthy"

    return (
      <span className="border-round border-1 px-3 py-1 text-xs font-bold tracking-1 uppercase" style={{ backgroundColor: bg, color: color, borderColor: bg }}>
        {text}
      </span>
    )
  }

  const sidebarItems = [
    { id: 'deadstock' as const, label: 'Dead Stock', iconClass: 'pi pi-exclamation-triangle', color: 'var(--red-500)', count: abcMetrics.totalDeadSkus },
    { id: 'all' as const, label: 'All Inventory', iconClass: 'pi pi-list', color: 'var(--blue-500)', count: allData.length },
  ]

  return (
    <div className="grid">
      <Head>
        <title>Dead Stock Intelligence</title>
      </Head>

      {/* Header Bar */}
      <div className="col-12">
        <div className="card flex align-items-center justify-content-between flex-wrap gap-3 py-3 px-4 mb-2 shadow-1">
          <div className="flex align-items-center gap-3">
            <div className="w-2.5rem h-2.5rem border-round-xl flex align-items-center justify-content-center bg-primary text-primary-contrast" style={{ boxShadow: '0 4px 10px rgba(var(--primary-color-rgb), 0.3)' }}>
              <i className="pi pi-bolt text-lg"></i>
            </div>
            <div>
              <h2 className="m-0 text-xl font-bold tracking-tight text-gradient">
                Dead<span style={{ color: 'var(--red-500)' }}>Stock</span> Intel
              </h2>
              <div className="text-[10px] text-500 uppercase tracking-2 font-mono leading-none mt-1">Inventory Optimization V3</div>
            </div>
          </div>

          <div className="flex align-items-center gap-4">
            {showResults && generatedDate ? (
              <div className="hidden md:flex flex-column align-items-end">
                <span className="text-[9px] text-500 uppercase tracking-2 font-mono font-bold">Report Generated</span>
                <span className="text-sm font-semibold text-700">{generatedDate.toLocaleString()}</span>
              </div>
            ) : (
              <div className="hidden md:flex align-items-center gap-2 px-3 py-2 border-round-full border-1 surface-border bg-card text-xs font-mono text-500">
                <div className="w-2 h-2 border-circle bg-red-500" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--red-500)' }} />
                SECURE_DASHBOARD / STANDBY
              </div>
            )}

            {showResults && (
              <Button
                label="Update CSVs"
                icon="pi pi-upload"
                onClick={updateCSVs}
                className="p-button-outlined p-button-secondary p-button-sm font-bold border-round-xl"
              />
            )}
          </div>
        </div>
      </div>

      {/* Upload View (standby mode) */}
      {!showResults ? (
        <div className="col-12 mt-4">
          <div className="text-center max-w-3xl mx-auto mb-5 py-4">
            <div 
              className="inline-block px-3 py-1 border-round-2xl border-1 text-xs font-bold uppercase tracking-2 mb-3" 
              style={{ color: 'var(--red-500)', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', letterSpacing: '2px' }}
            >
              Analysis Module 01
            </div>
            <h1 className="text-5xl font-bold mb-3 m-0" style={{ letterSpacing: '-1px' }}>
              Transform Data into Strategy.
            </h1>
            <p className="text-lg text-500 leading-relaxed max-w-xl mx-auto">
              Securely upload your CSV exports to unlock deep insights into stagnated inventory and capital optimization opportunities.
            </p>
          </div>

          <div className="grid mt-5">
            <div className="col-12 md:col-4">
              <FileUploadCard 
                label="Inventory Report" 
                fileName={invFile?.name} 
                iconClass="pi pi-box" 
                isSelected={!!invFile}
                onChange={(e) => setInvFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="col-12 md:col-4">
              <FileUploadCard 
                label="Product Attributes" 
                fileName={attrFile?.name} 
                iconClass="pi pi-database" 
                isSelected={!!attrFile}
                onChange={(e) => setAttrFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="col-12 md:col-4">
              <FileUploadCard 
                label="Sales performance" 
                fileName={salesFile?.name} 
                iconClass="pi pi-chart-bar" 
                isSelected={!!salesFile}
                onChange={(e) => setSalesFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="flex flex-column align-items-center gap-4 mt-5">
            <div className="flex flex-column gap-2 align-items-center">
              <label className="text-xs font-mono tracking-2 text-500 uppercase">Analysis Cutoff</label>
              <div className="flex align-items-center gap-2">
                <i className="pi pi-clock text-400"></i>
                <input
                  type="date"
                  value={cutoffDate}
                  onChange={(e) => setCutoffDate(e.target.value)}
                  className="p-inputtext p-component border-round-xl p-3 text-sm font-semibold"
                  style={{ width: '250px' }}
                />
              </div>
            </div>

            <Button
              label={loading ? 'Crunching Metrics...' : 'Compute Analytics'}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'}
              onClick={runAnalysis}
              disabled={loading || !invFile || !attrFile || !salesFile}
              className="p-button-raised border-round-xl p-3 font-bold text-sm tracking-1"
              style={{ backgroundColor: 'var(--red-500)', borderColor: 'var(--red-500)', minHeight: '60px', width: '300px' }}
            />
            
            {error && (
              <div className="p-message p-message-error border-round-xl p-3 flex align-items-center gap-2" style={{ color: 'var(--red-500)', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <i className="pi pi-exclamation-circle text-lg"></i>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Results View (split layout view mode) */
        <div className="col-12 mt-4 flex flex-column md:flex-row gap-4 align-items-start">
          
          {/* Sidebar */}
          <aside className="flex flex-column w-full md:w-15rem flex-shrink-0 card p-3 gap-2 shadow-1">
            <div className="text-xs font-mono tracking-2 uppercase text-500 font-bold mb-2 px-2" style={{ letterSpacing: '1.5px' }}>Navigation</div>
            <nav className="flex flex-column gap-2">
              {sidebarItems.map(item => {
                const isActive = viewMode === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setViewMode(item.id)}
                    className={`flex align-items-center gap-3 px-3 py-2 border-round-xl border-none text-left cursor-pointer transition-all ${
                      isActive 
                        ? 'surface-card border-1 border-primary shadow-1 font-bold' 
                        : 'surface-hover hover:surface-card font-medium text-500'
                    }`}
                    style={{ background: 'transparent' }}
                  >
                    <div className="w-2rem h-2rem border-round flex align-items-center justify-content-center"
                      style={{ 
                        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--surface-hover)', 
                        color: isActive ? item.color : 'var(--text-color-secondary)' 
                      }}
                    >
                      <i className={item.iconClass}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{item.label}</div>
                      <div className="text-xs text-500 font-mono">{item.count.toLocaleString()} SKUs</div>
                    </div>
                    {isActive && (
                      <div className="border-circle flex-shrink-0" style={{ width: '6px', height: '6px', backgroundColor: item.color }} />
                    )}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Right Panel */}
          <div className="flex-1 min-w-0 grid">
            <div className="col-12 mb-3">
              <h3 className="m-0 text-xl font-bold text-900 flex align-items-center gap-2">
                {viewMode === 'deadstock' ? (
                  <><i className="pi pi-exclamation-triangle text-red-500"></i> Dead Stock Analysis</>
                ) : (
                  <><i className="pi pi-clone text-blue-500"></i> Full Inventory Overview</>
                )}
              </h3>
              <p className="text-xs text-500 m-0 mt-1">
                {viewMode === 'deadstock' 
                  ? 'Items with sales velocity below 50% of current stock in the last 3 months' 
                  : 'Complete inventory with ABC classification — sorted by category priority'}
              </p>
            </div>

            {/* KPIs */}
            {viewMode === 'deadstock' ? (
              <div className="col-12 grid grid-nogutter gap-3">
                <div className="col flex-1">
                  <KpiCardPremium 
                    label="Dead SKUs" 
                    value={abcMetrics.totalDeadSkus.toLocaleString()} 
                    color="red" 
                    sub="Requires Liquidation" 
                    iconClass="pi pi-box"
                  />
                </div>
                <div className="col flex-1">
                  <KpiCardPremium 
                    label="Dead Value" 
                    value={`₹${formatNum(abcMetrics.totalDeadValue)}`} 
                    color="orange" 
                    sub="Frozen Capital" 
                    iconClass="pi pi-chart-bar"
                  />
                </div>
                <div className="col flex-1">
                  <KpiCardPremium 
                    label="Class A Leak" 
                    value={`₹${formatNum(abcMetrics.deadA)}`} 
                    color="yellow" 
                    sub="High Velocity Deadstock" 
                    iconClass="pi pi-arrow-up-right"
                  />
                </div>
                <div className="col flex-1">
                  <KpiCardPremium 
                    label="Class C Leak" 
                    value={`₹${formatNum(abcMetrics.deadC)}`} 
                    color="blue" 
                    sub="Long-Tail Deadstock" 
                    iconClass="pi pi-database"
                  />
                </div>
              </div>
            ) : (
              <div className="col-12 grid grid-nogutter gap-3">
                <div className="col flex-1">
                  <KpiCardPremium 
                    label="Inventory Value" 
                    value={`₹${formatNum(abcMetrics.totalInvValue)}`} 
                    color="blue" 
                    sub={`${allData.length.toLocaleString()} SKUs · ${formatNum(abcMetrics.totalUnits)} Units`} 
                    iconClass="pi pi-clone"
                  />
                </div>
                <div className="col flex-1">
                  <KpiCardPremium 
                    label="Class A Value" 
                    value={`₹${formatNum(abcMetrics.invA)}`} 
                    color="yellow" 
                    sub={`${abcMetrics.countA} SKUs · Top Drivers`} 
                    iconClass="pi pi-arrow-up-right"
                  />
                </div>
                <div className="col flex-1">
                  <KpiCardPremium 
                    label="Class B Value" 
                    value={`₹${formatNum(abcMetrics.invB)}`} 
                    color="green" 
                    sub={`${abcMetrics.countB} SKUs · Moderate Movers`} 
                    iconClass="pi pi-chart-bar"
                  />
                </div>
                <div className="col flex-1">
                  <KpiCardPremium 
                    label="Class C Value" 
                    value={`₹${formatNum(abcMetrics.invC)}`} 
                    color="orange" 
                    sub={`${abcMetrics.countC} SKUs · Long-Tail Items`} 
                    iconClass="pi pi-database"
                  />
                </div>
              </div>
            )}

            {/* Matrix Table */}
            <div className="col-12 mt-4">
              <div className="card shadow-2 p-0 border-round-2xl overflow-hidden">
                <div className="px-4 py-3 border-b surface-border flex flex-column md:flex-row align-items-center justify-content-between gap-3 bg-card">
                  <div>
                    <h4 className="m-0 font-bold flex align-items-center gap-2">
                       <i className="pi pi-filter text-primary"></i>
                       Inventory Intelligence Matrix
                    </h4>
                    <p className="text-xs text-500 font-mono uppercase mt-1 mb-0" style={{ letterSpacing: '1px' }}>
                      {filteredItems.length.toLocaleString()} {viewMode === 'deadstock' ? 'Dead Stock Units' : 'Total Inventory Units'} Identified
                    </p>
                  </div>
                  
                  <div className="flex align-items-center gap-3">
                    <span className="p-input-icon-left">
                      <i className="pi pi-search" />
                      <InputText
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search SKU identifier..."
                        className="p-inputtext-sm border-round-xl"
                      />
                    </span>
                    <Button 
                      label="Export CSV" 
                      icon="pi pi-download" 
                      onClick={downloadCSV}
                      className="p-button-outlined p-button-success p-button-sm border-round-xl"
                    />
                  </div>
                </div>

                <DataTable
                  value={filteredItems}
                  paginator
                  rows={15}
                  rowsPerPageOptions={[10, 15, 25, 50]}
                  responsiveLayout="scroll"
                  showGridlines
                  stripedRows
                  className="text-sm datatable-responsive"
                  emptyMessage="No items found matching the current filters."
                  removableSort
                >
                  <Column field="sku" header="SKU Code" sortable body={skuTemplate} className="w-2" />
                  <Column field="product_name" header="Product Title" sortable />
                  <Column field="abc_category" header="ABC" sortable align="center" body={abcTemplate} className="w-1" />
                  <Column field="current_stock" header="Total Units" sortable className="text-right w-1" body={(rowData) => rowData.current_stock.toLocaleString()} />
                  <Column field="sales_last3m" header="3M Velocity" sortable className="text-right w-1" body={(rowData) => rowData.sales_last3m.toLocaleString()} />
                  <Column field="dead_value" header="Est. Loss" sortable className="text-right font-semibold w-2" body={(rowData) => moneyTemplate(rowData, 'dead_value')} />
                  <Column header="Inventory Status" align="center" body={statusTemplate} className="w-2" />
                </DataTable>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Styled JSX Custom Gradients */}
      <style jsx>{`
        .text-gradient {
          background: linear-gradient(135deg, var(--text-color) 0%, var(--text-color-secondary) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  )
}

const DeadStockPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <DeadStockComponent />
      </Layout>
    </Suspense>
  )
}

export default DeadStockPage
