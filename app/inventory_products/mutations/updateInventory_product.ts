import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateInventory_product = z.unknown()

export default resolver.pipe(
  resolver.zod(UpdateInventory_product),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const inventory_product = await db.inventory_products.update({
      where: { id },
      data,
    })

    return inventory_product
  }
)
