-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Време на генериране: 17 ное 2026 в 23:11
-- Версия на сървъра: 10.11.16-MariaDB
-- Версия на PHP: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данни: `courier_tracking_db`
--

-- --------------------------------------------------------

--
-- Структура на таблица `employees`
--

CREATE TABLE `employees` (
  `Id` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` varchar(20) DEFAULT 'Operator'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Схема на данните от таблица `employees`
--

INSERT INTO `employees` (`Id`, `Username`, `PasswordHash`, `Role`) VALUES
(1, 'admin', '123456', 'Admin');

-- --------------------------------------------------------

--
-- Структура на таблица `packages`
--

CREATE TABLE `packages` (
  `Id` int(11) NOT NULL,
  `TrackingNumber` varchar(50) NOT NULL,
  `SenderInfo` varchar(255) NOT NULL,
  `ReceiverInfo` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `SendDate` datetime NOT NULL,
  `IsCompleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Схема на данните от таблица `packages`
--

INSERT INTO `packages` (`Id`, `TrackingNumber`, `SenderInfo`, `ReceiverInfo`, `Description`, `SendDate`, `IsCompleted`) VALUES
(1, 'TRK5000', 'Иван Петров, гр. София, тел: 0888111222', 'Мария Георгиева, гр. Стара Загора, тел: 0899333444', 'Документи за университет', '2026-10-31 10:00:00', 0),
(2, 'TRK696967', 'Daniel Yorgoff, гр. Стара Загора, тел: 0885847575', 'Петър Кавалджиев, гр. Пловдив, тел: 0898676951', 'Пратка с дрехи', '2026-11-01 19:50:26', 1);

-- --------------------------------------------------------

--
-- Структура на таблица `trackingstatuses`
--

CREATE TABLE `trackingstatuses` (
  `Id` int(11) NOT NULL,
  `PackageId` int(11) NOT NULL,
  `StatusName` varchar(100) NOT NULL,
  `Location` varchar(100) NOT NULL,
  `EventDateTime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Схема на данните от таблица `trackingstatuses`
--

INSERT INTO `trackingstatuses` (`Id`, `PackageId`, `StatusName`, `Location`, `EventDateTime`) VALUES
(1, 1, 'Приета в офис', 'София - Централен офис', '2026-10-31 10:30:00'),
(3, 1, 'В разнос', 'Стара Загора - Хъб', '2026-11-01 19:45:01'),
(4, 2, 'Транзит', 'Изчакване за полет', '2026-11-17 21:36:39'),
(5, 2, 'Приета в офис', 'София - Централен офис', '2026-11-17 21:37:47'),
(6, 2, 'В разнос', 'Навън', '2026-11-17 21:38:11'),
(7, 2, 'Доставена', 'Получена', '2026-11-17 21:38:43');

--
-- Indexes for dumped tables
--

--
-- Индекси за таблица `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- Индекси за таблица `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `TrackingNumber` (`TrackingNumber`);

--
-- Индекси за таблица `trackingstatuses`
--
ALTER TABLE `trackingstatuses`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `PackageId` (`PackageId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `trackingstatuses`
--
ALTER TABLE `trackingstatuses`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ограничения за дъмпнати таблици
--

--
-- Ограничения за таблица `trackingstatuses`
--
ALTER TABLE `trackingstatuses`
  ADD CONSTRAINT `trackingstatuses_ibfk_1` FOREIGN KEY (`PackageId`) REFERENCES `packages` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
