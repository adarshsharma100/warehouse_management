import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "app/core/layouts/Layout";
import createRfq from "app/rfqs/mutations/createRfq";
import { RfqForm, FORM_ERROR } from "app/rfqs/components/RfqForm";

const NewRfqPage = () => {
  const router = useRouter();
  const [createRfqMutation] = useMutation(createRfq);

  return (
    <Layout title={"Create New Rfq"}>
      <h1>Create New Rfq</h1>

      <RfqForm
        submitText="Create Rfq"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateRfq}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const rfq = await createRfqMutation(values);
            router.push(Routes.ShowRfqPage({ rfqId: rfq.id }));
          } catch (error: any) {
            console.error(error);
            return {
              [FORM_ERROR]: error.toString(),
            };
          }
        }}
      />

      <p>
        <Link href={Routes.RfqsPage()}>
          <a>Rfqs</a>
        </Link>
      </p>
    </Layout>
  );
};

NewRfqPage.authenticate = true;

export default NewRfqPage;
