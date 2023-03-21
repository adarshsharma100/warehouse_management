import { Suspense, useEffect } from "react";
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
    <div>
      {/* <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={Routes.ShowOrderPage({ orderId: order.id })}>
              <a>{order.name}</a>
            </Link>
          </li>
        ))}
      </ul> */}

      <div>
        <div className="card flex justify-content-between align-items-center mb-2">
          <h4 className="mb-0">Orders</h4>
          <div className="flex justify-content-end align-items-center">
            <Button
              icon="pi pi-plus"
              label="Create Order"
              onClick={() => {


              }}
            ></Button>

          </div>
        </div>


      </div>
      <Button
        icon="pi pi-plus"
        label="Test Order"
        className="block ml-auto"
        onClick={async () => {
          //working code for connecting alredy existing dat
          // try {
          //   const order = createNewOrder({
          //     orderStatus: 4,
          //     shippingAddressId: 210,
          //     billingAddressId: 210,
          //     createdAt: new Date(),
          //     shopifyId: 1,
          //     customerId: 1,
          //     paymentStatus: "unpaid",
          //     totalPrice: 200,
          //     gateway: "paytm",
          //     channelCreatedAt: new Date(),
          //     order_items: {
          //       create: [{
          //         product: 6,
          //         quantity: 10
          //       }]
          //     },
          //     // customer_orders_customerTocustomer: {
          //     //   create: {
          //     //     firstName: "Varun",
          //     //     lastName: "J",
          //     //     addressesId: 212,
          //     //     shopifyId: "1425869368574"
          //     //   }
          //     // }

          //   },
          //     {
          //       onSuccess: async () => {
          //         await refetch()
          //         alert("created")
          //       }
          //     })
          // } catch (error) {
          //   console.log('error123: ', error);
          // }

          try {
            const order = createNewOrder({
              orderStatus: 4,
              shippingAddressId: 210,
              billingAddressId: 210,
              createdAt: new Date(),
              shopifyId: 1,
              customerId: 1,
              paymentStatus: "unpaid",
              totalPrice: 200,
              gateway: "paytm",
              channelCreatedAt: new Date(),
              order_items: {
                create: [{
                  product: 6,
                  quantity: 10
                }]
              },
              // customer_orders_customerTocustomer: {
              //   create: {
              //     firstName: "Varun",
              //     lastName: "J",
              //     addressesId: 212,
              //     shopifyId: "1425869368574"
              //   }
              // }
              shopify: {
                create: {
                  orderId: "14269358745",
                  orderNumber: 63594,
                  orderStatusUrl: "some url"
                }
              },

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
          body={(rowData) => {
            return <ol>{rowData.order_items.map((product, i) => {
              const { quantity, products: { name, sku } } = product
              return (
                <li key={i}>
                  <p>Name:{name}</p>
                  <p>SKU:{sku}</p>
                  <p>Quantity:{quantity}</p>
                </li>
              )
            }
            )}</ol>

          }}

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
    </div >
  );
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
