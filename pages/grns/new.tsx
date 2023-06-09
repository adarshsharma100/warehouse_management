import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "layouts/Layout"

// import Layout from "src/core/layouts/Layout";
// import createGrn from "src/grns/mutations/createGrn";
// import { GrnForm, FORM_ERROR } from "src/grns/components/GrnForm";

const NewGrnPage = () => {
  const router = useRouter();
  // const [createGrnMutation] = useMutation(createGrn);

  return (
    <Layout title={"Create New Grn"}>
      <h1>Create New Grn</h1>

      {/* <GrnForm
        submitText="Create Grn"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateGrn}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const grn = await createGrnMutation(values);
            await router.push(Routes.ShowGrnPage({ grnId: grn.id }));
          } catch (error: any) {
            console.error(error);
            return {
              [FORM_ERROR]: error.toString(),
            };
          }
        }}
      /> */}

      <p>
        <Link href={Routes.GrnsPage()}>
          <a>Grns</a>
        </Link>
      </p>
    </Layout>
  );
};

NewGrnPage.authenticate = true;

export default NewGrnPage;
