import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "src/core/layouts/Layout";
import createWarehouse from "src/warehouses/mutations/createWarehouse";
import {
  WarehouseForm,
  FORM_ERROR,
} from "src/warehouses/components/WarehouseForm";

const NewWarehousePage = () => {
  const router = useRouter();
  const [createWarehouseMutation] = useMutation(createWarehouse);

  return (
    <Layout title={"Create New Warehouse"}>
      <h1>Create New Warehouse</h1>

      <WarehouseForm
        submitText="Create Warehouse"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateWarehouse}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const warehouse = await createWarehouseMutation(values);
            await router.push(
              Routes.ShowWarehousePage({ warehouseId: warehouse.id })
            );
          } catch (error: any) {
            console.error(error);
            return {
              [FORM_ERROR]: error.toString(),
            };
          }
        }}
      />

      <p>
        <Link href={Routes.WarehousesPage()}>Warehouses</Link>
      </p>
    </Layout>
  );
};

NewWarehousePage.authenticate = true;

export default NewWarehousePage;
