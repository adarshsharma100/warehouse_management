// don't delete this file until the project is completed.

// Function to verify order if all the Quantities are available
/**
 * const firstOrder = selectedOrder[0]
console.log('firstOrder: ', firstOrder);
const orderItems = firstOrder?.order_items

const isAllQuantityAvailable = await Promise.all(
    orderItems.map(async (product) => {
        const availableQuantity = await isInStock(product?.products?.sku);
        return {
            ...product,
            availableQuantity,
            isAvailable: availableQuantity >= product.quantity
        };
    })
);
console.log('isAllQuantityAvailable: ', isAllQuantityAvailable);

if (isAllQuantityAvailable.every(product => product.isAvailable === true)) {

    await updateNewOrder({
        id: firstOrder?.id,
        verified: 1,
    });
    const shipmentNumber = `ROB0${Math.floor(Math.random() * 100000)}`;
    const shipmentItems = activeOrderItems.map((item) => {
        return {
            order_items: {
                connect: {
                    id: item.id,
                },
            },
        };
    });

    await createShipment(
        {
            ordersId: firstOrder?.id,
            shipmentNumber,
            priority: 'LOW',
            shipment_items: {
                create: shipmentItems,
            },
        },
        {
            onSuccess: (data) => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: "Order Verified",
                    life: 3000
                })
            },
            onError: (error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: "Could not verify order",
                    life: 3000
                })
            },
        }
    );

} else {
    toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: "Can not verify order due to low Quantity",
        life: 3000
    })
}
*/


//function to update invenotry stock

/**
 * const updateInventoryProduct = async (productId: number, quantity: number) => {
      const updatedProduct = await db.inventory_products.update({
        where: {
          product_shelf: {
            product: productId,
            shelf: 2
          }
        },
        data: { quantity: { decrement: quantity } },
      })
      return updatedProduct
    }

    const updatedProducts = await Promise.all(shipmentProducts.map(({ product, quantity }) => updateInventoryProduct(product, quantity))) 
    */

/**
 <Button
               type="button"
               icon="pi pi-verified"
               label="Verify"
               className="p-button-outlined"

               onClick={async () => {
                 const activeIDs = selectedOrder.map((ele) => ele?.id);
                 const activeOrderItems = selectedOrder.map((ele) => ele?.order_items).flat();
                 const activeOrderName = activeOrderItems.map((i) => i.products.name)
                 const activeOrderQuantity = activeOrderItems.map((i) => i.quantity)

                 if (activeIDs.length > 0) {
                   activeIDs.forEach(async (id) => {

                     const selectedProduct = inventory_products.find((product) => product.products.name === activeOrderName[0]);
                     

                     if (selectedProduct && selectedProduct.quantity > activeOrderQuantity[0]) {
                       const updatedQuantity = Number(selectedProduct.quantity) - Number(activeOrderQuantity[0]);

                       await updateInventory_productMutation(
                         {
                           id: selectedProduct.id,
                           quantity: updatedQuantity,
                         },
                         {
                           onSuccess: () => {
                             toast?.current?.show(
                               tsuccess("Inventory  updated successfully.")
                             )
                           },
                         }
                       )

                       await updateNewOrder({
                         id,
                         verified: 1,
                       });
                       const shipmentNumber = `ROB0${Math.floor(Math.random() * 100000)}`;
                       const shipmentItems = activeOrderItems.map((item) => {
                         return {
                           order_items: {
                             connect: {
                               id: item.id,
                             },
                           },
                         };
                       });

                       await createShipment(
                         {
                           ordersId: id,
                           shipmentNumber,
                           priority: 'LOW',
                           shipment_items: {
                             create: shipmentItems,
                           },
                         },
                         {
                           onSuccess: () => {
                             toast?.current.show(tsuccess('Verified'));
                           },
                           onError: (error) => {
                             
                             toast?.current.show(terror('Not Verified'));
                           },
                         }
                       );
                     } 
                     else {
                       alert('You should reduce your quantity')
                     }

                   });
                 }

               }}
             />
 * 
 * 
 */