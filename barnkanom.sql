-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 08, 2025 at 10:27 PM
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
(10, 4, '2025-07-09 00:15:38', '2025-07-01 07:58:00', '', 0),
(13, 5, '2025-07-09 01:33:22', '2025-07-16 19:53:00', '', 0),
(14, 11, '2025-07-09 03:01:31', '2025-07-11 00:00:00', '', 0),
(15, 11, '2025-07-09 03:03:03', '2025-07-09 00:00:00', '', 0),
(16, 5, '2025-07-09 03:03:26', '2025-07-10 00:00:00', '', 0);

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
(16, 10, 13, 4),
(17, 10, 14, 3),
(22, 13, 13, 1),
(23, 13, 14, 1),
(24, 14, 13, 1),
(25, 14, 14, 1),
(26, 15, 13, 1),
(27, 15, 14, 1),
(28, 16, 13, 2),
(29, 16, 14, 3);

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
(14, 'ขนมปังกรอบพริกเผาหมูหยอง', 'หนูหยองราดซอสมายองนอส 12 ห่อ', 100, 0, 1, 0, '');

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
  MODIFY `o_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `ordersitems`
--
ALTER TABLE `ordersitems`
  MODIFY `i_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `p_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
