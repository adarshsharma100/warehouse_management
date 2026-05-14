import db from "./index"

const seedMetadata = async () => {
  console.log("Seeding Metadata (Job Types, Product Types, Countries, Warehouse, Payment Statuses, Terms)...")
  
  // 1. Job Types
  const jobTypes = [
    { id: 1, name: "CSV Processing" },
    { id: 2, name: "Shopify Order Sync" }
  ]
  for (const type of jobTypes) {
    await db.job_types.upsert({ where: { id: type.id }, update: { name: type.name }, create: type })
  }

  // 2. Product Types
  const productTypes = [
    { id: 1, type: "Finished Goods" },
    { id: 2, type: "Raw Materials" }
  ]
  for (const pType of productTypes) {
    await db.product_types.upsert({ where: { id: pType.id }, update: { type: pType.type }, create: pType })
  }

  // 3. Countries
  const countries = [{ id: 1, name: "India" }]
  for (const country of countries) {
    await db.country.upsert({ where: { id: country.id }, update: { name: country.name }, create: country })
  }

  // 4. Warehouse Structure
  const warehouse = await db.warehouse.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Main Warehouse", addressesId: 1 }
  })

  await db.areas.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Default Area", warehouse: 1, type: "Picking" }
  })

  await db.shelf_type.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Standard", description: "Standard Shelf" }
  })

  await db.shelves.upsert({
    where: { id: 1 },
    update: {},
    create: { 
      id: 1, 
      number: "DEFAULT-01", 
      sellable: true, 
      area: 1, 
      shelfType: 1, 
      height: 1 
    }
  })

  // 5. Payment Statuses
  const paymentStatuses = [
    { id: 1, name: "PENDING" },
    { id: 2, name: "PAID" },
    { id: 3, name: "PARTIALLY_PAID" },
    { id: 4, name: "REFUNDED" },
    { id: 5, name: "VOIDED" }
  ]
  for (const status of paymentStatuses) {
    await db.order_payment_status.upsert({
      where: { id: status.id },
      update: { name: status.name },
      create: status
    })
  }

  // 6. Payment Terms
  const paymentTerms = [
    { id: 1, name: "Due on Receipt" },
    { id: 2, name: "Net 30" }
  ]
  for (const term of paymentTerms) {
    await db.po_terms.upsert({
      where: { id: term.id },
      update: { name: term.name },
      create: term
    })
  }

  // 7. Order Statuses
  const orderStatuses = [
    { id: 1, name: "CREATED" },
    { id: 2, name: "PICKED" },
    { id: 3, name: "PACKED" },
    { id: 4, name: "SHIPPED" },
    { id: 5, name: "DELIVERED" },
    { id: 6, name: "CANCELLED" }
  ]
  for (const status of orderStatuses) {
    await db.order_status.upsert({
      where: { id: status.id },
      update: { name: status.name },
      create: status
    })
  }

  console.log("Metadata Seeding Complete.")
}

export default seedMetadata
