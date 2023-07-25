import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetRfq = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetRfq), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const rfq = await db.rfq.findFirst({
    where: { id },
    include: {
      rfq_products: {
        include: {
          products: true,
        },
      },
      purchase_orders: {
        select: {
          po_products: {
            select: {
              vendor_products: {
                select: {
                  products: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!rfq) throw new NotFoundError()

  return rfq
})
