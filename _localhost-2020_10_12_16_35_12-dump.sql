-- MariaDB dump 10.17  Distrib 10.5.6-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: cloothe
-- ------------------------------------------------------
-- Server version	10.5.6-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `about`
--

DROP TABLE IF EXISTS `about`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `about` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `about` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `about`
--

LOCK TABLES `about` WRITE;
/*!40000 ALTER TABLE `about` DISABLE KEYS */;
INSERT INTO `about` VALUES (1,'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris pellentesque aliquam auctor. Etiam facilisis iaculis tellus vitae suscipit. In leo felis, vulputate eu cursus ac, rutrum ut dolor.');
/*!40000 ALTER TABLE `about` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogs`
--

DROP TABLE IF EXISTS `catalogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `catalogs` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `clotheType` varchar(255) DEFAULT NULL,
  `photoUrl` varchar(255) DEFAULT NULL,
  `ruName` varchar(255) DEFAULT NULL,
  `uzName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogs`
--

LOCK TABLES `catalogs` WRITE;
/*!40000 ALTER TABLE `catalogs` DISABLE KEYS */;
INSERT INTO `catalogs` VALUES (1,'hoodie','https://telegra.ph/file/401d5cea3dc7ead8d5ac9.jpg','Худи','Hudi');
/*!40000 ALTER TABLE `catalogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotquestions`
--

DROP TABLE IF EXISTS `hotquestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hotquestions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` varchar(255) DEFAULT NULL,
  `answer` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotquestions`
--

LOCK TABLES `hotquestions` WRITE;
/*!40000 ALTER TABLE `hotquestions` DISABLE KEYS */;
INSERT INTO `hotquestions` VALUES (1,'Можно ли сделать собственный принт?','Да можно в разделе индивидуальный принт'),(2,'Есть ли у вас доставка?','Да у нас есть доставка');
/*!40000 ALTER TABLE `hotquestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `printingcolors`
--

DROP TABLE IF EXISTS `printingcolors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `printingcolors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nameRu` varchar(255) NOT NULL,
  `nameUz` varchar(255) NOT NULL,
  `clothe` int(11) DEFAULT NULL,
  `photoFront` varchar(255) NOT NULL,
  `photoBack` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `clothe` (`clothe`),
  CONSTRAINT `printingcolors_ibfk_1` FOREIGN KEY (`clothe`) REFERENCES `catalogs` (`ID`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `printingcolors`
--

LOCK TABLES `printingcolors` WRITE;
/*!40000 ALTER TABLE `printingcolors` DISABLE KEYS */;
INSERT INTO `printingcolors` VALUES (1,'Черный','Qora',1,'face-black.png','back-black.png'),(2,'Зеленый','Yashil',1,'face-green.png','back-green.png'),(3,'Серый','Kulrang',1,'face-grey.png','back-grey.png'),(4,'Оранжевый','Olo\'vrang',1,'face-orange.png','back-orange.png'),(5,'Красный','Qizil',1,'face-red.png','back-red.png');
/*!40000 ALTER TABLE `printingcolors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `printingdetails`
--

DROP TABLE IF EXISTS `printingdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `printingdetails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nameRu` varchar(255) NOT NULL,
  `nameUz` varchar(255) NOT NULL,
  `coordinatex` float NOT NULL,
  `coordinatey` float NOT NULL,
  `photoName` varchar(255) NOT NULL,
  `resizeWidth` float NOT NULL,
  `resizeHeight` float NOT NULL,
  `clothe` int(11) NOT NULL,
  `correctionx` float DEFAULT NULL,
  `correctiony` float DEFAULT NULL,
  `price` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `printingdetails_ibfk_1` (`clothe`),
  CONSTRAINT `printingdetails_ibfk_1` FOREIGN KEY (`clothe`) REFERENCES `catalogs` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `printingdetails`
--

LOCK TABLES `printingdetails` WRITE;
/*!40000 ALTER TABLE `printingdetails` DISABLE KEYS */;
INSERT INTO `printingdetails` VALUES (1,'Худи центр','Hudi o\'rtaga',2,2,'face',2.5,4,1,0.03,-0.1,250000),(2,'Худи сзади','Hudi ortga',2,2,'back',2,3,1,-0.03,0.1,280000),(3,'Худи с право на грудь','Hudi o\'ng taraf ko\'krakka',3,3,'face',6,8,1,0.2,NULL,230000),(4,'Худи с лево на грудь','Hudi chap taraf ko\'krakka',1.5,3,'face',6,8,1,-0.2,NULL,230000);
/*!40000 ALTER TABLE `printingdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `printingtypes`
--

DROP TABLE IF EXISTS `printingtypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `printingtypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nameRu` varchar(255) NOT NULL,
  `nameUz` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `printingtypes`
--

LOCK TABLES `printingtypes` WRITE;
/*!40000 ALTER TABLE `printingtypes` DISABLE KEYS */;
INSERT INTO `printingtypes` VALUES (1,'Квадрат','Kvadrat','square'),(2,'Прямоугольник','To\'rtburchak','rectangle');
/*!40000 ALTER TABLE `printingtypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `message_id` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `message_status` varchar(255) DEFAULT NULL,
  `answered` varchar(255) DEFAULT NULL,
  `question` varchar(255) DEFAULT NULL,
  `answer` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'JumaniyozovIslom','51','48828613','Ответил(а): JumaniyozovIslom','JumaniyozovIslom','qwer','asdfasd'),(2,'c0mrade_cs','53','743240193','Ожидает ответа',NULL,'привет)',NULL);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `ID` varchar(255) NOT NULL,
  `session` longtext DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('48828613:48828613','%7B%22mesage_filter%22%3A%5B795%2C797%2C799%2C800%2C802%5D%2C%22__language_code%22%3A%22ru%22%2C%22catalogueCart%22%3A%5B%5D%2C%22cart%22%3A%7B%22totalPrice%22%3A0%7D%2C%22chosenLanguage%22%3A%22ru%22%2C%22__scenes%22%3A%7B%22current%22%3A%22mainMenu%22%2C%22state%22%3A%7B%22start%22%3A%22%u0413%u043B%u0430%u0432%u043D%u043E%u0435%20%u043C%u0435%u043D%u044E%22%7D%7D%7D'),('757893610:757893610','%7B%22mesage_filter%22%3A%5B774%2C776%2C778%2C779%2C781%2C783%2C784%5D%2C%22catalogueCart%22%3A%5B%5D%2C%22cart%22%3A%7B%22totalPrice%22%3A0%7D%2C%22__language_code%22%3A%22ru%22%2C%22chosenLanguage%22%3A%22ru%22%2C%22catalogue%22%3A%5B%7B%22ID%22%3A1%2C%22clotheType%22%3A%22hoodie%22%2C%22photoUrl%22%3A%22https%3A//telegra.ph/file/401d5cea3dc7ead8d5ac9.jpg%22%2C%22ruName%22%3A%22%u0425%u0443%u0434%u0438%22%2C%22uzName%22%3A%22Hudi%22%7D%5D%2C%22clotheTypes%22%3A%5B%22%u0425%u0443%u0434%u0438%22%5D%2C%22currentProps%22%3A%7B%22variationSet%22%3A%7B%7D%2C%22clotheType%22%3A1%2C%22clotheName%22%3A%22%u0425%u0443%u0434%u0438%22%2C%22variationsArray%22%3A%5B%22%u041C%u0430%u0433%u0438%u044F%22%2C%22%u0421%u0442%u0440%u0438%u0442%22%5D%7D%2C%22__scenes%22%3A%7B%22current%22%3A%22catalogue%22%2C%22state%22%3A%7B%7D%7D%7D');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizes`
--

DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sizes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `size` varchar(10) NOT NULL,
  `sizeInNumbers` varchar(20) NOT NULL,
  `clothe` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sizes_catalogs_ID_fk` (`clothe`),
  CONSTRAINT `sizes_catalogs_ID_fk` FOREIGN KEY (`clothe`) REFERENCES `catalogs` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizes`
--

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
INSERT INTO `sizes` VALUES (1,'XS','20-25',1),(2,'S','25-30',1),(3,'M','30-35',1),(4,'L','35-40',1),(5,'XL','40-45',1),(6,'XXL','45-50',1);
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `chosenLanguage` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (11,48828613,'JumaniyozovIslom','Jumaniyozov','Islom','ru',NULL),(12,757893610,'Khumoyun00',NULL,'Kh','ru',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variations`
--

DROP TABLE IF EXISTS `variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `variations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nameRu` varchar(255) NOT NULL,
  `nameUz` varchar(255) NOT NULL,
  `captionRu` varchar(255) NOT NULL,
  `captionUz` varchar(255) NOT NULL,
  `clothe` int(11) NOT NULL,
  `photoUrl` varchar(255) NOT NULL,
  `price` float NOT NULL,
  PRIMARY KEY (`id`),
  KEY `variations_ibfk_1` (`clothe`),
  CONSTRAINT `variations_ibfk_1` FOREIGN KEY (`clothe`) REFERENCES `catalogs` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variations`
--

LOCK TABLES `variations` WRITE;
/*!40000 ALTER TABLE `variations` DISABLE KEYS */;
INSERT INTO `variations` VALUES (1,'Магия','Mo\'jiza','Магия','Mo\'jiza',1,'https://telegra.ph/file/01a1ad80bc382ad296a69.jpg',200000),(2,'Стрит','Strit','Стрит','Strit',1,'https://telegra.ph/file/def9f632d44aab5ea971d.jpg',200000);
/*!40000 ALTER TABLE `variations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-10-12 16:35:12
