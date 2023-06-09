import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";
import Layout from "layouts/Layout"

// import Layout from "src/core/layouts/Layout";
// import getProduct_brand from "src/product_brands/queries/getProduct_brand";
// import updateProduct_brand from "src/product_brands/mutations/updateProduct_brand";
// import {
//   Product_brandForm,
//   FORM_ERROR,
// } from "src/product_brands/components/Product_brandForm";

export const EditProduct_brand = () => {
  const router = useRouter();
  const product_brandId = useParam("product_brandId", "number");
  // const [product_brand, { setQueryData }] = useQuery(
  //   getProduct_brand,
  //   { id: product_brandId },
  //   {
  //     // This ensures the query never refreshes and overwrites the form data while the user is editing.
  //     staleTime: Infinity,
  //   }
  // );
  // const [updateProduct_brandMutation] = useMutation(updateProduct_brand);

  return (
    <>
      <Head>
        <title>Edit Product_brand</title>
      </Head>

      {/* <div>
        <h1>Edit Product_brand {product_brand.id}</h1>
        <pre>{JSON.stringify(product_brand, null, 2)}</pre>

        <Product_brandForm
          submitText="Update Product_brand"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateProduct_brand}
          initialValues={product_brand}
          onSubmit={async (values) => {
            try {
              const updated = await updateProduct_brandMutation({
                id: product_brand.id,
                ...values,
              });
              await setQueryData(updated);
              await router.push(
                Routes.ShowProduct_brandPage({ product_brandId: updated.id })
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

const EditProduct_brandPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditProduct_brand />
      </Suspense>

      <p>
        <Link href={Routes.Product_brandsPage()}>Product_brands</Link>
      </p>
    </div>
  );
};

EditProduct_brandPage.authenticate = true;
EditProduct_brandPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditProduct_brandPage;
