import { Suspense, useState } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { usePaginatedQuery, useQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "layouts/Layout"
import Loading from "components/loading"
import getShipments from "app/shipments/queries/getShipments";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TabMenu } from 'primereact/tabmenu';
import getShipment_statuses from "app/shipment_statuses/queries/getShipment_statuses";


const ITEMS_PER_PAGE = 100;
const initialOrders = [
  {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 1
  }, {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 2
  }, {
    "products": [
      { name: "Raspberry Pi 3 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 3
  }, {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 4
  },
  {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 5
  },
  {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 6
  }, {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 7
  }, {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 7
  }, {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 8
  }, {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 9
  }, {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 10
  }, {
    "products": [
      { name: "Raspberry Pi 4 Power supply-OFFICIAL", SKU: "(TIFPS0034)", quantity: "2", },
      { name: "5V 0.2A 3007 Cooling Fan for Raspberry Pi", SKU: "(TIF3P0183)", quantity: "1" },
    ],
    channel: {
      name: "SH"
    },

    status: {
      name: "CREATED"
    },

    priority: {
      number: "0"
    },

    onhold: {
      name: "No"
    },

    state: {
      name: "Himachal Pradesh"
    },

    fulfillmentTAT: {
      date: "08 Apr 2023, 06:36, SLA BREACHED"
    },

    orderType: 10
  },
]

export const ShipmentsList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ shipments, hasMore }] = usePaginatedQuery(getShipments, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });
  const [{ shipment_statuses, }] = useQuery(getShipment_statuses, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });

  console.log('shipment_statuses: ', shipment_statuses);

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });


  const tabMenuItems = shipment_statuses?.map(status => ({ label: `${status.name === "CREATED" ? "NEW" : status.name}`, }))

  const [orders, setOrders] = useState(initialOrders);

  const [activeIndex, setActiveIndex] = useState(0);

  return (

    <div className="card">
      <TabMenu
        model={[{ label: "ALL" }, ...tabMenuItems]}
        activeIndex={activeIndex}
        onTabChange={(e) => {
          console.log('e: ', e);

          setActiveIndex(e.index)
          setOrders(initialOrders.filter(data => e.index === 0 ? true : data.orderType === e.index))
        }} />



      <DataTable value={orders} tableStyle={{ minWidth: '50rem' }} showGridlines stripedRows >
        <Column field="Shipments" header="Shipments"></Column>
        <Column field="giftMessage" header="Gift Message(s)"></Column>
        <Column field="itemContains" header="Item Contains"></Column>
        <Column header="Products" body={({ products }) => <div>
          {products.map(product => (
            <div key={product.id}>
              <p>{product.name}</p>
              <p>{product.SKU}</p>
              <p>{product.quantity}</p>
            </div>
          ))}
        </div>} >
        </Column>
        <Column header="Channel" body={({ channel }) => <div>
          <p>{channel.name}</p>
        </div>} >
        </Column>
        <Column header="Status" body={({ status }) => <div>
          <p>{status.name}</p>
        </div>} >
        </Column>
        <Column header="Priority" body={({ priority }) => <div>
          <p>{priority.number}</p>
        </div>} >
        </Column>
        <Column field="picklist" header="Picklist"></Column>
        <Column field="invoiceNo." header="Invoice No."></Column>
        <Column header="OnHold" body={({ onhold }) => <div>
          <p>{onhold.name}</p>
        </div>} >
        </Column>
        <Column header="State" body={({ state }) => <div>
          <p>{state.name}</p>
        </div>} >
        </Column>
        <Column header="FulfillmentTAT" body={({ fulfillmentTAT }) => <div>
          <p>{fulfillmentTAT.date}</p>
        </div>} >
        </Column>
      </DataTable>
    </div>
  );
}

const ShipmentsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Shipments</title>
      </Head>

      <div>
        <Suspense fallback={<Loading />}>
          <ShipmentsList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default ShipmentsPage;
