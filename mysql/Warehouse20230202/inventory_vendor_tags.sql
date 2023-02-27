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
-- Table structure for table `vendor_tags`
--

DROP TABLE IF EXISTS `vendor_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendor_vendor_id` int NOT NULL,
  `tags_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`vendor_vendor_id`,`tags_id`),
  KEY `fk_vendor_tags_vendor1_idx` (`vendor_vendor_id`),
  KEY `fk_vendor_tags_tags1_idx` (`tags_id`),
  CONSTRAINT `fk_vendor_tags_tags1` FOREIGN KEY (`tags_id`) REFERENCES `tags` (`id`),
  CONSTRAINT `fk_vendor_tags_vendor1` FOREIGN KEY (`vendor_vendor_id`) REFERENCES `vendor` (`vendor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_tags`
--

LOCK TABLES `vendor_tags` WRITE;
/*!40000 ALTER TABLE `vendor_tags` DISABLE KEYS */;
INSERT INTO `vendor_tags` VALUES (52,1,1),(51,1,125),(12,2,1),(3,2,2),(29,2,6),(7,3,1),(30,3,4),(9,4,1),(31,4,10),(33,4,21),(32,4,25),(19,4,26),(16,5,12),(20,5,14),(21,123,2),(5,133,1),(22,133,30),(53,134,4),(54,134,16),(23,134,20),(55,134,22),(56,134,101),(6,135,1),(25,147,2),(35,168,5),(26,168,26),(18,170,15),(36,170,19),(17,171,2),(34,171,19),(27,173,21),(13,173,22);
/*!40000 ALTER TABLE `vendor_tags` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:11:24
