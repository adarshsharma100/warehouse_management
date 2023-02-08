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
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `product_type` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `products_sku` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Price` int DEFAULT '0',
  `product_unit` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `products_product_id_key` (`product_id`),
  UNIQUE KEY `products_sku_UNIQUE` (`products_sku`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Pi','Pi-descasw','Electronics','TIF001',11,'pc'),(2,'ESP','esp-desc','Electronics','TIF002',142,'2pc set'),(3,'Waterproof Ultrasonic Sensor','water-desp','Sensors','TIF003',24,'combo'),(4,'E18-D80NK Infrared Sensor Module','description','Sensors','TIF004',42,NULL),(5,'MQ-135 gas sensor Module','description 135','Sensors','TIF005',56,NULL),(6,'Turbidity Sensor','description sensor','Sensors','TIF006',67,NULL),(7,'Heat Flame Sensor','description heat','Sensors','TIF007',56,NULL),(8,'Eye Blink Sensor','eye description','Sensors','TIF008',53,NULL),(9,'Laser Module','description laser','Sensors','TIF009',856,NULL),(10,'Sound Sensor Module','sound description','Sensors','TIF010',56,NULL),(11,'Servo Motor Pan-Tilt Setup','servo description','Motors and mechanical devices','TIF011',5657,NULL),(12,'Micro Vibration Motor','micro  ','Motors and mechanical devices','TIF012',65,NULL),(13,'A4988 Stepper Motor Driver','description pump','Motors and mechanical devices','TIF013',346,NULL),(14,'R385 DC PUMP','R385 ','Motors and mechanical devices','TIF014',787,NULL),(15,'Solenoid valve 12V','valve 12V','Motors and mechanical devices','TIF015',343,NULL),(16,'Neo 6M GPS Module','Neo 6M GPS','IOT & wireless devices','TIF016',657,NULL),(17,'NRF24L01+PA+LNA','NRF24L01+PA+LNA','IOT & wireless devices','TIF017',786,NULL),(18,'test','tes0123','IOT & wireless devices','TIF018',657,NULL),(19,'ESP12E ESP8266 Wireless Transceiver Module','ESP12E ','IOT & wireless devices','TIF019',53,NULL),(20,'dummy name','dummy name','dummy product type','TIF000',4,NULL),(21,'Watermelon','Water-melon is a flowering plant species of the Cucurbitaceae family orem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,\nmolestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum','Fruit','Test',7,'kg'),(23,'Test CSV','Test CSV','CSV','TestSKU',67,NULL),(64,'boat','asdddasd','eleectric','TI-100',0,'Pc');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:12:02
