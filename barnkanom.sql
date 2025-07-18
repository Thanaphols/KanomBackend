-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 18, 2025 at 02:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `barnkanom`
--

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `c_ID` int(11) NOT NULL,
  `c_Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`c_ID`, `c_Name`) VALUES
(1, 'ขนม'),
(2, 'กะหรี่ปั๊ป');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `o_ID` int(11) NOT NULL,
  `u_ID` int(11) NOT NULL,
  `o_date` datetime NOT NULL,
  `o_endDate` datetime NOT NULL,
  `o_image` text NOT NULL,
  `o_Status` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`o_ID`, `u_ID`, `o_date`, `o_endDate`, `o_image`, `o_Status`) VALUES
(30, 11, '2025-07-12 01:28:04', '2025-07-12 14:00:00', '', 1),
(31, 11, '2025-07-12 01:28:13', '2025-07-13 00:00:00', '', 1),
(52, 5, '2025-07-12 20:37:15', '2025-07-12 00:00:00', '', 0),
(53, 5, '2025-07-12 20:37:30', '2025-07-12 00:00:00', '', 0),
(54, 11, '2025-07-12 20:47:21', '2025-07-12 00:00:00', '', 0),
(55, 11, '2025-07-13 00:53:02', '2025-07-13 00:00:00', '', 0),
(56, 11, '2025-07-13 00:53:56', '2025-07-13 00:00:00', '', 0),
(57, 11, '2025-07-13 02:10:06', '2025-07-13 00:00:00', '', 0),
(58, 5, '2025-07-13 02:12:41', '2025-07-13 00:00:00', '', 0),
(59, 5, '2025-07-13 02:13:23', '2025-07-13 00:00:00', '', 0),
(60, 5, '2025-07-13 02:13:42', '2025-07-13 00:00:00', '', 0),
(61, 5, '2025-07-13 02:14:07', '2025-07-13 00:00:00', '', 0),
(63, 11, '2025-07-13 02:21:43', '2025-07-13 00:00:00', '', 0),
(64, 5, '2025-07-13 02:48:03', '2025-07-12 19:45:00', '', 0),
(65, 5, '2025-07-13 03:04:25', '2025-07-17 20:03:00', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `ordersitems`
--

CREATE TABLE `ordersitems` (
  `i_ID` int(11) NOT NULL,
  `o_ID` int(11) NOT NULL,
  `p_ID` int(11) NOT NULL,
  `i_Amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ordersitems`
--

INSERT INTO `ordersitems` (`i_ID`, `o_ID`, `p_ID`, `i_Amount`) VALUES
(54, 30, 13, 2),
(55, 30, 14, 3),
(56, 31, 13, 5),
(57, 31, 14, 5),
(98, 52, 13, 1),
(99, 52, 14, 1),
(100, 53, 13, 1),
(101, 53, 14, 1),
(102, 54, 13, 1),
(103, 54, 14, 1),
(104, 56, 13, 10),
(105, 56, 14, 10),
(106, 57, 13, 10),
(107, 57, 14, 10),
(108, 58, 13, 12),
(109, 58, 14, 12),
(110, 59, 13, 12),
(111, 59, 14, 12),
(112, 60, 13, 12),
(113, 60, 14, 12),
(114, 61, 13, 12),
(115, 61, 14, 12),
(116, 63, 13, 15),
(117, 63, 14, 15),
(118, 65, 13, 6),
(119, 65, 18, 3);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `p_ID` int(11) NOT NULL,
  `p_Name` varchar(255) NOT NULL,
  `p_Detail` text NOT NULL,
  `p_Price` int(11) NOT NULL DEFAULT 0,
  `p_Amount` int(11) NOT NULL DEFAULT 0,
  `c_ID` int(11) NOT NULL,
  `p_Status` int(1) NOT NULL DEFAULT 0,
  `p_Img` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`p_ID`, `p_Name`, `p_Detail`, `p_Price`, `p_Amount`, `c_ID`, `p_Status`, `p_Img`) VALUES
(13, 'ขนมปังกรอบเนยน้ำตาล', 'เนยฉ่ำๆกรอบนาน 12 ห่อ', 100, 0, 1, 0, ''),
(14, 'ขนมปังกรอบพริกเผาหมูหยอง', 'หนูหยองราดซอสมายองนอส 12 ห่อ', 100, 0, 1, 0, ''),
(18, 'fdsa', 'fdsf', 123, 0, 1, 0, '');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `u_ID` int(11) NOT NULL,
  `u_userName` varchar(255) NOT NULL,
  `u_passWord` varchar(255) NOT NULL,
  `u_status` int(1) NOT NULL DEFAULT 0,
  `u_role` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`u_ID`, `u_userName`, `u_passWord`, `u_status`, `u_role`) VALUES
(4, 'n', '$2b$10$ojI9EA4RYJayfrD.I0Y4mO/WChm4pWJUkD4hHhGIlFcF9qOiZBkau', 0, 0),
(5, 'b', '$2b$10$Uw7xNspsm/keVox2FULeZOohZZCuPnPrsEmQXv9r34aZD8hr0fr3y', 0, 0),
(11, 'admin', '$2b$10$vd3FqoBPi1atiddewNWS2OQgoJ789YKomT/DEp02u2yGTDU.kDkhy', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `usersdetail`
--

CREATE TABLE `usersdetail` (
  `de_ID` int(11) NOT NULL,
  `u_ID` int(11) NOT NULL,
  `de_firstName` varchar(255) NOT NULL,
  `de_lastName` varchar(255) NOT NULL,
  `de_tel` varchar(10) NOT NULL,
  `de_address` text NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usersdetail`
--

INSERT INTO `usersdetail` (`de_ID`, `u_ID`, `de_firstName`, `de_lastName`, `de_tel`, `de_address`, `latitude`, `longitude`) VALUES
(1, 4, '123', '123', '123', '', 0.000000, 0.000000),
(2, 5, 'upb', 'upb', '0000000000', 'test', 1.000000, 1.000000),
(8, 11, 'admin', 'admin', '0432767432', '', 0.000000, 0.000000);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`c_ID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`o_ID`),
  ADD KEY `u_ID` (`u_ID`);

--
-- Indexes for table `ordersitems`
--
ALTER TABLE `ordersitems`
  ADD PRIMARY KEY (`i_ID`),
  ADD KEY `p_ID` (`p_ID`),
  ADD KEY `o_ID` (`o_ID`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`p_ID`),
  ADD KEY `c_ID` (`c_ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`u_ID`),
  ADD UNIQUE KEY `u_userName` (`u_userName`);

--
-- Indexes for table `usersdetail`
--
ALTER TABLE `usersdetail`
  ADD PRIMARY KEY (`de_ID`),
  ADD KEY `u_ID` (`u_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `c_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `o_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `ordersitems`
--
ALTER TABLE `ordersitems`
  MODIFY `i_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `p_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `u_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `usersdetail`
--
ALTER TABLE `usersdetail`
  MODIFY `de_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`u_ID`) REFERENCES `users` (`u_ID`);

--
-- Constraints for table `ordersitems`
--
ALTER TABLE `ordersitems`
  ADD CONSTRAINT `o_ID` FOREIGN KEY (`o_ID`) REFERENCES `orders` (`o_ID`),
  ADD CONSTRAINT `p_ID` FOREIGN KEY (`p_ID`) REFERENCES `product` (`p_ID`);

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `c_ID` FOREIGN KEY (`c_ID`) REFERENCES `category` (`c_ID`);

--
-- Constraints for table `usersdetail`
--
ALTER TABLE `usersdetail`
  ADD CONSTRAINT `u_ID` FOREIGN KEY (`u_ID`) REFERENCES `users` (`u_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
