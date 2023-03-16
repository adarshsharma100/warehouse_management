import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateShelf = z.object({
  // id:z.number().optional(),
  sellable: z.boolean(),
  number: z.string(),
  length: z.number().optional(),
  width: z.number().optional(),
  loadingStrength: z.number().optional(),
  reach: z.string().optional(),
  area: z.unknown(),
  shelfType: z.unknown(),
})

export default resolver.pipe(resolver.zod(CreateShelf), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const shelf = await db.shelves.create({ data: input })
  return shelf
})
