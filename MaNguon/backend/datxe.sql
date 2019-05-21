-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 04, 2019 at 01:14 AM
-- Server version: 5.7.23
-- PHP Version: 7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `datxe`
--

-- --------------------------------------------------------

--
-- Table structure for table `request`
--

DROP TABLE IF EXISTS `request`;
CREATE TABLE IF NOT EXISTS `request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `HoTen` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `DiaChi` text COLLATE utf8_unicode_ci NOT NULL,
  `X` double DEFAULT NULL,
  `Y` double DEFAULT NULL,
  `XThuCong` double DEFAULT NULL,
  `YThuCong` double DEFAULT NULL,
  `latDriver` double DEFAULT NULL,
  `lonDriver` double DEFAULT NULL,
  `GhiChu` text COLLATE utf8_unicode_ci NOT NULL,
  `ThoiGianNhan` datetime NOT NULL,
  `requeststatusid` int(11) NOT NULL,
  `DriverId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=104 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `request`
--

INSERT INTO `request` (`id`, `HoTen`, `DiaChi`, `X`, `Y`, `XThuCong`, `YThuCong`, `latDriver`, `lonDriver`, `GhiChu`, `ThoiGianNhan`, `requeststatusid`, `DriverId`) VALUES
(103, 'Sadio Mane', '224 nguyen van cu, quan 5, hcm', 10.7651395, 106.68178, 10.7651395, 106.68178, NULL, NULL, '', '2019-01-04 08:09:50', 5, NULL),
(102, 'Leroy Sane', '220 nguyen van cu, quan 5, hcm', 10.758554, 106.6829796, 10.758554, 106.6829796, 10.76832000676442, 106.68458711219478, '', '2019-01-04 07:45:34', 4, 3),
(101, 'hậu', '224 nguyen van cu, quan 5, hcm', 10.7651395, 106.68178, 10.7651395, 106.68178, 10.760924823074761, 106.69027090072632, '', '2019-01-04 07:31:40', 4, 2);

-- --------------------------------------------------------

--
-- Table structure for table `requeststatus`
--

DROP TABLE IF EXISTS `requeststatus`;
CREATE TABLE IF NOT EXISTS `requeststatus` (
  `id` int(11) NOT NULL,
  `status` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `requeststatus`
--

INSERT INTO `requeststatus` (`id`, `status`) VALUES
(0, 'chưa được định vị'),
(1, 'đã định vị xong'),
(2, 'đã có xe nhận'),
(3, 'đang di chuyển'),
(4, 'đã hoàn thành'),
(5, 'không có xe');

-- --------------------------------------------------------

--
-- Table structure for table `userlocation`
--

DROP TABLE IF EXISTS `userlocation`;
CREATE TABLE IF NOT EXISTS `userlocation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `DiaChi` text COLLATE utf8_unicode_ci,
  `X` double DEFAULT NULL,
  `Y` double DEFAULT NULL,
  `driverId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `userlocation`
--

INSERT INTO `userlocation` (`id`, `DiaChi`, `X`, `Y`, `driverId`) VALUES
(1, '', 0, 0, 2),
(2, '', 0, 0, 3),
(3, '', 0, 0, 10);

-- --------------------------------------------------------

--
-- Table structure for table `userrefreshtokenext`
--

DROP TABLE IF EXISTS `userrefreshtokenext`;
CREATE TABLE IF NOT EXISTS `userrefreshtokenext` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `TenDangNhap` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `refreshToken` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `rdt` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `userrefreshtokenext`
--

INSERT INTO `userrefreshtokenext` (`id`, `TenDangNhap`, `refreshToken`, `rdt`) VALUES
(1, 'nv1', '4G7Vo9KSl8JN5LnCZTwAaKAaLcliqZukVEUun4bpp5fTjePiAk1B3qXFKFBB179A47fcmpwn8QCd4JNa', '2019-01-04');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `TenDangNhap` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `MatKhau` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `HoTen` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `Email` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `SoDienThoai` int(11) NOT NULL,
  `NgaySinh` date NOT NULL,
  `userTypeId` int(11) NOT NULL,
  `userStatusId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `TenDangNhap`, `MatKhau`, `HoTen`, `Email`, `SoDienThoai`, `NgaySinh`, `userTypeId`, `userStatusId`) VALUES
(1, 'nv1', 'd41d8cd98f00b204e9800998ecf8427e', 'admin', 'admin@gmail.com', 190, '1995-01-01', 1, 1),
(2, 'tx1', 'd41d8cd98f00b204e9800998ecf8427e', 'Valentino Rossi', 'vr46@gmail.com', 946, '1995-01-01', 2, 0),
(3, 'tx2', 'd41d8cd98f00b204e9800998ecf8427e', 'Marc Márquez', 'mm93@gmail.com', 943, '1995-01-01', 2, 0),
(4, 'nv2', 'd41d8cd98f00b204e9800998ecf8427e', 'Roberto Firmino', 'rf9@gmail.com', 9493, '1991-10-02', 1, 0),
(10, 'tx3', 'd41d8cd98f00b204e9800998ecf8427e', 'Gareth Bale', 'gb11@gmail.com', 90011, '1989-12-09', 2, 0),
(5, 'nv3', 'd41d8cd98f00b204e9800998ecf8427e', 'Sergio Aguero', 'sa10@gmail.com', 910, '1989-11-11', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `usersrequests`
--

DROP TABLE IF EXISTS `usersrequests`;
CREATE TABLE IF NOT EXISTS `usersrequests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requestid` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=87 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `usersrequests`
--

INSERT INTO `usersrequests` (`id`, `requestid`, `userid`, `status`) VALUES
(86, 103, 3, 0),
(85, 103, 2, 0),
(84, 103, 10, 0),
(83, 102, 2, 0),
(82, 102, 3, 1),
(81, 101, 2, 1),
(80, 101, 3, 0),
(79, 100, 2, 0),
(78, 100, 3, 1);

-- --------------------------------------------------------

--
-- Table structure for table `userstatus`
--

DROP TABLE IF EXISTS `userstatus`;
CREATE TABLE IF NOT EXISTS `userstatus` (
  `id` int(11) NOT NULL,
  `TrangThai` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `userstatus`
--

INSERT INTO `userstatus` (`id`, `TrangThai`) VALUES
(1, 'online'),
(2, 'Đang đi đón khách'),
(0, 'offline'),
(3, 'Đang chở khách'),
(4, 'busy');

-- --------------------------------------------------------

--
-- Table structure for table `usertype`
--

DROP TABLE IF EXISTS `usertype`;
CREATE TABLE IF NOT EXISTS `usertype` (
  `id` int(11) NOT NULL,
  `Loai` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `usertype`
--

INSERT INTO `usertype` (`id`, `Loai`) VALUES
(1, 'Nhân viên'),
(2, 'Tài xế');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
