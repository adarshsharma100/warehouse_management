import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "src/core/layouts/Layout";
import getOrder from "src/orders/queries/getOrder";
import deleteOrder from "src/orders/mutations/deleteOrder";

export const Order = () => {
  const router = useRouter();
  const orderId = useParam("orderId", "number");
  const [deleteOrderMutation] = useMutation(deleteOrder);
  const [order] = useQuery(getOrder, { id: orderId });

  return (
    <>
      <Head>
        <title>Order {order.id}</title>
      </Head>

      <div>
        <h1>Order {order.id}</h1>
        <pre>{JSON.stringify(order, null, 2)}</pre>

        <Link href={Routes.EditOrderPage({ orderId: order.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteOrderMutation({ id: order.id });
              await router.push(Routes.OrdersPage());
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  );
};

const ShowOrderPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.OrdersPage()}>
          <a>Orders</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Order />
      </Suspense>
    </div>
  );
};

ShowOrderPage.authenticate = true;
ShowOrderPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowOrderPage;
