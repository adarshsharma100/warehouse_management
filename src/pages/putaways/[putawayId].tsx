import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "src/core/layouts/Layout";
import getPutaway from "app/putaways/queries/getPutaway";
import deletePutaway from "app/putaways/mutations/deletePutaway";

export const Putaway = () => {
  const router = useRouter();
  const putawayId = useParam("putawayId", "number");
  const [deletePutawayMutation] = useMutation(deletePutaway);
  const [putaway] = useQuery(getPutaway, { id: putawayId });

  return (
    <>
      <Head>
        <title>Putaway {putaway.id}</title>
      </Head>

      <div>
        <h1>Putaway {putaway.id}</h1>
        <pre>{JSON.stringify(putaway, null, 2)}</pre>

        <Link href={Routes.EditPutawayPage({ putawayId: putaway.id })}>
          Edit
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deletePutawayMutation({ id: putaway.id });
              await router.push(Routes.PutawaysPage());
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

const ShowPutawayPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.PutawaysPage()}>Putaways</Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Putaway />
      </Suspense>
    </div>
  );
};

ShowPutawayPage.authenticate = true;
ShowPutawayPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowPutawayPage;
