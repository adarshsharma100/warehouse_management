import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "src/core/layouts/Layout";
import createProduct_brand from "src/product_brands/mutations/createProduct_brand";
import {
  Product_brandForm,
  FORM_ERROR,
} from "src/product_brands/components/Product_brandForm";

const NewProduct_brandPage = () => {
  const router = useRouter();
  const [createProduct_brandMutation] = useMutation(createProduct_brand);

  return (
    <Layout title={"Create New Product_brand"}>
      <h1>Create New Product_brand</h1>

      <Product_brandForm
        submitText="Create Product_brand"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateProduct_brand}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const product_brand = await createProduct_brandMutation(values);
            await router.push(
              Routes.ShowProduct_brandPage({
                product_brandId: product_brand.id,
              })
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
        <Link href={Routes.Product_brandsPage()}>Product_brands</Link>
      </p>
    </Layout>
  );
};

NewProduct_brandPage.authenticate = true;

export default NewProduct_brandPage;
