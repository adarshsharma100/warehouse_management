import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateSales_invoice_detail = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateSales_invoice_detail),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const sales_invoice_detail = await db.sales_invoice_detail.update({ where: { id }, data })

    return sales_invoice_detail
  }
)
