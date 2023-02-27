CREATE DATABASE  IF NOT EXISTS `inventory` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inventory`;
-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: inventory
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.20.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `purchase_order_products`
--

DROP TABLE IF EXISTS `purchase_order_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_products` (
  `pop_id` int NOT NULL AUTO_INCREMENT,
  `vendor_products_vp_id` int NOT NULL,
  `vendor_products_vendor_vendor_id` int NOT NULL,
  `vendor_products_products_product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_per_unit` int DEFAULT NULL,
  `received_quantity` int DEFAULT NULL,
  `purchase_order_po_id` int NOT NULL,
  `purchase_order_vendor_vendor_id` int NOT NULL,
  PRIMARY KEY (`pop_id`,`vendor_products_vp_id`,`vendor_products_vendor_vendor_id`,`vendor_products_products_product_id`,`quantity`),
  UNIQUE KEY `pop_id_UNIQUE` (`pop_id`),
  KEY `fk_purchase_order_products_vendor_products1_idx` (`vendor_products_vp_id`,`vendor_products_vendor_vendor_id`,`vendor_products_products_product_id`),
  KEY `fk_purchase_order_products_purchase_order1_idx` (`purchase_order_po_id`,`purchase_order_vendor_vendor_id`),
  CONSTRAINT `fk_purchase_order_products_purchase_order1` FOREIGN KEY (`purchase_order_po_id`, `purchase_order_vendor_vendor_id`) REFERENCES `purchase_order` (`po_id`, `vendor_vendor_id`),
  CONSTRAINT `fk_purchase_order_products_vendor_products1` FOREIGN KEY (`vendor_products_vp_id`, `vendor_products_vendor_vendor_id`, `vendor_products_products_product_id`) REFERENCES `vendor_products` (`vp_id`, `vendor_vendor_id`, `products_product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_products`
--

LOCK TABLES `purchase_order_products` WRITE;
/*!40000 ALTER TABLE `purchase_order_products` DISABLE KEYS */;
INSERT INTO `purchase_order_products` VALUES (14,8,3,7,89,85,0,8,3),(16,1,1,1,10,500,0,186,1),(35,1,1,1,4,42,0,220,5),(36,1,1,1,142,142,0,222,1),(37,1,1,1,11,11,0,222,1),(38,2,1,2,7,142,0,223,1),(39,11,1,4,8,42,0,223,1),(40,1,1,1,9,11,0,223,1),(41,6,3,6,89,67,0,224,3),(42,9,4,6,2,67,0,225,4),(43,11,1,4,12,42,0,226,1),(44,11,1,4,12,43,0,227,1),(45,10,4,7,111,56,0,228,4),(46,11,1,4,22,42,0,229,1),(47,8,3,7,56,56,0,230,3),(48,2,1,2,2,142,0,231,1),(49,10,4,7,3,56,0,232,4),(50,5,3,3,23,24,0,233,3),(51,5,3,3,23,24,0,234,3),(52,11,1,4,1,42,0,235,1),(53,2,1,2,1,142,0,235,1),(54,1,1,1,2,11,0,235,1),(55,11,1,4,4,42,0,236,1),(56,2,1,2,2,142,0,236,1),(57,8,3,7,24,56,0,237,3),(58,6,3,6,23,67,0,237,3),(59,5,3,3,22,24,0,237,3),(60,10,4,7,11,56,0,238,4),(61,9,4,6,10,67,0,238,4),(62,8,3,7,3,56,0,239,3),(63,5,3,3,2,24,0,239,3),(64,6,3,6,1,67,0,239,3),(65,2,1,2,23,142,0,240,1),(66,11,1,4,2,42,0,240,1),(67,11,1,4,4,42,0,241,1),(68,11,1,4,4,42,0,244,1),(73,11,1,4,4,42,0,186,1),(74,2,1,2,47,142,0,186,1),(76,11,1,4,2,1,0,245,1),(79,11,1,4,456,123,0,246,1),(80,11,1,4,46,42,0,247,1),(81,1,1,1,1,11,0,249,1),(82,1,1,1,12,11,0,250,1),(83,2,1,2,123,142,0,250,1),(84,1,1,1,4,11,0,251,1),(85,11,1,4,34,42,0,252,1),(86,2,1,2,12,142,0,252,1),(87,11,1,4,21,42,0,254,1),(91,11,1,4,65,42,0,258,1),(92,2,1,2,58,42,0,258,1),(93,1,1,1,67,56,0,259,1),(94,11,1,4,23,45,0,260,1),(95,2,1,2,78,45,0,260,1),(96,11,1,4,12,45,0,260,1),(97,1,1,1,67,56,0,261,1),(98,20,3,5,1,12,0,262,3),(99,5,3,3,40,23,0,263,3),(100,2,1,2,3,142,0,264,1),(101,11,1,4,21,42,0,264,1),(102,29,1,8,19,78,0,265,1),(103,11,1,4,4,42,0,266,1),(104,2,1,2,69,42,0,266,1),(105,1,1,1,75,11,0,267,1),(106,6,3,6,4,67,0,268,3),(107,20,3,5,11,56,0,269,3),(108,5,3,3,12,24,0,269,3),(109,11,1,4,78,42,0,270,1),(110,11,1,4,11,42,0,271,1),(111,1,1,1,4,11,0,272,1),(112,1,1,1,4,11,0,273,1),(113,11,1,4,45,42,0,274,1),(114,2,1,2,69,42,0,274,1),(115,20,3,5,12,56,0,275,3),(116,33,123,2,4,142,0,276,123),(117,11,1,4,112,3,0,278,1),(118,2,1,2,212,4,0,278,1),(119,11,1,4,36,42,0,283,1),(120,2,1,2,3,142,0,283,1),(121,11,1,4,47,42,0,284,1),(122,2,1,2,55,142,0,284,1),(123,11,1,4,3,42,0,286,1),(124,2,1,2,74,142,0,286,1),(126,2,1,2,96,142,0,245,1),(127,1,1,1,12,11,0,287,1),(128,36,4,1,3,11,0,291,4),(129,2,1,2,32,142,0,303,1),(130,1,1,1,23,11,0,304,1),(131,1,1,1,47,11,0,305,1),(132,37,5,1,2,11,0,306,5),(133,2,1,2,2,142,0,307,1),(134,81,1,15,45,343,0,265,1),(135,11,1,4,999,42,0,308,1),(136,81,1,15,2,343,0,309,1),(137,2,1,2,1,142,0,310,1),(138,1,1,1,1,11,0,311,1),(139,105,2,5,15,56,0,312,2),(140,83,3,4,1,42,0,313,3),(141,105,2,5,78,56,0,312,2),(142,29,1,8,1,53,0,314,1),(143,112,147,21,12,7,0,315,147),(144,108,123,4,1,42,0,316,123),(145,33,123,2,1,142,0,316,123),(146,105,2,5,1,56,0,317,2),(147,108,123,4,34,42,0,318,123),(148,114,147,2,1,142,0,319,147),(149,83,3,4,87,42,0,224,3),(150,5,3,3,78,24,0,224,3),(151,8,3,7,67,56,0,224,3),(152,6,3,6,56,67,0,224,3),(153,20,3,5,45,56,0,224,3),(154,5,3,3,23,24,0,224,3),(155,20,3,5,7,56,0,8,3),(156,83,3,4,47,42,0,8,3),(157,5,3,3,14,24,0,8,3);
/*!40000 ALTER TABLE `purchase_order_products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:10:53
