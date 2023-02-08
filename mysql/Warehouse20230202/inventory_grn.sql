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
-- Table structure for table `grn`
--

DROP TABLE IF EXISTS `grn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grn` (
  `grn_id` int NOT NULL AUTO_INCREMENT,
  `grn_batch_code` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grn_status` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Created',
  `created_on` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `grn_desc` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grn_status_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`grn_id`),
  UNIQUE KEY `grn_id_UNIQUE` (`grn_id`),
  KEY `fk_grn_grn_status1_idx` (`grn_status_id`),
  CONSTRAINT `fk_grn_grn_status1` FOREIGN KEY (`grn_status_id`) REFERENCES `grn_status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grn`
--

LOCK TABLES `grn` WRITE;
/*!40000 ALTER TABLE `grn` DISABLE KEYS */;
INSERT INTO `grn` VALUES (1,'GRN#3','QC-Started','2022-12-14 10:10:46.000','mild magic',4),(2,'GRN#4','QC-Completed','2022-12-14 10:15:52.000','lorem text123',1),(3,'GRN#1','Created','2022-12-14 09:02:55.277','wse',1),(4,'GRN#2','Created','2022-12-14 09:08:04.396','wase',1),(5,'GRN#5','Created','2022-12-15 05:23:11.893','eees',1),(6,'GRN#6','Created','2022-12-15 10:00:37.999','lorem',2),(8,'GRN#7','QC-Completed','2022-12-15 10:02:37.574','dummy',1),(9,'GRN#8','QC-Completed','2022-12-15 10:12:07.203','test',1),(10,'GRN#9','Created','2022-12-15 10:15:19.106','txt',1),(11,'GRN-4-aw','Created','2022-12-15 10:15:44.571','fulltime',1),(12,'GRN-4-wqdwdc','Created','2022-12-15 10:17:40.464','sunny',1),(13,'GRN-4-1','Created','2022-12-15 10:18:47.444','egghead',1),(14,'GRN-4-sf','Created','2022-12-15 10:19:18.781',NULL,1),(15,'GRN-4-123','Created','2022-12-15 10:20:20.539',NULL,1),(16,'GRN-4-22','Created','2022-12-15 10:21:05.784',NULL,1),(17,'GRN-4-qazz','Created','2022-12-15 10:55:50.280',NULL,1),(18,'GRN-4-PO#57','QC-Started','2023-01-02 05:44:22.620',NULL,1),(19,'GRN-4-PO#66','Created','2023-01-02 05:50:34.326',NULL,1),(20,'GRN-4-PO#80','Created','2023-01-02 06:04:14.652',NULL,1),(21,'GRN-4-PO#82','Created','2023-01-02 06:04:44.242',NULL,1),(22,'GRN-4-PO#83','Created','2023-01-02 06:05:13.673',NULL,1),(23,'GRN-4-po code','Created','2023-01-04 12:56:16.292',NULL,1),(24,'GRN-4-po code','Created','2023-01-04 12:56:19.462',NULL,1),(25,'GRN-4-PO#43','Created','2023-01-10 13:17:42.184',NULL,1),(26,'GRN-4-PO#44','Created','2023-01-12 04:43:38.998',NULL,1),(27,'GRN-4-PO#44','QC-Started','2023-01-12 04:43:40.967',NULL,1),(28,'GRN-4-PO#57','Created','2023-01-20 07:20:28.718',NULL,1);
/*!40000 ALTER TABLE `grn` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:11:59
