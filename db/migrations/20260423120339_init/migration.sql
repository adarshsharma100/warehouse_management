-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `buildingNumber` VARCHAR(15) NULL,
    `areaStreet` VARCHAR(300) NULL,
    `landmarkName` VARCHAR(100) NULL,
    `cityCountryProvince` VARCHAR(45) NOT NULL,
    `state` VARCHAR(45) NULL,
    `pincode` VARCHAR(45) NULL,
    `country` INTEGER NOT NULL,

    INDEX `fk_addresses_country1_idx`(`country`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `areas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(150) NULL,
    `warehouse` INTEGER NOT NULL,
    `type` ENUM('Selling', 'Picking', 'Holding', 'Inbounding', 'Assemble', 'QC Area', 'Return To Customer', 'E-waste') NULL,

    INDEX `fk_areas_warehouse1_idx`(`warehouse`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchNumber` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bulk_awb` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `awbNumber` VARCHAR(45) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `courierId` INTEGER NOT NULL,

    INDEX `fk_bulk_awb_courier1_idx`(`courierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_number` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('mobile', 'landline', 'other') NOT NULL,
    `number` VARCHAR(45) NOT NULL,
    `address` INTEGER NOT NULL,

    INDEX `fk_contact_Number_addresses1_idx`(`address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `courierTypeId` INTEGER NOT NULL,

    INDEX `fk_courier_courier_types1_idx`(`courierTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courier_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(45) NULL,
    `lastName` VARCHAR(45) NULL,
    `addressesId` INTEGER NOT NULL,
    `shopifyId` VARCHAR(45) NULL,
    `companyName` VARCHAR(50) NULL,
    `display` TINYINT NULL DEFAULT 0,

    INDEX `fk_customers_addresses1_idx`(`addressesId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dimensions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `length` FLOAT NULL,
    `width` FLOAT NULL,
    `height` FLOAT NULL,
    `weight` FLOAT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(45) NOT NULL,
    `addresses` INTEGER NOT NULL,

    INDEX `fk_emails_addresses1_idx`(`addresses`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grnNumber` VARCHAR(45) NOT NULL,
    `invoiceNo` VARCHAR(45) NOT NULL,
    `invoiceDate` DATETIME(0) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `status` INTEGER NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `purchaseOrder` INTEGER NOT NULL,
    `vendorShipmentId` INTEGER NULL,
    `grnRemarks` VARCHAR(250) NULL,

    UNIQUE INDEX `grnNumber_UNIQUE`(`grnNumber`),
    UNIQUE INDEX `invoiceNo_UNIQUE`(`invoiceNo`),
    INDEX `fk_grn_grn_status1_idx`(`status`),
    INDEX `fk_grn_purchase_orders1_idx`(`purchaseOrder`),
    INDEX `fk_grn_user1_idx`(`createdBy`),
    INDEX `fk_grn_vendor_shipments1_idx`(`vendorShipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grn_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `receivedQuantity` INTEGER NOT NULL,
    `grnRejectedQuantity` INTEGER NULL,
    `grnRejectionRemarks` VARCHAR(255) NULL,
    `qcRejectedQuantity` INTEGER NULL,
    `qcRejectionRemarks` VARCHAR(255) NULL,
    `poProduct` INTEGER NOT NULL,
    `grnId` INTEGER NOT NULL,
    `qcComplete` TINYINT NULL DEFAULT 0,
    `shortSupply` INTEGER NULL,
    `finalQuantity` INTEGER NULL,

    INDEX `fk_grn_products_grn1_idx`(`grnId`),
    INDEX `fk_grn_products_po_products1_idx`(`poProduct`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grn_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` VARCHAR(150) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `oldQuantity` INTEGER NOT NULL,
    `fromShelf` VARCHAR(10) NOT NULL,
    `toShelf` VARCHAR(10) NULL,
    `remarks` VARCHAR(100) NOT NULL,
    `updatedAt` DATETIME(0) NOT NULL,
    `inventoryType` VARCHAR(45) NOT NULL,
    `adjustedBy` INTEGER NOT NULL,
    `inventoryProduct` INTEGER NOT NULL,
    `adjustmentType` INTEGER NOT NULL,

    INDEX `fk_inventory_history_inventory_history_adjustments1_idx`(`adjustmentType`),
    INDEX `fk_inventory_history_inventory_products1_idx`(`inventoryProduct`),
    INDEX `fk_inventory_history_user1_idx`(`adjustedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_history_adjustments` (
    `id` INTEGER NOT NULL,
    `type` VARCHAR(45) NULL,
    `description` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(45) NULL,
    `quantity` INTEGER NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `product` INTEGER NOT NULL,
    `shelf` INTEGER NOT NULL,
    `maxQuantityPerShelf` INTEGER NULL,

    INDEX `fk_inventory_products_products1_idx`(`product`),
    INDEX `fk_inventory_products_shelfs1_idx`(`shelf`),
    UNIQUE INDEX `product_shelf`(`product`, `shelf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `data` MEDIUMBLOB NULL,
    `isCompleted` BOOLEAN NULL DEFAULT false,
    `isRunning` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `jobTypesId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `fk_jobs_job_types1_idx`(`jobTypesId`),
    INDEX `fk_jobs_user1_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kit_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `kitProductId` INTEGER NOT NULL,

    INDEX `fk_kit_products_products1_idx`(`productId`),
    INDEX `fk_kit_products_products2_idx`(`kitProductId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manifest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `manifestNumber` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `manifestNumber_UNIQUE`(`manifestNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order` INTEGER NOT NULL,
    `product` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,

    INDEX `fk_order_items_orders1_idx`(`order`),
    INDEX `fk_order_items_products1_idx`(`product`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_payment_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(150) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderStatus` INTEGER NOT NULL,
    `shippingAddressId` INTEGER NOT NULL,
    `billingAddressId` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `shopifyId` INTEGER NULL,
    `customerId` INTEGER NOT NULL,
    `totalPrice` INTEGER NOT NULL,
    `gateway` VARCHAR(45) NOT NULL,
    `channelCreatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `cursor` VARCHAR(100) NULL,
    `paymentReferenceId` VARCHAR(100) NULL,
    `verified` TINYINT NULL,
    `giftMessage` VARCHAR(250) NULL,
    `paymentStatus` INTEGER NULL,
    `gstNumber` VARCHAR(15) NULL,
    `paymentTermsId` INTEGER NOT NULL,
    `discountAmount` INTEGER NULL,
    `paymentMethodId` INTEGER NULL,

    INDEX `fk_orders_addresses1_idx`(`shippingAddressId`),
    INDEX `fk_orders_addresses2_idx`(`billingAddressId`),
    INDEX `fk_orders_customers1_idx`(`customerId`),
    INDEX `fk_orders_order_payment_status1_idx`(`paymentStatus`),
    INDEX `fk_orders_order_status1_idx`(`orderStatus`),
    INDEX `fk_orders_payment_method2_idx`(`paymentMethodId`),
    INDEX `fk_orders_po_terms1_idx`(`paymentTermsId`),
    INDEX `fk_orders_shopify1_idx`(`shopifyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `dimensionsId` INTEGER NOT NULL,

    INDEX `fk_packages_dimensions1_idx`(`dimensionsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_method` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NULL,
    `price` INTEGER NULL,
    `vendorProduct` INTEGER NOT NULL,
    `purchaseOrder` INTEGER NOT NULL,

    INDEX `fk_po_products_purchase_orders1_idx`(`purchaseOrder`),
    INDEX `fk_po_products_vendor_products1_idx`(`vendorProduct`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_sentto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseOrder` INTEGER NOT NULL,
    `email` INTEGER NOT NULL,

    INDEX `fk_po_sentto_emails1_idx`(`email`),
    INDEX `fk_po_sentto_purchase_orders1_idx`(`purchaseOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,
    `description` VARCHAR(200) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_terms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,
    `description` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_brand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `code` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `code_UNIQUE`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_prices` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lastPurchasePrice` INTEGER NULL,
    `mrp` INTEGER NULL,
    `minSellingPrice` INTEGER NULL,
    `sellingPrice` INTEGER NULL,
    `averageCostPrice` INTEGER NULL,
    `productId` INTEGER NOT NULL,

    UNIQUE INDEX `productId_UNIQUE`(`productId`),
    INDEX `fk_product_prices_products1_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tags` VARCHAR(45) NULL,
    `product` INTEGER NOT NULL,

    INDEX `fk_product_tags_products1_idx`(`product`),
    UNIQUE INDEX `tags_product`(`tags`, `product`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `sku` VARCHAR(15) NOT NULL,
    `description` LONGTEXT NULL,
    `color` VARCHAR(7) NULL,
    `hsnCode` VARCHAR(15) NULL,
    `imageUrl` VARCHAR(300) NULL,
    `createdAT` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAT` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `customDuty` VARCHAR(45) NULL,
    `gstTaxTypeCode` INTEGER NULL,
    `taxCalcType` VARCHAR(45) NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `category` INTEGER NULL,
    `brand` INTEGER NULL,
    `type` INTEGER NOT NULL,
    `dimensionsId` INTEGER NOT NULL,

    UNIQUE INDEX `sku_UNIQUE`(`sku`),
    INDEX `fk_products_brands2_idx`(`brand`),
    INDEX `fk_products_category_idx`(`category`),
    INDEX `fk_products_dimensions1_idx`(`dimensionsId`),
    INDEX `fk_products_product_types1_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poNumber` VARCHAR(45) NOT NULL,
    `agreement` VARCHAR(100) NULL,
    `description` VARCHAR(45) NULL,
    `expectedDod` DATETIME(0) NULL,
    `rejectedReason` VARCHAR(45) NULL,
    `expiryDate` DATETIME(3) NULL,
    `approvedOn` DATETIME(0) NULL,
    `createdAT` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAT` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `rfqId` INTEGER NULL,
    `vendor` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `po_term` INTEGER NOT NULL,
    `approvedBy` INTEGER NULL,
    `amendedFrom` INTEGER NULL,
    `piNumber` VARCHAR(45) NULL,
    `piDate` DATETIME(0) NULL,
    `warehouseId` INTEGER NULL,

    UNIQUE INDEX `poNumber_UNIQUE`(`poNumber`),
    UNIQUE INDEX `piNumber_UNIQUE`(`piNumber`),
    INDEX `fk_purchase_orders_po_status1_idx`(`status`),
    INDEX `fk_purchase_orders_purchase_orders1_idx`(`amendedFrom`),
    INDEX `fk_purchase_orders_rfq1_idx`(`rfqId`),
    INDEX `fk_purchase_orders_terms1_idx`(`po_term`),
    INDEX `fk_purchase_orders_user1_idx`(`approvedBy`),
    INDEX `fk_purchase_orders_vendors1_idx`(`vendor`),
    INDEX `fk_purchase_orders_warehouse1_idx`(`warehouseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `putaway` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `putawayNumber` VARCHAR(45) NULL,
    `status` ENUM('Completed', 'Pending') NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `grnId` INTEGER NULL,
    `createdBy` INTEGER NOT NULL,
    `putawaytypeId` INTEGER NOT NULL,

    INDEX `fk_putaway_grn1_idx`(`grnId`),
    INDEX `fk_putaway_putaway_types1_idx`(`putawaytypeId`),
    INDEX `fk_putaway_user1_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `putaway_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `putawayId` INTEGER NOT NULL,
    `shelvesId` INTEGER NULL,
    `inventoryProductId` INTEGER NULL,

    INDEX `fk_putaway_products_inventory_products1_idx`(`inventoryProductId`),
    INDEX `fk_putaway_products_putaway1_idx`(`putawayId`),
    INDEX `fk_putaway_products_shelves1_idx`(`shelvesId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `putaway_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,
    `displayName` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quality_ckeck` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `products` INTEGER NOT NULL,

    INDEX `fk_quality_ckeck_products1_idx`(`products`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rfqNumber` VARCHAR(45) NOT NULL,
    `description` VARCHAR(100) NULL,
    `status` ENUM('Completed', 'Created', 'Processing', 'Sent', 'Cancelled', 'Force Completed') NOT NULL DEFAULT 'Created',
    `expectedDod` DATETIME(3) NULL,
    `agreement` VARCHAR(45) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `ammendedFrom` INTEGER NULL,

    UNIQUE INDEX `rfqNumber_UNIQUE`(`rfqNumber`),
    INDEX `fk_rfq_rfq1_idx`(`ammendedFrom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `price` INTEGER NULL,
    `rfq` INTEGER NOT NULL,
    `product` INTEGER NOT NULL,

    INDEX `fk_rfq_products_products1_idx`(`product`),
    INDEX `fk_rfq_products_rfq1_idx`(`rfq`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rfq_sentto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` INTEGER NOT NULL,
    `rfq` INTEGER NOT NULL,
    `sentOn` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_rfq_sentto_emails1_idx`(`email`),
    INDEX `fk_rfq_sentto_rfq1_idx`(`rfq`),
    UNIQUE INDEX `email_rfq`(`email`, `rfq`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(45) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,

    INDEX `fk_role_permission_permission1_idx`(`permissionId`),
    INDEX `fk_role_permission_role1_idx`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales_invoice_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceNumber` VARCHAR(45) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `shipmentId` INTEGER NOT NULL,

    UNIQUE INDEX `id_UNIQUE`(`id`),
    UNIQUE INDEX `shipmentId_UNIQUE`(`shipmentId`),
    INDEX `fk_sales_invoice_details_shipment1_idx`(`shipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expiresAt` DATETIME(0) NULL,
    `handle` VARCHAR(191) NOT NULL,
    `hashedSessionToken` VARCHAR(191) NULL,
    `antiCSRFToken` VARCHAR(191) NULL,
    `publicData` VARCHAR(191) NULL,
    `privateData` VARCHAR(191) NULL,
    `userId` INTEGER NULL,

    UNIQUE INDEX `Session_handle_key`(`handle`),
    INDEX `Session_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shelf_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,
    `description` VARCHAR(150) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shelves` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sellable` BOOLEAN NOT NULL,
    `number` VARCHAR(45) NOT NULL,
    `length` INTEGER NULL,
    `width` INTEGER NULL,
    `loadingStrength` ENUM('Weak', 'Medium', 'Strong', 'Very Weak') NULL,
    `reach` ENUM('High', 'Medium', 'Low') NULL,
    `area` INTEGER NOT NULL,
    `shelfType` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,

    UNIQUE INDEX `number_UNIQUE`(`number`),
    INDEX `fk_shelfs_areas1_idx`(`area`),
    INDEX `fk_shelfs_shelf_type1_idx`(`shelfType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentNumber` VARCHAR(45) NOT NULL,
    `ordersId` INTEGER NOT NULL,
    `priority` ENUM('LOW', 'NORMAL', 'MEDIUM', 'HIGH', 'URGENT') NULL DEFAULT 'NORMAL',
    `onHold` TINYINT NOT NULL DEFAULT 0,
    `fulfilmentTat` DATETIME(0) NULL,
    `dispatchedOn` DATETIME(0) NULL,
    `shipmentStatusId` INTEGER NOT NULL DEFAULT 1,
    `courierId` INTEGER NULL,
    `batchId` INTEGER NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `pickupFrom` INTEGER NULL,
    `dimensionsId` INTEGER NULL,
    `awb` VARCHAR(45) NULL,
    `manifestId` INTEGER NULL,

    UNIQUE INDEX `shipmentNumber_UNIQUE`(`shipmentNumber`),
    UNIQUE INDEX `dimensions_id_UNIQUE`(`dimensionsId`),
    INDEX `fk_shipment_batch1_idx`(`batchId`),
    INDEX `fk_shipment_courier1_idx`(`courierId`),
    INDEX `fk_shipment_dimensions1_idx`(`dimensionsId`),
    INDEX `fk_shipment_manifest1_idx`(`manifestId`),
    INDEX `fk_shipment_orders1_idx`(`ordersId`),
    INDEX `fk_shipment_shipment_status1_idx`(`shipmentStatusId`),
    INDEX `fk_shipment_warehouse1_idx`(`pickupFrom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemsId` INTEGER NOT NULL,
    `shipmentId` INTEGER NOT NULL,

    INDEX `fk_shipment_items_order_items1_idx`(`orderItemsId`),
    INDEX `fk_shipment_items_shipment1_idx`(`shipmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(150) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shopify` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(150) NULL,
    `orderNumber` VARCHAR(150) NULL,
    `orderStatusUrl` VARCHAR(200) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `hashedToken` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(0) NOT NULL,
    `sentTo` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `Token_userId_fkey`(`userId`),
    UNIQUE INDEX `Token_hashedToken_type_key`(`hashedToken`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `hashedPassword` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `roleId` INTEGER NOT NULL,

    INDEX `fk_user_roles_role1_idx`(`roleId`),
    INDEX `fk_user_roles_user1_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_branches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchCode` VARCHAR(45) NULL,
    `address` INTEGER NOT NULL,
    `vendor` INTEGER NOT NULL,

    UNIQUE INDEX `branch_code_UNIQUE`(`branchCode`),
    INDEX `fk_vendor_branches_addresses1_idx`(`address`),
    INDEX `fk_vendor_branches_vendors1_idx`(`vendor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(45) NULL,
    `priority` INTEGER NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `product` INTEGER NOT NULL,
    `vendor` INTEGER NOT NULL,

    INDEX `fk_vendor_products_products1_idx`(`product`),
    INDEX `fk_vendor_products_vendors1_idx`(`vendor`),
    UNIQUE INDEX `product_priority`(`product`, `priority`),
    UNIQUE INDEX `product_vendor`(`product`, `vendor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_shipments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trackingId` VARCHAR(100) NOT NULL,
    `courier` VARCHAR(45) NOT NULL,
    `shipmentId` VARCHAR(100) NOT NULL,
    `purchaseOrderId` INTEGER NOT NULL,

    INDEX `fk_vendor_shipments_purchase_orders1_idx`(`purchaseOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `code` VARCHAR(45) NOT NULL,
    `gstin` VARCHAR(45) NULL,
    `creditPeriod` INTEGER NOT NULL DEFAULT 0,
    `leadTime` INTEGER NULL,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `vendorScore` INTEGER NULL,

    UNIQUE INDEX `code_UNIQUE`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(150) NULL,
    `addressesId` INTEGER NULL,

    INDEX `fk_warehouse_addresses1_idx`(`addressesId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `fk_addresses_country1` FOREIGN KEY (`country`) REFERENCES `country`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `areas` ADD CONSTRAINT `fk_areas_warehouse1` FOREIGN KEY (`warehouse`) REFERENCES `warehouse`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bulk_awb` ADD CONSTRAINT `fk_bulk_awb_courier1` FOREIGN KEY (`courierId`) REFERENCES `courier`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contact_number` ADD CONSTRAINT `fk_contact_Number_addresses1` FOREIGN KEY (`address`) REFERENCES `addresses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `courier` ADD CONSTRAINT `fk_courier_courier_types1` FOREIGN KEY (`courierTypeId`) REFERENCES `courier_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `fk_customers_addresses1` FOREIGN KEY (`addressesId`) REFERENCES `addresses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `emails` ADD CONSTRAINT `fk_emails_addresses1` FOREIGN KEY (`addresses`) REFERENCES `addresses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grn` ADD CONSTRAINT `fk_grn_grn_status1` FOREIGN KEY (`status`) REFERENCES `grn_status`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grn` ADD CONSTRAINT `fk_grn_purchase_orders1` FOREIGN KEY (`purchaseOrder`) REFERENCES `purchase_orders`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grn` ADD CONSTRAINT `fk_grn_user1` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grn` ADD CONSTRAINT `fk_grn_vendor_shipments1` FOREIGN KEY (`vendorShipmentId`) REFERENCES `vendor_shipments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grn_products` ADD CONSTRAINT `fk_grn_products_grn1` FOREIGN KEY (`grnId`) REFERENCES `grn`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grn_products` ADD CONSTRAINT `fk_grn_products_po_products1` FOREIGN KEY (`poProduct`) REFERENCES `po_products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_history` ADD CONSTRAINT `fk_inventory_history_inventory_history_adjustments1` FOREIGN KEY (`adjustmentType`) REFERENCES `inventory_history_adjustments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_history` ADD CONSTRAINT `fk_inventory_history_inventory_products1` FOREIGN KEY (`inventoryProduct`) REFERENCES `inventory_products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_history` ADD CONSTRAINT `fk_inventory_history_user1` FOREIGN KEY (`adjustedBy`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_products` ADD CONSTRAINT `fk_inventory_products_products1` FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventory_products` ADD CONSTRAINT `fk_inventory_products_shelfs1` FOREIGN KEY (`shelf`) REFERENCES `shelves`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `fk_jobs_job_types1` FOREIGN KEY (`jobTypesId`) REFERENCES `job_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `fk_jobs_user1` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kit_products` ADD CONSTRAINT `fk_kit_products_products1` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `kit_products` ADD CONSTRAINT `fk_kit_products_products2` FOREIGN KEY (`kitProductId`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `fk_order_items_orders1` FOREIGN KEY (`order`) REFERENCES `orders`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `fk_order_items_products1` FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_addresses1` FOREIGN KEY (`shippingAddressId`) REFERENCES `addresses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_addresses2` FOREIGN KEY (`billingAddressId`) REFERENCES `addresses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_customers1` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_order_payment_status1` FOREIGN KEY (`paymentStatus`) REFERENCES `order_payment_status`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_order_status1` FOREIGN KEY (`orderStatus`) REFERENCES `order_status`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_payment_method2` FOREIGN KEY (`paymentMethodId`) REFERENCES `payment_method`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_po_terms1` FOREIGN KEY (`paymentTermsId`) REFERENCES `po_terms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_shopify1` FOREIGN KEY (`shopifyId`) REFERENCES `shopify`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `fk_packages_dimensions1` FOREIGN KEY (`dimensionsId`) REFERENCES `dimensions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `po_products` ADD CONSTRAINT `fk_po_products_purchase_orders1` FOREIGN KEY (`purchaseOrder`) REFERENCES `purchase_orders`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `po_products` ADD CONSTRAINT `fk_po_products_vendor_products1` FOREIGN KEY (`vendorProduct`) REFERENCES `vendor_products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `po_sentto` ADD CONSTRAINT `fk_po_sentto_emails1` FOREIGN KEY (`email`) REFERENCES `emails`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `po_sentto` ADD CONSTRAINT `fk_po_sentto_purchase_orders1` FOREIGN KEY (`purchaseOrder`) REFERENCES `purchase_orders`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_prices` ADD CONSTRAINT `fk_product_prices_products1` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `product_tags` ADD CONSTRAINT `fk_product_tags_products1` FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_brands2` FOREIGN KEY (`brand`) REFERENCES `product_brand`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category`) REFERENCES `product_categories`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_dimensions1` FOREIGN KEY (`dimensionsId`) REFERENCES `dimensions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `fk_products_product_types1` FOREIGN KEY (`type`) REFERENCES `product_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `fk_purchase_orders_po_status1` FOREIGN KEY (`status`) REFERENCES `po_status`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `fk_purchase_orders_purchase_orders1` FOREIGN KEY (`amendedFrom`) REFERENCES `purchase_orders`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `fk_purchase_orders_rfq1` FOREIGN KEY (`rfqId`) REFERENCES `rfq`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `fk_purchase_orders_terms1` FOREIGN KEY (`po_term`) REFERENCES `po_terms`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `fk_purchase_orders_user1` FOREIGN KEY (`approvedBy`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `fk_purchase_orders_vendors1` FOREIGN KEY (`vendor`) REFERENCES `vendors`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `purchase_orders` ADD CONSTRAINT `fk_purchase_orders_warehouse1` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `putaway` ADD CONSTRAINT `fk_putaway_grn1` FOREIGN KEY (`grnId`) REFERENCES `grn`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `putaway` ADD CONSTRAINT `fk_putaway_putaway_types1` FOREIGN KEY (`putawaytypeId`) REFERENCES `putaway_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `putaway` ADD CONSTRAINT `fk_putaway_user1` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `putaway_products` ADD CONSTRAINT `fk_putaway_products_inventory_products1` FOREIGN KEY (`inventoryProductId`) REFERENCES `inventory_products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `putaway_products` ADD CONSTRAINT `fk_putaway_products_putaway1` FOREIGN KEY (`putawayId`) REFERENCES `putaway`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `putaway_products` ADD CONSTRAINT `fk_putaway_products_shelves1` FOREIGN KEY (`shelvesId`) REFERENCES `shelves`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `quality_ckeck` ADD CONSTRAINT `fk_quality_ckeck_products1` FOREIGN KEY (`products`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rfq` ADD CONSTRAINT `fk_rfq_rfq1` FOREIGN KEY (`ammendedFrom`) REFERENCES `rfq`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rfq_products` ADD CONSTRAINT `fk_rfq_products_products1` FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rfq_products` ADD CONSTRAINT `fk_rfq_products_rfq1` FOREIGN KEY (`rfq`) REFERENCES `rfq`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rfq_sentto` ADD CONSTRAINT `fk_rfq_sentto_emails1` FOREIGN KEY (`email`) REFERENCES `emails`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rfq_sentto` ADD CONSTRAINT `fk_rfq_sentto_rfq1` FOREIGN KEY (`rfq`) REFERENCES `rfq`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `fk_role_permission_permission1` FOREIGN KEY (`permissionId`) REFERENCES `permission`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `fk_role_permission_role1` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sales_invoice_details` ADD CONSTRAINT `fk_sales_invoice_details_shipment1` FOREIGN KEY (`shipmentId`) REFERENCES `shipment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shelves` ADD CONSTRAINT `fk_shelfs_areas1` FOREIGN KEY (`area`) REFERENCES `areas`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shelves` ADD CONSTRAINT `fk_shelfs_shelf_type1` FOREIGN KEY (`shelfType`) REFERENCES `shelf_type`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment` ADD CONSTRAINT `fk_shipment_batch1` FOREIGN KEY (`batchId`) REFERENCES `batch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment` ADD CONSTRAINT `fk_shipment_courier1` FOREIGN KEY (`courierId`) REFERENCES `courier`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment` ADD CONSTRAINT `fk_shipment_dimensions1` FOREIGN KEY (`dimensionsId`) REFERENCES `dimensions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment` ADD CONSTRAINT `fk_shipment_manifest1` FOREIGN KEY (`manifestId`) REFERENCES `manifest`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment` ADD CONSTRAINT `fk_shipment_orders1` FOREIGN KEY (`ordersId`) REFERENCES `orders`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment` ADD CONSTRAINT `fk_shipment_shipment_status1` FOREIGN KEY (`shipmentStatusId`) REFERENCES `shipment_status`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment` ADD CONSTRAINT `fk_shipment_warehouse1` FOREIGN KEY (`pickupFrom`) REFERENCES `warehouse`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment_items` ADD CONSTRAINT `fk_shipment_items_order_items1` FOREIGN KEY (`orderItemsId`) REFERENCES `order_items`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `shipment_items` ADD CONSTRAINT `fk_shipment_items_shipment1` FOREIGN KEY (`shipmentId`) REFERENCES `shipment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `fk_user_roles_role1` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `fk_user_roles_user1` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendor_branches` ADD CONSTRAINT `fk_vendor_branches_addresses1` FOREIGN KEY (`address`) REFERENCES `addresses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendor_branches` ADD CONSTRAINT `fk_vendor_branches_vendors1` FOREIGN KEY (`vendor`) REFERENCES `vendors`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendor_products` ADD CONSTRAINT `fk_vendor_products_products1` FOREIGN KEY (`product`) REFERENCES `products`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendor_products` ADD CONSTRAINT `fk_vendor_products_vendors1` FOREIGN KEY (`vendor`) REFERENCES `vendors`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendor_shipments` ADD CONSTRAINT `fk_vendor_shipments_purchase_orders1` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_orders`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `warehouse` ADD CONSTRAINT `fk_warehouse_addresses1` FOREIGN KEY (`addressesId`) REFERENCES `addresses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
