import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";
import Layout from "layouts/Layout"

// import Layout from "src/core/layouts/Layout";
// import getGrn from "src/grns/queries/getGrn";
// import deleteGrn from "src/grns/mutations/deleteGrn";

export const Grn = () => {
  const router = useRouter();
  const grnId = useParam("grnId", "number");
  // const [deleteGrnMutation] = useMutation(deleteGrn);
  // const [grn] = useQuery(getGrn, { id: grnId });

  return (
    <>
      <Head>
        {/* <title>Grn {grn.id}</title> */}
      </Head>

      <div>
        {/* <h1>Grn {grn?.id}</h1> */}
        {/* <pre>{JSON.stringify(grn, null, 2)}</pre> */}

        {/* <Link href={Routes.EditGrnPage({ grnId: grn?.id })}> */}
        <a>Edit</a>
        {/* </Link> */}

        <button
          type="button"
          // onClick={async () => {
          //   if (window.confirm("This will be deleted")) {
          //     await deleteGrnMutation({ id: grn.id });
          //     await router.push(Routes.GrnsPage());
          //   }
          // }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  );
};

const ShowGrnPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.GrnsPage()}>
          <a>Grns</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Grn />
      </Suspense>
    </div>
  );
};

ShowGrnPage.authenticate = true;
ShowGrnPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowGrnPage;
