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
-- Table structure for table `rfq_sentto`
--

DROP TABLE IF EXISTS `rfq_sentto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rfq_sentto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(45) DEFAULT NULL,
  `rfq_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_rfq_sentto_rfq1_idx` (`rfq_id`),
  CONSTRAINT `fk_rfq_sentto_rfq1` FOREIGN KEY (`rfq_id`) REFERENCES `rfq` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=209 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfq_sentto`
--

LOCK TABLES `rfq_sentto` WRITE;
/*!40000 ALTER TABLE `rfq_sentto` DISABLE KEYS */;
INSERT INTO `rfq_sentto` VALUES (11,'dylan.p@tiflabs.in',191),(15,'test@gmail.com',201),(16,'test45@gmail.com',201),(28,'QUID@g.com',209),(57,'vj@gmail.com',238),(58,'ss',239),(59,'saa',240),(60,'vj@gmail.com',241),(62,'asd',243),(63,'sdfds',244),(64,'wefwe',245),(65,'wewe',245),(66,'sfsd',246),(67,'fasf',246),(68,'dfg',247),(69,'ser',247),(70,'dsds',248),(71,'dfdfs',248),(72,'dfs',249),(73,'sdf',249),(74,'sdsd',250),(75,'ds',250),(78,'saa',252),(79,'dsdsa',252),(80,'dfg',253),(81,'gds',253),(97,'kamehameha@gmail.com',311),(101,'kamehameha@gmail.com',315),(115,'udederson@gmail.com',329),(122,'varunram.66@gmail.com',329),(123,'varunram.66@gmail.com',326),(124,'varunram.66@gmail.com',329),(125,'kamehameha@gmail.com',342),(126,'varunram.66@gmail.com',343),(127,'varunram.66@gmail.com',16),(128,'varunram.66@gmail.com',344),(149,'varunram.66@gmail.com',19),(150,'varunram.66@gmail.com',22),(151,'varunram.66@gmail.com',209),(154,'F@gmail.com',209),(155,'F@gmail.com',240),(159,'xylene8@gmail.com',362),(160,'xylene8@gmail.com',362),(175,'varunram.66@gmail.com',370),(176,'kar@gmail.com',371),(180,'varunram.66@gmail.com',322),(181,'varunram.66@gmail.com',374),(182,'varunram.66@gmail.com',16),(183,'xylene8@gmail.com',16),(184,'z@g.com',16),(185,'d@c.com',16),(186,'m2@G.COM',16),(187,'kar@gmail.com',16),(188,'raj@gmail,com',16),(189,'udederson@gmail.com',16),(190,'m2@G.COM',311),(191,'d@c.com',311),(192,'z@g.com',311),(193,'xylene8@gmail.com',311),(194,'raj@gmail,com',311),(195,'kar@gmail.com',311),(196,'varunram.66@gmail.com',311),(197,'xylene8@gmail.com',309),(198,'varunram.66@gmail.com',161),(199,'varunram.66@gmail.com',375),(200,'varunram.66@gmail.com',376),(201,'varunram.66@gmail.com',377),(202,'varunram.66@gmail.com',379),(203,'varunram.66@gmail.com',380),(204,'varunram.66@gmail.com',381),(205,'varunram.66@gmail.com',324),(206,'varunram.66@gmail.com',17),(207,'varunram.66@gmail.com',18),(208,'varunram.66@gmail.com',240);
/*!40000 ALTER TABLE `rfq_sentto` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-02 17:11:44
