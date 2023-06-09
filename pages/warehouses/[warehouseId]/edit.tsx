import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";
import Layout from "layouts/Layout"

// import Layout from "src/core/layouts/Layout";
// import getWarehouse from "src/warehouses/queries/getWarehouse";
// // import updateWarehouse from "src/warehouses/mutations/updateWarehouse";
// import {
//   WarehouseForm,
//   FORM_ERROR,
// } from "src/warehouses/components/WarehouseForm";

export const EditWarehouse = () => {
  const router = useRouter();
  const warehouseId = useParam("warehouseId", "number");
  // const [warehouse, { setQueryData }] = useQuery(
  //   getWarehouse,
  //   { id: warehouseId },
  //   {
  //     // This ensures the query never refreshes and overwrites the form data while the user is editing.
  //     staleTime: Infinity,
  //   }
  // );
  // const [updateWarehouseMutation] = useMutation(updateWarehouse);

  return (
    <>
      <Head>
        <title>Edit Warehouse </title>
      </Head>

      {/* <div>
        <h1>Edit Warehouse {warehouse.id}</h1>
        <pre>{JSON.stringify(warehouse, null, 2)}</pre>

        <WarehouseForm
          submitText="Update Warehouse"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateWarehouse}
          initialValues={warehouse}
          onSubmit={async (values) => {
            try {
              const updated = await updateWarehouseMutation({
                id: warehouse.id,
                ...values,
              });
              await setQueryData(updated);
              await router.push(
                Routes.ShowWarehousePage({ warehouseId: updated.id })
              );
            } catch (error: any) {
              console.error(error);
              return {
                [FORM_ERROR]: error.toString(),
              };
            }
          }}
        />
      </div> */}
    </>
  );
};

const EditWarehousePage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditWarehouse />
      </Suspense>

      <p>
        {/* <Link href={Routes.WarehousesPage()}>Warehouses</Link> */}
      </p>
    </div>
  );
};

EditWarehousePage.authenticate = true;
EditWarehousePage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditWarehousePage;
