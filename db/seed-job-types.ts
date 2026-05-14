import db from "./index"

const seedJobTypes = async () => {
  console.log("Seeding Job Types...")
  
  const types = [
    { id: 1, name: "CSV Processing" },
    { id: 2, name: "Shopify Order Sync" }
  ]

  for (const type of types) {
    const existing = await db.job_types.findUnique({ where: { id: type.id } })
    if (!existing) {
      await db.job_types.create({
        data: type
      })
      console.log(`Created Job Type: ${type.name} (ID: ${type.id})`)
    } else {
      console.log(`Job Type already exists: ${type.name}`)
    }
  }
}

export default seedJobTypes
