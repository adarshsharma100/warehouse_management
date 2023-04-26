import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetOrder = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetOrder), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const order = await db.orders.findFirst({
    where: { id },
    include : {
      shipment:{
        include:{
          sales_invoice_details:true,
          shipment_items:true
        }
      }
    }


    // include: {
    //   order_items: {
    //     include: {
    //       products: true,
    //     },
    //   },
    // }
  })

  if (!order) throw new NotFoundError()

  return order
})
