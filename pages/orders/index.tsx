import { Suspense, useEffect, useRef } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useMutation, usePaginatedQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "layouts/Layout"
import getOrders from "app/orders/queries/getOrders";
import Loading from "components/loading";
import { Button } from "primereact/button";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { dateFormat } from "app/constants";
import createOrder from "app/orders/mutations/createOrder";
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from "primereact/inputtext";

const ITEMS_PER_PAGE = 100;

export const OrdersList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ orders }, { refetch }] = usePaginatedQuery(getOrders, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });
  // Todo : UsePaginatedQueries

  console.log('orders: ', orders);
  // const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  // const goToNextPage = () => router.push({ query: { page: page + 1 } });

  const [createNewOrder] = useMutation(createOrder)



  useEffect(() => {
    // let config = {
    //   headers: {
    //     'X-Shopify-Access-Token': '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',
    //     'Content-Type': 'application/json'
    //   },
    // };

    // axios.get("https://robocraze-com.myshopify.com/admin/api/2023-01/orders.json", config)
    //   .then((response) => {
    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    // axios.get(""{
    //   headers: {
    //     "X-Shopify-Access-Token": "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",
    //   },
    // })
    //   .then((response) => console.log("responseobj", response.data))
    //   .catch((error) => console.log("error123", error));




  }, [])

  return (
    <div className="grid w-full">
      <div className="col-12">
        <div className="card flex justify-content-between align-items-center m-0">
          <h2>Orders</h2>
          <div className="flex justify-content-end align-items-center">
            <Button
              icon="pi pi-plus"
              label="Create Order"
              onClick={() => {

              }}
            />
          </div>
        </div>
      </div>
      <div className="col-12">
        <div className="card m-0">
          <div className="flex justify-content-between align-items-center">
            <h4>Create Product</h4>
            <Button
              icon="pi pi-times"
              onClick={() => setProductEditState(!productEditState)}
            />
          </div>
          <div className="formgrid grid pl-2">
            <div className="col-12">
              <span className="text-lg">Customer Details</span>
            </div>
            {[{
              label: "First Name"
            }, {
              label: "Last Name"
            }, {
              label: "Email ID"
            }, {
              label: "Contact Number"
            }].map(({ label }, index) => (
              <div key={index} className="field col-12 lg:col-3 md:col-6 mt-3">
                <span className="p-float-label">
                  <InputText
                  // disabled={disableField}
                  // id={"sku"}
                  // placeholder='SKU'
                  // name={"sku"}
                  // value={formik.values.sku}
                  // autoFocus
                  // className={classNames({ "p-invalid ": isFormFieldValid("description") })}
                  />
                  <label
                  // htmlFor={"sku"}
                  // className={classNames({ "p-error": isFormFieldValid("sku") })}
                  >
                    {label}
                  </label>
                </span>
              </div>
            ))}

          </div>
        </div>
      </div>
      <Button
        icon="pi pi-plus"
        label="Test Order"
        className="block ml-auto"
        onClick={async () => {

          try {
            const order = createNewOrder({
              customer: {
                firstName: "Varun",
                lastName: "J",
                shopifyId: "1425636985",
                addresses: {
                  create: {
                    buildingNumber: "56",
                    areaStreet: "street",
                    landmarkName: "mark",
                    cityCountryProvince: "Mysore",
                    state: "Karnataka",
                    pincode: 560079,
                    country: 1,
                    emails_emails_addressesToaddresses: {
                      create: [
                        {
                          email: "test2@gmail.com",
                        },
                      ],
                    },
                    contact_number: {
                      create: [
                        {
                          type: "landline",
                          number: 1,
                        },
                      ],
                    }

                  }
                }
              },
              order: {
                orderStatus: 4,
                isShippingIsBilling: true,
                shippingAddress: {
                  buildingNumber: "123",
                  areaStreet: "Main St.",
                  landmarkName: "Central Park",
                  cityCountryProvince: "New York",
                  state: "NY",
                  pincode: 10001,
                  country: 1,
                  emails_emails_addressesToaddresses: {
                    create: [
                      {
                        email: "shiptest2@gmail.com",
                      },
                    ],
                  },
                  contact_number: {
                    create: [
                      {
                        type: "landline",
                        number: 1425,
                      },
                    ],
                  }
                },
                billingAddress: {
                  buildingNumber: "456",
                  areaStreet: "Broadway",
                  landmarkName: "Times Square",
                  cityCountryProvince: "New York",
                  state: "NY",
                  pincode: 10001,
                  country: 1,
                  emails_emails_addressesToaddresses: {
                    create: [
                      {
                        email: "Billtest2@gmail.com",
                      },
                    ],
                  },
                  contact_number: {
                    create: [
                      {
                        type: "landline",
                        number: 1,
                      },
                    ],
                  }
                },
                paymentStatus: "unpaid",
                totalPrice: 200,
                gateway: "paytm",
                channelCreatedAt: new Date(),
                order_items: {
                  create: [{
                    product: 6,
                    quantity: 10,
                    price: 123,
                  }]
                },

              }

            },
              {
                onSuccess: async () => {
                  await refetch()
                  alert("created")
                }, onError: (error) => {
                  alert(error)
                },
              })
          } catch (error) {
            console.log('error123: ', error);

          }

        }}
      ></Button>
      <div className="col-12">
        <div className="card">
          <DataTable
            value={orders}
            responsiveLayout="scroll"
            showGridlines
            // header={renderHeader}
            stripedRows
            className="text-s datatable-responsive"

          // paginator
          // currentPageReportTemplate={PAGINATION_VARIABLES.currentPageReportTemplate}
          // rows={PAGINATION_VARIABLES.rows}
          // rowsPerPageOptions={PAGINATION_VARIABLES.rowsPerPageOptions}
          // paginatorTemplate={PAGINATION_VARIABLES.paginatorTemplate}
          >
            <Column
              // field={}
              header="Order Number"
              body={(rowData) => rowData.shopifyId ? rowData.shopify.orderNumber : rowData.id}
            // className="text-center"
            />
            <Column
              field=""
              header="Products"
              body={({ order_items }) => {
                const orderItemOverlayRef = useRef(null);
                return (
                  <div>
                    <Button
                      label={`Products(${order_items.length})`}
                      onClick={(e) => orderItemOverlayRef?.current?.toggle(e)}
                      className="p-button-link"
                    />
                    <OverlayPanel ref={orderItemOverlayRef}>
                      <div className="w-20rem">
                        {order_items.map((product, i) => {
                          const { quantity, products: { name, sku } } = product
                          return (
                            <div key={i} className="pt-2 pb-2">
                              {[{
                                prop: "Name",
                                value: name
                              }, {
                                prop: "SKU",
                                value: sku
                              }, {
                                prop: "Quantity",
                                value: quantity
                              }].map(({ prop, value }, index) => (
                                <div key={index} className="grid">
                                  <label className="font-semibold col-4">{prop}:</label>
                                  <div className="col">
                                    {value?.toString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    </OverlayPanel>
                  </div>
                )
              }}
            // body={(rowData) => {
            //   return <ol>{rowData.order_items.map((product, i) => {
            //     const { quantity, products: { name, sku } } = product
            //     return (
            //       <li key={`i${product}`}>
            //         <p>Name:{name}</p>
            //         <p>SKU:{sku}</p>
            //         <p>Quantity:{quantity}</p>
            //       </li>
            //     )
            //   }
            //   )}</ol>

            // }}

            // className="text-center"
            />

            <Column
              field="products.name"
              header="Channel"
              // className="text-center"
              body={(rowdata) => rowdata.shopifyId ? "SH" : "IH"}

            />
            <Column
              // todo add customer details
              field="customers.firstName"
              header="Customer Details"
              // className="text-center"
              body={({ customers }) => {
                const customerOverlayRef = useRef(null);
                const { firstName, lastName, addresses } = customers
                return (
                  <div>
                    <Button
                      label={firstName + " " + lastName}
                      onClick={(e) => customerOverlayRef?.current?.toggle(e)}
                      className="p-button-link"
                    />
                    <OverlayPanel ref={customerOverlayRef}>
                      <div className="w-20rem">
                        {[{
                          prop: "First Name",
                          value: firstName
                        }, {
                          prop: "Last Name",
                          value: lastName
                        }, {
                          prop: "Email",
                          value: addresses?.emails_emails_addressesToaddresses?.[0]?.email
                        }, {
                          prop: "Contact Number",
                          value: addresses?.contact_number?.[0]?.number
                          // contact number should be varchar
                        },].map(({ prop, value }, index) => (
                          <div key={index} className="field grid">
                            <label className="font-semibold col-4">{prop}:</label>
                            <div className="col">
                              {value?.toString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </OverlayPanel>
                  </div>
                )
              }}
            />
            <Column
              field="quantity"
              header="Status"
            // className="text-center"
            />
            <Column
              field="gateway"
              header="Payment Gateway"
            // className="text-center"

            />
            <Column
              field="totalPrice"
              header="Amount"
            // className="text-center"
            />
            <Column
              field="createdAt"
              header="Created At"
              // className="text-center"
              body={(rowData) => dateFormat(rowData.createdAt)}
            />
            <Column
              field="channelCreatedAt"
              header="Channel Created At"
              body={(rowData) => dateFormat(rowData.channelCreatedAt)}
            />
          </DataTable>
        </div>
      </div>
    </div>
  )
};

const OrdersPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Layout>
        <OrdersList />
      </Layout>
    </Suspense>
  )
};

export default OrdersPage;
