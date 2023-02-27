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
-- Table structure for table `vendor`
--

DROP TABLE IF EXISTS `vendor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor` (
  `vendor_id` int NOT NULL AUTO_INCREMENT,
  `vendor_code` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_email` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_city` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_contact` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_state` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_gstin` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(145) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `credit_period` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lead_time` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `vendor_id_UNIQUE` (`vendor_id`),
  UNIQUE KEY `vendor_code_UNIQUE` (`vendor_code`),
  UNIQUE KEY `vendor_email_UNIQUE` (`vendor_email`),
  UNIQUE KEY `vendor_gstin_UNIQUE` (`vendor_gstin`)
) ENGINE=InnoDB AUTO_INCREMENT=193 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor`
--

LOCK TABLES `vendor` WRITE;
/*!40000 ALTER TABLE `vendor` DISABLE KEYS */;
INSERT INTO `vendor` VALUES (1,'DA','mdatif796@gmail.com','Panaji','4562879123','Goa','GSTRIO783211111','Dylan Alisson','Rio ','411','471',0),(2,'UE','udederson@gmail.com','Manuguru','8956237845','Andhra Pradesh','GSTMAN012541111','Ud Ederson','Manaus','5','4',1),(3,'TE','thomasEdison@gmail.com','Miraj','8954236172','Maharashtra','GSTMIL009222222','Thomas Edison','Milan','4','4',0),(4,'KM','kamehameha@gmail.com','Tonk','7856124391','Rajasthan','GSTTK0097811111','Kamehameha','Tokyo','7','4',1),(5,'RH','rahul@gmail.com','Dumka','4556788925','Jharkhand','GSTDUB012541111','Rahul','Dubai','3','4',1),(123,'VJ','varunram.66@gmail.com','Bangalore','7892496089','Karnataka','GSTN97313398111','Varun','Hennur','12','21',0),(133,'iotif','iot@gmail.com','Gopalganj','4567892567','Bihar','GSTO14562398745','TIF','banglore','10','12',0),(134,'KR','kar@gmail.com','Cambay','8987634523','Gujarat','GSTI87640111111','Karan','12th street ','4','5',1),(135,'RA','raj@gail.com','banglor','1546237964','Karnataka','GSTI14254572222','Raj','11th street','11','12',1),(147,'FK','xylene8@gmail.com','Salur','4567891238','Andhra Pradesh','GSTIN6786543467','Frank','11','11','11',1),(168,'z','z@g.com','Chirala','1456987856','Andhra Pradesh','145698712345698','z','asd','45','56',1),(170,'asq','d@c.com','Wanaparthy','1234567894','Andhra Pradesh','123456789568745','q','sda','12','45',1),(171,'m','m2@G.COM','Zahirabad','1456239875','Andhra Pradesh','123654789632145','m','WSAQ','45','69',1),(173,'SWD','SD@GMAIL.COM','Bellampalle','7895263654','Andhra Pradesh','SDEF412C5D6E3S6','vj','STRING ','56','85',1),(192,'AS','AS@gmail.com','AS','AS','AS','AS','AS','AS','AS','AS',1);
/*!40000 ALTER TABLE `vendor` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:11:48
