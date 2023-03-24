import { Suspense, useEffect, useRef, useState } from "react";
import { getQueryClient, useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "layouts/Layout"
import getOrders from "app/orders/queries/getOrders";
import getOrderStatuses from "app/order_statuses/queries/getOrder_statuses"
import Loading from "components/loading";
import { Button } from "primereact/button";
import * as Yup from "yup"
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { cities, dateFormat } from "app/constants";
import createOrder from "app/orders/mutations/createOrder";
import updateOrder from "app/orders/mutations/updateOrder";

import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
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
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { ToggleButton } from 'primereact/togglebutton';
import { Checkbox } from "primereact/checkbox";


const initialOrderDetails = {
  firstName: '',
  lastName: '',
  emailID: '',
  customer: '',
  contactNumber: '',
  checkedAddress: '',
  orderStatus: '',
  // shippingAddressId: "",
  // billingAddressId: "",
  // shopifyId: "",
  // customerId: "",
  paymentStatus: "",
  totalPrice: "",
  gateway: "",
  orderItems: '',
  address: '',
  city: '',
  state: '',
  country:'',
  areaStreet:'',
  landmarkName:'',
  pincode:'',
  bulidingNumber:'',

}

const customers_ = [{ id: 1, name: 'customers1' },
{ id: 2, name: 'customers2' }, { id: 3, name: 'customers3' },
{ id: 4, name: 'customers4' }, { id: 5, name: 'customers5' }
]
const gateway_ = [{ id: 1, name: 'Paypal' },
{ id: 2, name: 'Paytm' },
]
const paymentStatus_ = [{ id: 1, name: 'Unpaid' },
{ id: 2, name: 'Paid' },
]

const ITEMS_PER_PAGE = 100;

export const OrdersList = () => {

  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ orders }, { refetch }] = usePaginatedQuery(getOrders, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });
  const [{ order_statuses }] = usePaginatedQuery(getOrderStatuses, {
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
  console.log('products: ', products);


  const [createMutationOrder] = useMutation(CreateOrder)
  const [show, setShow] = useState('')
  console.log('show: ', show);

  // Todo : UsePaginatedQueries
  // const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  // const goToNextPage = () => router.push({ query: { page: page + 1 } });

  const [createNewOrder] = useMutation(createOrder)
  const [updateNewOrder, { isLoading }] = useMutation(updateOrder)




  const [checked, setChecked] = useState(false);
  console.log('checked: ', checked);

  const [orderItemsDetails, setOrderItemsDetails] = useState(initialOrderDetails)
  const [orderDialog, setOrderDialog] = useState(true)
  const [orderStatusOption, setOrderStatusOption] = useState(order_statuses)
  const [orderStatusSuggestions, setOderStatusSuggestions] = useState<any>(null)

  const orderItemsOptions = products.map(({ id, name, sku, description }) => {
    return {
      name: `${sku} - ${name}`,
      id,
      description,
    }
  })

  const [orderItemsSuggestions, setOderItemsSuggestions] = useState<any>(null)

  const [customerOptions] = useState(customers_)
  const [customerOptionsSuggestions, setCustomerOptionsSuggestions] = useState<any>(null)

  const [gatewayOptions] = useState(gateway_)
  const [gatewayOptionsSuggestions, setGatewayOptionsSuggestions] = useState<any>(null)

  const [paymentOptions] = useState(paymentStatus_)
  const [paymentOptionsSuggestions, setPaymentOptionsSuggestions] = useState<any>(null)


  const [addressSuggestion, setAddressSuggestion] = useState<any>(null)


  const searchOrderStatus = createSearchFunction(orderStatusOption, setOderStatusSuggestions)
  const searchOrderItems = createSearchFunction(orderItemsOptions, setOderItemsSuggestions)
  const searchCustomers = createSearchFunction(customerOptions, setCustomerOptionsSuggestions)
  const searchGateway = createSearchFunction(gatewayOptions, setGatewayOptionsSuggestions)
  const searchPayment = createSearchFunction(paymentOptions, setPaymentOptionsSuggestions)


  const searchCities = (event: { query: string }) => {
    setTimeout(() => {
      let _filteredSuggestions
      if (!event.query.trim().length) {
        _filteredSuggestions = [...cities]
      } else {
        _filteredSuggestions = cities.filter((element) => {
          return element.city.toLowerCase().startsWith(event.query.toLowerCase())
        })
      }

      setAddressSuggestion(_filteredSuggestions)
    }, 50)
  }



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
  console.log('000', formik.values)
  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }




  const [orderItemInput, setOrderItemInput] = useState([{ id: '', name: '', quantity: '', price: '' }]);

  const handleAddInput = () => {
    setOrderItemInput([...orderItemInput, { id: '', name: '', quantity: '', price: '' }]);
  };

  const handleRemoveInput = (index) => {
    if (orderItemInput.length === 1) {
      return;
    }
    const newInputsItems = [...orderItemInput];
    newInputsItems.splice(index, 1);
    setOrderItemInput(newInputsItems);
  };


  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    setOrderItemInput(prevState => {
      const newInputsItems = [...prevState];
      newInputsItems[index][name] = value;

      const newOrderItems = newInputsItems.map(({ id, name, quantity, price }) => ({ id, name, quantity, price, }));
      const totalPrice = newOrderItems.reduce((acc, curr) => {
        return acc + curr.price * curr.quantity;
      }, 0)

      // update the state with the new order items
      formik.setValues({ ...formik.values, orderItems: newOrderItems, totalPrice: totalPrice });
      return newInputsItems;
    });
  };


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
                    pincode: "560079",
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
                          number: "1",
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
                  pincode: "10001",
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
                        number: "1425",
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
                  pincode: "10001",
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
                        number: "1",
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
                    product: 11,
                    quantity: 10,
                    price: 123,
                  }, {
                    product: 12,
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
                { label: "Address", field: "address" },
                
                { label: "Area Street", field: "areaStreet" },
                { label: "LandMark", field: "landmark Name" },
                { label: "Building Number", field: "buildingNumber" },
                { label: "Pincode", field: "pincode" },
                // { field: "totalPrice", label: "Total Price" },
                // { field: "quantity", label: "Quantity" },
                // { field: "paymentStatus", label: "Payment Status" },
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

              <div className="field col-12 md:col-3 lg:col-2 mt-4">
                <div className="p-float-label">
                  <AutoComplete
                    id="city"
                    value={formik.values.city}
                    suggestions={addressSuggestion}
                    completeMethod={searchCities}
                    field="city"
                    onChange={async (e) => {
                      let city = typeof e.value === "string" ? e.value : e.value.city
                      let state = typeof e.value === "string" ? " " : e.value.state
                      let country = typeof e.value === "string" ? "" : "India"

                      await formik.setValues({ ...formik.values, city, state ,country})
                    }}
                    aria-label="cities"
                    dropdownAriaLabel="Select City"
                    className={classNames({ "p-invalid": isFormFieldValid("city") })}
                  // disabled={!vendorEditState}
                  />

                  <label
                    htmlFor="vendor_city"
                    className={classNames({ "p-error": isFormFieldValid("city") })}
                  >
                    City
                  </label>
                </div>
                {getFormErrorMessage("city")}
              </div>


              <div className="field col-12 md:col-3 lg:col-2 mt-4">
                <span className="p-float-label">
                  <InputText
                    id="state"
                    value={formik.values.state}
                    className={classNames({ "p-invalid": isFormFieldValid("state") })}
                    // disabled={!vendorEditState}
                    onChange={formik.handleChange}
                  />
                  <label
                    htmlFor="state"
                    className={classNames({ "p-error": isFormFieldValid("state") })}
                  >
                    State
                  </label>
                </span>
                {getFormErrorMessage("state")}
              </div>

              <div className="field col-12 md:col-3 lg:col-2 mt-4">
                <span className="p-float-label">
                  <InputText
                    id="country"
                    value={formik.values.country}
                    className={classNames({ "p-invalid": isFormFieldValid("country") })}
                    // disabled={!vendorEditState}
                    onChange={formik.handleChange}
                  />
                  <label
                    htmlFor="country"
                    className={classNames({ "p-error": isFormFieldValid("country") })}
                  >
                   Country
                  </label>
                </span>
                {getFormErrorMessage("country")}
              </div>



              <div className="field col-12 lg:col-2 md:col-6 mt-4">
                <span className="p-float-label">
                  <InputText
                    disabled={true}
                    id={"totalPrice"}
                    // placeholder='SKU'
                    name={"totalPrice"}
                    value={formik.values.totalPrice}
                    autoFocus
                    className={classNames({ "p-invalid ": isFormFieldValid("description") })}
                  />
                  <label
                    htmlFor={"totalPrice"}
                    className={classNames({ "p-error": isFormFieldValid("sku") })}
                  >
                    TotalPrice
                  </label>
                </span>
                {getFormErrorMessage("totalPrice")}
              </div>

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
                      // const selectedItemsOptionName = selectedOrderItem ? selectedOrderItem.name : null;
                      formik.setFieldValue('customer', selectedOrderItem);
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

              <div key={`paymentStatus`} className="field col-12 lg:col-5 md:col-6 mt-4">
                <span className="p-float-label">
                  <AutoComplete
                    id="paymentStatus"
                    value={formik.values.paymentStatus}
                    dropdown
                    forceSelection
                    suggestions={paymentOptionsSuggestions}
                    completeMethod={searchPayment}
                    field="name"
                    onChange={(e) => {

                      const selectedOrderItem = paymentOptions.find(option_ => option_.name === e.value.name);
                      const selectedItemsOptionName = selectedOrderItem ? selectedOrderItem.name : null;
                      formik.setFieldValue('paymentStatus', selectedItemsOptionName);
                    }}
                    aria-label="paymentStatus"
                    dropdownAriaLabel="paymentStatus"
                    className={classNames({ "p-invalid": isFormFieldValid("paymentStatus") })}
                  />
                  <label

                    className={classNames({ "p-error": isFormFieldValid("paymentStatus") })}
                  >
                    Payment Status
                  </label>
                </span>
                {/* {getFormErrorMessage("category")} */}
              </div>

              <div>
                <div className="">
                  {orderItemInput.map((ele, index) => (
                    <div key={index} className='flex gap-4 align-items-center mt-3'>
                      <span className="p-float-label">
                        <AutoComplete
                          id="name"
                          value={ele?.name}
                          dropdown
                          forceSelection
                          suggestions={orderItemsSuggestions}
                          completeMethod={searchOrderItems}
                          field="name"
                          onChange={async (e) => {
                            console.log(e.value, 'event')
                            handleInputChange(e, index)
                            const test = [...orderItemInput]
                            test[index] = { ...e.value }
                            setOrderItemInput(test)
                          }}
                          aria-label="products"
                          dropdownAriaLabel="Select Product"
                          className={classNames({ "p-invalid": isFormFieldValid("name") })}
                          style={{ width: '400px' }}
                        />
                        <label
                          htmlFor={"type"}
                          className={classNames({ "p-error": isFormFieldValid("type") })}
                        >
                          Order Items
                        </label>
                      </span>

                      <span className="p-float-label">
                        <InputText
                          className=''
                          type='text'
                          name='quantity'
                          value={ele?.quantity}
                          onChange={async (e) => {
                            handleInputChange(e, index)

                          }}
                          style={{ width: '400px' }}
                        />
                        <label
                          htmlFor={"type"}
                          className={classNames({ "p-error": isFormFieldValid("type") })}
                        >
                          Quantity
                        </label>
                      </span>

                      <span className="p-float-label">
                        <InputText
                          className=''
                          type='text'
                          name='price'
                          value={ele?.price}
                          onChange={async (e) => {
                            handleInputChange(e, index)

                          }}
                          style={{ width: '400px' }}
                        />
                        <label
                          htmlFor={"type"}
                          className={classNames({ "p-error": isFormFieldValid("type") })}
                        >
                          Price
                        </label>
                      </span>

                      <Button
                        icon="pi pi-minus"
                        className="p-2 m-1"
                        onClick={() => handleRemoveInput(index)}
                        style={{ height: '40px' }}
                      />

                      <Button
                        icon="pi pi-plus"
                        className="m-1"
                        onClick={handleAddInput}
                        style={{ height: '40px' }}
                      />
                    </div>
                  ))
                  }
                </div>
              </div>


              <div className="col-12">
                <Checkbox
                  value={formik.values.checkedAddress}
                  checked={formik.values.checkedAddress === true}
                  onChange={(e) => {
                    formik.setFieldValue("checkedAddress", e.checked ? true : false);
                  }}
                  className="mt-2"
                />
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
            <Column
              // field="channelCreatedAt"
              header="Order Status"
              body={(rowData) => {
                if (isLoading)
                  return <span>loading..</span>
                else
                  return (
                    <pre>
                      <Dropdown
                        value={rowData.orderStatus}
                        options={order_statuses}
                        optionLabel="name"
                        optionValue="id"
                        onChange={async (e) => {
                          console.log('e: ', e.target.value);
                          await updateNewOrder({
                            id: rowData.id,
                            orderStatus: e.target.value
                          }, {
                            onSuccess: async () => {
                              await refetch()
                            }
                          })
                        }}
                      />
                      {/* {JSON.stringify(rowData, null, 2)} */}
                    </pre>
                  )
              }}
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
