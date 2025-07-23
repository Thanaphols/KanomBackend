
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";



CREATE TABLE `category` (
  `c_ID` int(11) NOT NULL,
  `c_Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `category` (`c_ID`, `c_Name`) VALUES
(1, 'ขนม'),
(2, 'กะหรี่ปั๊ป');


CREATE TABLE `costs` (
  `co_ID` int(11) NOT NULL,
  `co_Name` varchar(255) NOT NULL,
  `co_Unit` varchar(255) NOT NULL,
  `co_Price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `financials` (
  `f_ID` int(11) NOT NULL,
  `co_ID` int(11) NOT NULL,
  `f_Amount` int(11) NOT NULL,
  `f_Price` int(11) NOT NULL,
  `f_Date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `orders` (
  `o_ID` int(11) NOT NULL,
  `u_ID` int(11) NOT NULL,
  `o_date` datetime NOT NULL,
  `o_endDate` date NOT NULL,
  `o_image` text NOT NULL,
  `o_Status` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `orders` (`o_ID`, `u_ID`, `o_date`, `o_endDate`, `o_image`, `o_Status`) VALUES
(68, 11, '2025-07-22 01:26:14', '2025-07-23', '', 1),
(70, 11, '2025-07-22 01:32:09', '2025-07-21', '', 0),
(71, 5, '2025-07-22 02:55:03', '2025-07-22', '', 0),
(72, 5, '2025-07-22 02:57:33', '2025-07-22', '', 0),
(73, 11, '2025-07-22 02:59:47', '2025-07-22', '', 0),
(74, 5, '2025-07-22 03:00:35', '2025-07-22', '', 0),
(75, 11, '2025-07-22 03:00:51', '2025-07-24', '', 0),
(76, 4, '2025-07-22 03:01:04', '2025-07-26', '', 0);


CREATE TABLE `ordersitems` (
  `i_ID` int(11) NOT NULL,
  `o_ID` int(11) NOT NULL,
  `p_ID` int(11) NOT NULL,
  `i_Amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `ordersitems` (`i_ID`, `o_ID`, `p_ID`, `i_Amount`) VALUES
(121, 68, 13, 3),
(124, 70, 13, 2),
(125, 70, 14, 3),
(126, 72, 13, 1),
(127, 72, 14, 1),
(128, 73, 13, 1),
(129, 73, 14, 1),
(130, 74, 13, 1),
(131, 74, 14, 1),
(132, 75, 13, 5),
(133, 75, 14, 8),
(134, 76, 13, 3),
(135, 76, 14, 7);



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


INSERT INTO `product` (`p_ID`, `p_Name`, `p_Detail`, `p_Price`, `p_Amount`, `c_ID`, `p_Status`, `p_Img`) VALUES
(13, 'ขนมปังกรอบเนยน้ำตาล', 'เนยฉ่ำๆกรอบนาน 12 ห่อ', 100, 0, 1, 0, ''),
(14, 'ขนมปังกรอบพริกเผาหมูหยอง', 'หนูหยองราดซอสมายองนอส 12 ห่อ', 100, 0, 1, 0, '');


CREATE TABLE `shops` (
  `s_ID` int(11) NOT NULL,
  `s_Name` varchar(255) NOT NULL,
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  `s_Detail` text NOT NULL,
  `s_Status` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `u_ID` int(11) NOT NULL,
  `u_userName` varchar(255) NOT NULL,
  `u_passWord` varchar(255) NOT NULL,
  `u_status` int(1) NOT NULL DEFAULT 0,
  `u_role` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (`u_ID`, `u_userName`, `u_passWord`, `u_status`, `u_role`) VALUES
(4, 'n', '$2b$10$ojI9EA4RYJayfrD.I0Y4mO/WChm4pWJUkD4hHhGIlFcF9qOiZBkau', 0, 0),
(5, 'b', '$2b$10$Uw7xNspsm/keVox2FULeZOohZZCuPnPrsEmQXv9r34aZD8hr0fr3y', 0, 0),
(11, 'admin', '$2b$10$vd3FqoBPi1atiddewNWS2OQgoJ789YKomT/DEp02u2yGTDU.kDkhy', 0, 1);

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

INSERT INTO `usersdetail` (`de_ID`, `u_ID`, `de_firstName`, `de_lastName`, `de_tel`, `de_address`, `latitude`, `longitude`) VALUES
(1, 4, '123', '123', '123', '', 0.000000, 0.000000),
(2, 5, 'upb', 'upb', '0000000000', 'test', 1.000000, 1.000000),
(8, 11, 'admin', 'admin', '0432767432', '', 0.000000, 0.000000);

ALTER TABLE `category`
  ADD PRIMARY KEY (`c_ID`);

ALTER TABLE `costs`
  ADD PRIMARY KEY (`co_ID`);

ALTER TABLE `financials`
  ADD PRIMARY KEY (`f_ID`),
  ADD KEY `co_ID` (`co_ID`);

ALTER TABLE `orders`
  ADD PRIMARY KEY (`o_ID`),
  ADD KEY `u_ID` (`u_ID`);

ALTER TABLE `ordersitems`
  ADD PRIMARY KEY (`i_ID`),
  ADD KEY `p_ID` (`p_ID`),
  ADD KEY `o_ID` (`o_ID`);

ALTER TABLE `product`
  ADD PRIMARY KEY (`p_ID`),
  ADD KEY `c_ID` (`c_ID`);

ALTER TABLE `shops`
  ADD PRIMARY KEY (`s_ID`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`u_ID`),
  ADD UNIQUE KEY `u_userName` (`u_userName`);

ALTER TABLE `usersdetail`
  ADD PRIMARY KEY (`de_ID`),
  ADD KEY `u_ID` (`u_ID`);

ALTER TABLE `category`
  MODIFY `c_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `costs`
  MODIFY `co_ID` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `financials`
  MODIFY `f_ID` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `orders`
  MODIFY `o_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

ALTER TABLE `ordersitems`
  MODIFY `i_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=136;

ALTER TABLE `product`
  MODIFY `p_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

ALTER TABLE `shops`
  MODIFY `s_ID` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `u_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

ALTER TABLE `usersdetail`
  MODIFY `de_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;


ALTER TABLE `financials`
  ADD CONSTRAINT `co_ID` FOREIGN KEY (`co_ID`) REFERENCES `costs` (`co_ID`);

ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`u_ID`) REFERENCES `users` (`u_ID`);

ALTER TABLE `ordersitems`
  ADD CONSTRAINT `o_ID` FOREIGN KEY (`o_ID`) REFERENCES `orders` (`o_ID`),
  ADD CONSTRAINT `p_ID` FOREIGN KEY (`p_ID`) REFERENCES `product` (`p_ID`);

ALTER TABLE `product`
  ADD CONSTRAINT `c_ID` FOREIGN KEY (`c_ID`) REFERENCES `category` (`c_ID`);

ALTER TABLE `usersdetail`
  ADD CONSTRAINT `u_ID` FOREIGN KEY (`u_ID`) REFERENCES `users` (`u_ID`);
COMMIT;