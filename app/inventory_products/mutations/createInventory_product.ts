import { resolver } from "@blitzjs/rpc"
import axios from "axios"
import db from "db"
import { z } from "zod"

const CreateInventory_product = z.object({
  product_description: z.string(),
  price: z.number(),
  quantity: z.number(),
  products_product_id: z.number(),
})

// function for mailing the specific user after creating inventory_products
const mailer = async (created_at) => {
  const admins = await db.mutation_admin_mail.findMany({
    where: {
      mutations_functions: {
        name: "createInventory_product",
      },
    },
    select: {
      id: true,
      mutations_functions: true,
      mutations_functions_id: true,
      user: true,
      user_id: true,
    },
  })

  if (!admins) {
    return
  }

  const user = admins.map(({ user, mutations_functions }) => {
    return {
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      email_format: mutations_functions.email_format,
      mutations: mutations_functions.name,
    }
  })

  console.log("user: ", user)

  // mailing to that specific user after creation of every mutation
  if (user) {
    const promised = user.map(async (u) => {
      const data = JSON.stringify({
        to: `${u.user_email}`,
        subject: "testing",
        message: `${u.email_format} created at ${created_at}`,
      })
      var config = {
        method: "post",
        url: "http://localhost:3000/api/inventory_products",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      }

      // uncomment it when you need
      await axios(config)
        .then(async (res) => {
          console.log("response ", res)
          console.log(JSON.stringify(res.data))
          await db.notifications_sent.create({
            data: {
              user_id: Number(`${u.user_id}`),
              user_email: `${u.user_email}`,
              user_name: `${u.user_name}`,
              mutations: `${u.mutations}`,
              created_at: `${created_at}`,
            },
          })
        })
        .catch((err) => {
          console.log("error ", err)
        })
    })
    await Promise.all(promised)
  }
}

export default resolver.pipe(
  resolver.zod(CreateInventory_product),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const inventory_product = await db.inventory_products.create({
      data: input,
    })

    await mailer(inventory_product.created_at)

    return { inventory_product }
  }
)
