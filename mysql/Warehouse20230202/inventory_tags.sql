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
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'best','#ffcdd2'),(2,'poor','#FCFF4B'),(3,'test','#50A2A7'),(4,'delivery time','#FFFFFF'),(5,'location','#E4D6A7'),(6,'priority','F1A208'),(7,'rating','06A77D'),(8,'price','FCFF4B'),(9,'reviews','F0E100'),(10,'certifications','5E4352'),(11,'product range','E43F6F'),(12,'customer service','427AA1'),(13,'years in business','96C0B7'),(14,'payment options','D9F9A5'),(15,'return policy','A9927D'),(16,'warranty','679436'),(17,'references','427AA1'),(18,'industry experience','5D2E46'),(19,'quantity discounts','005C69'),(20,'lead time','EAC5D8'),(21,'specializations','A9927D'),(22,'availability','D9F9A5'),(23,'accreditations','5D2E46'),(24,'customer base','06A77D'),(25,'awards',NULL),(26,'inventory','A1B5D8'),(27,'min order qty','B3CBB9'),(28,'partnership','72B01D'),(29,'compliance','E6C0E9'),(30,'logistics','b908c9'),(32,'partnership level','9BBEC7'),(89,'asda','F6E27F'),(90,'dx','9BBEC7'),(92,'sxdc','8491A3'),(94,'dc','8491A3'),(98,'wsdds','679436'),(99,'sxdcf','427AA1'),(100,'sdasdad','5D2E46'),(101,'awesome','5E0035'),(102,'awe','005C69'),(106,'dsasddsf','EAC5D8'),(107,'ffffff','A9927D'),(108,'dcf','D9F9A5'),(109,'fff','96C0B7'),(113,'sdcf','E43F6F'),(116,'sdefr','F56476'),(119,'aaaaa','5E4352'),(120,'nice','50A2A7'),(121,'go-to','E4D6A7'),(122,'sS','F1A208'),(123,'SSS','06A77D'),(124,'luffy','F0E100'),(125,'creative','FCFF4B');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:11:17
