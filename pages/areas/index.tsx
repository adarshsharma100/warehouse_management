import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { usePaginatedQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "layouts/Layout";
// // import Layout from "src/core/layouts/Layout";
import getAreas from "app/areas/queries/getAreas";

const ITEMS_PER_PAGE = 100;

export const AreasList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  // const [{ areas, hasMore }] = usePaginatedQuery(getAreas, {
  //   orderBy: { id: "asc" },
  //   skip: ITEMS_PER_PAGE * page,
  //   take: ITEMS_PER_PAGE,
  // });

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });

  return (
    <div>
      <ul>
        {areas.map((area) => (
          <li key={area.id}>
            <Link href={Routes.ShowAreaPage({ areaId: area.id })}>
              {area.name}
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

const AreasPage = () => {
  return (
    <Layout>
      <Head>
        <title>Areas</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewAreaPage()}>Create Area</Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <AreasList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default AreasPage;
