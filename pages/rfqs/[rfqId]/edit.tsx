import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "app/core/layouts/Layout";
import getRfq from "app/rfqs/queries/getRfq";
import updateRfq from "app/rfqs/mutations/updateRfq";
import { RfqForm, FORM_ERROR } from "app/rfqs/components/RfqForm";

export const EditRfq = () => {
  const router = useRouter();
  const rfqId = useParam("rfqId", "number");
  const [rfq, { setQueryData }] = useQuery(
    getRfq,
    { id: rfqId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  );
  const [updateRfqMutation] = useMutation(updateRfq);

  return (
    <>
      <Head>
        <title>Edit Rfq {rfq.id}</title>
      </Head>

      <div>
        <h1>Edit Rfq {rfq.id}</h1>
        <pre>{JSON.stringify(rfq, null, 2)}</pre>

        <RfqForm
          submitText="Update Rfq"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateRfq}
          initialValues={rfq}
          onSubmit={async (values) => {
            try {
              const updated = await updateRfqMutation({
                id: rfq.id,
                ...values,
              });
              await setQueryData(updated);
              router.push(Routes.ShowRfqPage({ rfqId: updated.id }));
            } catch (error: any) {
              console.error(error);
              return {
                [FORM_ERROR]: error.toString(),
              };
            }
          }}
        />
      </div>
    </>
  );
};

const EditRfqPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditRfq />
      </Suspense>

      <p>
        <Link href={Routes.RfqsPage()}>
          <a>Rfqs</a>
        </Link>
      </p>
    </div>
  );
};

EditRfqPage.authenticate = true;
EditRfqPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditRfqPage;
