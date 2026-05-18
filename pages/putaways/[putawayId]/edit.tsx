import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "layouts/Layout";
import getPutaway from "app/putaways/queries/getPutaway";
import updatePutaway from "app/putaways/mutations/updatePutaway";
import { PutawayForm, FORM_ERROR } from "app/putaways/components/PutawayForm";

export const EditPutaway = () => {
  const router = useRouter();
  const putawayId = useParam("putawayId", "number");
  const [putaway, { setQueryData }] = useQuery(
    getPutaway,
    { id: putawayId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  );
  const [updatePutawayMutation] = useMutation(updatePutaway);

  return (
    <>
      <Head>
        <title>Edit Putaway {putaway.id}</title>
      </Head>

      <div>
        <h1>Edit Putaway {putaway.id}</h1>
        <pre>{JSON.stringify(putaway, null, 2)}</pre>

        <PutawayForm
          submitText="Update Putaway"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdatePutaway}
          initialValues={putaway}
          onSubmit={async (values) => {
            try {
              const updated = await updatePutawayMutation({
                id: putaway.id,
                ...values,
              });
              await setQueryData(updated);
              await router.push(
                Routes.ShowPutawayPage({ putawayId: updated.id })
              );
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

const EditPutawayPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditPutaway />
      </Suspense>

      <p>
        <Link href={Routes.PutawaysPage()}>Putaways</Link>
      </p>
    </div>
  );
};

EditPutawayPage.authenticate = true;
EditPutawayPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditPutawayPage;
