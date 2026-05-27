import { invoke, useMutation, usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { cities, createSearchFunction, dateFormat, initialFilterRules } from "app/constants";
import Head from "next/head";
import Link from "next/link"
import { dateFilterTemplate } from "components/FilterTemplates"

import { Routes } from "@blitzjs/next"
import getOrder_statuses from "app/order_statuses/queries/getOrder_statuses";
import createOrder from "app/orders/mutations/createOrder";
import updateOrder from "app/orders/mutations/updateOrder";
import getOrders from "app/orders/queries/getOrders";
import getProducts from "app/products/queries/getProducts";
import getCustomers from "app/customers/queries/getCustomers";
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
import { Badge } from "primereact/badge";
import { Tooltip } from "primereact/tooltip";
import { Paginator } from "primereact/paginator";
import { Suspense, useEffect, useReducer, useRef, useState, useTransition } from "react";
import * as Yup from "yup";
import AddressComponent from "../../components/AddressComponent";

import { tError, tsuccess } from "app/constants";
import updateInventory_product from "app/inventory_products/mutations/updateInventory_product";
import getInventory_products from "app/inventory_products/queries/getInventory_products";
import { TabMenu } from "primereact/tabmenu";
import { Toast } from "primereact/toast";
import getInventory_product from "app/inventory_products/queries/getInventory_product";
import getPo_terms from "app/po_terms/queries/getPo_terms";
import getProduct_prices from "app/product_prices/queries/getProduct_prices";
import { InputSwitch } from "primereact/inputswitch";
import getOrder_payment_statuses from "app/order_payment_statuses/queries/getOrder_payment_statuses";
import getPayment_methods from "app/payment_methods/queries/getPayment_methods";
import { Divider } from "primereact/divider";
import { FilterMatchMode } from "primereact/api";

const initialState = {
  _orders: [],
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
  gstNumber: "",
  customer: { firstName: '', companyName: '', },
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
  display: 0,
  gstTaxTypeCode: "",
  discountAmount: '',
  paymentTermsId: '',
  paymentReferenceId: "",
  payment_method: '',
  paymentMethodId: '',
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
  { id: 1, name: 'RazorPay' },
  { id: 2, name: 'Paytm' },
  { id: 3, name: 'UPI' },
  { id: 4, name: 'Net-Banking' },
  { id: 5, name: 'Cash' },
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
        return { ...state, _orders: payload };
      case 'UPDATE_STATUS_ID':
        return { ...state, statusId: payload };
      case 'UPDATE_STATUS_NAME':
        return { ...state, statusName: payload };
      case 'UPDATE_SKIP_COUNT':
        return { ...state, skipCount: payload };
      case 'UPDATE_TABLE_ROWS_COUNT':
        return { ...state, tableRowsCount: payload };
      default:
        throw new Error(`Unhandled action type: ${type}`);
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isVisible, setIsVisible] = useState(true);

  const [searchInputValue, setSearchInputValue] = useState("");
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      startTransition(() => {
        setGlobalFilterValue(searchInputValue);
        dispatch({ type: 'UPDATE_SKIP_COUNT', payload: 0 });
      });
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchInputValue]);

  const initialFilters = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: initialFilterRules.andContains,
    firstName: initialFilterRules.andContains,
    shopifyId: initialFilterRules.andContains,
    id: initialFilterRules.andContains,
    gateway: initialFilterRules.andContains,
    discountAmount: initialFilterRules.andContains,
    gstNumber: initialFilterRules.andContains,
    paymentReferenceId: initialFilterRules.andContains,
    totalPrice: initialFilterRules.andContains,
    "order_items.products.name": initialFilterRules.andContains,
    createdAt: initialFilterRules.dateIs,
  }

  const [filters, setFilters] = useState(initialFilters)
  const clearFilter = () => {
    setFilters(initialFilters)
    setSearchInputValue("")
    setGlobalFilterValue("")
    dispatch({ type: 'UPDATE_SKIP_COUNT', payload: 0 })
  }
  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    setSearchInputValue(value)
  }

  const { statusId, skipCount, tableRowsCount, statusName, _orders, } = state
  console.log('statusId: ', statusId);
  const toast = useRef(null)
  const router = useRouter();

  const page = Number(router.query.page) || 0;

  const isNumeric = !isNaN(Number(globalFilterValue)) && globalFilterValue.trim() !== "";
  const searchFilter = globalFilterValue ? {
    OR: [
      {
        customers: {
          OR: [
            { firstName: { contains: globalFilterValue } },
            { lastName: { contains: globalFilterValue } },
            { companyName: { contains: globalFilterValue } },
          ]
        }
      },
      {
        shopify: {
          OR: [
            { orderId: { contains: globalFilterValue } },
            { orderNumber: { contains: globalFilterValue } }
          ]
        }
      },
      ...(isNumeric ? [
        { id: Number(globalFilterValue) },
        { totalPrice: Number(globalFilterValue) }
      ] : [])
    ]
  } : {};

  const whereQuery = {
    orderStatus: statusId,
    ...searchFilter
  };

  const [{ orders, count: orderCounts }, { refetch: refetchOrders }] = usePaginatedQuery(getOrders, {
    orderBy: { channelCreatedAt: "desc" },
    where: whereQuery,
    skip: skipCount,
    take: tableRowsCount,
    sync: true,
  } as any);
  console.log('orders: ', orders);


  const [{ count: pendingVerificationCount }] = useQuery(getOrders, {
    orderBy: { channelCreatedAt: "desc" },
    where: { orderStatus: 1 },
    skip: skipCount,
    take: tableRowsCount,
  });
  const [{ count: failedCount }] = useQuery(getOrders, {
    orderBy: { channelCreatedAt: "desc" },
    where: { orderStatus: 5 },
    skip: skipCount,
    take: tableRowsCount,
  });

  const [{ po_terms }] = useQuery(getPo_terms, {
    orderBy: { id: 'asc' },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })
  // console.log('po_terms: ', po_terms);


  const [{ order_statuses, }] = useQuery(getOrder_statuses, {
    orderBy: { id: "asc" },
    where: {},
    skip: 0,
    take: undefined,
  })
  console.log('order_statuses: ', order_statuses);
  console.log("statusId", statusId);
  console.log("statusName", statusName);

  const [{ order_payment_statuses }] = useQuery(getOrder_payment_statuses, {
    orderBy: { id: 'asc' },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })
  // console.log('order_payment_statuses: ', order_payment_statuses);

  const [{ payment_methods }] = useQuery(getPayment_methods, {
    orderBy: { id: 'asc' },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    where: undefined
  })
  // console.log('payment_methods: ', payment_methods);


  const [{ products }] = useQuery(getProducts, {
    orderBy: { id: "asc" },
  })

  const [{ product_prices }] = useQuery(getProduct_prices, {
    orderBy: { id: "asc" },
    where: undefined,
    skip: undefined,
    take: undefined
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

  // // Add Payment terms
  // const [optionsPaymentTerms, setOptionsPaymentTerms] = useState({ id: 3, name: '100% Advance', description: '100% Advance' })
  // console.log('optionsPaymentTerms: ', optionsPaymentTerms);



  const [createNewOrder] = useMutation(createOrder)
  const [updateNewOrder, { isLoading }] = useMutation(updateOrder)
  const [orderItemsDetails, setOrderItemsDetails] = useState(initialOrderDetails)
  const [orderDialog, setOrderDialog] = useState(false)
  const [orderStatusOption, setOrderStatusOption] = useState(order_statuses)
  const [selectedOrderItemValue, setSelectedOrderItemValue] = useState([])
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [orderStatusSuggestions, setOderStatusSuggestions] = useState<any>(null)


  const [{ customers }] = useQuery(getCustomers, {
    orderBy: { id: "asc" },
    skip: undefined,
    where: {
      OR: [
        {
          firstName: { contains: selectedCustomerName ?? undefined }
        },
        {
          companyName: { contains: selectedCustomerName ?? undefined }
        }
      ]
    },
    take: undefined
  })


  console.log("customers", customers)
  // console.log("selectedCustomers", selectedCustomerName)


  const gstTotal = 0;

  // const orderItemsOptions = products.filter((product) => !selectedOrderItemValue?.includes(product.id)).map(({ id, name, sku, description, gstTaxTypeCode }) => {
  //   return {
  //     name: `${sku} - ${name} `,
  //     id,
  //     description,
  //     sku,
  //     gstTaxTypeCode,
  //   }
  // })
  // console.log('orderItemsOptions: ', orderItemsOptions);

  const orderItemsOptions = products
    .filter((product) => !selectedOrderItemValue?.includes(product.id))
    .map(({ id, name, sku, description, gstTaxTypeCode }) => {
      return {
        name: `${sku} - ${name} `,
        id,
        description,
        sku,
        gstTaxTypeCode,
      };
    });



  // console.log('gstTotal: ', gstTotal);





  const [orderItemsSuggestions, setOderItemsSuggestions] = useState<any>(null)
  console.log('orderItemsSuggestions: ', orderItemsSuggestions);


  const customerOptions = customers?.map((customer) => ({
    ...customer,
    name: `${customer?.firstName}${customer?.companyName ? `- ${customer?.companyName}` : ""}`
  }))



  // const paymentTermsOption = po_terms.map((val) => {
  //    return val.name
  // })
  // console.log('paymentTermsOption: ', paymentTermsOption);

  const [customerOptionsSuggestions, setCustomerOptionsSuggestions] = useState<any>(null)
  // const [paymentTermsOptionsSuggestions, setPaymentTermsOptionsSuggestions] = useState<any>(null)


  const [gatewayOptions] = useState(gateway_)
  const [gatewayOptionsSuggestions, setGatewayOptionsSuggestions] = useState<any>(null)
  const [paymentOptions] = useState(paymentStatus_)
  const [paymentOptionsSuggestions, setPaymentOptionsSuggestions] = useState<any>(null)
  const [addressSuggestion, setAddressSuggestion] = useState<any>(null)
  const [activeRowData, setActiveRowData] = useState({})
  const [newOrderUpdate, setNewOrderUpdate] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const productDisplayRef = useRef(null);


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

  const address = [
    // { name: 'address', requiredMessage: 'Address  is required' },
    // { name: 'pincode', requiredMessage: 'Pincode  is required' },
    // { name: 'city', requiredMessage: 'City is required' },
    // { name: 'state', requiredMessage: 'State  is required' },
    // { name: 'country', requiredMessage: 'Country status is required' },
    // { name: 'email', requiredMessage: 'Email is required', type: "email" },
    // { name: 'contactNumber', requiredMessage: 'Contact number is required' },
  ];

  const CustomerParams = [
    { name: 'firstName', requiredMessage: 'FirstName is required' },
    { name: 'lastName', requiredMessage: 'LastName is required' },
    // { name: 'contactNumber', requiredMessage: 'Contact number is required' },
    // { name: 'companyName', requiredMessage: 'companyName is required' },
    // { name: 'gstNumber ', requiredMessage: 'GSTNumber is required' },
    // { name: 'pincode', requiredMessage: 'Pincode  is required' },
    // { name: 'city', requiredMessage: 'City is required' },
    // { name: 'state', requiredMessage: 'State  is required' },
    // { name: 'country', requiredMessage: 'Country status is required' },
    // { name: 'email', requiredMessage: 'Email is required' },

    ...address
  ];

  const CustomerParamSchema = CustomerParams.map(({ name, requiredMessage }) => {

    // if (name === 'contactNumber') {
    //   return Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits').required(requiredMessage);
    // }

    return Yup.string().when("isExistingCustomer", {
      is: false,
      then: Yup.string().required(requiredMessage),
    });
  });

  const addressSchema = address.map(({ name, requiredMessage }) => {
    if (name === 'contactNumber') {
      return Yup.string().matches(/^\d{10}$/, 'Contact number must be 10 digits').required(requiredMessage);
    }
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

      gstNumber: Yup.string()
        .min(15, 'GST number must be at least 15 characters')
        .matches(/^[\dA-Za-z]{15}$/, 'GST number must be 15 alphanumeric characters')
        .required('GSTNumber is required'),

      // ...Object.assign({}, ...addressSchema.map((p, i) => ({ [p.name]: addressSchema[i] }))),


    }),
    onSubmit: async (data) => {
      const {
        firstName, lastName, companyName, email, contactNumber, orderStatus,
        landmarkName, pincode, paymentStatus, totalPrice, gateway, payment_method, display, discountAmount, gstNumber, gstTaxTypeCode, paymentMethodId, paymentTermsId, paymentReferenceId,

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
      console.log('gateway: ', gateway);
      console.log('orderItems: ', orderItems);

      //TIP:=>  isAllQuantityAvailable comment code for not create wne qty is more then avaliable qty
      // const isAllQuantityAvailable = orderItems?.map((product) => {
      //   const { availableInventory, quantity } = product

      //   return (
      //     {
      //       ...product,
      //       isAvailable: Number(availableInventory) >= Number(quantity)
      //     }
      //   );
      // })

      // if (!isAllQuantityAvailable.every(product => product.isAvailable === true)) {
      //   toast.current?.show({
      //     severity: 'error',
      //     summary: 'Error',
      //     detail: "Can not verify order due to low Quantity",
      //     life: 3000
      //   })
      //   return
      // }


      const isAllQuantityAvailable = orderItems?.map((product) => {
        const { availableInventory, quantity } = product;
        return {
          ...product,
          isAvailable: Number(availableInventory) >= Number(quantity),
        };
      });
      console.log('isAllQuantityAvailable: ', isAllQuantityAvailable);

      if (!isAllQuantityAvailable.every((product) => product.isAvailable === true)) {
        // Change the order status to "FAILED" here
        console.log(" isAllQuantityAvailable:  first>>>")
        setSelectOrderStatus(order_statuses.find((status) => status.name === 'FAILED'));

        try {
          await createNewOrder({
            customer: {
              firstName,
              lastName,
              companyName,
              display,
            },
            order: {
              orderStatus: 5,
              isShippingIsBilling: true,
              shippingAddress: {
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
              paymentMethodId: selectPaymentMethod ? selectPaymentMethod?.id : null,
              paymentStatus: selectedPaymentStatus ? selectedPaymentStatus.id : null,
              totalPrice,
              gateway: selectPaymentMethod ? selectPaymentMethod.name : null,
              discountAmount,
              gstNumber,
              gstTaxTypeCode,
              paymentTermsId: selectedPaymentTerm ? selectedPaymentTerm.id : null,
              paymentReferenceId,
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

              }))
            },
          },
            {
              onSuccess: async (data) => {
                await refetchOrders()
                formik?.resetForm()
                setOrderDialog(!orderDialog)
                toast.current?.show({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: `${data.id} Create order status is failed`,
                  life: 3000,
                });
              }, onError: (error) => {
                console.log('error: ', error);
                toast.current.show({ severity: 'error', summary: 'error', detail: `${data?.id} Created`, life: 3000 });

              },
            })
        } catch (error) {
          console.log('error: ', error);

        }
        // toast.current?.show({
        //   severity: 'warn',
        //   summary: 'Warning',
        //   detail: 'Create order status is failed',
        //   life: 3000,
        // });

        return;
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
              display,

              // shopifyId: "1425636985",
              // addresses: {
              //   create: {
              //     // buildingNumber: "56",
              //     areaStreet: address,
              //     landmarkName,
              //     cityCountryProvince: city,
              //     state,
              //     pincode,
              //     country: 1,
              //     emails_emails_addressesToaddresses: {
              //       create: [
              //         {
              //           email,
              //         },
              //       ],
              //     },
              //     contact_number: {
              //       create: [
              //         {
              //           type: "mobile",
              //           number: contactNumber,
              //         },
              //       ],
              //     }

              //   }
              // }
            },
            order: {
              // orderStatus: Number(orderStatus?.id),
              orderStatus: selectOrderStatus ? selectOrderStatus.id : null,
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
              // paymentStatus: paymentStatus.id,
              // payment_method: selectPaymentMethod ? selectPaymentMethod?.name : null,
              paymentMethodId: selectPaymentMethod ? selectPaymentMethod?.id : null,
              paymentStatus: selectedPaymentStatus ? selectedPaymentStatus.id : null,
              totalPrice,
              gateway: selectPaymentMethod ? selectPaymentMethod.name : null,
              discountAmount,
              gstNumber,
              gstTaxTypeCode,
              paymentTermsId: selectedPaymentTerm ? selectedPaymentTerm.id : null,
              paymentReferenceId,
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
                // shelf: ele?.shelf
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
                // console.log('error: ', error);
                toast.current.show({ severity: 'error', summary: 'error', detail: `${data?.id} Created`, life: 3000 });

              },
            })
        } catch (error) {
          // console.log('error: ', error);

        }
      }
    }
  })


  console.log("orderItems", formik?.values.orderItems)

  // console.log(formik.errors, 'formik.error')
  // console.log('orderItem', orderItemsDetails)
  const isFormFieldValid = (name) => !!(formik.touched[name] && formik.errors[name])
  const getFormErrorMessage = (name) => {
    return isFormFieldValid(name) && <small className="p-error">{formik.errors[name]}</small>
  }


  const handleAddInput = () => {
    formik.setFieldValue("orderItems", [...formik.values.orderItems, { id: '', name: '', quantity: '', price: '' }]);
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



  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      // Create an array of objects that represent your orders data
      const ordersData = orders.map((order) => {
        return {
          OrderID: order.id,
          CustomerName: `${order.customers.firstName} ${order.customers.lastName}`,
          TotalPrice: order.totalPrice,
        };
      });

      const worksheet = xlsx.utils.json_to_sheet(ordersData);

      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };

      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      saveAsExcelFile(excelBuffer, 'order');
    });
  };


  const saveAsExcelFile = (buffer, fileName) => {
    import('file-saver').then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data = new Blob([buffer], {
          type: EXCEL_TYPE
        });

        module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
      }
    });
  };

  const [createShipment] = useMutation(CreateShipment)

  const renderHeader = () => {

    return (
      <>
        <Toast ref={toast} />

        <div className="flex gap-3 justify-content-end">
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
          )}
          <div className="flex gap-4">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                value={searchInputValue}
                onChange={onGlobalFilterChange}
                placeholder="Keyword Search"
              />
            </span>
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              className="p-button-outlined"
              onClick={clearFilter}
            />

            <Button
              type="button"
              icon="pi pi-file-excel"
              label="Export as XLSX"
              // severity="success"
              rounded onClick={exportExcel}
              tooltip="Export Data"
              tooltipOptions={{ position: 'top' }}
            />

          </div>

        </div>

      </>

    )
  }
  // Render header dynamically in the JSX to prevent Temporal Dead Zone (TDZ) issues for handlers and states


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

  // useEffect(() => {
  //   const debounceTimer = setTimeout(() => {
  //     setSelectedCustomerName(formik.values.name);
  //   }, 300);

  //   // Cleanup function for the debounced function
  //   return () => {
  //     clearTimeout(debounceTimer);
  //   };
  // }, [formik.values.name]);

  function verifyOrder(order) {
    return order.verified ? "Verified" : "Not Verified";
  }

  const handlePageChange = async (event) => {
    dispatch({ type: "UPDATE_SKIP_COUNT", payload: event.first })
    dispatch({ type: "UPDATE_TABLE_ROWS_COUNT", payload: event.rows })
  }

  const searchCustomer = createSearchFunction(customerOptions, setCustomerOptionsSuggestions)

  // const searchPaymentTerms = createSearchFunction(paymentTermsOption, setPaymentTermsOptionsSuggestions)



  const handleViewClick = async (id) => {
    router.push(`orders/${id}`);
  };
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };


  // const tabMenuItems = order_statuses?.map(status => (
  //   {
  //     label: status.name,
  //     status: status.name,
  //     id: status.id
  //   }
  // ))

  const tabMenuItems = order_statuses?.map(status => {
    return {
      label: (
        <div className="flex gap-1">
          <span>{status.name}</span>
          {(status.name === "PENDING VERIFICATION" || status.name === "FAILED") && (
            <Badge className="p-overlay-badge -mt-3"
              value={
                status.name === "PENDING VERIFICATION" ? pendingVerificationCount :
                  status.name === "FAILED" ? failedCount : ""
              } severity="success" />
          )}
        </div>
      ),
      status: status.name,
      id: status.id,
    };
  });
  console.log('tabMenuItems: ', tabMenuItems);



  const isSelectable = (data) => !data?.verified;
  const isRowSelectable = (event) => (event.data ? isSelectable(event.data) : true);
  const paginator = <Paginator first={skipCount} rows={tableRowsCount} totalRecords={orderCounts} rowsPerPageOptions={[10, 20, 30]} onPageChange={handlePageChange} />



  const cellClassName = (data, row,) => {
    const index = row.rowIndex
    const verified = row.props.value[index]?.verified
    verified ? '' : 'p-disabled'
  };





  //  payment terms code-->>

  const [itemsPaymentTerms, setItemsPaymentTerms] = useState([]);

  const search = (event) => {
    setItemsPaymentTerms(po_terms.map((val) => val.name))
  }

  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState({ id: 3, name: '100% Advance' });

  const handlePaymentTermChange = (e) => {
    const selectedTerm = po_terms.find((term) => term.name === e.value);
    setSelectedPaymentTerm(selectedTerm);
  };


  //  Payment status dropdown -->>

  const [paymentStatus, setPaymentStatus] = useState([])

  const paymentStatusSearch = (event) => {
    setPaymentStatus(order_payment_statuses.map((val) => val.name))
  }
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState({ id: 1, name: 'PAID' });

  const handlePaymentStatusChange = (e) => {
    const selectedPayment = order_payment_statuses.find((status) => status.name === e.value);
    setSelectedPaymentStatus(selectedPayment);
  };

  // Order Status dropdown ===>>>

  const [orderStatus, setOrderStatus] = useState([])

  const orderStatusSearch = () => {
    setOrderStatus(order_statuses.map((val) => val.name))
  }

  // const [selectOrderStatus, setSelectOrderStatus] = useState({ id: 4, name: 'Created', description: 'Order has been opened' })
  const [selectOrderStatus, setSelectOrderStatus] = useState({ id: 1, name: 'PENDING VERIFICATION', description: 'Order has been in pending' })

  const handleOrderStatusChange = (e) => {
    const selectedOrder = order_statuses.find((order) => order.name === e.value);
    setSelectOrderStatus(selectedOrder);
  };

  // payment method dropdown ===>>

  const [paymentMethod, setPaymentMethod] = useState([])
  const paymentMethodSearch = () => {
    setPaymentMethod(payment_methods.map((val) => val.name))
  }
  const [selectPaymentMethod, setSelectPaymentMethod] = useState({})
  console.log('selectPaymentMethod: ', selectPaymentMethod);


  const handlePaymentMethodChange = (e) => {
    const selectPaymentMethod = payment_methods.find((val) => val.name === e.value)
    setSelectPaymentMethod(selectPaymentMethod)
  }



  // Discount handelchange code:->>

  const discountHandleSubmit = (event) => {
    const { value } = event.target;
    formik.handleChange(event);

    // Check if the discount value is a valid number or empty string
    const discountValue = parseFloat(value);
    const isDiscountValid = !isNaN(discountValue);

    if (isDiscountValid) {
      formik.setFieldValue("discountAmount", discountValue);
    } else {
      formik.setFieldValue("discountAmount", 0);
    }

    const totalPrice = formik.values.totalPrice;
    if (isDiscountValid && discountValue > totalPrice) {
      toast.current.show({ severity: 'error', summary: 'Discount amount should be less than the total price.', life: 3000 });
      formik.setFieldValue("discountAmount", 0);
    }
  };


  const totalPriceAmount = (formik.values.orderItems.reduce(
    (total, ele) => total + ele.price * ele.quantity + (ele.price * ele.quantity * ele.gst) / 100,

    0
  ) - formik.values.discountAmount);



  const totalGST = formik.values.orderItems.reduce(
    (total, ele) => {
      const itemGST = (ele.price * ele.quantity * ele.gst) / 100;
      return isNaN(itemGST) ? total : total + itemGST;
    },
    0
  );


  const handleTabMenuOrderDataChange = (event) => {
    const { id, label, status } = event.value;
    dispatch({ type: 'UPDATE_STATUS_ID', payload: id })
    dispatch({ type: 'UPDATE_STATUS_NAME', payload: status ?? label })
  }





  const handleMouseEnter = (event) => {
    if (productDisplayRef.current) {
      productDisplayRef.current.toggle(event);
    }

  };

  const handleMouseLeave = (event) => {
    if (productDisplayRef.current) {
      productDisplayRef.current.toggle(event);
    }

  };

  const handleCustomerDetailsRender = ({ customers }) => {

    const { addresses: { contact_number, emails_emails_addressesToaddresses,
      areaStreet, buildingNumber, cityCountryProvince, landmarkName, pincode, state },
      firstName, lastName } = customers;
    return (
      <div className="w-30rem">
        <div className="customer-name-container">
          <span className="mr-1">{firstName}</span>
          <span className="ml-1">{lastName}</span>
        </div>
        <div className="address-container">
          {buildingNumber ? <span className="mr-2">{buildingNumber}</span> : null}
          {areaStreet ? <span className="mr-2">{areaStreet},</span> : null}
          {landmarkName ? <span className="mr-2">{landmarkName},</span> : null}
          <span className="mr-2">{cityCountryProvince}</span>
          <span className="mr-2">{pincode}</span>
          <span>{state}</span>
        </div>
        <div className="email-container">
          {emails_emails_addressesToaddresses ? <span>{emails_emails_addressesToaddresses[0]?.email}</span> : null}
        </div>
        <div className="contact-number-container">
          {contact_number ? <span>{contact_number[0]?.number}</span> : null}
        </div>
      </div>
    )

  }





  const handleShowProducts = ({ order_items }) => {
    return (
      <div>
        {order_items.length > 2 ?
          <div>
            <div
              className="product-header"
            >
              <Button
                label={`Products(${order_items.length})`}
                className="p-button-link"
                onMouseEnter={handleMouseEnter}
              // onMouseLeave={handleMouseLeave}

              />
            </div>
            <div className="overlay-panel">
              <OverlayPanel ref={productDisplayRef} showCloseIcon  >
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}>
                  {/* <Tooltip target=".product-header" autoHide={true} >
                <div style={{
                  maxHeight: '200px',
                  overflow: 'auto',
                }}> */}


                  {/* {order_items.map((product, i) => {
                    const { quantity, products: { name, sku } } = product;
                    return (

                      <div key={i} >

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
                        {i !== order_items.length - 1 && (
                          <Divider align="center" type="dashed" style={{ borderTop: '1px solid #ddd' }} />
                        )}
                      </div>


                    )
                  })} */}
                  {order_items.map((product, i) => {
                    const { quantity, products: { name, sku } } = product;
                    const slNo = i + 1;
                    return (
                      <div key={i} className="flex mt-4 ">
                        <div className="flex gap-2">
                          {/* <div className="font-semibold ml-2">Name:</div> */}
                          <div className="">{`${slNo}. ${name} (${sku}) - ${quantity}`}</div>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </OverlayPanel>
            </div>
          </div>
          : order_items.length < 3 && order_items.length > 0 ?
            <div className="w-30rem">

              {/* {order_items.map((product, i) => {
                const { quantity, products: { name, sku } } = product;
                return (
                  <div key={i} className="flex mt-4" >
                    {[{ prop: "Name", value: name },
                    { prop: "SKU", value: sku },
                    { prop: "Quantity", value: quantity }
                    ].map(({ prop, value }, index) => (
                      <div key={index} className="flex gap-2">

                        <label className="font-semibold ml-2">{prop}:</label>
                        <div className="">
                          {value?.toString()}
                        </div>

                      </div>
                    ))}
                    {i !== order_items.length - 1 && (
                      <Divider align="center" type="dashed" style={{ borderTop: '1px solid #ddd' }} />
                    )}
                  </div>
                )
              })} */}

              {order_items.map((product, i) => {
                const { quantity, products: { name, sku } } = product;
                const slNo = i + 1;
                return (
                  <div key={i} className="flex mt-4 ">
                    <div className="flex gap-2">
                      {/* <div className="font-semibold ml-2">Name:</div> */}
                      <div className="">{`${slNo}. ${name} (${sku}) - ${quantity}`}</div>
                    </div>
                  </div>
                );
              })}
            </div>


            : <div className="hideLargeContent">-</div>
        }
      </div>
    )
  }

  //  checked customer
  const [displayChecked, setDisplayChecked] = useState(false);
  console.log('displayChecked: ', displayChecked);
  console.log("orders", orders);

  console.log('formik.values: ', formik.values.name);



  // Crete DataTable

  const calculateSubtotal = () => {
    const totalPrice = formik.values.orderItems.reduce(
      (total, ele) => total + ele.price * ele.quantity,
      0
    ) - formik.values.discountAmount;

    formik.setFieldValue("totalPrice", totalPrice);
  };

  const calculateTotal = () => {
    const totalPriceAmount = formik.values.orderItems.reduce(
      (total, ele) => {
        const priceWithGst = ele.gst ? ele.price * ele.quantity * (1 + ele.gst / 100) : ele.price * ele.quantity;
        console.log('price: ', priceWithGst);
        return total + priceWithGst
      },
      0
    ) - formik.values.discountAmount
    return totalPriceAmount;
  };
  console.log('calculateTotal: ', calculateTotal());


  const dataTableOrderdata = formik.values.orderItems;
  console.log('dataTableOrderdata: ', dataTableOrderdata);

  const onCellEditComplete = (e) => {
    const { rowData, newValue, field, originalEvent: event } = e;
    console.log('newValue: ', newValue, rowData, field);
    if (['price', 'quantity'].includes(field)) {
      if (newValue?.trim().length > 0) {
        rowData[field] = newValue

        const updatedOrderItems = formik.values.orderItems.map((item, itemIndex) => {

          if (item.id === rowData.id) {
            return { ...item, [field]: newValue };
          }
          return item;
        });

        formik.setValues({
          ...formik.values,
          orderItems: updatedOrderItems,
        });

        calculateSubtotal();
      } else {
        event.preventDefault();
      }
    }
  };

  const textEditor = (options) => {

    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}

      />
    );
  };

  const orderItemColumn = [
    { field: "price", header: 'Price', body: (rowData) => rowData.price || "-" },
    { field: "AvailableQuantity", header: 'AvailableQuantity', body: (rowData) => rowData.availableInventory || rowData.availableInventory },
    { field: "quantity", header: 'Quantity', body: (rowData) => rowData.quantity || "-" },
    { field: "rowTotal", header: 'Row Total', body: (rowData) => rowData.price * rowData.quantity || "-" },
  ]

  const [isProductSelected, setIsProductSelected] = useState(false);
  console.log('isProductSelected: ', isProductSelected);


  const handleRemoveInput = (index) => {
    const _filteredDeleteItemOptions = selectedOrderItemValue.filter((value) => value !== formik.values.orderItems[index]?.id)
    setSelectedOrderItemValue(_filteredDeleteItemOptions);


    if (formik.values.orderItems.length === 1) {
      return;
    }
    const newInputsItems = [...formik.values.orderItems];
    newInputsItems.splice(index, 1);
    formik.setFieldValue("orderItems", newInputsItems);
  };

  const initialItemList = {
    id: '',
    name: '',
    quantity: '',
    price: '',
    availableInventory: ''
  }

  const [itemList, setItemList] = useState([
    {
      ...initialItemList,
    },
  ])



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
            <div className="flex col-12">
              <h3 className="mt-2">Customer Details</h3>
              <div className="flex justify-content-center align-items-center ml-4">
                <InputSwitch
                  checked={formik.values.display === 1}
                  onChange={(e) => {
                    console.log('e:value ', e.value);
                    formik.setFieldValue("display", e.value ? 1 : 0);
                  }}
                // className="mt-2"
                />
                <label className="ml-3" style={{ fontSize: "0.8rem" }}>Show Customer in Future Search </label>
              </div>

            </div>

            <form onSubmit={formik.handleSubmit}
              className="p-fluid">

              <div className="grid">
                <div className=" mt-3">
                  {/* <div>
                    <span>Display Customer </span>
                  </div> */}
                  {/* <InputSwitch
                    checked={formik.values.display === 1}
                    onChange={(e) => {
                      console.log('e:value ', e.value);
                      formik.setFieldValue("display", e.value ? 1 : 0);
                    }}
                    className="mt-2"
                  /> */}
                </div>

                <div className="field col-12 md:col-4 lg:col-3 mt-3">

                  <span className="p-float-label">
                    <AutoComplete
                      value={formik.values?.name}
                      dropdown
                      field="name"
                      suggestions={customerOptionsSuggestions && customerOptionsSuggestions.filter((val) => val.display === 1)}
                      completeMethod={searchCustomer}
                      forceSelection

                      onChange={async (e) => {
                        // const selectedCustomer = typeof e.value === "string" ? e.value : " "
                        const selectedCustomer = e.value;
                        console.log("customer e.value", e.value);
                        console.log("customer e.value", typeof e.value);
                        let name = typeof e.value === "string" ? e.value : e.value?.name
                        startTransition(() => {
                          setSelectedCustomerName(name)
                        })
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
                  // { field: "gstNumber", label: "GST " },
                  // { field: "contactNumber", label: "Contact Number" },
                  // { label: "Address", field: "address" },
                  // { label: "LandMark", field: "landmarkName" },
                  // { label: "Pincode", field: "pincode" },
                ].map((ele, i) => {
                  return (
                    <div key={`${ele.label}${i}`} className="field col-12 lg:col-2 md:col-6 mt-3">
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

                <div className="field col-12 md:col-6 lg:col-2 mt-3">
                  <span className="p-float-label">
                    <InputText
                      id="gstNumber"
                      name="gstNumber"
                      value={formik.values?.gstNumber}
                      onChange={formik.handleChange}
                      className={classNames({ "p-invalid": isFormFieldValid("gstNumber") })}

                    />
                    <label
                      htmlFor="gstNumber"
                      className={classNames({ "p-error": isFormFieldValid("gstNumber") })}
                    >
                      GST Number
                    </label>
                    {getFormErrorMessage("gstNumber")}
                  </span>
                </div>

                <div className="grid col-12">
                  <div key={`Order Status`} className="field col-12 lg:col-4 md:col-6 ">
                    <span className="p-float-label">
                      <span>{formik.values.orderStatus?.name || ''}</span>
                      <label
                        htmlFor={"category"}
                        className={classNames({ "p-error": isFormFieldValid("category") })}
                      >
                        Order Status
                      </label>
                    </span>

                  </div>

                </div>

                <div className="col-12">
                  <h3 className="p-0">Shipping Address</h3>
                  <AddressComponent isFormFieldValid={isFormFieldValid} getFormErrorMessage={getFormErrorMessage} errors={formik.errors.shippingAddress} value={formik.values.shippingAddress} setField={formik.setFieldValue} addressName={'shippingAddress'} />
                </div>
                <div className="col-12 grid align-items-center">
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
                    <h3 className="mt-2">Billing Address</h3>
                    <AddressComponent errors={formik.errors.billingAddress} value={formik.values.billingAddress} setField={formik.setFieldValue} addressName={'billingAddress'} />
                  </div >
                }

                {/* <div className="with-border col-12">
                  <div className=" ">
                    <h3 >Order Items</h3>
                    {formik.values.orderItems.map((ele, index) => (
                      <div key={index} className="grid ">
                        <span className="bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center mt-4 ml-2">{index + 1}</span>

                        <div className="field col-12 lg:col-3 md:col-2 mt-2 ">
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
                                const selectedProduct = e.value;
                                console.log("e.value", e.value);
                                setSelectedOrderItemValue([...selectedOrderItemValue, e.value?.id])
                                const selectedProductGST = selectedProduct?.gstTaxTypeCode || 0;
                                const inventory = await isInStock(selectedProduct?.sku);
                                const sellingPrice = product_prices.find((price) => price.productId === selectedProduct?.id)?.sellingPrice || 0;
                                const _orderItemInput = [...formik.values.orderItems];
                                _orderItemInput[index] = {
                                  ..._orderItemInput[index],
                                  ...selectedProduct,
                                  price: sellingPrice,
                                  availableInventory: inventory?.availableQuantity,
                                  shelf: inventory?.shelf?.blockedShelfIds[0],
                                  gst: selectedProductGST, // Add the GST value to the order item
                                };
                                // const totalAmount = ele.price * ele.quantity;
                                // const totalAmountWithGST = totalAmount + (totalAmount * ele.gst) / 100;

                                await formik.setValues({
                                  ...formik.values,
                                  orderItems: _orderItemInput,
                                });

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

                        <div className=" ">
                          <span className="p-float-label">
                            <InputText
                              // disabled={true}
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

                        <div className=" ">
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
                              htmlFor="type"
                              className={classNames({ "p-error": isFormFieldValid("type"), })}
                            >
                              Quantity - <span className="green_color">{ele?.availableInventory}</span>
                            </label>
                          </span>
                        </div>

                        <div className="field col-12 lg:col-1 md:col-6 mt-2">
                          <span className="p-float-label">
                            <InputText

                              className=''
                              id="rowTotal"
                              type='text'
                              name='rowTotal'
                              value={(ele.price * ele.quantity)}
                              disabled
                            />
                            <label
                              htmlFor="availableInventory"
                              className={classNames({ "p-error": isFormFieldValid("rowTotal") })}
                            >
                              Row Total
                            </label>
                          </span>
                        </div>


                        <div className="field flex  col-12 lg:col-1 md:col-6 mt-2 ">
                          <Button
                            icon="pi pi-minus"
                            className="p-2 m-1"
                            onClick={() => handleRemoveInput(index)}
                            style={{ height: '35px' }}
                          />

                          <Button
                            icon="pi pi-plus"
                            className="m-1"
                            onClick={(e) => {
                              e.preventDefault()
                              handleAddInput();
                            }}
                            style={{ height: '35px' }}
                          />
                        </div>

                      </div>
                    ))}



                  </div>


                  <div className="field mt-1 flex justify-content-end mt-2">
                    <span className="p-float-label ">
                      <InputText
                        disabled={true}
                        id={"totalPrice"}
                        name={"totalPrice"}
                        value={formik.values.totalPrice}
                        autoFocus
                        className={classNames({ "p-invalid ": isFormFieldValid("description") })}
                      />
                      <label
                        htmlFor={"totalPrice"}
                        className={classNames({ "p-error": isFormFieldValid("sku") })}
                      >
                        Sub Total
                      </label>
                    </span>
                    {getFormErrorMessage("totalPrice")}
                  </div>

                  <div className="field mt-1 flex justify-content-end mt-4">
                    <span className="p-float-label">
                      <InputText
                        className=''
                        type='text'
                        name='gstTaxTypeCode'
                        value={formik.values.gstTaxTypeCode}
                        onChange={() => { }}
                      />
                      <label
                        htmlFor="gstTaxTypeCode"
                        className={classNames({ "p-error": isFormFieldValid("gstTaxTypeCode") })}>
                        GST: {totalGST}%
                      </label>
                    </span>
                  </div>

                  <div className="field mt-1 flex justify-content-end mt-4">
                    <span className="p-float-label">
                      <InputText
                        className=''
                        type='text'
                        name='discountAmount'
                        value={formik.values.discountAmount}
                        onChange={discountHandleSubmit}
                      />
                      <label
                        htmlFor="discountAmount"
                        className={classNames({ "p-error": isFormFieldValid("discountAmount") })}>
                        Discount Amount
                      </label>
                    </span>
                  </div>


                  <div className="field mt-1 flex justify-content-end mt-4">
                    <span className="p-float-label">
                      <InputText
                        disabled
                        className=''
                        type='text'
                        name='total'
                        value={totalPriceAmount.toFixed(1)}

                      />
                      <label
                        htmlFor="discountAmount"
                        className={classNames({ "p-error": isFormFieldValid("discountAmount") })}>
                        <span className="green_color">Total Amount</span>
                      </label>
                    </span>
                  </div>

                </div>  */}


                <div className="col-12 ">
                  <h3 >Order Items</h3>

                  <DataTable
                    value={formik.values.orderItems}
                    showGridlines
                    stripedRows
                    editMode="cell"
                    className="p-10 text-red-400"
                  >
                    <Column
                      header='ID'
                      className="reduce-column"
                      body={(ele, { rowIndex }) => (
                        <div key={rowIndex} className=" ">
                          <span className="bg-primary border-circle w-2rem h-2rem flex align-items-center justify-content-center ">{rowIndex + 1}</span>
                        </div>

                      )}
                    />

                    <Column
                      header="Products"
                      label='name'
                      className="remove-column"
                      body={(ele, { rowIndex }) => {
                        console.log('index', rowIndex)
                        return (
                          <div className="">

                            <div className="">
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
                                  const selectedProduct = e.value;
                                  console.log("e.value", e.value);
                                  setSelectedOrderItemValue([...selectedOrderItemValue, e.value?.id])
                                  const selectedProductGST = selectedProduct?.gstTaxTypeCode || 0;
                                  const inventory = await isInStock(selectedProduct?.sku);
                                  const sellingPrice = product_prices.find((price) => price.productId === selectedProduct?.id)?.sellingPrice || 0;

                                  const filterEmptyProducts = formik.values.orderItems.filter((product) => product.name)
                                  console.log('filterEmptyProducts _filter ', formik.values.orderItems);
                                  console.log('filterEmptyProducts: ', filterEmptyProducts);
                                  const _orderItemInput = [...filterEmptyProducts];
                                  console.log('_orderItemInput: ', _orderItemInput);

                                  const lastOrderItem = _orderItemInput[_orderItemInput.length - 1];
                                  console.log('lastOrderItem: ', lastOrderItem);


                                  _orderItemInput[rowIndex] = {
                                    ..._orderItemInput[rowIndex],
                                    ...selectedProduct,
                                    price: sellingPrice,
                                    availableInventory: inventory?.availableQuantity,
                                    shelf: inventory?.shelf?.blockedShelfIds[0],
                                    gst: selectedProductGST,
                                  };
                                  await formik.setValues({
                                    ...formik.values,
                                    orderItems: [..._orderItemInput,
                                    {
                                      id: '',
                                      name: '',
                                      quantity: '',
                                      price: '',
                                      availableInventory: ''
                                    }]

                                  });


                                  // const filterValue = formik.values.orderItems.filter((val, index) => {
                                  //   const existingOrderItems = formik.values.orderItems;

                                  //   if (existingOrderItems[rowIndex]?.name === "") {
                                  //     console.log('TRUE ++: true');
                                  //     console.log("TRUE ++:", existingOrderItems.length);
                                  //   } else {
                                  //     console.log("TRUE ++: false ");
                                  //     console.log("TRUE ++:", existingOrderItems.length);

                                  //     existingOrderItems[rowIndex] = {
                                  //       ...existingOrderItems[rowIndex],
                                  //       ...selectedProduct,
                                  //       price: sellingPrice,
                                  //       availableInventory: inventory?.availableQuantity,
                                  //       shelf: inventory?.shelf?.blockedShelfIds[0],
                                  //       gst: selectedProductGST,
                                  //     };
                                  //   }

                                  // })


                                  // console.log('filterValue: ', filterValue);

                                  // await formik.setValues({
                                  //   ...formik.values,
                                  //   orderItems: existingOrderItems,
                                  // });


                                  setIsProductSelected(!!e.value);

                                  const totalAmount = ele.price * ele.quantity;
                                  const totalAmountWithGST = totalAmount + (totalAmount * ele.gst) / 100;

                                  // _orderItemInput[rowIndex] = {
                                  //   ..._orderItemInput[rowIndex],
                                  //   ...selectedProduct,
                                  //   price: sellingPrice,
                                  //   availableInventory: inventory?.availableQuantity,
                                  //   shelf: inventory?.shelf?.blockedShelfIds[0],
                                  //   gst: selectedProductGST,
                                  // };

                                  // await formik.setValues({
                                  //   ...formik.values,
                                  //   orderItems: _orderItemInput,
                                  // });

                                }}



                                aria-label="products"
                                dropdownAriaLabel="Select Product"
                                className={classNames({ "p-invalid": isFormFieldValid("name") })}

                              />
                            </div>


                          </div>
                        )
                      }}
                    />

                    {orderItemColumn.map((i) => {
                      return (
                        <Column
                          key={i.field}
                          field={i.field}
                          header={i.header}
                          body={i.body}
                          editor={i.field === "price" || i.field === 'quantity' ? textEditor : null}
                          onCellEditComplete={i.field === "price" || i.field === 'quantity' ? onCellEditComplete : null}
                        />
                      )
                    })}
                    {/* <Column
                      header='Row Total'
                      body={(ele, { rowIndex }) => (
                        <div key={rowIndex} className="mt-3 ">
                          <div className="">
                            <InputText
                              className=''
                              id="rowTotal"
                              type='text'
                              name='rowTotal'
                              value={(ele.price * ele.quantity)}
                              disabled
                            />

                          </div>
                        </div>
                      )}
                    /> */}


                    <Column
                      header='Remove'
                      className="reduce-column"
                      body={(ele, { rowIndex }) => (
                        <div key={rowIndex} className="">
                          <div className="">
                            <Button
                              icon="pi pi-times"
                              className="p-button-secondary"
                              onClick={() => handleRemoveInput(rowIndex)}
                              style={{ height: '35px' }}
                              disabled={formik.values.orderItems.length === 1 ? true : false}
                            />
                          </div>

                        </div>
                      )}
                    />

                  </DataTable>

                  <div className="col-12">
                    <div className="field mt-1 flex justify-content-end mt-4">
                      <span className="p-float-label ">
                        <InputText
                          disabled={true}
                          id={"totalPrice"}
                          name={"totalPrice"}
                          value={formik.values.totalPrice}
                          autoFocus
                          className={classNames({ "p-invalid ": isFormFieldValid("description") })}
                        />
                        <label
                          htmlFor={"totalPrice"}
                          className={classNames({ "p-error": isFormFieldValid("sku") })}
                        >
                          Sub Total
                        </label>
                      </span>
                      {getFormErrorMessage("totalPrice")}
                    </div>

                    <div className="field mt-1 flex justify-content-end mt-4">
                      <span className="p-float-label">
                        <InputText
                          className=''
                          type='text'
                          name='gstTaxTypeCode'
                          value={formik.values.gstTaxTypeCode}
                          onChange={() => { }}
                          disabled
                        />
                        <label
                          htmlFor="gstTaxTypeCode"
                          className={classNames({ "p-error": isFormFieldValid("gstTaxTypeCode") })}>
                          GST: {totalGST}₹
                        </label>
                      </span>
                    </div>

                    <div className="field mt-1 flex justify-content-end mt-4">
                      <span className="p-float-label">
                        <InputText
                          className=''
                          type='text'
                          name='discountAmount'
                          value={formik.values.discountAmount}
                          onChange={discountHandleSubmit}
                        />
                        <label
                          htmlFor="discountAmount"
                          className={classNames({ "p-error": isFormFieldValid("discountAmount") })}>
                          Discount Amount
                        </label>
                      </span>
                    </div>


                    <div className="field mt-1 flex justify-content-end mt-4">
                      <span className="p-float-label">
                        <InputText
                          disabled
                          className=''
                          type='text'
                          name='total'
                          value={calculateTotal()}

                        />
                        <label
                          htmlFor="discountAmount"
                          className={classNames({ "p-error": isFormFieldValid("discountAmount") })}>
                          <span className="green_color">Total Amount</span>
                        </label>
                      </span>
                    </div>
                  </div>

                </div>


                <div className="col-12">
                  <h3>Payment Method </h3>
                  <div className="grid">

                    <div className="field col-12 lg:col-2 md:col-2 mt-2">
                      <span className="p-float-label">
                        <AutoComplete
                          value={selectedPaymentTerm ? selectedPaymentTerm.name : ''}
                          suggestions={itemsPaymentTerms}
                          completeMethod={search}
                          onChange={handlePaymentTermChange}
                          dropdown
                        />
                      </span>
                    </div>
                    {selectedPaymentTerm.name === '100% Advance' ?
                      <>
                        <div key={`paymentStatus`} className="field col-12 lg:col-4 md:col-6 mt-2">
                          <span className="p-float-label ">
                            <AutoComplete
                              id="paymentStatus"
                              value={selectedPaymentStatus ? selectedPaymentStatus.name : ''}
                              suggestions={paymentStatus}
                              completeMethod={paymentStatusSearch}
                              onChange={handlePaymentStatusChange}
                              dropdown
                              // value={formik.values.paymentStatus?.name}
                              // suggestions={paymentOptionsSuggestions}
                              // completeMethod={searchPayment}
                              // onChange={(e) => {
                              //   formik.setFieldValue('paymentStatus', e?.value);
                              // }}
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

                        <div key={`paymentMethodId`} className="field col-12 lg:col-4 md:col-6 mt-2">
                          <span className="p-float-label">
                            <AutoComplete
                              id="paymentMethodId"
                              value={selectPaymentMethod ? selectPaymentMethod?.name : ''}
                              suggestions={paymentMethod}
                              completeMethod={paymentMethodSearch}
                              onChange={handlePaymentMethodChange}
                              dropdown
                              forceSelection
                              aria-label="paymentMethodId"
                              dropdownAriaLabel="paymentMethodId"
                              className={classNames({ "p-invalid": isFormFieldValid("paymentMethodId") })}
                            // field="name"
                            // id="gateway"
                            // value={formik.values.gateway}
                            // onChange={(e) => {
                            //   const selectedOrderItem = gatewayOptions.find(option_ => option_.name === e.value?.name);
                            //   const selectedItemsOptionName = selectedOrderItem ? selectedOrderItem.name : null;
                            //   formik.setFieldValue('gateway', selectedItemsOptionName);
                            // }}
                            />
                            <label
                              className={classNames({ "p-error": isFormFieldValid("paymentMethodId") })}
                            >
                              Payment Method
                            </label>
                          </span>
                          {/* {getFormErrorMessage("category")} */}
                        </div>

                        <div className="field col-12 md:col-3 lg:col-2 mt-2 ">
                          <span className="p-float-label">
                            <InputText
                              id="paymentReferenceId"
                              value={formik.values?.paymentReferenceId}
                              onChange={formik.handleChange}
                              className={classNames({ "p-invalid": isFormFieldValid("paymentReferenceId") })}

                            />
                            <label
                              htmlFor="paymentReferenceId"
                              className={classNames({ "p-error": isFormFieldValid("paymentReferenceId") })}
                            >
                              Reference Number
                            </label>

                          </span>
                        </div>

                      </>
                      :
                      ''}



                  </div>

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
                    formik.resetForm()
                  }}
                />
              </div>

            </form>
          </div >
        </div >
      }

      {/* <div className="col-12">
        <JobStatus id={jobId} title={"Order Fetching Job"} />
      </div> */}


      <div className="col-12">
        <div className="card">
          <div className="col-12">
            <TabMenu
              onTabChange={handleTabMenuOrderDataChange}
              model={[...tabMenuItems, { label: "ALL" },]}
              activeIndex={statusId === 1 ? 0 : (statusId === "all"
                ? tabMenuItems.length - 1
                : tabMenuItems.findIndex(tab => tab.id === statusId))}

            />


          </div>

          <div className="col-12 mt-3 mb-3">
            {renderHeader()}
          </div>

          <DataTable
            value={orders}
            // value={filteredOrders}
            responsiveLayout="scroll"
            // scrollable
            filters={filters}
            stripedRows
            showGridlines
            className="text-s datatable-responsive"
            selection={selectedOrder}
            onSelectionChange={(e) => setSelectedOrder(e.value)}
            tableStyle={{ minWidth: '50rem' }}
            style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s ease-in-out' }}
            isDataSelectable={isRowSelectable}
            cellClassName={cellClassName}
            footer={paginator}
          >
            {statusId === 1 ? <Column
              selectionMode="multiple"
              headerStyle={{ width: '3rem' }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
            </Column> : null}

            <Column
              field='id'
              header="Order ID"

              body={(rowData) => (
                <Link href={`/orders/${rowData.id}`}>{rowData.id}</Link>
              )}
              filter
              filterField="id"
              filterPlaceholder="Search..."

            />
            <Column
              field="shopify.orderNumber"
              header="Shopify Order #"
              body={(rowData) => {
                if (!rowData.shopify) return <span>-</span>;
                const shopifyNum = rowData.shopify.orderNumber || rowData.shopify.orderId;
                if (!shopifyNum) return <span>-</span>;
                const cleaned = shopifyNum.replace("gid://shopify/Order/", "");
                return <span>{cleaned}</span>;
              }}
            />
            <Column
              field="shopifyId"
              header="Channel"
              body={(rowdata) => rowdata.shopifyId ? "SH" : "IH"}

            />


            {/* Add Hover thing in product  */}

            <Column
              field="order_items"
              header="Products"
              body={handleShowProducts}

            />

            <Column
              field="firstName"
              header="Customer"
              body={handleCustomerDetailsRender}

            />
            <Column
              field="gateway"
              header="Payment Method"
              filter
              filterField="gateway"
              filterPlaceholder="Search..."
            />
            <Column
              field="discountAmount"
              header="Discount"
              filter
              filterField="discountAmount"
              filterPlaceholder="Search..."
            />

            <Column
              field="gstNumber"
              header='GST Number'
              filter
              filterField="gstNumber"
              filterPlaceholder="Search..."
            />
            <Column
              field="paymentReferenceId"
              header='Payment Reference Id'
              filter
              filterField="paymentReferenceId"
              filterPlaceholder="Search..."

            />
            <Column
              field="totalPrice"
              header="Amount"
              filter
              filterField="totalPrice"
              filterPlaceholder="Search..."

            />
            <Column
              field="channelCreatedAt"
              header="Order Date & Time"
              filter
              filterField="channelCreatedAt"
              dataType="date"
              filterElement={dateFilterTemplate}
              body={(rowData) => dateFormat(rowData.channelCreatedAt || rowData.createdAt)}
            />

            <Column
              header="Order Status"
              body={(rowData) => {
                if (isLoading)
                  return <span>loading..</span>
                const statusName = rowData.order_status?.name || rowData.orderStatus?.name || rowData.orderStatus || '-';
                return (
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#e2e8f0',
                    letterSpacing: '0.03em',
                    display: 'inline-block'
                  }}>
                    {statusName}
                  </span>
                )
              }}
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
