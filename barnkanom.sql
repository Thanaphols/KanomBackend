-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 12, 2025 at 03:56 PM
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
(1, 'ขนม');

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
(1, 'ขนมปังเนย', 'ขนมปังอบทาเนยหอมๆ', 20, 1, 1, 0, '');

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
(1, 'test', '$2b$10$PDau5pfGY4701AET29S8jeDhVjKrQSCQSPEhymmA11JOQLdfm0UZS', 0, 0),
(2, '', '$2b$10$jUTXr022cidqvc3dVSsqWOMulpdZ0yxCxPVlZlQoCt/SzZHI7tXiK', 0, 0),
(3, 'a', '$2b$10$ze4k6O2IwK5KQSo9t.XUo.fRobJxDM2DPOrWEye2wMp49hhwpSd8e', 0, 0);

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
-- Indexes for dumped tables
--

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`c_ID`);

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
  MODIFY `c_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `p_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `u_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usersdetail`
--
ALTER TABLE `usersdetail`
  MODIFY `de_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

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
