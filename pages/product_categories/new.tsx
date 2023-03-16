import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "src/core/layouts/Layout";
import createProduct_category from "src/product_categories/mutations/createProduct_category";
import {
  Product_categoryForm,
  FORM_ERROR,
} from "src/product_categories/components/Product_categoryForm";

const NewProduct_categoryPage = () => {
  const router = useRouter();
  const [createProduct_categoryMutation] = useMutation(createProduct_category);

  return (
    <Layout title={"Create New Product_category"}>
      <h1>Create New Product_category</h1>

      <Product_categoryForm
        submitText="Create Product_category"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateProduct_category}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const product_category = await createProduct_categoryMutation(
              values
            );
            await router.push(
              Routes.ShowProduct_categoryPage({
                product_categoryId: product_category.id,
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
        <Link href={Routes.Product_categoriesPage()}>Product_categories</Link>
      </p>
    </Layout>
  );
};

NewProduct_categoryPage.authenticate = true;

export default NewProduct_categoryPage;
