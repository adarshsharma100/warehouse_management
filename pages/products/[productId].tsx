import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"
import { Inplace, InplaceDisplay, InplaceContent } from "primereact/inplace";
import Layout from "app/core/layouts/Layout"
import getProduct from "app/products/queries/getProduct"
import deleteProduct from "app/products/mutations/deleteProduct"
import Loading from "components/loading"
import { Button } from "primereact/button"
import { useState, useRef } from "react"
import { Galleria } from "primereact/galleria"
import { InputText } from "primereact/inputtext"

export const Product = () => {
  const router = useRouter()
  const productId = useParam("productId", "number")
  
  const [deleteProductMutation] = useMutation(deleteProduct)
  const [product] = useQuery(getProduct, { id: productId! }) as [any, any]

  const object = {
    Name: product.name || "-",
    Type: product.product_types?.type || "-",
    SKU: product.sku || "-",
    Code: product.id.toString(),
    Category: product.product_categories?.name || "-",
    Length: product.dimensions?.length?.toString() || "-",
    Width: product.dimensions?.width?.toString() || "-",
    Height: product.dimensions?.height?.toString() || "-",
    Weight: product.dimensions?.weight?.toString() || "-",
    Color: product.color || "-",
    Brand: product.product_brand?.name || "-",
    TaxTypeCode: product.customDuty || "-",
    GstTaxTypeCode: product.gstTaxTypeCode || "-",
    HSNCode: product.hsnCode || "-",
    Tags: "-",
    CostPrice: product.product_prices?.averageCostPrice !== null && product.product_prices?.averageCostPrice !== undefined ? `${product.product_prices.averageCostPrice}/-` : "-",
    MRP: product.product_prices?.mrp !== null && product.product_prices?.mrp !== undefined ? `${product.product_prices.mrp}/-` : "-",
    BasePrice: product.product_prices?.sellingPrice !== null && product.product_prices?.sellingPrice !== undefined ? `${product.product_prices.sellingPrice}/-` : "-",
    Enabled: product.status || "-",
    TaxCalculationType: product.taxCalcType || "-",
  }
  // const obj = Object.entries(object)
  const obj = Object.entries(object).map(([key, value]) => ({ key, value }));

  const item = [
    {
      itemImageSrc: product.imageUrl || "https://m.media-amazon.com/images/I/41pxcui7YpL._SY445_SX342_QL70_FMwebp_.jpg",
      thumbnailImageSrc: product.imageUrl || "https://m.media-amazon.com/images/I/41pxcui7YpL._SX38_SY50_CR,0,0,38,50_.jpg",
      alt: product.name,
      title: product.name,
    }
  ]

  const [active, setActive] = useState(false)
  const [images, setImages] = useState(item)

  const [inputs, setInputs] = useState([{ id: 1, value: "" }])
  const [nextId, setNextId] = useState(2)

  const [text, setText] = useState("");
  const [store, setStore] = useState(obj);

  const handleChange = (index, value) => {
    const updatedStore = [...store];
    updatedStore[index].value = value;
    setStore(updatedStore);
    localStorage.setItem("store", JSON.stringify(updatedStore));
  };

  const handleAddInput = () => {
    const lastInput: any = inputs[inputs.length - 1]
    if (lastInput.value !== "") {
      const newInputs = [...inputs, { id: nextId, value: "" }]
      setInputs(newInputs)
      setNextId(nextId + 1)
    }
  }

  const handleInputChange = (id, value) => {
    const newInputs = inputs.map((input) => {
      if (input.id === id) {
        return { id, value }
      }
      return input
    })
    setInputs(newInputs)
  }

  const responsiveOptions = [
    {
      breakpoint: "991px",
      numVisible: 4,
    },
    {
      breakpoint: "767px",
      numVisible: 3,
    },
    {
      breakpoint: "575px",
      numVisible: 1,
    },
  ]

  const itemTemplate = (item) => {
    return <img src={item.itemImageSrc} alt={item.alt} style={{ width: "80%" }} />
  }

  const thumbnailTemplate = (item) => {
    return <img src={item.thumbnailImageSrc} alt={item.alt} />
  }

  return (
    <>
      <Head>
        <title>Product</title>
      </Head>

      <div className="">
        <div className="card flex justify-content-between align-items-center sticky top-0 z-1">
          <h2 className="mb-0">Products Details</h2>
        </div>

        <div className="grid gap-6 p-8 " >

          <div className="card grid" style={{ width: "65%" }}>

            {store.map(({ key, value }, index) => (
              <div key={key} className="mt-3 col-4 flex align-items-center">
                <span className="text-xl font-italic font-bold">{key}:</span>
                <Inplace closable>
                  <InplaceDisplay className="text-xl ml-2">{text || value}</InplaceDisplay>
                  <InplaceContent>
                    <InputText
                      value={value}
                      onChange={(e) => handleChange(index, e.target.value)}
                      autoFocus
                    />
                  </InplaceContent>
                </Inplace>


              </div>
            ))}
          </div>



          <div className="col card2 " style={{ width: '35%' }}>
            <div className="flex gap-2 font-bold  align-items-center">
              <div className="text-2xl"> {object.Name}</div>-
              <div className="text-2xl">{object.SKU}</div>
            </div>
            <div className="mt-3">
              <Galleria
                value={images}
                responsiveOptions={responsiveOptions}
                numVisible={3}
                style={{ maxWidth: "640px" }}
                item={itemTemplate}
                thumbnail={thumbnailTemplate}
              />
            </div>

            <p className="text-3xl font-bold">Description</p>
            <p className=" text-xl">
              {product.description || "No description available."}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

const ShowProductPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <Product />
      </Layout>
    </Suspense>
  )
}

// ShowProductPage.authenticate = false
// ShowProductPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowProductPage
