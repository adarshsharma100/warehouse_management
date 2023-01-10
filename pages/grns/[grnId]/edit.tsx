import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "src/core/layouts/Layout";
import getGrn from "src/grns/queries/getGrn";
import updateGrn from "src/grns/mutations/updateGrn";
import { GrnForm, FORM_ERROR } from "src/grns/components/GrnForm";

export const EditGrn = () => {
  const router = useRouter();
  const grnId = useParam("grnId", "number");
  const [grn, { setQueryData }] = useQuery(
    getGrn,
    { id: grnId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  );
  const [updateGrnMutation] = useMutation(updateGrn);

  return (
    <>
      <Head>
        <title>Edit Grn {grn.id}</title>
      </Head>

      <div>
        <h1>Edit Grn {grn.id}</h1>
        <pre>{JSON.stringify(grn, null, 2)}</pre>

        <GrnForm
          submitText="Update Grn"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateGrn}
          initialValues={grn}
          onSubmit={async (values) => {
            try {
              const updated = await updateGrnMutation({
                id: grn.id,
                ...values,
              });
              await setQueryData(updated);
              await router.push(Routes.ShowGrnPage({ grnId: updated.id }));
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

const EditGrnPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditGrn />
      </Suspense>

      <p>
        <Link href={Routes.GrnsPage()}>
          <a>Grns</a>
        </Link>
      </p>
    </div>
  );
};

EditGrnPage.authenticate = true;
EditGrnPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditGrnPage;
