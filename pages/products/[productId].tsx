import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getProduct from "app/products/queries/getProduct"
import deleteProduct from "app/products/mutations/deleteProduct"
import Loading from "components/loading"
import { Button } from "primereact/button"
import { useState, useRef } from "react"
import { Galleria } from "primereact/galleria"

export const Product = () => {
  const router = useRouter()
  const productId = useParam("productId", "number")
  const [deleteProductMutation] = useMutation(deleteProduct)
  // const [product] = useQuery(getProduct, { id: productId })

  const object = {
    Name: "3D Pen- Good Quality (Multicolour) ",
    Type: "SIMPLE",
    SKU: "TIF3P0001",
    Code: "123456",
    Category: "3D Printer",
    Length: "40",
    Width: "80",
    Height: "80",
    Color: "Black",
    Brand: "",
    TaxTypeCode: "12365479885",
    GstTaxTypeCode: "8778411445rtcf",
    HSNCode: "84439940",
    Tags: "tags",
    CostPrice: "price/-",
    MRP: "649/-",
    BasePrice: "base price/-",
    Enabled: "Yes",
    TaxCalculationType: "tax calculation type",
  }

  const obj = Object.entries(object)
  const item = [
    {
      itemImageSrc: "https://m.media-amazon.com/images/I/41pxcui7YpL._SY445_SX342_QL70_FMwebp_.jpg",
      thumbnailImageSrc:
        "https://m.media-amazon.com/images/I/41pxcui7YpL._SX38_SY50_CR,0,0,38,50_.jpg",
      alt: "Description for Image 1",
      title: "Title 1",
    },
    {
      itemImageSrc: "https://m.media-amazon.com/images/I/41qy3JdP8tL._SX522_.jpg",
      thumbnailImageSrc:
        "https://m.media-amazon.com/images/I/21fJ7Bdd93L._SX38_SY50_CR,0,0,38,50_.jpg",
      alt: "Description for Image 2",
      title: "Title 2",
    },
    {
      itemImageSrc: "https://m.media-amazon.com/images/I/51jkoGBksZL._SX522_.jpg",
      thumbnailImageSrc:
        "https://m.media-amazon.com/images/I/41fMCaIULOL._SX38_SY50_CR,0,0,38,50_.jpg",
      alt: "Description for Image 3",
      title: "Title 3",
    },
    {
      itemImageSrc: "https://m.media-amazon.com/images/I/41-DWClDQnL._SX522_.jpg",
      thumbnailImageSrc:
        "https://m.media-amazon.com/images/I/2184TSCRHzL._SX38_SY50_CR,0,0,38,50_.jpg",
      alt: "Description for Image 4",
      title: "Title 4",
    },
    {
      itemImageSrc: "https://m.media-amazon.com/images/I/71K1Joe6c6L._SX522_.jpg",
      thumbnailImageSrc:
        "https://m.media-amazon.com/images/I/41jxCFS+6VL._SX38_SY50_CR,0,0,38,50_.jpg",
      alt: "Description for Image 5",
      title: "Title 5",
    },
  ]

  const [store, setStore] = useState(obj)
  const [active, setActive] = useState(false)
  const [images, setImages] = useState(item)

  const [inputs, setInputs] = useState([{ id: 1, value: "" }])
  const [nextId, setNextId] = useState(2)
  console.log(inputs, "inputs")

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
          {active ? (
            <Button onClick={() => setActive((s: any) => !s)}>Save</Button>
          ) : (
            <Button onClick={() => setActive((s: any) => !s)}>Edit</Button>
          )}
        </div>

        <div className="grid gap-6 p-8 ">
          <div className="col card2 text-2xl">
            {store.map((i) => {
              return (
                <div key={i}>
                  <div className="border-card flex flex-grow-0 gap-4  p-2 ">
                    <div className=" flex gap-4">
                      <div className="w-18rem">{i[0]}</div>

                      <div className="">: {i[1]}</div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="flex gap-4"></div>
          </div>

          <div className="col card2 ">
            <div className="flex gap-2 font-bold  align-items-center">
              <div className="text-3xl"> {object.Name}</div>-
              <div className="text-3xl">{object.SKU}</div>
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
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
              has been the industry's standard dummy text ever since the 1500s, when an unknown
              printer took a galley of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into electronic typesetting,
              remaining essentially unchanged.{" "}
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
