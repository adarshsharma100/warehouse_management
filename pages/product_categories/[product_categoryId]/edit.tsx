import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";
import Layout from "layouts/Layout"

// // import Layout from "src/core/layouts/Layout";
// import getProduct_category from "src/product_categories/queries/getProduct_category";
// import updateProduct_category from "src/product_categories/mutations/updateProduct_category";
// import {
//   Product_categoryForm,
//   FORM_ERROR,
// } from "src/product_categories/components/Product_categoryForm";

export const EditProduct_category = () => {
  const router = useRouter();
  const product_categoryId = useParam("product_categoryId", "number");
  // const [product_category, { setQueryData }] = useQuery(
  //   getProduct_category,
  //   { id: product_categoryId },
  //   {
  //     // This ensures the query never refreshes and overwrites the form data while the user is editing.
  //     staleTime: Infinity,
  //   }
  // );
  // const [updateProduct_categoryMutation] = useMutation(updateProduct_category);

  return (
    <>
      <Head>
        <title>Edit Product_category</title>
      </Head>

      {/* <div>
        <h1>Edit Product_category {product_category.id}</h1>
        <pre>{JSON.stringify(product_category, null, 2)}</pre>

        <Product_categoryForm
          submitText="Update Product_category"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateProduct_category}
          initialValues={product_category}
          onSubmit={async (values) => {
            try {
              const updated = await updateProduct_categoryMutation({
                id: product_category.id,
                ...values,
              });
              await setQueryData(updated);
              await router.push(
                Routes.ShowProduct_categoryPage({
                  product_categoryId: updated.id,
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
      </div> */}
    </>
  );
};

const EditProduct_categoryPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditProduct_category />
      </Suspense>

      <p>
        <Link href={Routes.Product_categoriesPage()}>Product_categories</Link>
      </p>
    </div>
  );
};

EditProduct_categoryPage.authenticate = true;
EditProduct_categoryPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditProduct_categoryPage;
