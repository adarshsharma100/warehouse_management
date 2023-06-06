import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetSales_invoice_detail = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSales_invoice_detail),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const sales_invoice_detail = await db.sales_invoice_detail.findFirst({ where: { id } })

    if (!sales_invoice_detail) throw new NotFoundError()

    return sales_invoice_detail
  }
)
