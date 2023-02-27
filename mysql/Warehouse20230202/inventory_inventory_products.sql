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
-- Table structure for table `inventory_products`
--

DROP TABLE IF EXISTS `inventory_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_products` (
  `inventory_product_id` int NOT NULL AUTO_INCREMENT,
  `product_description` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` int DEFAULT '0',
  `quantity` int NOT NULL DEFAULT '0',
  `products_product_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `good_stock` int DEFAULT NULL,
  `bad_stock` int DEFAULT '0',
  PRIMARY KEY (`inventory_product_id`,`products_product_id`),
  UNIQUE KEY `inventory_products_inventory_product_id_key` (`inventory_product_id`),
  KEY `fk_inventory_products_products1_idx` (`products_product_id`),
  CONSTRAINT `fk_inventory_products_products1` FOREIGN KEY (`products_product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_products`
--

LOCK TABLES `inventory_products` WRITE;
/*!40000 ALTER TABLE `inventory_products` DISABLE KEYS */;
INSERT INTO `inventory_products` VALUES (1,' await ()',45622,150,4,'2022-12-15 15:52:03',121,50),(2,'tester',3223,121,2,'2022-12-15 15:52:52',100,0),(3,'sensor',22,3434,3,'2022-12-15 10:23:09',NULL,0),(18,'sound description',12,123,10,'2022-12-26 12:48:16',NULL,0),(38,'valve 12V',11,11,15,'2022-12-27 06:41:16',NULL,0),(40,'e',0,23,1,'2022-12-27 07:17:16',NULL,0),(41,'description sensor',123,345,6,'2023-01-02 10:50:12',NULL,0),(42,'water-desp',123,12,3,'2023-01-03 03:29:23',NULL,0),(43,'Pi-descasw',123,2,1,'2023-01-03 03:34:02',NULL,0),(44,'description 135',121,13,5,'2023-01-03 04:56:25',NULL,0),(45,'description heat',234,2453,7,'2023-01-03 04:59:02',NULL,0),(46,'servo description',234,123,11,'2023-01-03 04:59:35',NULL,0),(47,'Test CSV',123,12,23,'2023-01-03 05:00:49',NULL,0),(48,'description laser',23,12,9,'2023-01-03 05:01:07',NULL,0),(49,'eye description',3,34,8,'2023-01-03 05:01:43',NULL,0),(50,'micro  ',897,657,12,'2023-01-03 05:08:38',NULL,0),(71,'description pump',23,21,13,'2023-01-04 12:09:00',NULL,0),(72,'R385 ',879,13,14,'2023-01-04 12:10:31',NULL,0),(73,'Neo 6M GPS',563,60,16,'2023-01-04 12:12:51',NULL,0),(74,'NRF24L01+PA+LNA',14,60,17,'2023-01-04 12:20:35',56,4),(75,'dummy name',21,21,20,'2023-01-04 12:26:01',20,1),(76,'ESP12E ',123,123,19,'2023-01-10 07:49:59',100,0),(77,'asdddasd',111,20,64,'2023-01-19 09:27:38',19,0),(78,'greate',12,12,12,'2023-01-20 06:01:41',10,0);
/*!40000 ALTER TABLE `inventory_products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:11:21
