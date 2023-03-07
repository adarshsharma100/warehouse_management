import { resolver, useQuery } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import sendPomail from "helperFunctions/poMail"
import getPurchase_order from "../queries/getPurchase_order"

const UpdatePurchase_order = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdatePurchase_order),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const purchase_order = await db.purchase_orders.update({
      where: { id },
      include: {
        po_products: {
          include: {
            vendor_products: {
              include: {
                products: true,
              },
            },
          },
        },
        po_status: true,
        po_terms: true,
        vendors: {
          include: {
            vendor_branches: {
              include: {
                addresses: {
                  include: {
                    country_addresses_countryTocountry: true,
                    emails_emails_addressesToaddresses: true,
                    contact_number: true,
                  },
                },
              },
            },
          },
        },
        purchase_orders: true,
      },
      data,
    })

    const input = { id, ...data }

    const {
      po_status: { name },
    } = purchase_order

    if (name === "Approved") {
      await sendPomail(input, purchase_order, null)
    }

    // await sendPomail(input, purchase_order, { class: "-Amended" })
    return purchase_order
  }
)
