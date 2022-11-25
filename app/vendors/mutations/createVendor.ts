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
  vendor_code: z.string(),
  vendor_email: z.string(),
  vendor_city: z.string(),
  vendor_contact: z.string(),
  vendor_gstin: z.string(),
  vendor: z.string(),
  address: z.string(),
  credit_period: z.string(),
  lead_time: z.string(),
})

export default resolver.pipe(resolver.zod(CreateVendor), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant

  let vendor = await db.vendor.create({ data: input })
  vendor = await db.vendor.update({
    where: { vendor_id: vendor.vendor_id },
    data: {
      vendor_id_helper: `TIF_VENDOR_${vendor.vendor_id}`,
    },
  })
  const admins = await db.mutation_admin_mail.findMany({
    where: {
      mutations_functions: {
        name: "createVendor",
      },
    },
    select: {
      admins: true,
      id: true,
      mutations_functions: true,
      admins_id: true,
      mutations_id: true,
    },
  })
  console.log("admins: ", admins)
  const adminsEmails = admins.map(({ admins }) => {
    return admins.email
  })
  console.log("adminsEmails: ", adminsEmails)
  return { adminsEmails, vendor }
})
