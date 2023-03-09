import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "src/core/layouts/Layout";
import getWarehouse from "src/warehouses/queries/getWarehouse";
import deleteWarehouse from "src/warehouses/mutations/deleteWarehouse";

export const Warehouse = () => {
  const router = useRouter();
  const warehouseId = useParam("warehouseId", "number");
  const [deleteWarehouseMutation] = useMutation(deleteWarehouse);
  const [warehouse] = useQuery(getWarehouse, { id: warehouseId });

  return (
    <>
      <Head>
        <title>Warehouse {warehouse.id}</title>
      </Head>

      <div>
        <h1>Warehouse {warehouse.id}</h1>
        <pre>{JSON.stringify(warehouse, null, 2)}</pre>

        <Link href={Routes.EditWarehousePage({ warehouseId: warehouse.id })}>
          Edit
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteWarehouseMutation({ id: warehouse.id });
              await router.push(Routes.WarehousesPage());
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

const ShowWarehousePage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.WarehousesPage()}>Warehouses</Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Warehouse />
      </Suspense>
    </div>
  );
};

ShowWarehousePage.authenticate = true;
ShowWarehousePage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowWarehousePage;
