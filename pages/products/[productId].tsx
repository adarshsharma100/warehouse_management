import { Suspense } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import Layout from "app/core/layouts/Layout"
import getProduct from "app/products/queries/getProduct"
import deleteProduct from "app/products/mutations/deleteProduct"
import Loading from "components/loading"
import { useState } from "react"

// ─── InfoRow ───────────────────────────────────────────────────────────────────
const InfoRow = ({
  label,
  value,
  accent = false,
}: {
  label: string
  value?: string | null
  accent?: boolean
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "9px 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: "12px",
    }}
  >
    <span
      style={{
        color: "#6b7280",
        fontSize: "0.9rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <span
      style={{
        color: accent ? "#818cf8" : "#e2e8f0",
        fontSize: "1.05rem",
        fontWeight: accent ? 700 : 400,
        textAlign: "right",
        wordBreak: "break-word",
      }}
    >
      {value || "—"}
    </span>
  </div>
)

// ─── SectionCard ───────────────────────────────────────────────────────────────
const SectionCard = ({
  title,
  icon,
  color = "#818cf8",
  children,
}: {
  title: string
  icon: string
  color?: string
  children: React.ReactNode
}) => (
  <div
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px",
      padding: "18px 20px",
      marginBottom: "14px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "7px",
          background: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <i className={icon} style={{ color, fontSize: "16px" }} />
      </div>
      <span
        style={{
          color: "#94a3b8",
          fontWeight: 700,
          fontSize: "0.88rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
    </div>
    {children}
  </div>
)

// Strip inline style= attributes from Shopify HTML so our CSS is authoritative
const stripInlineStyles = (html: string): string =>
  html
    .replace(/\s*style\s*=\s*"[^"]*"/gi, "")
    .replace(/\s*style\s*=\s*'[^']*'/gi, "")

// ─── Product ───────────────────────────────────────────────────────────────────
export const Product = () => {
  const router = useRouter()
  const productId = useParam("productId", "number")
  const [deleteProductMutation] = useMutation(deleteProduct)
  const [product] = useQuery(getProduct, { id: productId! }) as [any, any]
  const [imgError, setImgError] = useState(false)

  const imageUrl =
    !imgError && product.imageUrl
      ? product.imageUrl
      : "https://m.media-amazon.com/images/I/41pxcui7YpL._SY445_SX342_QL70_FMwebp_.jpg"

  const isActive = product.status === "Active"

  return (
    <>
      <Head>
        <title>{product.name || "Product Details"}</title>
      </Head>

      {/* Scoped styles for description HTML — inline styles are pre-stripped by stripInlineStyles() */}
      <style>{`
        .pd-desc-html,
        .pd-desc-html * {
          box-sizing: border-box !important;
          float: none !important;
          position: static !important;
          max-width: 100% !important;
          columns: unset !important;
          column-count: unset !important;
          flex: unset !important;
          grid-template-columns: unset !important;
        }
        .pd-desc-html,
        .pd-desc-html div,
        .pd-desc-html section,
        .pd-desc-html article,
        .pd-desc-html aside,
        .pd-desc-html span {
          display: block !important;
          width: 100% !important;
          clear: both !important;
          overflow: visible !important;
        }
        .pd-desc-html h1,
        .pd-desc-html h2,
        .pd-desc-html h3,
        .pd-desc-html h4,
        .pd-desc-html h5 {
          display: block !important;
          font-size: 1.15rem !important;
          font-weight: 700 !important;
          color: #e2e8f0 !important;
          margin: 20px 0 10px !important;
          padding: 0 !important;
          clear: both !important;
          width: 100% !important;
          line-height: 1.4 !important;
        }
        .pd-desc-html p {
          display: block !important;
          font-size: 1rem !important;
          color: #94a3b8 !important;
          line-height: 1.85 !important;
          margin: 0 0 14px !important;
          padding: 0 !important;
          clear: both !important;
          width: 100% !important;
        }
        .pd-desc-html ul,
        .pd-desc-html ol {
          display: block !important;
          padding-left: 24px !important;
          margin: 0 0 14px !important;
          width: 100% !important;
          clear: both !important;
          list-style: disc !important;
        }
        .pd-desc-html ol { list-style: decimal !important; }
        .pd-desc-html li {
          display: list-item !important;
          font-size: 1rem !important;
          color: #94a3b8 !important;
          line-height: 1.75 !important;
          margin-bottom: 6px !important;
          padding: 0 !important;
          width: 100% !important;
        }
        .pd-desc-html a { color: #818cf8 !important; }
        .pd-desc-html strong, .pd-desc-html b { color: #e2e8f0 !important; font-weight: 700 !important; }
        .pd-desc-html em, .pd-desc-html i { font-style: italic !important; }
        .pd-desc-html table {
          display: block !important;
          overflow-x: auto !important;
          width: 100% !important;
          border-collapse: collapse !important;
        }
        .pd-desc-html td, .pd-desc-html th {
          display: table-cell !important;
          font-size: 0.95rem !important;
          color: #94a3b8 !important;
          padding: 8px 10px !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .pd-desc-html img { max-width: 100% !important; height: auto !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0d1117", color: "#f1f5f9" }}>
        {/* ── Top bar ────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(13,17,23,0.9)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "12px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => router.back()}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#94a3b8",
                padding: "6px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.82rem",
              }}
            >
              <i className="pi pi-arrow-left" style={{ fontSize: "11px" }} /> Back
            </button>
            <span style={{ color: "#374151", fontSize: "0.82rem" }}>Products</span>
            <i className="pi pi-angle-right" style={{ color: "#374151", fontSize: "11px" }} />
            <span
              style={{
                color: "#94a3b8",
                fontSize: "0.82rem",
                fontFamily: "monospace",
              }}
            >
              {product.sku}
            </span>
          </div>

          <button
            onClick={async () => {
              if (window.confirm("Delete this product?")) {
                await deleteProductMutation({ id: product.id })
                router.push("/products")
              }
            }}
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "8px",
              color: "#f87171",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <i className="pi pi-trash" style={{ fontSize: "11px" }} /> Delete
          </button>
        </div>

        {/* ── Page body ─────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
            padding: "28px 24px",
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* ══ LEFT — image + pricing ══════════════════════════════ */}
          <div style={{ position: "sticky", top: "62px" }}>
            {/* Image card */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "14px",
              }}
            >
              {/* White image area */}
              <div
                style={{
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "260px",
                  padding: "20px",
                }}
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "220px",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Below image meta */}
              <div style={{ padding: "14px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: isActive
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(248,113,113,0.12)",
                      color: isActive ? "#4ade80" : "#f87171",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: isActive ? "#4ade80" : "#f87171",
                        display: "inline-block",
                      }}
                    />
                    {product.status || "Active"}
                  </span>
                  <span style={{ color: "#4b5563", fontSize: "0.85rem", fontFamily: "monospace" }}>
                    #{product.id}
                  </span>
                </div>
                <p
                  style={{
                    color: "#4b5563",
                    fontSize: "0.85rem",
                    margin: "6px 0 0",
                    fontFamily: "monospace",
                  }}
                >
                  {product.sku}
                </p>
              </div>
            </div>

            {/* Pricing card */}
            <SectionCard title="Pricing" icon="pi pi-tag" color="#f59e0b">
              <InfoRow
                label="Selling Price"
                value={
                  product.product_prices?.sellingPrice != null
                    ? `₹${product.product_prices.sellingPrice}`
                    : null
                }
                accent
              />
              <InfoRow
                label="MRP"
                value={
                  product.product_prices?.mrp != null
                    ? `₹${product.product_prices.mrp}`
                    : null
                }
              />
              <InfoRow
                label="Avg Cost"
                value={
                  product.product_prices?.averageCostPrice != null
                    ? `₹${product.product_prices.averageCostPrice}`
                    : null
                }
              />
            </SectionCard>

            {/* Status card — in left sticky panel to reduce right-column height */}
            <SectionCard title="Status" icon="pi pi-info-circle" color="#4ade80">
              <InfoRow label="Status" value={product.status} accent />
              <InfoRow
                label="Created"
                value={
                  product.createdAT
                    ? new Date(product.createdAT).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : null
                }
              />
              <InfoRow
                label="Updated"
                value={
                  product.updatedAT
                    ? new Date(product.updatedAT).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : null
                }
              />
            </SectionCard>
          </div>

          {/* ══ RIGHT — details ═════════════════════════════════════ */}
          <div style={{ minWidth: 0 }}>
            {/* Product name + badges */}
            <div style={{ marginBottom: "20px" }}>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#f1f5f9",
                  margin: "0 0 10px",
                  lineHeight: 1.35,
                  wordBreak: "break-word",
                }}
              >
                {product.name}
              </h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {product.product_brand?.name && (
                  <span
                    style={{
                      background: "rgba(129,140,248,0.12)",
                      color: "#818cf8",
                      borderRadius: "20px",
                      padding: "5px 14px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                    }}
                  >
                    {product.product_brand.name}
                  </span>
                )}
                {product.product_categories?.name && (
                  <span
                    style={{
                      background: "rgba(34,211,238,0.1)",
                      color: "#22d3ee",
                      borderRadius: "20px",
                      padding: "5px 14px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                    }}
                  >
                    {product.product_categories.name}
                  </span>
                )}
                {product.product_types?.type && (
                  <span
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      color: "#34d399",
                      borderRadius: "20px",
                      padding: "5px 14px",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                    }}
                  >
                    {product.product_types.type}
                  </span>
                )}
              </div>
            </div>

            {/* Dimensions — full width row of 4 tiles */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "18px 20px",
                marginBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: "rgba(34,211,238,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="pi pi-box" style={{ color: "#22d3ee", fontSize: "13px" }} />
                </div>
                <span
                  style={{
                    color: "#94a3b8",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Dimensions & Weight
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "12px",
                }}
              >
                {[
                  { label: "Length", value: product.dimensions?.length, unit: "cm" },
                  { label: "Width", value: product.dimensions?.width, unit: "cm" },
                  { label: "Height", value: product.dimensions?.height, unit: "cm" },
                  { label: "Weight", value: product.dimensions?.weight, unit: "g" },
                ].map(({ label, value, unit }) => (
                  <div
                    key={label}
                    style={{
                      background: "rgba(34,211,238,0.05)",
                      border: "1px solid rgba(34,211,238,0.1)",
                      borderRadius: "10px",
                      padding: "14px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "#22d3ee",
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {value != null ? value : "—"}
                    </div>
                    <div
                      style={{
                        color: "#67e8f9",
                        fontSize: "0.78rem",
                        marginTop: "3px",
                        marginBottom: "4px",
                      }}
                    >
                      {value != null ? unit : ""}
                    </div>
                    <div
                      style={{
                        color: "#4b5563",
                        fontSize: "0.82rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2-col grid: Identity + Tax */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "0",
              }}
            >
              {/* Identity */}
              <SectionCard title="Identity" icon="pi pi-id-card" color="#818cf8">
                <InfoRow label="Internal ID" value={product.id?.toString()} />
                <InfoRow label="SKU" value={product.sku} accent />
                <InfoRow label="Brand" value={product.product_brand?.name} />
                <InfoRow label="Category" value={product.product_categories?.name} />
                <InfoRow label="Type" value={product.product_types?.type} />
                <InfoRow label="Color" value={product.color} />
              </SectionCard>

              {/* Tax & Compliance */}
              <SectionCard title="Tax & Compliance" icon="pi pi-file" color="#f59e0b">
                <InfoRow label="HSN Code" value={product.hsnCode} accent />
                <InfoRow label="GST Code" value={product.gstTaxTypeCode} />
                <InfoRow label="Custom Duty" value={product.customDuty} />
                <InfoRow label="Tax Calc Type" value={product.taxCalcType} />
              </SectionCard>
            </div>

            {/* Description — full width below the 2-col grid */}
            {product.description && (
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  marginTop: "14px",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
                      background: "rgba(148,163,184,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i className="pi pi-align-left" style={{ color: "#94a3b8", fontSize: "13px" }} />
                  </div>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Description
                  </span>
                </div>
                {/* Scoped wrapper for HTML content */}
                <div
                  className="pd-desc-html"
                  style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: stripInlineStyles(product.description) }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page wrapper ──────────────────────────────────────────────────────────────
const ShowProductPage = () => (
  <Suspense fallback={<Loading />}>
    <Layout>
      <Product />
    </Layout>
  </Suspense>
)

export default ShowProductPage
