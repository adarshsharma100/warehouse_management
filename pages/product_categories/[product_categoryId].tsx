import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";
import Layout from "layouts/Layout"

// import Layout from "src/core/layouts/Layout";
// import getProduct_category from "src/product_categories/queries/getProduct_category";
// import deleteProduct_category from "src/product_categories/mutations/deleteProduct_category";

export const Product_category = () => {
  const router = useRouter();
  const product_categoryId = useParam("product_categoryId", "number");
  // const [deleteProduct_categoryMutation] = useMutation(deleteProduct_category);
  // const [product_category] = useQuery(getProduct_category, {
  //   id: product_categoryId,
  // });

  return (
    <>
      <Head>
        <title>Product_category </title>
      </Head>

      {/* <div>
        <h1>Product_category {product_category.id}</h1>
        <pre>{JSON.stringify(product_category, null, 2)}</pre>

        <Link
          href={Routes.EditProduct_categoryPage({
            product_categoryId: product_category.id,
          })}
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteProduct_categoryMutation({ id: product_category.id });
              await router.push(Routes.Product_categoriesPage());
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div> */}
    </>
  );
};

const ShowProduct_categoryPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.Product_categoriesPage()}>Product_categories</Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Product_category />
      </Suspense>
    </div>
  );
};

ShowProduct_categoryPage.authenticate = true;
ShowProduct_categoryPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowProduct_categoryPage;
