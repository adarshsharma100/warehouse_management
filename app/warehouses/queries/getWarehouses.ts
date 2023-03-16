import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetWarehousesInput
  extends Pick<Prisma.WarehouseFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetWarehousesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: warehouses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.warehouse.count({ where }),
      query: (paginateArgs) =>
        db.warehouse.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {
            areas_areas_warehouseTowarehouse: true,
          },
        }),
    })

    return {
      warehouses,
      nextPage,
      hasMore,
      count,
    }
  }
)
