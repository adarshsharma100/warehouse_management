import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "app/core/layouts/Layout";
import getVendor from "app/vendors/queries/getVendor";
import deleteVendor from "app/vendors/mutations/deleteVendor";

export const Vendor = () => {
  const router = useRouter();
  const vendorId = useParam("vendorId", "number");
  const [deleteVendorMutation] = useMutation(deleteVendor);
  const [vendor] = useQuery(getVendor, { id: vendorId });

  return (
    <>
      <Head>
        <title>Vendor {vendor.id}</title>
      </Head>

      <div>
        <h1>Vendor {vendor.id}</h1>
        <pre>{JSON.stringify(vendor, null, 2)}</pre>

        <Link href={Routes.EditVendorPage({ vendorId: vendor.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteVendorMutation({ id: vendor.id });
              router.push(Routes.VendorsPage());
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

const ShowVendorPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.VendorsPage()}>
          <a>Vendors</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Vendor />
      </Suspense>
    </div>
  );
};

ShowVendorPage.authenticate = true;
ShowVendorPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowVendorPage;
