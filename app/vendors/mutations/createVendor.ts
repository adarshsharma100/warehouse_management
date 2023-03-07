import { resolver, usePaginatedQuery } from "@blitzjs/rpc"
// import updateVendor from "app/vendors/mutations/updateVendor"
// import getAdmins from "app/admins/queries/getAdmins"
// import getMutations_functions from "app/mutations_functions/queries/getMutations_functions"
import db from "db"
import { create } from "domain"
import { z } from "zod"
// import { useRouter } from "next/router"
// const [updateVendorMutation] = useMutation(updateVendor)
// const ITEMS_PER_PAGE = 100

const CreateVendor = z.object({
  code: z.string(),
  name: z.string(),
  creditPeriod: z.number(),
  status: z.string(),
  gstin: z.string().optional(),
  vendorScore: z.number().optional(),
  leadTime: z.number().optional(),
  addresses: z.unknown(),
})

export default resolver.pipe(resolver.zod(z.unknown()), resolver.authorize(), async () => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant

  // let vendor = await db.vendors.create({ data: input })

  // email create
  // let email = await db.emails.create({
  //   data: {
  //     email: "test2@gmail.com",
  //     addresses: 1,
  //   },
  // })

  // let contact_number = await db.contact_number.create({
  //   data: {
  //     type: "landline",
  //     number: 1,
  //     address: 1,
  //   },
  // })
  try {
    const email = {
      create: [
        {
          email: "test2@gmail.com",
        },
      ],
    }

    const contact_number = {
      create: [
        {
          type: "landline",
          number: 1,
        },
      ],
    }

    const address = {
      create: {
        buildingNumber: "1",
        areaStreet: "1",
        landmarkName: "!",
        cityCountryProvince: "1",
        state: "1",
        pincode: 12345,
        country: 1,
        emails_emails_addressesToaddresses: email,
        contact_number,
      },
    }

    const vendor_branches = {
      create: [
        {
          branchCode: "ASD-005",
          addresses: {
            create: {
              buildingNumber: "1",
              areaStreet: "1",
              landmarkName: "!",
              cityCountryProvince: "1",
              state: "1",
              pincode: 12345,
              country: 1,
              emails_emails_addressesToaddresses: email,
              contact_number,
            },
          },
        },
      ],
    }

    let createaddress = await db.vendors.create({
      data: {
        id: 100,
        name: "Frank100",
        code: "FK1000",
        gstin: "GSTIN1000000000",
        creditPeriod: 12100,
        leadTime: 45100,
        status: "Active",
        vendorScore: 101000,
        vendor_branches,
      },
    })
  } catch (error) {
    console.log("addressCreationerror ", error)
  }

  // contact number create

  // let vendor = await db.vendors.create({
  //   data: {
  //     id: 1,
  //     name: "Dylan Alisson",
  //     code: "DA",
  //     gstin: "GSTRIO783211111",
  //     creditPeriod: 5,
  //     leadTime: 4,
  //     status: "Active",
  //     vendorScore: 1,
  //     vendor_branches: {
  //       create: [{
  //         addresses: {
  //           create: [{
  //             addressData,
  //             contact_number: {
  //               create: [{
  //                 contactNumberData
  //               }]
  //             },
  //             emails_emails_addressesToaddresses::{
  //               create: [{
  //                 emailData
  //               }]
  //             }
  //           }]
  //         }
  //       }]
  //     }
  //   },
  // })
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
  // return vendor
})
