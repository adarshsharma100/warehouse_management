import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { usePaginatedQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "src/core/layouts/Layout";
import getPutaways from "app/putaways/queries/getPutaways";

const ITEMS_PER_PAGE = 100;

export const PutawaysList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ putaways, hasMore }] = usePaginatedQuery(getPutaways, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });

  return (
    <div>
      <ul>
        {putaways.map((putaway) => (
          <li key={putaway.id}>
            <Link href={Routes.ShowPutawayPage({ putawayId: putaway.id })}>
              {putaway.name}
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  );
};

const PutawaysPage = () => {
  return (
    <Layout>
      <Head>
        <title>Putaways</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewPutawayPage()}>Create Putaway</Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <PutawaysList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default PutawaysPage;
