import { resolver, useQuery } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import sendPomail from "helperFunctions/poMail"
import getPurchase_order from "../queries/getPurchase_order"

const UpdatePurchase_order = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdatePurchase_order),
  resolver.authorize(),
  async ({ po_id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_order.update({
      where: { po_id },
      include: {
        purchase_order_products: {
          include: {
            vendor_products: {
              include: {
                products: true,
              },
            },
          },
        },
      },
      data,
    })

    // console.log("testdata", data)
    // console.log("purchase_order", purchase_order)
    const input = { po_id, ...data }

    console.log("updatePO", purchase_order)

    const {
      purchase_order_status: { name },
    } = purchase_order

    if (name === "Approved") {
      await sendPomail(input, purchase_order, null)
    }

    // await sendPomail(input, purchase_order, { class: "-Amended" })
    return purchase_order
  }
)
