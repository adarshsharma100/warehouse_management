import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "layouts/Layout"

// // import Layout from "src/core/layouts/Layout";
// import createArea from "src/areas/mutations/createArea";
// import { AreaForm, FORM_ERROR } from "src/areas/components/AreaForm";

const NewAreaPage = () => {
  const router = useRouter();
  // const [createAreaMutation] = useMutation(createArea);

  return (
    <Layout title={"Create New Area"}>
      <h1>Create New Area</h1>

      {/* <AreaForm
        submitText="Create Area"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateArea}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const area = await createAreaMutation(values);
            await router.push(Routes.ShowAreaPage({ areaId: area.id }));
          } catch (error: any) {
            console.error(error);
            return {
              [FORM_ERROR]: error.toString(),
            };
          }
        }}
      /> */}

      <p>
        <Link href={Routes.AreasPage()}>Areas</Link>
      </p>
    </Layout>
  );
};

NewAreaPage.authenticate = true;

export default NewAreaPage;
