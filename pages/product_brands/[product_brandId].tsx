import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "src/core/layouts/Layout";
import getProduct_brand from "src/product_brands/queries/getProduct_brand";
import deleteProduct_brand from "src/product_brands/mutations/deleteProduct_brand";

export const Product_brand = () => {
  const router = useRouter();
  const product_brandId = useParam("product_brandId", "number");
  const [deleteProduct_brandMutation] = useMutation(deleteProduct_brand);
  const [product_brand] = useQuery(getProduct_brand, { id: product_brandId });

  return (
    <>
      <Head>
        <title>Product_brand {product_brand.id}</title>
      </Head>

      <div>
        <h1>Product_brand {product_brand.id}</h1>
        <pre>{JSON.stringify(product_brand, null, 2)}</pre>

        <Link
          href={Routes.EditProduct_brandPage({
            product_brandId: product_brand.id,
          })}
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteProduct_brandMutation({ id: product_brand.id });
              await router.push(Routes.Product_brandsPage());
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  );
};

const ShowProduct_brandPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.Product_brandsPage()}>Product_brands</Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Product_brand />
      </Suspense>
    </div>
  );
};

ShowProduct_brandPage.authenticate = true;
ShowProduct_brandPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowProduct_brandPage;
