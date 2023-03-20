import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { usePaginatedQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "src/core/layouts/Layout";
import getOrders from "src/orders/queries/getOrders";

const ITEMS_PER_PAGE = 100;

export const OrdersList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ orders, hasMore }] = usePaginatedQuery(getOrders, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });

  return (
    <div>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={Routes.ShowOrderPage({ orderId: order.id })}>
              <a>{order.name}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  );
};

const OrdersPage = () => {
  return (
    <Layout>
      <Head>
        <title>Orders</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewOrderPage()}>
            <a>Create Order</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <OrdersList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default OrdersPage;
