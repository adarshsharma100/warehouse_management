import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteSales_invoice_detail = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSales_invoice_detail),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const sales_invoice_detail = await db.sales_invoice_detail.deleteMany({ where: { id } })

    return sales_invoice_detail
  }
)
