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
-- Table structure for table `vendor_products`
--

DROP TABLE IF EXISTS `vendor_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_products` (
  `vp_id` int NOT NULL AUTO_INCREMENT,
  `unit_price` int NOT NULL,
  `vendor_vendor_id` int NOT NULL,
  `products_product_id` int NOT NULL,
  `enabled` tinyint NOT NULL DEFAULT '1',
  `priority` int NOT NULL DEFAULT '1',
  `vendor_sku` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`vp_id`,`vendor_vendor_id`,`products_product_id`),
  UNIQUE KEY `vpt_id_UNIQUE` (`vp_id`),
  UNIQUE KEY `vendor_sku_UNIQUE` (`vendor_sku`),
  UNIQUE KEY `unique_index` (`vendor_vendor_id`,`products_product_id`),
  KEY `fk_vendor_products_products1_idx` (`products_product_id`),
  KEY `fk_vendor_products_vendor_idx` (`vendor_vendor_id`),
  CONSTRAINT `fk_vendor_products_products1` FOREIGN KEY (`products_product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `fk_vendor_products_vendor` FOREIGN KEY (`vendor_vendor_id`) REFERENCES `vendor` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_products`
--

LOCK TABLES `vendor_products` WRITE;
/*!40000 ALTER TABLE `vendor_products` DISABLE KEYS */;
INSERT INTO `vendor_products` VALUES (1,424,1,1,1,1,'DA1002'),(2,10,1,2,1,2,'DA1001'),(5,50,3,3,1,4,'TE103'),(6,905,3,6,1,5,'TE106'),(8,45,3,7,1,2,'TE107'),(9,88,4,6,1,3,'KM106'),(10,47,4,7,1,2,'KM107'),(11,83,1,4,1,1,'DA102'),(20,120,3,5,1,1,'TE105'),(29,11,1,8,1,1,'qws'),(33,25,123,2,1,1,'VJ338'),(34,120,5,6,1,1,'TE1564'),(35,11,5,7,1,1,'TE571'),(36,756,4,1,1,1,'TE417'),(37,454,5,1,1,1,'TE420'),(79,142,4,3,1,1,'KA146'),(81,85,1,15,1,1,'DA10456'),(83,0,3,4,1,1,'TE104'),(86,12,1,23,1,1,'aws'),(102,15,123,21,1,1,'VJW1001'),(104,12,4,14,1,1,'dewa'),(105,123,2,5,1,1,'ssWW'),(106,111,170,5,1,1,'qqq'),(108,45,123,4,1,1,'VJ12345'),(112,45,147,21,1,1,'FK489'),(113,40,147,4,1,1,'FK491'),(114,41,147,2,1,1,'FK490'),(116,85,3,1,1,1,'TH4568');
/*!40000 ALTER TABLE `vendor_products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:11:31
