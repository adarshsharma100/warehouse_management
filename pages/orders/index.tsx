import { Suspense, useEffect, useRef, useState } from "react";
import { getQueryClient, usePaginatedQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "layouts/Layout"
import getOrders from "app/orders/queries/getOrders";
import Loading from "components/loading";
import { Button } from "primereact/button";
import * as Yup from "yup"
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { dateFormat } from "app/constants";
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import classNames from "classnames";
import { createCSVFormat, createSearchFunction, filterExistingValues, } from "app/constants"
import { AutoComplete } from "primereact/autocomplete";
import getOrder_statuses from "app/order_statuses/queries/getOrder_statuses";
import { invoke, useMutation, useQuery } from "@blitzjs/rpc"
import getOrder_items from "app/order_items/queries/getOrder_items";
import getProducts from "app/products/queries/getProducts"
import { useFormik } from "formik";
import CreateOrder from 'app/orders/mutations/createOrder'
import getCustomers from "app/customers/queries/getCustomers";
import { ToggleButton } from 'primereact/togglebutton';


const initialOrderDetails = {
  firstName: '',
  lastName: '',
  emailID: '',
  customer: '',
  contactNumber: '',
  orderStatus: '',
  // shippingAddressId: "",
  // billingAddressId: "",
  // shopifyId: "",
  // customerId: "",
  paymentStatus: "",
  totalPrice: "",
  gateway: "",
  orderItems: '',
}

const customers_ = [{ id: 1, name: 'customers1' },
{ id: 2, name: 'customers2' }, { id: 3, name: 'customers3' },
{ id: 4, name: 'customers4' }, { id: 5, name: 'customers5' }
]
const gateway_ = [{ id: 1, name: 'Paypal' },
{ id: 2, name: 'Paytm' }, { id: 3, name: '' },
]

const ITEMS_PER_PAGE = 100;

export const OrdersList = () => {

  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ orders, hasMore }] = usePaginatedQuery(getOrders, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });
  const [{ order_statuses, }] = useQuery(getOrder_statuses, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })
  console.log('order_statuses: ', order_statuses);


  const [{ order_items }] = useQuery(getOrder_items, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })
  // const [{ customers }] = useQuery(getCustomers, {
  //   skip: undefined,
  //   where: undefined,
  //   orderBy: undefined,
  //   take: undefined
  // })
  // console.log('customers: ', customers);

  const [{ products }, { refetch }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
  })


  const [createMutationOrder] = useMutation(CreateOrder)
  const [show, setShow] = useState('')
  console.log('show: ', show);

  // Todo : UsePaginatedQueries
  // const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  // const goToNextPage = () => router.push({ query: { page: page + 1 } });

  const [orderItemsDetails, setOrderItemsDetails] = useState(initialOrderDetails)
  const [orderDialog, setOrderDialog] = useState(false)
  const [orderStatusOption, setOrderStatusOption] = useState(order_statuses)
  const [orderStatusSuggestions, setOderStatusSuggestions] = useState<any>(null)
  const [orderItemsOptions] = useState(products)

  const [orderItemsSuggestions, setOderItemsSuggestions] = useState<any>(null)
  const [customerOptions] = useState(customers_)
  const [customerOptionsSuggestions, setCustomerOptionsSuggestions] = useState<any>(null)

  const [gatewayOptions] = useState(gateway_)
  const [gatewayOptionsSuggestions, setGatewayOptionsSuggestions] = useState<any>(null)


  const searchOrderStatus = createSearchFunction(orderStatusOption, setOderStatusSuggestions)
  const searchOrderItems = createSearchFunction(orderItemsOptions, setOderItemsSuggestions)
  const searchCustomers = createSearchFunction(customerOptions, setCustomerOptionsSuggestions)
  const searchGateway = createSearchFunction(gatewayOptions, setGatewayOptionsSuggestions)
  // const selectedOption = orderStatusOption.find( (option) => option.name)
  // console.log('selectedOption: ', selectedOption);




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

  const formik = useFormik({
    initialValues: orderItemsDetails,
    validationSchema: Yup.object().shape({
      name: Yup.string().required("*Required")
    }),
    onSubmit: async (data) => {
      // const { orderStatus, shippingAddressId, billingAddressId, shopifyId, customerId, paymentStatus, totalPrice, gateway } = data
      // if (false) {
      //   try {
      //   } catch (err) {
      //   }
      // } else {
      //   alert('hii')
      //   console.log('hello___hii')
      //   try {
      //     await createMutationOrder({
      //       shippingAddressId: Number(shippingAddressId),
      //       billingAddressId: Number(billingAddressId),
      //       shopifyId: Number(shopifyId),
      //       customerId: Number(customerId),
      //       paymentStatus,
      //       totalPrice:Number(totalPrice),
      //       gateway,
      //       orderStatus: Number(orderStatus),

      //     }),{
      //       onSuccess: (data) => {
      //         console.log('data: ', data);
      //         alert('Created')
      //       },
      //       onError: (error) =>{
      //         console.log('error: ', error);
      //         alert('Created Error')
      //       }
      //     }
      //   } catch (error) {
      //     alert('out error')
      //     console.log('error: ', error);
      //   }

      // }
    }
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }

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
                setOrderDialog(!orderDialog)
              }}
            />
          </div>
        </div>
      </div>

      {/* <div className="col-12">
        {orderDialog &&
          <div className="card m-0">
            <div className="flex justify-content-between align-items-center">
              <h4>Create Product</h4>
              <Button
                icon="pi pi-times"
              // onClick={() => setProductEditState(!productEditState)}
              />
            </div>
            <div className="formgrid grid pl-2">
              <div className="col-12">
                <span className="text-lg">Customer Details</span>
              </div>
              {[{
                label: "First Name"},
              { label: "Last Name" },
              { label: "Email ID" },
              { label: "Contact Number" },
              { label: "TotalPrice" },
              { label: "Order Status" },
              { label: "Payment Status" },
              { label: "Gateway " },
              ].map(({ label }, index) => (
                <div key={index} className="field col-12 lg:col-2 md:col-6 mt-5">
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
            <div className="flex mt-4 ">
              <Button
                type="submit"
                className="mr-2 "
                label="SUBMIT"
              // label={editUpdateProduct ? 'UPDATE' : 'SUBMIT'}
              />
              <Button
                className="p-button-secondary"
                type="button"
                label="CANCEL"
                onClick={() => {
                  setOrderDialog(false)
                }}
              />
            </div>
          </div>
        }
      </div> */}

      {orderDialog &&
        <div className="card">
          <form onSubmit={formik.handleSubmit}
            className="p-fluid">
            <div className="formgrid grid">
              {[
                { field: "firstName", label: "First Name" },
                { field: "lastName", label: "Last Name" },
                { field: "emailID", label: "Email ID" },
                { field: "contactNumber", label: "Contact Number" },
                { field: "totalPrice", label: "Total Price" },
                { field: "quantity", label: "Quantity" },
                { field: "paymentStatus", label: "Payment Status" },
                // { field: "gateway", label: "Gateway " },
                // { field:"", label: 'Customer Id' },
              ].map((ele, i) => {
                return (
                  <div key={`${ele.label}${i}`} className="field col-12 lg:col-2 md:col-6 mt-4">
                    <span className="p-float-label">
                      <InputText
                        // disabled={productEditState}
                        id={ele.field}
                        name={ele.field}
                        value={formik.values[ele.field]}
                        onChange={formik.handleChange}
                        autoFocus
                        className={classNames({ "p-invalid": isFormFieldValid(ele.field) })}
                      />
                      <label
                        htmlFor={ele.label}
                        className={classNames({ "p-error": isFormFieldValid(ele.field) })}
                      >
                        {ele.label}
                      </label>
                    </span>
                    {getFormErrorMessage(ele.field)}
                  </div>
                )

              })
              }
              <div key={`Order Status`} className="field col-12 lg:col-5 md:col-6 mt-4">
                <span className="p-float-label">
                  <AutoComplete
                    id="orderStatus"
                    value={formik.values.orderStatus}
                    dropdown
                    forceSelection
                    suggestions={orderStatusSuggestions}
                    completeMethod={searchOrderStatus}
                    field="name"
                    onChange={(e) => {
                      const selectedOption = orderStatusOption.find(option => option.name === e.target.value.name);
                      const selectedOptionName = selectedOption ? selectedOption.name : null;
                      formik.setFieldValue('orderStatus', selectedOptionName);
                    }}

                    className={classNames({ "p-invalid": isFormFieldValid("category") })}
                  />
                  <label
                    htmlFor={"category"}
                    className={classNames({ "p-error": isFormFieldValid("category") })}
                  >
                    Order Status
                  </label>
                </span>
                {/* {getFormErrorMessage("category")} */}
              </div>

              <div key={`Order Items`} className="field col-12 lg:col-5 md:col-6 mt-4">
                <span className="p-float-label">
                  <AutoComplete
                    id="orderItems"
                    value={formik.values.orderItems}
                    dropdown
                    forceSelection
                    suggestions={orderItemsSuggestions}
                    completeMethod={searchOrderItems}
                    field="name"
                    // aria-label="Order Items"
                    // dropdownAriaLabel="Order Items"
                    onChange={(e) => {

                      const selectedOrderItem = orderItemsOptions.find(option_ => option_.name === e.value.name);
                      const selectedItemsOptionName = selectedOrderItem ? selectedOrderItem.name : null;
                      formik.setFieldValue('orderItems', selectedItemsOptionName);
                    }}
                    className={classNames({ "p-invalid": isFormFieldValid("category") })}
                  />
                  <label
                    className={classNames({ "p-error": isFormFieldValid("category") })}
                  >
                    Order Items
                  </label>
                </span>
                {/* {getFormErrorMessage("category")} */}
              </div>

              <div key={`Customer`} className="field col-12 lg:col-5 md:col-6 mt-4">
                <span className="p-float-label">
                  <AutoComplete
                    id="Customer"
                    value={formik.values.customer}
                    dropdown
                    forceSelection
                    suggestions={customerOptionsSuggestions}
                    completeMethod={searchCustomers}
                    field="name"
                    onChange={(e) => {
                      const selectedOrderItem = customerOptions.find(option_ => option_.name === e.value.name);
                      const selectedItemsOptionName = selectedOrderItem ? selectedOrderItem.name : null;
                      formik.setFieldValue('customer', selectedItemsOptionName);
                    }}
                    aria-label="Customer"
                    dropdownAriaLabel="Customer"
                    className={classNames({ "p-invalid": isFormFieldValid("category") })}
                  />
                  <label

                    className={classNames({ "p-error": isFormFieldValid("category") })}
                  >
                    Customer
                  </label>
                </span>
                {/* {getFormErrorMessage("category")} */}
              </div>

              <div key={`gateway`} className="field col-12 lg:col-5 md:col-6 mt-4">
                <span className="p-float-label">
                  <AutoComplete
                    id="gateway"
                    value={formik.values.gateway}
                    dropdown
                    forceSelection
                    suggestions={gatewayOptionsSuggestions}
                    completeMethod={searchGateway}
                    field="name"
                    onChange={(e) => {
                      const selectedOrderItem = gatewayOptions.find(option_ => option_.name === e.value.name);
                      const selectedItemsOptionName = selectedOrderItem ? selectedOrderItem.name : null;
                      formik.setFieldValue('gateway', selectedItemsOptionName);
                    }}
                    aria-label="gateway"
                    dropdownAriaLabel="gateway"
                    className={classNames({ "p-invalid": isFormFieldValid("category") })}
                  />
                  <label

                    className={classNames({ "p-error": isFormFieldValid("category") })}
                  >
                    Gateway
                  </label>
                </span>
                {/* {getFormErrorMessage("category")} */}
              </div>

              <div>
                {/* <ToggleButton checked={checked} onChange={(e) => setChecked(e.value)} className="w-8rem" /> */}
              </div>




            </div>

            <div className="flex mt-4">
              <Button
                type="submit"
                className="mr-2 "
                label="SUBMIT"
              // label={editUpdateProduct ? 'UPDATE' : 'SUBMIT'}
              />
              <Button
                className="p-button-secondary"
                type="button"
                label="CANCEL"
                onClick={() => {
                  setOrderDialog(false)
                }}
              />
            </div>

          </form>
        </div>

      }
      <pre>{JSON.stringify(formik.values, null, 2)}</pre>



      <div className="col-12">
        <div className="card">
          <DataTable
            value={orders}
            responsiveLayout="scroll"
            showGridlines
            // header={renderHeader}
            stripedRows
            className="text-s datatable-responsive"
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
                              {[{ prop: "Name", value: name },
                              { prop: "SKU", value: sku },
                              { prop: "Quantity", value: quantity }
                              ].map(({ prop, value }, index) => (
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

            // body={({ customers }) => {
            //   const customerOverlayRef = useRef(null);
            //   const { firstName, lastName, addresses } = customers
            //   return (
            //     <div>
            //       <Button
            //         label={firstName + " " + lastName}
            //         onClick={(e) => customerOverlayRef?.current?.toggle(e)}
            //         className="p-button-link"
            //       />
            //       <OverlayPanel ref={customerOverlayRef}>
            //         <div className="w-20rem">
            //           {[{
            //             prop: "First Name",
            //             value: firstName
            //           }, {
            //             prop: "Last Name",
            //             value: lastName
            //           }, {
            //             prop: "Email",
            //             value: addresses?.emails_emails_addressesToaddresses?.[0]?.email
            //           }, {
            //             prop: "Contact Number",
            //             value: addresses?.contact_number?.[0]?.number
            //             // contact number should be varchar
            //           },].map(({ prop, value }, index) => (
            //             <div key={index} className="field grid">
            //               <label className="font-semibold col-4">{prop}:</label>
            //               <div className="col">
            //                 {value?.toString()}
            //               </div>
            //             </div>
            //           ))}
            //         </div>
            //       </OverlayPanel>
            //     </div>
            //   )
            // }}
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


  return (
    <div>


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
