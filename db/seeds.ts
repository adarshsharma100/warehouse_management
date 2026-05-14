import db from "./index"
import { SecurePassword } from "@blitzjs/auth"
import seedMetadata from "./seed-metadata"

const seed = async () => {
  await seedMetadata()

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
