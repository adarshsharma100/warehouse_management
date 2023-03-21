import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateOrder = z.object({
  // name: z.string(),
  orderStatus:z.number().optional(),
  shippingAddressId:z.number().optional(),
  billingAddressId:z.number().optional(),
  shopifyId:z.number().optional(),
  customerId:z.number().optional(),
  paymentStatus:z.string().optional(),
  totalPrice:z.number().optional(),
  gateway:z.string().optional(),
});

export default resolver.pipe(
  resolver.zod(CreateOrder),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const order = await db.orders.create({ data: input });

    return order;
  }
);
