import { invoke, useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { cities, createSearchFunction, dateFormat } from "app/constants";
import Head from "next/head";
import getOrder_statuses from "app/order_statuses/queries/getOrder_statuses";
import createOrder from "app/orders/mutations/createOrder";
import updateOrder from "app/orders/mutations/updateOrder";
import getOrders from "app/orders/queries/getOrders";
import getProducts from "app/products/queries/getProducts";
import CreateShipment from 'app/shipments/mutations/createShipment';
import classNames from "classnames";
import Loading from "components/loading";
import { useFormik } from "formik";
import Layout from "layouts/Layout";
import { useRouter } from "next/router";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { OverlayPanel } from 'primereact/overlaypanel';
import { Paginator } from "primereact/paginator";
import { Suspense, useEffect, useReducer, useRef, useState } from "react";
import * as Yup from "yup";
import AddressComponent from "../../components/AddressComponent";

import { tError, tsuccess } from "app/constants";
import updateInventory_product from "app/inventory_products/mutations/updateInventory_product";
import getInventory_products from "app/inventory_products/queries/getInventory_products";
import { TabMenu } from "primereact/tabmenu";
import { Toast } from "primereact/toast";
import getInventory_product from "app/inventory_products/queries/getInventory_product";

const initialState = {
  orders: [],
  filteredOrders: [],
  manifestShipments: [],
  manifestStep: 0,
  displayManifest: false,
  statusId: undefined,
  statusName: "ALL",
  tableRowsCount: 10,
  skipCount: 0,
  first: 0,
  rows: 10,
  itemsPerPage: 10,
  selectedShipments: [],
  isReadyToShip: false,
  readyToShipActiveIndex: 0,
  containerName: 'manifests',
  sasToken: process.env.NEXT_PUBLIC_STORAGESASTOKEN,
  storageAccountName: process.env.NEXT_PUBLIC_STORAGERESOURCENAME,
  manifestImageURL: ""
};

const initialOrderDetails = {
  name: "",
  firstName: '',
  lastName: '',
  email: '',
  companyName: "",
  customer: { firstName: '', companyName: '' },
  contactNumber: '',
  checkedAddress: '',
  orderStatus: '',
  landmarkName: "",
  shippingAddressId: "",
  billingAddressId: "",
  shopifyId: "",
  isExistingCustomer: false,
  customerId: "",
  paymentStatus: { id: "", name: "" },
  totalPrice: "",
  gateway: "",
  orderItems: [{ id: '', name: '', quantity: '', price: '', availableInventory: "" }],
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
  { id: 1, name: "PAID" },
  { id: 2, name: "PENDING" },
  { id: 3, name: "REFUNDED" },
  { id: 4, name: "PARTIALLY - REFUNDED" },
  { id: 5, name: "VOIDED" },
]

const ITEMS_PER_PAGE = 250;

export const OrdersList = () => {
  const reducer = (state, { type, payload }) => {
    switch (type) {
      case 'GET_ORDERS':
        return { ...state, orders: payload };
      case 'FILTER_BY':
        return { ...state, filteredOrders: payload };
      case 'UPDATE_STATUS_ID':
        return { ...state, statusId: payload };
      case 'UPDATE_STATUS_NAME':
        return { ...state, statusName: payload };
      case 'UPDATE_SKIP_COUNT':
        return { ...state, skipCount: payload };
      case 'UPDATE_TABLE_ROWS_COUNT':
        return { ...state, tableRowsCount: payload };
      case 'SET_SELECTED_SHIPMENTS':
        return { ...state, selectedShipments: payload };
      case 'RESET_SELECTED_SHIPMENTS':
        return { ...state, selectedShipments: [] };
      case 'READY_TO_SHIP':
        return { ...state, isReadyToShip: payload };
      case 'READY_TO_SHIP_ACTIVE_INDEX':
        return { ...state, readyToShipActiveIndex: payload };
      case 'DISPATCH_SHIPMENTS':
        return { ...state, displayManifest: true }
      case 'SET_SHIPMENT_STATE':
        return { ...state, [payload.prop]: payload.value }

      case 'FILTER_BY_STATUS': // Add this case
        const filteredOrders = state.orders.filter(order => order.status === 'unfulfilled');
        return { ...state, filteredOrders };
      default:
        throw new Error(`Unhandled action type: ${type}`);
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);
  const { statusId, skipCount, tableRowsCount } = state
  const toast = useRef(null)
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ orders, count: orderCounts }, { refetch: refetchOrders }] = usePaginatedQuery(getOrders, {
    orderBy: { id: "asc" },
    where: {},
    skip: skipCount,
    take: tableRowsCount,
  });

  const [{ order_statuses, }] = useQuery(getOrder_statuses, {
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

  const [{ products }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
  })

  const [{ inventory_products }] = useQuery(getInventory_products, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })

  const [updateInventory_productMutation, { error: updateInventoryError, isLoading: updatingInventory },] = useMutation(updateInventory_product)


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
      sku,
    }
  })

  const [orderItemsSuggestions, setOderItemsSuggestions] = useState<any>(null)

  const customerOptions = orders.map(({ customers }) => ({
    ...customers,
    name: `${customers?.firstName}${customers?.companyName ? `- ${customers?.companyName}` : ""}`
  }))

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
  // const searchCustomers = createSearchFunction(customerOptions, setCustomerOptionsSuggestions)
  const searchGateway = createSearchFunction(gatewayOptions, setGatewayOptionsSuggestions)
  const searchPayment = createSearchFunction(paymentOptions, setPaymentOptionsSuggestions)
  const scrollToTop = useRef<HTMLDivElement>(null)


  const searchCities = (event: { query: string }) => {
    setTimeout(() => {
      let _filteredSuggestions
      if (!event.query.trim().length) {
        _filteredSuggestions = [...cities]
        // 
      } else {
        _filteredSuggestions = cities.filter((element) => {
          // 
          return element.city.toLowerCase().startsWith(event.query.toLowerCase())
        })
      }

      setAddressSuggestion(_filteredSuggestions)
    }, 50)
  }


  const searchCustomers = (event) => {
    setTimeout(() => {
      let _filteredSuggestions;

      if (!event.query.trim().length) {
        _filteredSuggestions = [...customerOptions];
      } else {
        const query = event.query.toLowerCase();
        _filteredSuggestions = customerOptions.filter((element) => {
          const firstName = element.firstName?.toLowerCase();
          return firstName?.startsWith(query);
        });
      }

      setCustomerOptionsSuggestions(_filteredSuggestions);
    }, 50);
  };

  const isInStock = async (sku) => {
    try {
      const { inventory_products
      } = await invoke(getInventory_products, {
        where: {
          products: {
            sku,
          },   
          shelves: {
            areas: {
              warehouse: 2
            }
          }
        }
      })


      const { quantity, blocked, goodShelfIds, blockedShelfIds } = inventory_products.reduce((acc, curr, i) => {
        if (curr?.shelves?.shelfType === 2) {
          return {
            ...acc,
            quantity: acc.quantity + curr?.quantity,
            goodShelfIds: [...acc.goodShelfIds, curr.id]
          }
        }
        else {
          return {
            ...acc,
            blocked: acc.blocked + curr?.quantity,
            blockedShelfIds: [...acc.blockedShelfIds, curr.id]
          }
        }
      }, {
        quantity: 0,
        blocked: 0,
        blockedShelfIds: [],
        goodShelfIds: [],
      })


      const availableQuantity = quantity - blocked
      return { availableQuantity, shelf: { blockedShelfIds, goodShelfIds } }

    } catch (error) {

    }
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
    //     
    //   })
    //   .catch((error) => {
    //     
    //   });

    // axios.get(""{
    //   headers: {
    //     "X-Shopify-Access-Token": "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",
    //   },
    // })
    //   .then((response) => 
    //   .catch((error) => 
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
    // 
    // const onclickClass = e.originalEvent.target.classList[0]

    const onclickClass = e.target.classList[0]

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
    // 

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
      const {
        firstName, lastName, companyName, email, contactNumber, orderStatus,
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

      const isAllQuantityAvailable = orderItems?.map((product) => {
        const { availableInventory, quantity } = product

        return (
          {
            ...product,
            isAvailable: Number(availableInventory) >= Number(quantity)
          }
        );
      })



      if (!isAllQuantityAvailable.every(product => product.isAvailable === true)) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: "Can not verify order due to low Quantity",
          life: 3000
        })
        return
      }

      // const orderItemValue = orderItems?.map((ele) => ele)
      const { id: activeID } = activeRowData

      if (newOrderUpdate) {
        try {
          await updateNewOrder({
            id: activeID,
            customer: {
              firstName,
              lastName,
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

        }
      } else {
        try {
          await createNewOrder({
            customer: {
              firstName,
              lastName,
              companyName,
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
              paymentStatus: paymentStatus.id,
              totalPrice,
              gateway,
              // channelCreatedAt: new Date(),
              order_items: {
                create: orderItems.map((ele) => ({
                  product: ele.id,
                  quantity: Number(ele.quantity),
                  price: Number(ele.price),
                }))
              },
              orderItemsData: orderItems.map(ele => ({
                productID: ele?.id,
                quantity: Number(ele.quantity),
                shelf: ele?.shelf
              }))
            },
          },
            {
              onSuccess: async (data) => {

                await refetchOrders()
                formik?.resetForm()
                setOrderDialog(!orderDialog)

                toast.current.show({ severity: 'success', summary: 'Success', detail: `${data?.id} Created`, life: 3000 });

              }, onError: (error) => {

                alert(error)
              },
            })
        } catch (error) {

        }
      }


    }
  })

  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }


  const handleAddInput = () => {
    formik.setFieldValue("orderItems", [...formik.values.orderItems, { id: '', name: '', quantity: '', price: '' }]);
  };

  const handleRemoveInput = (index) => {
    if (formik.values.orderItems.length === 1) {
      return;
    }
    const newInputsItems = [...formik.values.orderItems];
    newInputsItems.splice(index, 1);
    formik.setFieldValue("orderItems", newInputsItems);
  };




  const handleInputChange = (event, index) => {
    const { name, value } = event.target;

    const newInputsItems = [...formik.values.orderItems];
    newInputsItems[index][name] = value;


    const totalPrice = newInputsItems.reduce((acc, curr) => {
      return acc + curr.price * curr.quantity;
    }, 0)

    // update the state with the new order items
    formik.setValues({ ...formik.values, orderItems: newInputsItems, totalPrice: totalPrice });
    return newInputsItems;

  };

  const [verificationStatus, setVerificationStatus] = useState(false);
  const inventory_productName = inventory_products.map((val) => val.products.name)




  const checkVerifyOrder = () => {
    const inventoryProduct = inventory_products.find(product => product.products.name === selectOrder.name);
  }


  const [createShipment] = useMutation(CreateShipment)

  const renderHeader = () => {

    return (
      <>
        <Toast ref={toast} />

        <div className="flex justify-content-end">
          {checkVerified && (




            <Button
              type="button"
              icon="pi pi-verified"
              label="Verify"
              className="p-button-outlined"

              onClick={async () => {
                const activeIDs = selectedOrder.map((ele) => ele?.id);


                if (activeIDs.length > 0) {
                  selectedOrder.forEach(async (ele) => {
                    await updateNewOrder({
                      id: ele?.id,
                      verified: 1,
                    });
                    const shipmentNumber = `ROB0${Math.floor(Math.random() * 100000)}`;
                    const shipmentItems = ele?.order_items.map((item) => {
                      return {
                        order_items: {
                          connect: {
                            id: item.id,
                          },
                        },
                      };
                    });

                    await createShipment(
                      {
                        ordersId: ele?.id,
                        shipmentNumber,
                        priority: 'LOW',
                        shipment_items: {
                          create: shipmentItems,
                        },
                      },
                      {
                        onSuccess: () => {
                          toast?.current.show(tsuccess('Verified'));
                        },
                        onError: (error) => {

                          toast?.current.show(terror('Not Verified'));
                        },
                      }
                    );
                  }
                  )
                }

              }}
            />


            // <Button
            //   type="button"
            //   icon="pi pi-verified"
            //   label="Verify"
            //   className="p-button-outlined"
            //   onClick={async () => {
            //     const activeIDs = selectedOrder.map((ele) => ele?.id);
            //     const activeOrderItems = selectedOrder.map((ele) => ele?.order_items).flat();
            //     const activeOrderNames = activeOrderItems.map((i) => i.products.name);
            //     const activeOrderQuantities = activeOrderItems.map((i) => i.quantity);

            //     if (activeIDs.length > 0) {
            //       let verificationPassed = true; // Flag to track if all products pass verification

            //       for (let i = 0; i < activeOrderItems.length; i++) {
            //         const activeOrderItem = activeOrderItems[i];
            //         const activeOrderName = activeOrderNames[i];
            //         const activeOrderQuantity = activeOrderQuantities[i];

            //         const selectedProduct = inventory_products.find((product) => product.products.name === activeOrderName);

            //         if (!selectedProduct || selectedProduct.quantity < activeOrderQuantity) {
            //           verificationPassed = false;
            //           break;
            //         }
            //       }

            //       if (verificationPassed) {
            //         for (let i = 0; i < activeIDs.length; i++) {
            //           const id = activeIDs[i];
            //           const activeOrderItem = activeOrderItems[i];
            //           const activeOrderName = activeOrderNames[i];
            //           const activeOrderQuantity = activeOrderQuantities[i];

            //           const selectedProduct = inventory_products.find((product) => product.products.name === activeOrderName);
            //           const updatedQuantity = selectedProduct.quantity - activeOrderQuantity;

            //           await updateInventory_productMutation(
            //             {
            //               id: selectedProduct.id,
            //               quantity: updatedQuantity,
            //             },
            //             {
            //               onSuccess: () => {
            //                 toast?.current?.show(tsuccess("Inventory updated successfully."));
            //               },
            //             }
            //           );

            //           await updateNewOrder({
            //             id,
            //             verified: 1,
            //           });

            //           const shipmentNumber = `ROB0${Math.floor(Math.random() * 100000)}`;
            //           const shipmentItems = {
            //             order_items: {
            //               connect: {
            //                 id: activeOrderItem.id,
            //               },
            //             },
            //           };

            //           await createShipment(
            //             {
            //               ordersId: id,
            //               shipmentNumber,
            //               priority: 'LOW',
            //               shipment_items: {
            //                 create: shipmentItems,
            //               },
            //             },
            //             {
            //               onSuccess: () => {
            //                 toast?.current.show(tsuccess('Verified'));
            //               },
            //               onError: (error) => {
            //
            //                 toast?.current.show(terror('Not Verified'));
            //               },
            //             }
            //           );
            //         }
            //       } else {
            //         alert('Product quantity is insufficient or product not found in inventory');
            //       }
            //     }
            //   }}
            // />



          )}
        </div>

      </>

    )
  }


  const [selectedOrder, setSelectedOrder] = useState([]);
  const [checkVerified, setCheckVerified] = useState(false)
  // 
  // 

  useEffect(() => {
    if (selectedOrder && Object.keys(selectedOrder).length >= 1) {
      setCheckVerified(true);
    } else {
      setCheckVerified(false);
    }
  }, [selectedOrder]);


  function verifyOrder(order) {
    return order.verified ? "Verified" : "Not Verified";
  }

  const handlePageChange = async (event) => {
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })

  }

  const searchCustomer = createSearchFunction(customerOptions, setCustomerOptionsSuggestions)


  const handleViewClick = async (id) => {
    router.push(`orders/${id}`);
  };
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  //     tab_view 

  // const initialState = {
  //   orders: [],
  //   filteredOrders: [],
  //   manifestShipments: [],
  //   manifestStep: 0,
  //   displayManifest: false,
  //   statusId: undefined,
  //   statusName: "ALL",
  //   tableRowsCount: 10,
  //   skipCount: 0,
  //   first: 0,
  //   rows: 10,
  //   itemsPerPage: 10,
  //   selectedShipments: [],
  //   isReadyToShip: false,
  //   readyToShipActiveIndex: 0,
  //   containerName: 'manifests',
  //   sasToken: process.env.NEXT_PUBLIC_STORAGESASTOKEN,
  //   storageAccountName: process.env.NEXT_PUBLIC_STORAGERESOURCENAME,
  //   manifestImageURL: ""
  // };



  // const reducer = (state, { type, payload }) => {
  //   switch (type) {
  //     case 'GET_ORDERS':
  //       return { ...state, orders: payload };
  //     case 'FILTER_BY':
  //       return { ...state, filteredOrders: payload };
  //     case 'UPDATE_STATUS_ID':
  //       return { ...state, statusId: payload };
  //     case 'UPDATE_STATUS_NAME':
  //       return { ...state, statusName: payload };
  //     case 'UPDATE_SKIP_COUNT':
  //       return { ...state, skipCount: payload };
  //     case 'UPDATE_TABLE_ROWS_COUNT':
  //       return { ...state, tableRowsCount: payload };
  //     case 'SET_SELECTED_SHIPMENTS':
  //       return { ...state, selectedShipments: payload };
  //     case 'RESET_SELECTED_SHIPMENTS':
  //       return { ...state, selectedShipments: [] };
  //     case 'READY_TO_SHIP':
  //       return { ...state, isReadyToShip: payload };
  //     case 'READY_TO_SHIP_ACTIVE_INDEX':
  //       return { ...state, readyToShipActiveIndex: payload };
  //     case 'DISPATCH_SHIPMENTS':
  //       return { ...state, displayManifest: true }
  //     case 'SET_SHIPMENT_STATE':
  //       return { ...state, [payload.prop]: payload.value }

  //     case 'FILTER_BY_STATUS': // Add this case
  //       const filteredOrders = state.orders.filter(order => order.status === 'unfulfilled');
  //       return { ...state, filteredOrders };
  //     default:
  //       throw new Error(`Unhandled action type: ${type}`);
  //   }
  // }
  // const initialState = {
  //   orders: [],
  //   filteredOrders: [],
  //   manifestShipments: [],
  //   manifestStep: 0,
  //   displayManifest: false,
  //   statusId: undefined,
  //   statusName: "ALL",
  //   tableRowsCount: 10,
  //   skipCount: 0,
  //   first: 0,
  //   rows: 10,
  //   itemsPerPage: 10,
  //   selectedShipments: [],
  //   isReadyToShip: false,
  //   readyToShipActiveIndex: 0,
  //   containerName: 'manifests',
  //   sasToken: process.env.NEXT_PUBLIC_STORAGESASTOKEN,
  //   storageAccountName: process.env.NEXT_PUBLIC_STORAGERESOURCENAME,
  //   manifestImageURL: ""
  // };
  // const [state, dispatch] = useReducer(reducer, initialState);
  // const { statusId, skipCount, tableRowsCount } = state
  const tabMenuItems = order_statuses?.map(status => (
    {
      label: `${status.name === "CREATED" ? "NEW" : status.name}`,
      status: status.name,
      id: status.id
    }
  ))

  // const [{ orders }] = usePaginatedQuery(getOrders, {
  //   orderBy: { id: "asc" },
  //   where: {},
  //   skip: skipCount,
  //   take: tableRowsCount,
  // })

  console.log("orders", orders);

  const handleOnPageChange = () => {

  }

  const isSelectable = (data) => !data?.verified;

  const isRowSelectable = (event) => (event.data ? isSelectable(event.data) : true);

  const paginator = <Paginator first={skipCount} rows={tableRowsCount} totalRecords={orderCounts} rowsPerPageOptions={[10, 20, 30]} onPageChange={handlePageChange} />



  const cellClassName = (data, row,) => {
    const index = row.rowIndex
    const verified = row.props.value[index]?.verified
    verified ? '' : 'p-disabled'
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

                <div className="field col-12 md:col-3 lg:col-2 mt-4">
                  <span className="p-float-label">

                    <AutoComplete
                      value={formik.values?.name}
                      dropdown
                      field="name"
                      suggestions={customerOptionsSuggestions}
                      completeMethod={searchCustomer}
                      forceSelection
                      onChange={async (e) => {
                        const selectedCustomer = e.value;

                        let name = typeof e.value === "string" ? e.value : e.value?.name

                        await formik.setValues({
                          ...formik.values,
                          name,
                          firstName: selectedCustomer?.firstName,
                          lastName: selectedCustomer?.lastName,
                          address: selectedCustomer?.addresses?.areaStreet,
                          email: selectedCustomer?.addresses?.emails_emails_addressesToaddresses?.map((ele) => ele.email),
                          pincode: selectedCustomer?.addresses?.pincode,
                          state: selectedCustomer?.addresses?.state,
                          landmarkName: selectedCustomer?.addresses?.landmarkName,
                          city: selectedCustomer?.addresses?.cityCountryProvince,
                          country: selectedCustomer?.addresses?.country_addresses_countryTocountry?.name,

                        });


                        if (selectedCustomer?.addresses && selectedCustomer?.addresses?.contact_number.length > 0) {
                          const contactNumber = selectedCustomer?.addresses?.contact_number[0]?.number || '';
                          formik.setFieldValue('contactNumber', contactNumber);
                        } else {
                          formik.setFieldValue('contactNumber', '');
                        }

                      }}

                      aria-label="customer"
                      dropdownAriaLabel="Select customer"
                      className={classNames({ "p-invalid": isFormFieldValid("name") })}
                    />
                    <label
                      htmlFor={"type"}
                      className={classNames({ "p-error": isFormFieldValid("type") })}
                    >
                      Select Customer
                    </label>
                  </span>
                </div>

                {[
                  { field: "firstName", label: "First Name" },
                  { field: "lastName", label: "Last Name" },
                  { field: "companyName", label: "Company Name" },
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
                        value={formik.values.paymentStatus?.name}
                        dropdown
                        forceSelection
                        suggestions={paymentOptionsSuggestions}
                        completeMethod={searchPayment}
                        field="name"
                        onChange={(e) => {

                          // const selectedOrderItem = paymentOptions.find(option_ => option_.name === e.value.name);
                          // const selectedItemsOptionName = selectedOrderItem ? selectedOrderItem.id : null;
                          formik.setFieldValue('paymentStatus', e?.value);
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
                  {formik.values.orderItems.map((ele, index) => (
                    <div key={index} className="grid ">

                      <div className="field col-12 lg:col-4 md:col-6 mt-2">
                        <span className="p-float-label">
                          <AutoComplete
                            id="name"
                            value={ele?.name}
                            name="name"
                            dropdown
                            forceSelection
                            suggestions={orderItemsSuggestions}
                            completeMethod={searchOrderItems}
                            field="name"
                            onChange={async (e) => {
                              const inventory = await isInStock(e?.target?.value?.sku)
                              const _orderItemInput = [...formik.values.orderItems]
                              _orderItemInput[index] = {
                                ..._orderItemInput[index],
                                ...e.value,
                                availableInventory: inventory?.availableQuantity,
                                shelf: inventory?.shelf?.blockedShelfIds[0]
                              }
                              await formik.setValues({
                                ...formik.values,
                                orderItems: _orderItemInput,
                              })

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
                            type='number'
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
                        </span>
                      </div>
                      <div className="field col-12 lg:col-3 md:col-6 mt-2">
                        <span className="p-float-label">
                          <InputText
                            className=''
                            type='number'
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
                      <div className="field col-12 lg:col-1 md:col-6 mt-2">
                        <span className="p-float-label">
                          <InputText
                            className=''
                            id="availableInventory"
                            type='text'
                            name='availableInventory'
                            value={ele?.availableInventory}
                            disabled
                          />
                          <label
                            htmlFor="availableInventory"
                            className={classNames({ "p-error": isFormFieldValid("availableInventory") })}
                          >
                            Inventory
                          </label>
                        </span>
                      </div>
                      <div className="field flex justify-content-between col-12 lg:col-1 md:col-6 mt-2 ">
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
            // scrollable
            showGridlines
            header={renderHeader}
            stripedRows
            className="text-s datatable-responsive"
            selection={selectedOrder}
            onSelectionChange={(e) => setSelectedOrder(e.value)}
            tableStyle={{ minWidth: '50rem' }}
            isDataSelectable={isRowSelectable}
            cellClassName={cellClassName}
            footer={paginator}

          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: '3rem' }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            </Column>

            <Column
              // field={}
              header="ID"
              body={(rowData) => rowData.Id ? rowData.id : rowData.id}
            />

            {/* <Column
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
            /> */}


            {/* Add Hover thing in product  */}

            <Column
              field=""
              header="Products"
              body={({ order_items }) => {
                const [showOverlay, setShowOverlay] = useState(false);

                const handleMouseEnter = () => {
                  setShowOverlay(true);
                };

                const handleMouseLeave = () => {
                  setShowOverlay(false);
                };

                return (
                  <div className="product-column">
                    <div
                      className="product-header"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Button
                        label={`Products(${order_items.length})`}
                        className="p-button-link"
                      />
                    </div>
                    {showOverlay && (
                      <div className="overlay-panel">
                        <div className="w-20rem">
                          {order_items.map((product, i) => {
                            const { quantity, products: { name, sku } } = product;
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
                      </div>
                    )}
                  </div>
                )
              }}
            />





            <Column
              field="products.name"
              header="Channel"
              // className="text-center"
              body={(rowdata) => rowdata.shopifyId ? "SH" : "IH"}

            />

            <Column
              field=""
              header="Customer Details"
              body={({ customers }) => {
                const orderItemOverlayRef = useRef(null);
                const contactNumbers = customers?.addresses?.contact_number || [];
                const { firstName, lastName } = customers || {};
                return (
                  <div>
                    <Button
                      label={`Customer Details`}
                      onClick={(e) => orderItemOverlayRef?.current?.toggle(e)}
                      className="p-button-link"
                    />
                    <OverlayPanel ref={orderItemOverlayRef}>
                      <div className="w-20rem">
                        <div className="pt-2 pb-2">
                          <div className="grid">
                            <label className="font-semibold col-4">Name:</label>
                            <div className="col">
                              {`${firstName} ${lastName}`}
                            </div>
                          </div>
                        </div>
                        {contactNumbers.map((contact, i) => {
                          const { type, number } = contact;
                          return (
                            <div key={i} className="pt-2 pb-2">
                              {[{ prop: "Type", value: type },
                              { prop: "Number", value: number }
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
            />

            <Column
              field=""
              header="Customer Contact Number"
              body={({ customers }) => {
                const contactNumbers = customers?.addresses?.contact_number || [];
                return (
                  <div className="">
                    {contactNumbers.map((contact, i) => {
                      const { type, number } = contact;
                      return (
                        <div key={i} className="">
                          {[{ value: number }
                          ].map(({ value }, index) => (
                            <div key={index} className="">
                              <div className="">
                                {value?.toString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />

            <Column
              field=""
              header='Customer Address'
              body={({ customers }) => {
                const customerAddress = customers?.addresses?.cityCountryProvince
                return (
                  <div className="">
                    {customerAddress}
                  </div>
                )
              }}

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
            <Column
              header="Verified orders"
              body={verifyOrder}
              bodyClassName={(rowData) => rowData.verified ? 'verified' : 'not-verified'}
            />
            <Column
              header="Action"
              body={(rowData) => {

                return (
                  <div className="flex gap-4">
                    {/* <Button
                      id="edit"
                      label="Edit"
                      icon='pi pi-pencil'
                      // onClick={()=> handleRowClick(rowData)}
                      onClick={async (e) => {
                        setActiveRowData(rowData)
                        setNewOrderUpdate(true)
                        setOrderDialog(true)
                        window.scrollTo()

                        const name = rowData.customers
                        const _email = rowData.customers?.addresses?.emails_emails_addressesToaddresses.map((ele) => ele.email)
                        const _contactNumber = rowData.customers?.addresses?.contact_number.map((ele) => ele.number)
                        const _orderStatus = rowData.order_status.name
                        const _shippingAddress = rowData.addresses_orders_shippingAddressIdToaddresses
                        const _billingAddress = rowData.addresses_orders_billingAddressIdToaddresses
                        const _orderItems = rowData.order_items.map(({ quantity, price, products: { id, name, sku } }) => ({
                          id,
                          name: `${sku} - ${name}`,
                          quantity: quantity.toString(),
                          price: price.toString()
                        }));

                        await formik.setValues({
                          ...rowData,
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
                      }}
                      tooltip="Update Order"
                      tooltipOptions={{ position: "left" }}
                    /> */}

                    <Button
                      id="view"
                      label="View"
                      onClick={(e) => handleViewClick(rowData.id)}
                    />
                  </div>
                )
              }}

            />



          </DataTable>

        </div>

      </div>
    </div >
  )
};

const OrdersPage = () => {
  return (
    <Layout>
      <Head>
        <title>Orders</title>
      </Head>

      <div>
        <Suspense fallback={<Loading />}>
          <OrdersList />
        </Suspense>
      </div>
    </Layout>
    // <Suspense fallback={<Loading />}>
    //   <Layout>
    //     <OrdersList />
    //   </Layout>
    // </Suspense>
  )
};

export default OrdersPage;

// sample data received onsubmit 
/**{
    "name": "select",
    "firstName": "select",
    "lastName": "A2y",
    "email": "qqq",
    "companyName": "",
    "customer": {
        "firstName": "",
        "companyName": ""
    },
    "contactNumber": "0987654321",
    "checkedAddress": "",
    "orderStatus": "",
    "landmarkName": "zxczc",
    "shippingAddressId": "",
    "billingAddressId": "",
    "shopifyId": "",
    "isExistingCustomer": false,
    "customerId": "",
    "paymentStatus": "",
    "totalPrice": 121,
    "gateway": "",
    "orderItems": [
        {
            "id": 5,
            "name": "TIFTO0007 - Controllers.",
            "quantity": "11",
            "price": "11"
        }
    ],
    "address": "jsdnsfsd",
    "city": "Sunam",
    "state": "Punjab",
    "country": "India",
    "pincode": "0864",
    "shippingAddress": {
        "address": "",
        "pincode": "",
        "city": "",
        "state": "",
        "country": "",
        "landmarkName": "",
        "email": "",
        "contactNumber": ""
    },
    "billingAddress": {
        "address": "",
        "pincode": "",
        "city": "",
        "state": "",
        "country": "",
        "landmarkName": "",
        "email": "",
        "contactNumber": ""
    },
    "isShippingIsBilling": true
} */
