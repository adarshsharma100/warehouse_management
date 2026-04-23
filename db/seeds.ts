import db from "./index"
import { SecurePassword } from "@blitzjs/auth"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * to easily generate realistic data.
 */
const seed = async () => {
  const email = "admin@warehouse.com"
  const password = "AdminPassword123!"
  const hashedPassword = await SecurePassword.hash(password.trim())

  const existingUser = await db.user.findFirst({ where: { email } })
  if (!existingUser) {
    await db.user.create({
      data: {
        email,
        hashedPassword,
        role: "ADMIN",
        name: "Super Admin",
      },
    })
    console.log("Admin user created: admin@warehouse.com / AdminPassword123!")
  } else {
    console.log("Admin user already exists.")
  }
}

export default seed
