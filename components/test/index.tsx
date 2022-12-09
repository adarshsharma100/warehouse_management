// Create PO dialog component
<Dialog
  header="Create PO "
  visible={purchaseDialog}
  style={{ width: "80vw" }}
  // footer={renderFooter}
  onHide={() => setPurchaseDialog(false)}
>
  <form
    onSubmit={
      // async
      () => {
        console.log("purchase details", purchaseDetails)
        // const rfc = await createRFQMutation({ ...rfqDetails })
        // console.log(" rfc:132 ", rfc)
        // const many = itemList.map((ele) => {
        //   return {
        //     rfq_id: rfc.id,
        //     price_per_unit: Number(ele.price_per_unit),
        //     products_product_id: Number(ele.products_product_id),
        //     quantity: Number(ele.quantity),
        //   }
        // })
        // console.log("many: ", many)
        // try {
        //   await createRFQProductMutation(many)
        // } catch (error: any) {
        //   console.log("error: ", error)
        // }
        // await refetch()
      }
    }
    className="p-fluid"
  >
    <div className="flex justify-content-between mt-2 mb-2 pt-4">
      <Dropdown
        className="mr-2 w-28rem"
        // name="products_product_id"
        // disabled={editState}
        filter
        showClear
        filterBy="name"
        value={purchaseDetails.vendor_vendor_id}
        options={vendorOptions}
        onChange={(e) => {
          setPurchaseDetails({ ...purchaseDetails, vendor_vendor_id: e.value })
          const productOptionsList = vendor_products
            .filter(({ vendor_vendor_id }) => {
              return Number(vendor_vendor_id) === Number(e.value)
            })
            .map(({ vp_id, products }) => {
              return { name: products.name, value: vp_id }
            })
          setProductOptions(productOptionsList)
        }}
        placeholder="Select Vendor"
      />
      {/* <Dropdown
              className="mr-2 w-16rem"
              // name="products_product_id"
              // disabled={editState}
              optionLabel="name"
              value={purchaseDetails.rfq_id}
              options={rfqOptions}
              onChange={(e) => {
                const all = rfq_products.filter(({rfq_id}) => {
                  return rfq_id==e.value
                }).map re
                setPurchaseDetails({ ...purchaseDetails, rfq_id: e.value })
              }}
              placeholder="Select RFQ to prefill values"
            /> */}

      <div className="p-float-label">
        <InputText
          name=""
          className="mr-2 w-22rem"
          value={purchaseDetails.po_code}
          onChange={(e) => setPurchaseDetails({ ...purchaseDetails, po_code: e.target.value })}
        />
        <label
        // htmlFor={ele.field}
        // className={classNames({ "p-error": isFormFieldValid("name") })}
        >
          PO Code
        </label>
      </div>
      <div className="p-float-label">
        <InputText
          className="mr-2 w-22rem"
          value={purchaseDetails.po_description}
          onChange={(e) =>
            setPurchaseDetails({ ...purchaseDetails, po_description: e.target.value })
          }
        />
        <label
        // htmlFor={ele.field}
        // className={classNames({ "p-error": isFormFieldValid("name") })}
        >
          PO Name
        </label>
      </div>
    </div>
    <div className="flex justify-content-between mt-2 mb-2 pt-4">
      <div className="p-float-label">
        <Calendar
          className="mr-2 w-16rem"
          id="basic"
          value={purchaseDetails.expiry_date}
          onChange={(e) =>
            setPurchaseDetails({
              ...purchaseDetails,
              expiry_date: e.value,
            })
          }
        />
        <label
        // htmlFor={ele.field}
        // className={classNames({ "p-error": isFormFieldValid("name") })}
        >
          Expiry Date
        </label>
      </div>
      <div className="p-float-label">
        <Calendar
          className="mr-2 w-16rem"
          id="basic"
          value={purchaseDetails.expected_delivery}
          onChange={(e) =>
            setPurchaseDetails({
              ...purchaseDetails,
              expected_delivery: e.value,
            })
          }
        />
        <label
        // htmlFor={ele.field}
        // className={classNames({ "p-error": isFormFieldValid("name") })}
        >
          Expected Delivery
        </label>
      </div>
      <div className="p-float-label">
        <InputText
          className="mr-2 w-16rem"
          value={purchaseDetails.agreement}
          onChange={(e) => setPurchaseDetails({ ...purchaseDetails, agreement: e.target.value })}
        />
        <label
        // htmlFor={ele.field}
        // className={classNames({ "p-error": isFormFieldValid("name") })}
        >
          Agreement
        </label>
      </div>
      <div className="p-float-label">
        <InputText
          className="mr-2 w-16rem"
          value={purchaseDetails.from_party}
          onChange={(e) => setPurchaseDetails({ ...purchaseDetails, from_party: e.target.value })}
        />
        <label
        // htmlFor={ele.field}
        // className={classNames({ "p-error": isFormFieldValid("name") })}
        >
          From Party
        </label>
      </div>
    </div>
    <div>Select Items</div>
    <hr />

    {itemList.map((ele, i) => {
      return (
        <div key={i} className="flex justify-content-between mt-2 pt-4">
          <Dropdown
            className="mr-2 w-20rem"
            name="vendor_products_vp_id"
            // disabled={editState}
            filter
            showClear
            filterBy="name"
            placeholder="Select a Product"
            optionLabel="name"
            value={ele?.vendor_products_vp_id}
            options={productOptions}
            onChange={(e) => handleFormChange(e, i)}
          />
          <div className="p-label ">
            <label className="mr-2">Price per unit</label>
            <InputNumber
              name="price_per_unit"
              className="mr-2 w-20rem"
              onChange={(e) => handleFormChange(e, i)}
            />
          </div>
          <div className="p-label ">
            <label className="mr-2">Quantity</label>
            <InputNumber
              name="quantity"
              value={Number(ele.quantity)}
              className="mr-2 w-20rem"
              // onChange={(e) => handleFormChange(e, i)}
              onChange={(e) => handleFormChange(e, i)}
            />
          </div>
          <Button
            type="button"
            disabled={itemList.length <= 1}
            icon="pi pi-minus"
            className="m-2 p-button-rounded "
            onClick={() => removeFields(i)}
          />
        </div>
      )
    })}

    <div className="flex justify-content-end">
      <Button
        type="button"
        icon="pi pi-plus"
        className="m-2 p-button-rounded "
        onClick={addFields}
      />
    </div>
    <div className="flex justify-content-end">
      <Button
        type="button"
        className="col-3 mr-2 mt-2"
        label="CREATE"
        onClick={async () => {
          console.log("purchase details", purchaseDetails)

          const purchaseOrder = await createPurchaseOrderMutation({
            vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
            po_code: purchaseDetails.po_code,
            po_description: purchaseDetails.po_description,
            expiry_date: new Date(purchaseDetails.expiry_date),
            expected_delivery: new Date(purchaseDetails.expected_delivery),
            from_party: purchaseDetails.from_party,
            agreement: purchaseDetails.agreement,
            rfq_id: Number(purchaseDetails.rfq_id) ?? undefined,
          })
          console.log("purchaseOrder: ", purchaseOrder)
          const many = itemList.map((ele) => {
            const product_id = vendor_products.filter((item) => {
              return Number(ele.vendor_products_vp_id) === Number(item.vp_id)
            })[0].products_product_id
            console.log("many", ele)
            return {
              purchase_order_po_id: purchaseOrder?.po_id ?? "",
              // purchase_order_po_id: 1,
              purchase_order_purchase_order_status_pos_id: 1,
              purchase_order_vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
              vendor_products_vp_id: Number(ele.vendor_products_vp_id),
              vendor_products_vendor_vendor_id: Number(purchaseDetails.vendor_vendor_id),
              vendor_products_products_product_id: Number(product_id),
              quantity: Number(ele.quantity),
              price_per_unit: Number(ele.price_per_unit),
              received_quantity: 0,
            }
          })
          console.log("many: ", many)
          try {
            const result = await createManyPurchaseOrderProductsMutation(many)
            console.log("error: ", result)
          } catch (error: any) {
            console.log("error: ", error)
          }
          await refetch()
        }}
      />
    </div>
  </form>
</Dialog>
