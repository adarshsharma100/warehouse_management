import { Suspense, useState } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

// import Layout from "src/core/layouts/Layout";
import Layout from "layouts/Layout";
import getPutaway from "app/putaways/queries/getPutaway";
import deletePutaway from "app/putaways/mutations/deletePutaway";
import Loading from "components/loading";
import { Button } from "primereact/button";
import { TabPanel, TabView } from "primereact/tabview";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Checkbox } from "primereact/checkbox";

const putawayData = [
  {
    'S No.': '123',
    'Name': 'putawayData',
    'UniwareSKU': 'sku',
    'Quantity': '123',
    'ShelfCode': '00982',
    'BatchCode': 'awq1123',
    "InventoryCode": '1009123',
  },
  {
    'S No.': '123',
    'Name': 'putawayData',
    'UniwareSKU': 'sku',
    'Quantity': '123',
    'ShelfCode': '00982',
    'BatchCode': 'awq1123',
    "InventoryCode": '1009123',
  },
]

export const Putaway = () => {
  // const router = useRouter();
  // const putawayId = useParam("putawayId", "number");
  // const [putaway] = useQuery(getPutaway, { id: putawayId });

  const columns = Object.keys(putawayData[0]).map((key) => (
    <Column
      key={key}
      field={key}
      header={key}
      filter
      filterPlaceholder="Search...."
    />
  ));

  const [selectPutawayProducts, setSelectPutawayProducts] = useState([])
  console.log('selectPutawayProducts: ', selectPutawayProducts);
  const handleCheckboxChange = (e, rowData) => {
    const selectedRow = rowData; // You can modify this based on your data structure
    const selectedIndex = selectPutawayProducts.findIndex(
      (row) => row === selectedRow
    );

    let newSelectedRows = [];

    if (selectedIndex === -1) {
      // If the row is not already selected, add it to the selection
      newSelectedRows = [...selectPutawayProducts, selectedRow];
    } else {
      // If the row is already selected, remove it from the selection
      newSelectedRows = selectPutawayProducts.filter(
        (row) => row !== selectedRow
      );
    }

    setSelectPutawayProducts(newSelectedRows);
  };

  // Function to render the checkbox for each row
  const renderCheckbox = (rowData) => {
    const isChecked = selectPutawayProducts.includes(rowData);
    return (
      <Checkbox
        onChange={(e) => handleCheckboxChange(e, rowData)} // Call handleCheckboxChange here
        checked={isChecked}
      />
    );
  };

  return (
    <div>
      <Head>
        {/* <title>Putaway {putaway.id}</title> */}
      </Head>

      <div className="col-12 card flex justify-content-between align-items-center m-0">
        <h2 className="mt-2">Putaway / PT0035</h2>
      </div>
      <div className="mt-2">
        <TabView>
          <TabPanel header="Pending">
            <DataTable
              value={putawayData}
              responsiveLayout="scroll"
              showGridlines
              stripedRows
              className="text-s datatable-responsive"
            >
              {columns}

            </DataTable>
          </TabPanel>

          <TabPanel header="Completed">
            <DataTable
              value={putawayData}
              responsiveLayout="scroll"
              showGridlines
              stripedRows
              className="text-s datatable-responsive"
            >
              {columns}

            </DataTable>
          </TabPanel>

        </TabView>
      </div>

      <div className="col-12 card mt-6">
        <DataTable
          value={putawayData}
          responsiveLayout="scroll"
          showGridlines
          stripedRows
          className="text-s datatable-responsive"
          selectionMode='multiple'
          selection={selectPutawayProducts}
          onSelectionChange={(e) => setSelectPutawayProducts(e.value)}
          // onSelectionChange={(e) => handleCheckboxChange(e.value)}

        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '3rem' }}
            body={renderCheckbox}
          />

          {columns}

        </DataTable>
      </div>





    </div>
  );
};

const ShowPutawayPage = () => {
  return (
    <div>
      <p>
        <title>Putaway Id</title>
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
