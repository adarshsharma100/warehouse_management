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
import classNames from "classnames";
import { createCSVFormat, createSearchFunction, filterExistingValues, } from "app/constants"
import { AutoComplete } from "primereact/autocomplete";
import getOrder_statuses from "app/order_statuses/queries/getOrder_statuses";
import getOrder_items from "app/order_items/queries/getOrder_items";
import getProducts from "app/products/queries/getProducts"
import { useFormik } from "formik";
import CreateOrder from 'app/orders/mutations/createOrder'
import getCustomers from "app/customers/queries/getCustomers";
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { ToggleButton } from 'primereact/togglebutton';
import { Checkbox } from "primereact/checkbox";
import { JobStatus } from "components/JobStatus";
import AddressComponent from "../../components/AddressComponent";


const initialOrderDetails = {
  firstName: '',
  lastName: '',
  email: '',
  customer: '',
  contactNumber: '',
  checkedAddress: '',
  orderStatus: '',
  landmarkName: "",
  shippingAddressId: "",
  billingAddressId: "",
  shopifyId: "",
  isExistingCustomer: false,
  customerId: "",
  paymentStatus: "",
  totalPrice: "",
  gateway: "",
  orderItems: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  shippingAddress: {
    address: '',
    pincode: '',
    city: '',
    state: '',
    country: '',
    landmarkName: '',
    email: '',
    contactNumber: '',

  },
  billingAddress: {
    address: '',
    pincode: '',
    city: '',
    state: '',
    country: '',
    landmarkName: '',
    email: '',
    contactNumber: '',
  },
  isShippingIsBilling: false
}

const customers_ = [
  { id: 1, name: 'customers1' },
  { id: 2, name: 'customers2' },
  { id: 3, name: 'customers3' },
  { id: 4, name: 'customers4' },
  { id: 5, name: 'customers5' }
]
const gateway_ = [
  { id: 1, name: 'Paypal' },
  { id: 2, name: 'Paytm' },
  { id: 3, name: 'UPI' },
  { id: 4, name: 'Net-Banking' },
]
const paymentStatus_ = [
  { id: 1, name: 'Unpaid' },
  { id: 2, name: 'Paid' },
]

const ITEMS_PER_PAGE = 100;

export const OrdersList = () => {

  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ orders, jobId }, { refetch: refetchOrders }] = usePaginatedQuery(getOrders, {
    orderBy: { id: "desc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });
  console.log('orders: ', orders);

  const [{ order_statuses, }] = useQuery(getOrder_statuses, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })
  console.log('order_statuses: ', order_statuses);

  // const [{ customers }] = useQuery(getCustomers, {
  //   skip: undefined,
  //   where: undefined,
  //   orderBy: undefined,
  //   take: undefined
  // })
  // console.log('customers: ', customers);

  const [{ products }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
  })

  // Todo : UsePaginatedQueries
  // const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  // const goToNextPage = () => router.push({ query: { page: page + 1 } });

  const [createNewOrder] = useMutation(createOrder)
  const [updateNewOrder, { isLoading }] = useMutation(updateOrder)
  const [orderItemsDetails, setOrderItemsDetails] = useState(initialOrderDetails)
  const [orderDialog, setOrderDialog] = useState(false)
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
  const [activeRowData, setActiveRowData] = useState({})
  const [newOrderUpdate, setNewOrderUpdate] = useState(false)


  const searchOrderStatus = createSearchFunction(orderStatusOption, setOderStatusSuggestions)
  const searchOrderItems = createSearchFunction(orderItemsOptions, setOderItemsSuggestions)
  const searchCustomers = createSearchFunction(customerOptions, setCustomerOptionsSuggestions)
  const searchGateway = createSearchFunction(gatewayOptions, setGatewayOptionsSuggestions)
  const searchPayment = createSearchFunction(paymentOptions, setPaymentOptionsSuggestions)
  const scrollToTop = useRef<HTMLDivElement>(null)


  const searchCities = (event: { query: string }) => {
    setTimeout(() => {
      let _filteredSuggestions
      if (!event.query.trim().length) {
        _filteredSuggestions = [...cities]
        console.log("searchCity -", _filteredSuggestions)
      } else {
        _filteredSuggestions = cities.filter((element) => {
          console.log("searchCity +", _filteredSuggestions)
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


  const address = [
    { name: 'address', requiredMessage: 'Address  is required' },
    { name: 'pincode', requiredMessage: 'Pincode  is required' },
    { name: 'city', requiredMessage: 'City is required' },
    { name: 'state', requiredMessage: 'State  is required' },
    { name: 'country', requiredMessage: 'Country status is required' },
    { name: 'email', requiredMessage: 'Email is required', type: "email" },
    { name: 'contactNumber', requiredMessage: 'Contact number is required' },
  ];

  const CustomerParams = [
    { name: 'firstName', requiredMessage: 'FirstName is required' },
    { name: 'lastName', requiredMessage: 'LastName is required' },
    // { name: 'address', requiredMessage: 'Address  is required' },
    // { name: 'pincode', requiredMessage: 'Pincode  is required' },
    // { name: 'city', requiredMessage: 'City is required' },
    // { name: 'state', requiredMessage: 'State  is required' },
    // { name: 'country', requiredMessage: 'Country status is required' },
    // { name: 'email', requiredMessage: 'Email is required' },
    // { name: 'contactNumber', requiredMessage: 'Contact number is required' },
    ...address
  ];


  const CustomerParamSchema = CustomerParams.map(({ requiredMessage }) => {
    return Yup.string().when("isExistingCustomer", {
      is: false,
      then: Yup.string().required(requiredMessage),
    });
  });
  const addressSchema = address.map(({ requiredMessage }) => {
    return Yup.string().required(requiredMessage);
  });





  const handleRowClick = async (e) => {
    console.log('e.data: ', e.originalEvent.target.classList[0]);
    const onclickClass = e.originalEvent.target.classList[0]
    // e.preventDefault()
    // e.stopPropagation()
    if (["p-dropdown-trigger", "OrderStatus", "p-dropdown-trigger-icon", "p-dropdown-label"].includes(onclickClass)) {
      return
    }
    setActiveRowData({ ...e.data })
    setNewOrderUpdate(true)
    setOrderDialog(true)
    const name = e.data.customers
    const _email = e.data.customers?.addresses?.emails_emails_addressesToaddresses.map((ele) => ele.email)
    const _contactNumber = e.data.customers?.addresses?.contact_number.map((ele) => ele.number)
    const _orderStatus = e.data.order_status.name
    const _shippingAddress = e.data.addresses_orders_shippingAddressIdToaddresses
    const _billingAddress = e.data.addresses_orders_billingAddressIdToaddresses

    const _orderItems = e.data.order_items.map(({ quantity, price, products: { id, name, sku } }) => ({
      id,
      name: `${sku} - ${name}`,
      quantity: quantity.toString(),
      price: price.toString()
    }));

    // const _quantity = e.data.order_items.quantity
    console.log('name: ', _billingAddress);

    await formik.setValues({
      ...e.data,
      firstName: name.firstName,
      lastName: name.lastName,
      email: _email,
      contactNumber: _contactNumber,
      // order_status: _orderStatus,
      shippingAddress: {
        address: _shippingAddress.areaStreet,
        landmarkName: _shippingAddress.landmarkName,
        pincode: _shippingAddress.pincode,
        city: _shippingAddress.cityCountryProvince,
        state: _shippingAddress.state,
        country: 'India'


      },
      billingAddress: {
        address: _billingAddress.areaStreet,
        landmarkName: _billingAddress.landmarkName,
        pincode: _billingAddress.pincode,
        city: _billingAddress.cityCountryProvince,
        state: _billingAddress.state,
        country: "India"


      },
      // orderItems: _orderItems,

    })

    scrollToTop?.current && scrollToTop?.current.scrollIntoView()

    // const test = {
    //   "id": 131,
    //   "orderStatus": 2,
    //   "shippingAddressId": 604,
    //   "billingAddressId": 605,
    //   "createdAt": null,
    //   "shopifyId": null,
    //   "customerId": 147,
    //   "paymentStatus": "Paid",
    //   "totalPrice": 27000,
    //   "gateway": "Paypal",
    //   "channelCreatedAt": "2023-03-23T12:15:20.000Z",
    //   "cursor": null,
    //   "order_items": [
    //     {
    //       "id": 67,
    //       "order": 131,
    //       "product": 3,
    //       "quantity": 2,
    //       "price": 13500,
    //       "products": {
    //         "id": 3,
    //         "name": "Machine Tools",
    //         "sku": "TIFEC0045",
    //         "description": "Machine Tools update::",
    //         "length": null,
    //         "width": null,
    //         "height": null,
    //         "weight": null,
    //         "color": null,
    //         "hsnCode": null,
    //         "imageUrl": "https://loremflickr.com/320/240/device?random=1",
    //         "createdAT": null,
    //         "updatedAT": null,
    //         "customDuty": null,
    //         "gstTaxTypeCode": null,
    //         "taxCalcType": null,
    //         "status": "Active",
    //         "category": null,
    //         "brand": null,
    //         "costPrice": 10,
    //         "type": 1
    //       }
    //     }
    //   ],
    //   "order_status": {
    //     "id": 2,
    //     "name": "Unfulfilled",
    //     "description": "Order has not been fulfilled yet"
    //   },
    //   "addresses_orders_billingAddressIdToaddresses": {
    //     "id": 605,
    //     "buildingNumber": null,
    //     "areaStreet": "dfghjkl",
    //     "landmarkName": "67ytutgyg",
    //     "cityCountryProvince": "Adoni",
    //     "state": "Andhra Pradesh",
    //     "pincode": "09876543",
    //     "country": 1
    //   },
    //   "addresses_orders_shippingAddressIdToaddresses": {
    //     "id": 604,
    //     "buildingNumber": null,
    //     "areaStreet": "dfghjkl",
    //     "landmarkName": "67ytutgyg",
    //     "cityCountryProvince": "Adoni",
    //     "state": "Andhra Pradesh",
    //     "pincode": "09876543",
    //     "country": 1
    //   },
    //   "customers": {
    //     "id": 147,
    //     "firstName": "Akshara",
    //     "lastName": "Mishra",
    //     "addressesId": 603,
    //     "shopifyId": null,
    //     "addresses": {
    //       "contact_number": [
    //         {
    //           "id": 395,
    //           "type": "mobile",
    //           "number": "1234567890",
    //           "address": 603
    //         }
    //       ],
    //       "emails_emails_addressesToaddresses": [
    //         {
    //           "id": 127,
    //           "email": "scd@fds.af",
    //           "addresses": 603
    //         }
    //       ]
    //     }
    //   }
    // }
  }


  const formik = useFormik({
    initialValues: orderItemsDetails,
    validationSchema: Yup.object().shape({
      ...Object.assign({}, ...CustomerParams.map((p, i) => ({ [p.name]: CustomerParamSchema[i] }))),
      // shippingAddress: Yup.object().shape({
      //   ...Object.assign({}, ...address.map((p, i) => ({ [p.name]: addressSchema[i] }))),
      // })
      // shippingAddress: Yup.object().shape({
      //   address: Yup.string()
      //     .required('Shipping address is required'),
      //   pincode: Yup.string()
      //     .required('Shipping pincode is required'),
      //   city: Yup.string()
      //     .required('Shipping city is required'),
      //   state: Yup.string()
      //     .required('Shipping state is required'),
      //   country: Yup.string()
      // })

      // lastName: Yup.string()
      //   .required('Last name is required'),
      // email: Yup.string()
      //   .email('Invalid email')
      //   .required('Email is required'),
      // customer: Yup.string()
      //   .required('Customer name is required'),
      // contactNumber: Yup.string()
      //   .required('Contact number is required'),
      // checkedAddress: Yup.string()
      //   .required('Checked address is required'),
      // orderStatus: Yup.string()
      //   .required('Order status is required'),
      // landmarkName: Yup.string(),
      // shippingAddressId: Yup.string(),
      // billingAddressId: Yup.string(),
      // shopifyId: Yup.string(),
      // customerId: Yup.string(),
      // paymentStatus: Yup.string(),
      // totalPrice: Yup.string(),
      // gateway: Yup.string(),
      // orderItems: Yup.string(),
      // address: Yup.string()
      //   .required('Address is required'),
      // city: Yup.string()
      //   .required('City is required'),
      // state: Yup.string()
      //   .required('State is required'),
      // country: Yup.string()
      //   .required('Country is required'),
      // pincode: Yup.string()
      //   .required('Pincode is required'),
      // shippingAddress: Yup.object().shape({
      //   address: Yup.string()
      //     .required('Shipping address is required'),
      //   pincode: Yup.string()
      //     .required('Shipping pincode is required'),
      //   city: Yup.string()
      //     .required('Shipping city is required'),
      //   state: Yup.string()
      //     .required('Shipping state is required'),
      //   country: Yup.string()
      // })


    }),
    onSubmit: async (data) => {
      console.log('formdata: ', data);

      const {
        firstName, lastName, email, contactNumber, orderStatus,
        landmarkName, pincode, paymentStatus, totalPrice, gateway,
        orderItems, address, state, country, city,
        shippingAddress: {
          address: shippingAreaStreet,
          pincode: shippingPincode,
          city: shippingCity,
          state: shippingState,
          country: shippingCountry,
          landmarkName: shippingLandmarkName,
          email: shippingEmail,
          contactNumber: shippingContactNumber
        },
        billingAddress: {
          address: billingAreaStreet,
          pincode: billingPincode,
          city: billingCity,
          state: billingState,
          country: billingCountry,
          landmarkName: billingLandmarkName,
          email: billingEmail,
          contactNumber: billingContactNumber
        }
      } = data

      const orderItemValue = orderItems?.map((ele) => ele)
      const { id: activeID } = activeRowData

      if (newOrderUpdate) {
        try {
          await updateNewOrder({
            id: activeID,
            customer: {
              firstName,
              lastName
            }
          }, {
            onSuccess: () => {
              alert('Update Order!')
            },
            onError: () => {
              alert('update error!!!!!')
            }
          })

        } catch (error) {
          console.log('error: ', error);
        }
      } else {
        try {
          await createNewOrder({
            customer: {
              firstName,
              lastName,
              // shopifyId: "1425636985",
              addresses: {
                create: {
                  // buildingNumber: "56",
                  areaStreet: address,
                  landmarkName,
                  cityCountryProvince: city,
                  state,
                  pincode,
                  country: 1,
                  emails_emails_addressesToaddresses: {
                    create: [
                      {
                        email,
                      },
                    ],
                  },
                  contact_number: {
                    create: [
                      {
                        type: "mobile",
                        number: contactNumber,
                      },
                    ],
                  }

                }
              }
            },
            order: {
              orderStatus: Number(orderStatus?.id),
              isShippingIsBilling: true,
              shippingAddress: {
                // buildingNumber: "123",
                areaStreet: shippingAreaStreet,
                landmarkName: shippingLandmarkName,
                cityCountryProvince: shippingCity,
                state: shippingState,
                pincode: shippingPincode,
                country: 1,
                emails_emails_addressesToaddresses: {
                  create: [
                    {
                      email: shippingEmail,
                    },
                  ],
                },
                contact_number: {
                  create: [
                    {
                      type: "mobile",
                      number: shippingContactNumber,
                    },
                  ],
                }
              },
              billingAddress: {
                // buildingNumber: "456",
                areaStreet: billingAreaStreet,
                landmarkName: billingLandmarkName,
                cityCountryProvince: billingCity,
                state: billingState,
                pincode: billingPincode,
                country: 1,
                emails_emails_addressesToaddresses: {
                  create: [
                    {
                      email: billingEmail,
                    },
                  ],
                },
                contact_number: {
                  create: [
                    {
                      type: "mobile",
                      number: billingContactNumber,
                    },
                  ],
                }
              },
              paymentStatus,
              totalPrice,
              gateway,
              // channelCreatedAt: new Date(),
              order_items: {
                create: orderItemValue.map((ele) => ({
                  product: ele.id,
                  quantity: Number(ele.quantity),
                  price: Number(ele.price),
                }))
              },
            }

          },
            {
              onSuccess: async () => {
                await refetchOrders()
                formik?.resetForm()
                setOrderDialog(!orderDialog)

                //TO do Add Toast messages 
                alert(" new order created ")
              }, onError: (error) => {
                alert(error)
              },
            })
        } catch (error) {
          console.log('OrderCreation error: ', error);
        }
      }

      console.log('Order mutation Error')
    }
  })


  console.log('formik', formik.errors)
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
    <div className="grid w-full" >
      <div className="col-12">
        <div className="card flex justify-content-between align-items-center m-0">
          <h2>Orders</h2>

          <div className="flex gap-4 justify-content-end align-items-center">
            <Button
              icon="pi pi-plus"
              label="Create Order"
              onClick={() => {
                setOrderDialog(!orderDialog)
              }}
            />
            <div>
            </div>
          </div>
        </div>



      </div>

      {orderDialog &&
        <div className="col-12">
          <div className="card">
            <div>
              <h3>Customer Details</h3>
            </div>
            <form onSubmit={formik.handleSubmit}
              className="p-fluid">
              <div className=" grid">
                {[
                  { field: "firstName", label: "First Name" },
                  { field: "lastName", label: "Last Name" },
                  { field: "email", label: "Email ID" },
                  { field: "contactNumber", label: "Contact Number" },
                  { label: "Address", field: "address" },
                  { label: "LandMark", field: "landmarkName" },
                  { label: "Pincode", field: "pincode" },
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
                        console.log('e.value + ', e.value);
                        let city = typeof e.value === "string" ? e.value : e.value.city
                        let state = typeof e.value === "string" ? " " : e.value.state
                        let country = typeof e.value === "string" ? "" : "India"

                        await formik.setValues({ ...formik.values, city, state, country })
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



                {/* <div key={`Customer`} className="field col-12 lg:col-5 md:col-6 mt-4">
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
                {getFormErrorMessage("category")}
              </div> */}
                <div className="grid col-12">
                  <div key={`Order Status`} className="field col-12 lg:col-4 md:col-6 mt-2">
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
                          console.log('selectedOptionName: ', selectedOption);
                          formik.setFieldValue('orderStatus', selectedOption);
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

                  <div key={`gateway`} className="field col-12 lg:col-4 md:col-6 mt-2">
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
                          const selectedOrderItem = gatewayOptions.find(option_ => option_.name === e.value?.name);
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

                  <div key={`paymentStatus`} className="field col-12 lg:col-4 md:col-6 mt-2">
                    <span className="p-float-label ">
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
                  </div>
                </div>
                <div className="col-12">
                  <h3 >Order Items</h3>
                  {orderItemInput.map((ele, index) => (
                    <div key={index} className="grid ">

                      <div className="field col-12 lg:col-4 md:col-6 mt-2">
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
                              console.log(e.value, 'itemevent')
                              handleInputChange(e, index)
                              const test = [...orderItemInput]
                              test[index] = { ...e.value }
                              setOrderItemInput(test)
                            }}
                            aria-label="products"
                            dropdownAriaLabel="Select Product"
                            className={classNames({ "p-invalid": isFormFieldValid("name") })}

                          />
                          <label
                            htmlFor={"type"}
                            className={classNames({ "p-error": isFormFieldValid("type") })}
                          >
                            Products
                          </label>
                        </span>
                      </div>
                      <div className="field col-12 lg:col-3 md:col-6 mt-2">
                        <span className="p-float-label">
                          <InputText
                            className=''
                            type='text'
                            name='quantity'
                            value={ele?.quantity}
                            onChange={async (e) => {
                              handleInputChange(e, index)

                            }}

                          />
                          <label
                            htmlFor={"type"}
                            className={classNames({ "p-error": isFormFieldValid("type") })}
                          >
                            Quantity
                          </label>
                        </span>
                      </div>
                      <div className="field col-12 lg:col-3 md:col-6 mt-2">
                        <span className="p-float-label">
                          <InputText
                            className=''
                            type='text'
                            name='price'
                            value={ele?.price}
                            onChange={async (e) => {
                              handleInputChange(e, index)
                            }}

                          />
                          <label
                            htmlFor={"type"}
                            className={classNames({ "p-error": isFormFieldValid("type") })}
                          >
                            Price
                          </label>
                        </span></div>
                      <div className="field col-12 lg:col-2 md:col-6 mt-2">
                        <Button
                          icon="pi pi-minus"
                          className="p-2 m-1"
                          onClick={() => handleRemoveInput(index)}
                          style={{ height: '40px' }}
                        />

                        <Button
                          icon="pi pi-plus"
                          className="m-1"
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddInput();
                          }}
                          style={{ height: '40px' }}
                        />
                      </div>
                    </div>
                  ))
                  }
                </div>

                <div className="field col-12 lg:col-2 md:col-6 mt-1">
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

                <div className="col-12">
                  <h3 className="field col-12 lg:col-5 md:col-6 mt-4">Shipping Address</h3>
                  <AddressComponent isFormFieldValid={isFormFieldValid} getFormErrorMessage={getFormErrorMessage} errors={formik.errors.shippingAddress} value={formik.values.shippingAddress} setField={formik.setFieldValue} addressName={'shippingAddress'} />
                </div>
                <div className="col-12 mt-3 grid align-items-center">
                  <label className="ml-3">If Billing Address is Shipping Address:</label>
                  <Checkbox
                    // disabled={true}
                    checked={formik?.values?.isShippingIsBilling}
                    onChange={async (e) => {
                      await formik.setFieldValue("isShippingIsBilling", e.checked);
                    }}
                    className="ml-2"
                  />
                </div>

                {!formik?.values?.isShippingIsBilling &&
                  <div className="col-12">
                    <h3 className="field col-12 lg:col-5 md:col-6 mt-4">Billing Address</h3>
                    <AddressComponent errors={formik.errors.billingAddress} value={formik.values.billingAddress} setField={formik.setFieldValue} addressName={'billingAddress'} />
                  </div >}




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
                    formik.resetForm()
                  }}
                />
              </div>

            </form>
          </div>
        </div>

      }
      {/* <div className="col-12">
        <JobStatus id={jobId} title={"Order Fetching Job"} />
      </div> */}


      <div className="col-12">
        <div className="card">
          <DataTable
            value={orders}
            responsiveLayout="scroll"
            showGridlines
            // header={renderHeader}
            stripedRows
            className="text-s datatable-responsive"
            onRowClick={handleRowClick}
          // onRowClick={async (e) => {
          //   console.log('e.data: ', e.data);
          //   setActiveRowData({ ...e.data })
          //   setNewOrderUpdate(true)
          //   setOrderDialog(true)
          //   const name = e.data.customers
          //   const _email = e.data.customers?.addresses?.emails_emails_addressesToaddresses.map((ele) => ele.email)
          //   const _contactNumber = e.data.customers?.addresses?.contact_number.map((ele) => ele.number)
          //   const _orderStatus = e.data.order_status.name
          //   const _shippingAddress = e.data.addresses_orders_shippingAddressIdToaddresses
          //   const _billingAddress = e.data.addresses_orders_billingAddressIdToaddresses

          //   const _orderItems = e.data.order_items.map(({ quantity, price, products: { id, name, sku } }) => ({
          //     id,
          //     name: `${sku} - ${name}`,
          //     quantity: quantity.toString(),
          //     price: price.toString()
          //   }));

          //   // const _quantity = e.data.order_items.quantity
          //   console.log('name: ', _billingAddress);

          //   await formik.setValues({
          //     ...e.data,
          //     firstName: name.firstName,
          //     lastName: name.lastName,
          //     email: _email,
          //     contactNumber: _contactNumber,
          //     // order_status: _orderStatus,
          //     shippingAddress: {
          //       address: _shippingAddress.areaStreet,
          //       landmarkName: _shippingAddress.landmarkName,
          //       pincode: _shippingAddress.pincode,
          //       city: _shippingAddress.cityCountryProvince,
          //       state: _shippingAddress.state,
          //       country: 'India'


          //     },
          //     billingAddress: {
          //       address: _billingAddress.areaStreet,
          //       landmarkName: _billingAddress.landmarkName,
          //       pincode: _billingAddress.pincode,
          //       city: _billingAddress.cityCountryProvince,
          //       state: _billingAddress.state,
          //       country: "India"


          //     },
          //     // orderItems: _orderItems,

          //   })

          //   scrollToTop?.current && scrollToTop?.current.scrollIntoView()

          //   const test = {
          //     "id": 131,
          //     "orderStatus": 2,
          //     "shippingAddressId": 604,
          //     "billingAddressId": 605,
          //     "createdAt": null,
          //     "shopifyId": null,
          //     "customerId": 147,
          //     "paymentStatus": "Paid",
          //     "totalPrice": 27000,
          //     "gateway": "Paypal",
          //     "channelCreatedAt": "2023-03-23T12:15:20.000Z",
          //     "cursor": null,
          //     "order_items": [
          //       {
          //         "id": 67,
          //         "order": 131,
          //         "product": 3,
          //         "quantity": 2,
          //         "price": 13500,
          //         "products": {
          //           "id": 3,
          //           "name": "Machine Tools",
          //           "sku": "TIFEC0045",
          //           "description": "Machine Tools update::",
          //           "length": null,
          //           "width": null,
          //           "height": null,
          //           "weight": null,
          //           "color": null,
          //           "hsnCode": null,
          //           "imageUrl": "https://loremflickr.com/320/240/device?random=1",
          //           "createdAT": null,
          //           "updatedAT": null,
          //           "customDuty": null,
          //           "gstTaxTypeCode": null,
          //           "taxCalcType": null,
          //           "status": "Active",
          //           "category": null,
          //           "brand": null,
          //           "costPrice": 10,
          //           "type": 1
          //         }
          //       }
          //     ],
          //     "order_status": {
          //       "id": 2,
          //       "name": "Unfulfilled",
          //       "description": "Order has not been fulfilled yet"
          //     },
          //     "addresses_orders_billingAddressIdToaddresses": {
          //       "id": 605,
          //       "buildingNumber": null,
          //       "areaStreet": "dfghjkl",
          //       "landmarkName": "67ytutgyg",
          //       "cityCountryProvince": "Adoni",
          //       "state": "Andhra Pradesh",
          //       "pincode": "09876543",
          //       "country": 1
          //     },
          //     "addresses_orders_shippingAddressIdToaddresses": {
          //       "id": 604,
          //       "buildingNumber": null,
          //       "areaStreet": "dfghjkl",
          //       "landmarkName": "67ytutgyg",
          //       "cityCountryProvince": "Adoni",
          //       "state": "Andhra Pradesh",
          //       "pincode": "09876543",
          //       "country": 1
          //     },
          //     "customers": {
          //       "id": 147,
          //       "firstName": "Akshara",
          //       "lastName": "Mishra",
          //       "addressesId": 603,
          //       "shopifyId": null,
          //       "addresses": {
          //         "contact_number": [
          //           {
          //             "id": 395,
          //             "type": "mobile",
          //             "number": "1234567890",
          //             "address": 603
          //           }
          //         ],
          //         "emails_emails_addressesToaddresses": [
          //           {
          //             "id": 127,
          //             "email": "scd@fds.af",
          //             "addresses": 603
          //           }
          //         ]
          //       }
          //     }
          //   }
          // }}
          >
            <Column
              // field={}
              header="Order Number"
              body={(rowData) => rowData.shopifyId ? rowData.shopify?.orderNumber.slice(20) : rowData.id}
            // body={(rowData) => <pre>{JSON.stringify(rowData.shopify, null, 2)}</pre>}
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
                              await refetchOrders()
                            }
                          })
                        }}



                      />
                    </pre>
                  )
              }}
              className="OrderStatus"
            />
          </DataTable>
        </div>
      </div>
    </div >
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

// Working CRUD for orders can delete after orders page is complete
{/* <Button
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
                  type: "mobile",
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
></Button> */}
