import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import getInventory_products from "app/inventory_products/queries/getInventory_products"
import Layout from "layouts/Layout"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import Loading from "components/loading"
import { FileUpload } from "primereact/fileupload"
import papa from "papaparse"
import downloadCsv from "download-csv"
import createInventory_product from "app/inventory_products/mutations/createInventory_product"
import createNotifications_sent from "app/notifications_sents/mutations/createNotifications_sent"
import getProducts from "app/products/queries/getProducts"
import deleteInventory_product from "app/inventory_products/mutations/deleteInventory_product"
import axios from "axios"

const ITEMS_PER_PAGE = 100

export const Inventory_productsList = () => {
  const [createInventory_productMutation] = useMutation(createInventory_product)
  const [deleteInventory_productsMutation] = useMutation(deleteInventory_product)
  const [createNotifications_sentMutation] = useMutation(createNotifications_sent)

  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ inventory_products, hasMore }, { refetch }] = usePaginatedQuery(getInventory_products, {
    orderBy: { inventory_product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const [{ products }] = usePaginatedQuery(getProducts, {
    orderBy: { product_id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  console.log("products: ", products)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })
  const tableInventory = inventory_products.map(({ quantity, products }) => {
    return {
      products_sku: products.products_sku,
      name: products.name,
      product_type: products.product_type,
      quantity,
    }
  })
  const onBasicUpload = async (e) => {
    console.log("FileUpload", e)
    const csv = [] // this will contain all the data of imported csv file
    papa.parse(e.files[0], {
      header: true,
      step: function (result) {
        csv.push(result.data)
      },
      complete: async function (results, file) {
        console.log("Complete", csv.length, "records.  ", results, "csvVendor", csv)
        csv.pop() // to remove the last index value from csv (empty object)
        const finalResults = csv.map(async (el) => {
          console.log("testing", el)
          const productSku = el["products_sku"]
          console.log("productSku: ", productSku)

          // checking for null values
          let flag = true // flag true means we are ready to call vendor mutation and vice-versa
          let a = {}

          const productId = products.filter(({ products_sku }) => {
            return products_sku === productSku
          })

          console.log("productId: ", productId)
          // function to validate the csv file
          const checkError = () => {
            let errors = " " // this will contain all the error

            if (productId.length < 1) {
              flag = false
              errors += `${productSku} doesn't exists`
            } else {
              inventory_products.forEach(({ products_product_id }) => {
                if (Number(products_product_id) == Number(productId[0]?.product_id)) {
                  flag = false
                  console.log("flag: ", flag)
                  errors += `inventory products already exists`
                }
              })
            }

            // checking for null values
            Object.keys(el).forEach((e) => {
              if (!el[e]) {
                errors += `${e} is empty. `
              }
            })

            // destructuring el
            const { product_description, price, quantity } = el

            let a = {
              product_description,
              price,
              quantity,
              products_sku: productSku,
              error: errors,
            }

            return a
          }

          if (productId.length < 1) {
            flag = false
            return checkError()
          } else {
            inventory_products.forEach(({ products_product_id }) => {
              if (Number(products_product_id) == Number(productId[0]?.product_id)) {
                flag = false
                a = checkError()
              }
            })
          }

          // if any of the column is empty in csv file
          Object.keys(el).forEach((e) => {
            if (!el[e]) {
              flag = false
              a = checkError()
            }
          })

          try {
            // flag && const adminsEmails = await createVendorMutation(el)
            if (flag) {
              const userAndInventory = await createInventory_productMutation({
                product_description: el["product_description"],
                price: Number(el["price"]),
                quantity: Number(el["quantity"]),
                products_product_id: Number(productId[0]?.product_id),
              })
            }
            flag && (await refetch())
            return a
          } catch (error) {
            console.log("error: ", error)
            return checkError()
          }
        })
        let failedCsv = await Promise.all(finalResults)
        console.log("failedCsv: ", failedCsv)

        // removing the empty object from failedCsv
        failedCsv = failedCsv.filter((ele) => {
          return Object.getOwnPropertyNames(ele).length !== 0
        })

        // exporting failed csv file as downloadable
        const columns = {
          product_description: "product_description",
          price: "price",
          quantity: "quantity",
          products_sku: "products_sku",
          error: "error",
        }
        await downloadCsv(failedCsv, columns, "failed inventory products")
      },
    })
  }
  return (
    <div>
      <div className="col-12 px-0">
        <div className="card flex justify-content-between mb-2">
          <h2 className="mb-0">Inventory</h2>
          <FileUpload
            mode="basic"
            accept=".csv"
            customUpload
            // name="demo[]"
            // url="https://primefaces.org/primereact/showcase/upload.php"
            // accept="image/*"
            maxFileSize={1000000}
            uploadHandler={(e) => onBasicUpload(e)}
            // onUpload={(e) => onBasicUpload(e)}
          />
        </div>
      </div>

      <DataTable
        value={tableInventory}
        showGridlines
        // header={renderHeader}
        scrollable
        scrollHeight="60vh"
        stripedRows
        className="text-s datatable-responsive"
      >
        {/* <Column
          field="vendor_id"
          header="Vendor ID"
          // className="text-center"
        /> */}
        <Column
          field="products_sku"
          header="SKU"
          // className="text-center"
        />
        <Column
          field="name"
          header="Name"
          // className="text-center"
        />
        <Column
          field="product_type"
          header="Type"
          // className="text-center"
        />
        {/* <Column
          field="vendor_sku"
          header="Vendor Sku"
          // className="text-center"
        /> */}
        <Column
          field="quantity"
          header="Quantity"
          // className="text-center"
        />

        <Column
          // field="vendor_gstin"
          header="Action"
          body={(rowData) => {
            // console.log("rowData: ", rowData)
            return (
              <div>
                <Button
                  // label="Edit"
                  icon="pi pi-pencil"
                  className="m-1"
                  onClick={() => {
                    // setActiveVendor(true)
                    // setVendorDetails({ ...rowData })
                    // setVendorDialog(true)
                  }}
                />
                <Button
                  // label="Delete"
                  disabled={true}
                  icon="pi pi-trash"
                  className="m-1"
                  onClick={async () => {
                    console.log("rowData: ", rowData.products_sku)
                    const productSku = await rowData.products_sku
                    console.log("productSku: ", productSku)
                    const inventoryProductId = inventory_products.filter(({ products }) => {
                      return products.products_sku === productSku
                    })
                    console.log("inventoryProductId: ", inventoryProductId)

                    await deleteInventory_productsMutation({
                      inventory_product_id: Number(inventoryProductId[0]?.inventory_product_id),
                    })
                    await refetch()
                  }}
                />
              </div>
            )
          }}
          // className="text-center"
        />
      </DataTable>
    </div>
  )
}

const Inventory_productsPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Inventory_productsList />
      </Layout>
    </Suspense>
  )
}

export default Inventory_productsPage
