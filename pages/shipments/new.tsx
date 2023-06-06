import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "src/core/layouts/Layout";
import createShipment from "src/shipments/mutations/createShipment";
import {
  ShipmentForm,
  FORM_ERROR,
} from "src/shipments/components/ShipmentForm";

const NewShipmentPage = () => {
  const router = useRouter();
  const [createShipmentMutation] = useMutation(createShipment);

  return (
    <Layout title={"Create New Shipment"}>
      <h1>Create New Shipment</h1>

      <ShipmentForm
        submitText="Create Shipment"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateShipment}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const shipment = await createShipmentMutation(values);
            await router.push(
              Routes.ShowShipmentPage({ shipmentId: shipment.id })
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
        <Link href={Routes.ShipmentsPage()}>
          <a>Shipments</a>
        </Link>
      </p>
    </Layout>
  );
};

NewShipmentPage.authenticate = true;

export default NewShipmentPage;
