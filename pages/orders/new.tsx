import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
// import Layout from "src/core/layouts/Layout";
// import createOrder from "src/orders/mutations/createOrder";
// import { OrderForm, FORM_ERROR } from "src/orders/components/OrderForm";
import Layout from "layouts/Layout"


const NewOrderPage = () => {
  const router = useRouter();
  // const [createOrderMutation] = useMutation(createOrder);

  return (
    <Layout title={"Create New Order"}>
      <h1>Create New Order</h1>

      {/* <OrderForm
        submitText="Create Order"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateOrder}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const order = await createOrderMutation(values);
            await router.push(Routes.ShowOrderPage({ orderId: order.id }));
          } catch (error: any) {
            console.error(error);
            return {
              [FORM_ERROR]: error.toString(),
            };
          }
        }}
      /> */}

      <p>
        <Link href={Routes.OrdersPage()}>
          <a>Orders</a>
        </Link>
      </p>
    </Layout>
  );
};

NewOrderPage.authenticate = true;

export default NewOrderPage;
