import { resolver, usePaginatedQuery } from "@blitzjs/rpc"
// import updateVendor from "app/vendors/mutations/updateVendor"
// import getAdmins from "app/admins/queries/getAdmins"
// import getMutations_functions from "app/mutations_functions/queries/getMutations_functions"
import db from "db"
import { z } from "zod"
// import { useRouter } from "next/router"
// const [updateVendorMutation] = useMutation(updateVendor)
// const ITEMS_PER_PAGE = 100

const CreateVendor = z.object({
  code: z.string(),
  name: z.string(),
  creditPeriod: z.number(),
  status:z.string(),
  gstin: z.string().optional(),
  vendorScore:z.number().optional(),
  leadTime: z.number().optional(), 
  addresses:z.unknown(),
})
 
export default resolver.pipe(resolver.zod(CreateVendor), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant

  let vendor = await db.vendors.create({ data: input })
  // vendor = await db.vendor.update({
  //   where: { vendor_id: vendor.vendor_id },
  //   data: {
  //     vendor_id_helper: `TIF_VENDOR_${vendor.vendor_id}`,
  //   },
  // })
  // const admins = await db.mutation_admin_mail.findMany({
  //   where: {
  //     mutations_functions: {
  //       name: "createVendor",
  //     },
  //   },
  //   select: {
  //     id: true,
  //     mutations_functions: true,
  //     mutations_functions_id: true,
  //     user: true,
  //     user_id: true,
  //   },
  // })
  // console.log("admins: ", admins)
  // const adminsEmails = admins.map(({ user }) => {
  //   return user.email
  // })
  // console.log("adminsEmails: ", adminsEmails)
  // return { adminsEmails, vendor }
  return vendor
})
