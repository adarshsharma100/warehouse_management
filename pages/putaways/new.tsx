import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "src/core/layouts/Layout";
import createPutaway from "app/putaways/mutations/createPutaway";
import { PutawayForm, FORM_ERROR } from "app/putaways/components/PutawayForm";

const NewPutawayPage = () => {
  const router = useRouter();
  const [createPutawayMutation] = useMutation(createPutaway);

  return (
    <Layout title={"Create New Putaway"}>
      <h1>Create New Putaway</h1>

      <PutawayForm
        submitText="Create Putaway"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreatePutaway}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const putaway = await createPutawayMutation(values);
            await router.push(
              Routes.ShowPutawayPage({ putawayId: putaway.id })
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
        <Link href={Routes.PutawaysPage()}>Putaways</Link>
      </p>
    </Layout>
  );
};

NewPutawayPage.authenticate = true;

export default NewPutawayPage;
