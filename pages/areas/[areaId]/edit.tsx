import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

// // import Layout from "src/core/layouts/Layout";
// import getArea from "src/areas/queries/getArea";
// import updateArea from "src/areas/mutations/updateArea";
// import { AreaForm, FORM_ERROR } from "src/areas/components/AreaForm";
import Layout from "layouts/Layout"

export const EditArea = () => {
  const router = useRouter();
  const areaId = useParam("areaId", "number");
  // const [area, { setQueryData }] = useQuery(
  //   getArea,
  //   { id: areaId },
  //   {
  //     // This ensures the query never refreshes and overwrites the form data while the user is editing.
  //     staleTime: Infinity,
  //   }
  // );
  // const [updateAreaMutation] = useMutation(updateArea);

  return (
    <>
      <Head>
        <title>Edit Area </title>
      </Head>

      <div>
        <h1>Edit Area </h1>
        {/* <h1>Edit Area {area.id}</h1> */}
        {/* <pre>{JSON.stringify(area, null, 2)}</pre> */}

        {/* <AreaForm
          submitText="Update Area"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateArea}
          initialValues={area}
          onSubmit={async (values) => {
            try {
              const updated = await updateAreaMutation({
                id: area.id,
                ...values,
              });
              await setQueryData(updated);
              await router.push(Routes.ShowAreaPage({ areaId: updated.id }));
            } catch (error: any) {
              console.error(error);
              return {
                [FORM_ERROR]: error.toString(),
              };
            }
          }}
        /> */}
      </div>
    </>
  );
};

const EditAreaPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditArea />
      </Suspense>

      <p>
        <Link href={Routes.AreasPage()}>Areas</Link>
      </p>
    </div>
  );
};

EditAreaPage.authenticate = true;
EditAreaPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditAreaPage;
