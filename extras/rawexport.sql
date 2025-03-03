SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `computer` (
  `id` int(11) NOT NULL,
  `label` varchar(500) NOT NULL COMMENT 'Name or identification label of the computer',
  `install_date` date DEFAULT NULL COMMENT 'Date when the computer was installed',
  `isassignedto` int(11) NOT NULL COMMENT 'Reference to the room ID where the computer is located',
  `belongstocategory` int(11) NOT NULL COMMENT 'Reference to the computer category this machine belongs to',
  `status` varchar(100) NOT NULL COMMENT 'Current operational status of the computer',
  `quantity` int(11) NOT NULL DEFAULT 1 COMMENT 'Number of identical computers of this type'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `computer` (`id`, `label`, `install_date`, `isassignedto`, `belongstocategory`, `status`, `quantity`) VALUES
(2, 'Quantum Workstation', '2023-01-15', 1, 1, 'functional', 1),
(3, 'AI Research Node', '2023-02-01', 2, 2, 'maintenance', 1),
(4, 'Deep Learning Rig', '2023-02-15', 3, 3, 'functional', 1),
(5, 'Bioinformatics Server', '2023-03-01', 4, 4, 'retired', 1),
(6, 'Quantum Simulator', '2023-03-15', 5, 5, 'functional', 1),
(7, 'Neural Network Trainer', '2023-04-01', 6, 6, 'maintenance', 1),
(8, 'Genomics Analyzer', '2023-04-15', 7, 7, 'functional', 1),
(9, 'Astrophysics Workbench', '2023-05-01', 8, 8, 'retired', 1),
(10, 'Robotics Controller', '2023-05-15', 9, 9, 'functional', 1),
(11, 'Cybersecurity Hub', '2023-06-01', 10, 10, 'maintenance', 1),
(12, 'AI Development Kit', '2023-07-01', 2, 1, 'functional', 1),
(13, 'Machine Learning Station', '2023-07-15', 3, 2, 'maintenance', 1),
(14, 'Quantum Computing Node', '2023-08-01', 4, 3, 'functional', 1),
(15, 'Bioinformatics Workstation', '2023-08-15', 5, 4, 'retired', 1),
(16, 'Neural Network Processor', '2023-09-01', 6, 5, 'functional', 1),
(17, 'Genomics Workbench', '2023-09-15', 7, 6, 'maintenance', 1),
(18, 'Astrophysics Simulator', '2023-10-01', 8, 7, 'functional', 1),
(19, 'Robotics Development Kit', '2023-10-15', 9, 8, 'retired', 1),
(20, 'Cybersecurity Node', '2023-11-01', 10, 9, 'functional', 1),
(21, 'Development Workstation Pro', '2023-06-15', 3, 4, 'functional', 1),
(22, 'Data Analytics Server', '2023-07-01', 1, 2, 'maintenance', 1),
(23, 'Cloud Computing Node', '2023-07-15', 4, 1, 'functional', 1),
(24, 'Web Development Station', '2023-08-01', 2, 3, 'retired', 1),
(25, 'Mobile Testing Device', '2023-08-15', 6, 5, 'functional', 1),
(26, 'DevOps Workbench', '2023-09-01', 5, 7, 'maintenance', 1),
(27, 'Database Server', '2023-09-15', 8, 6, 'functional', 1),
(28, 'Testing Environment', '2023-10-01', 7, 8, 'retired', 1),
(29, 'Network Monitor', '2023-10-15', 10, 10, 'functional', 1),
(30, 'Security Testing Lab', '2023-11-01', 9, 9, 'maintenance', 1),
(31, 'Full Stack Dev Station', '2023-11-15', 2, 3, 'functional', 1),
(32, 'Backend Server Node', '2023-12-01', 4, 5, 'functional', 1),
(33, 'Frontend Dev Kit', '2023-12-15', 1, 4, 'maintenance', 1),
(34, 'API Testing Station', '2024-01-01', 6, 7, 'functional', 1),
(35, 'CI/CD Pipeline Server', '2024-01-15', 3, 8, 'retired', 1),
(36, 'Code Review Station', '2024-02-01', 5, 2, 'functional', 1),
(37, 'QA Testing Environment', '2024-02-15', 8, 1, 'maintenance', 1),
(38, 'Load Testing Server', '2024-03-01', 7, 6, 'functional', 1),
(39, 'Deployment Station', '2024-03-15', 10, 10, 'retired', 1),
(40, 'Version Control Server', '2024-04-01', 9, 9, 'functional', 1),
(41, 'Development Workstation Pro', '2023-06-15', 3, 4, 'functional', 1),
(42, 'Development Workstation Pro', '2023-06-15', 3, 4, 'functional', 1),
(43, 'Version Control Server', '2024-04-01', 9, 9, 'functional', 1);

CREATE TABLE `computer_cat` (
  `id` int(11) NOT NULL,
  `label` varchar(200) NOT NULL DEFAULT 'Untitled' COMMENT 'Category Name/ID if exists',
  `model_release_date` date NOT NULL COMMENT 'Release date of this computer category',
  `description` varchar(2000) NOT NULL COMMENT 'Detailed description of the computer category'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `computer_cat` (`id`, `label`, `model_release_date`, `description`) VALUES
(1, 'Intel Core Ultra 7 155H Gaming Edition', '2024-01-15', 'Intel� CoreT Ultra 7 155H, 16 cores, Windows 11 Home, NVIDIA GeForce RTX 4050, 32 GB LPDDR5X, 1 TB SSD, 16.3\", Non-Touch, FHD+ 1920x1200, Anti-Glare, 500 nit, InfinityEdge'),
(2, 'Intel Core i7-13700H Workstation', '2023-06-20', 'Intel� CoreT i7-13700H, 14 cores, Windows 11 Pro, NVIDIA RTX A2000, 16 GB DDR5, 512 GB SSD, 15.6\", IPS, QHD 2560x1440, Anti-Glare, 400 nit'),
(3, 'Intel Core i5-1335U Student Edition', '2023-08-01', 'Intel� CoreT i5-1335U, 10 cores, Windows 11 Home, Intel� Iris� Xe Graphics, 8 GB DDR4, 256 GB SSD, 14\", FHD 1920x1080, Anti-Glare, 250 nit'),
(4, 'Intel Core Ultra 5 125H Professional', '2024-02-01', 'Intel Core Ultra 5 125H, 14 cores, Windows 11 Pro, Intel Arc Graphics, 16 GB LPDDR5, 512 GB SSD, 13.4\", Touch, QHD+ 2560x1600, Anti-Reflective, 450 nit'),
(5, 'AMD Ryzen 9 7945HX Creator Edition', '2023-09-15', 'AMD Ryzen 9 7945HX, 16 cores, Windows 11 Pro, NVIDIA RTX 4070, 64 GB DDR5, 2 TB SSD, 17\", OLED 3840x2400, Touch, HDR 500, 100% DCI-P3'),
(6, 'Intel Core i9-14900HX Enterprise', '2024-01-05', 'Intel Core i9-14900HX, 24 cores, Windows 11 Pro, NVIDIA� RTXT 4080, 32 GB DDR5, 1 TB SSD + 1 TB SSD, 17.3\", Mini-LED, UHD 3840x2160, HDR 1000'),
(7, 'Intel Celeron N4500 Education', '2023-07-10', 'Intel Celeron N4500, 2 cores, Chrome OS, Intel� UHD Graphics, 4 GB LPDDR4X, 64 GB eMMC, 11.6\", HD 1366x768, Anti-Glare, 250 nit, Military-Grade Durability'),
(8, 'AMD Ryzen 7 7840U Business', '2024-03-01', 'AMD RyzenT 7 7840U, 8 cores, Windows 11 Pro, AMD Radeon 780M Graphics, 16 GB LPDDR5, 512 GB SSD, 14\", IPS, FHD+ 1920x1200, Anti-Glare, 400 nit, Privacy Screen'),
(9, 'AMD Ryzen 9 7945HX Extreme Gaming', '2023-11-20', 'AMD RyzenT 9 7945HX, 16 cores, Windows 11 Home, NVIDIA� GeForce RTXT 4090, 64 GB DDR5, 2 TB SSD + 2 TB SSD, 18\", Mini-LED, QHD+ 2560x1600, 240Hz, G-SYNC'),
(10, 'Intel Core Ultra 9 185H Creator Pro', '2024-02-15', 'Intel Core Ultra 9 185H, 16 cores, Windows 11 Pro, NVIDIA RTX 4070, 32 GB LPDDR5X, 2 TB SSD, 16\", OLED, UHD+ 3840x2400, Touch, HDR 600, 100% Adobe RGB');

CREATE TABLE `lab_utility` (
  `id` int(11) NOT NULL,
  `label` varchar(100) NOT NULL COMMENT 'Name/Label for utility',
  `description` varchar(500) NOT NULL COMMENT 'Short Description',
  `quantity` int(11) NOT NULL COMMENT 'No. of items existent',
  `isassignedto` int(11) NOT NULL COMMENT 'Reference to the room ID where the utility is located',
  `status` varchar(100) NOT NULL COMMENT 'Current operational status of the utility'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `lab_utility` (`id`, `label`, `description`, `quantity`, `isassignedto`, `status`) VALUES
(1, 'Multimeter', 'Used for measuring voltage, current, and resistance.', 10, 1, 'functional'),
(2, 'Wattmeter', 'Used for measuring electrical power.', 5, 2, 'maintenance'),
(3, 'Ammeter', 'Used for measuring electric current.', 8, 3, 'retired'),
(4, 'Oscilloscope', 'Used for observing the change of an electrical signal over time.', 7, 4, 'functional'),
(5, 'Signal Generator', 'Used for generating electronic signals.', 6, 5, 'maintenance'),
(6, 'Function Generator', 'Used for generating different types of electrical waveforms.', 4, 6, 'retired'),
(7, 'Power Supply', 'Provides electrical power to an electrical load.', 9, 7, 'functional'),
(8, 'Frequency Counter', 'Used for measuring frequency of an electrical signal.', 3, 8, 'maintenance'),
(9, 'Logic Analyzer', 'Used for capturing and displaying multiple signals from a digital system.', 2, 9, 'retired'),
(10, 'Spectrum Analyzer', 'Used for measuring the magnitude of an input signal versus frequency.', 1, 10, 'functional');

CREATE TABLE `room` (
  `id` int(11) NOT NULL,
  `label` varchar(200) NOT NULL COMMENT 'Classroom name if any',
  `type` varchar(20) NOT NULL COMMENT 'Type or category of the room',
  `status` varchar(100) NOT NULL DEFAULT 'functional' COMMENT 'Current operational status of the room',
  `image_file_id` varchar(255) DEFAULT NULL COMMENT 'Stores the uploaded image filename'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `room` (`id`, `label`, `type`, `status`, `image_file_id`) VALUES
(1, 'Computer Research and Development Lab', 'laboratory', 'functional', NULL),
(2, 'Electronic Communications Lab', 'laboratory', 'functional', NULL),
(3, 'Basic Electronics Lab I', 'laboratory', 'functional', NULL),
(4, 'Basic Electronics Lab II', 'laboratory', 'functional', NULL),
(5, 'Advanced Electronic Lab', 'laboratory', 'functional', NULL),
(6, 'Basic Computer Lab', 'laboratory', 'functional', NULL),
(7, 'Advanced Computer Lab', 'laboratory', 'functional', NULL),
(8, 'Repair and Maintenance Lab', 'laboratory', 'functional', NULL),
(9, 'Photovoltaic Lab', 'laboratory', 'functional', NULL),
(10, 'DBMS Lab and Computer Simulation Lab', 'laboratory', 'functional', NULL),
(11, 'Project Lab', 'laboratory', 'functional', NULL),
(12, 'Student Computer Club', 'laboratory', 'functional', NULL),
(13, 'Room 300', 'classroom', 'functional', NULL),
(14, 'Room 301', 'classroom', 'functional', NULL),
(15, 'Room 302', 'classroom', 'functional', NULL),
(16, 'Room 303', 'classroom', 'functional', NULL),
(17, 'Room 304', 'classroom', 'functional', NULL),
(18, 'Room 305', 'classroom', 'functional', NULL),
(19, 'Room 306', 'classroom', 'functional', NULL),
(20, 'Room 307', 'classroom', 'functional', NULL),
(21, 'Room 308', 'classroom', 'functional', NULL),
(22, 'Room 309', 'classroom', 'functional', NULL),
(23, 'Room 310', 'classroom', 'functional', NULL),
(24, 'Room 311', 'classroom', 'functional', NULL),
(25, 'Room 312', 'classroom', 'functional', NULL),
(26, 'Room 313', 'classroom', 'functional', NULL),
(27, 'Room 314', 'classroom', 'functional', NULL),
(28, 'Room 315', 'classroom', 'functional', NULL),
(29, 'Room 316', 'classroom', 'functional', NULL),
(30, 'Room 317', 'classroom', 'functional', NULL),
(31, 'Room 318', 'classroom', 'functional', NULL),
(32, 'Room 319', 'classroom', 'functional', NULL),
(33, 'Room 320', 'classroom', 'functional', NULL),
(34, 'Room 321', 'classroom', 'functional', NULL),
(35, 'Room 322', 'classroom', 'functional', NULL),
(36, 'Room 323', 'classroom', 'functional', NULL),
(37, 'Room 324', 'classroom', 'functional', NULL),
(38, 'Room 325', 'classroom', 'functional', NULL);

CREATE TABLE `smart_board` (
  `id` int(11) NOT NULL,
  `model_id` varchar(200) NOT NULL DEFAULT 'Unknown' COMMENT 'Model identifier of the smart board',
  `isassignedto` int(11) NOT NULL COMMENT 'Room that this smart board is assigned to, room id that is',
  `installed_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Date and time when the smart board was installed',
  `status` varchar(100) NOT NULL COMMENT 'Current operational status of the smart board',
  `image_file_id` varchar(255) DEFAULT NULL COMMENT 'Stores the uploaded image filename'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `smart_board` (`id`, `model_id`, `isassignedto`, `installed_date`, `status`, `image_file_id`) VALUES
(1, 'SB-2001', 1, '2025-03-02 18:15:00', 'functional', NULL),
(2, 'SB-2002', 2, '2025-03-02 18:15:00', 'maintenance', NULL),
(3, 'SB-2003', 3, '2025-03-02 18:15:00', 'retired', NULL),
(4, 'SB-2004', 4, '2025-03-02 18:15:00', 'functional', NULL),
(5, 'SB-2005', 5, '2025-03-02 18:15:00', 'maintenance', NULL),
(6, 'SB-2006', 6, '2025-03-02 18:15:00', 'retired', NULL),
(7, 'SB-2007', 7, '2025-03-02 18:15:00', 'functional', NULL),
(8, 'SB-2008', 8, '2025-03-02 18:15:00', 'maintenance', NULL),
(9, 'SB-2009', 9, '2025-03-02 18:15:00', 'retired', NULL),
(10, 'SB-2010', 10, '2025-03-02 18:15:00', 'functional', NULL);

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(200) NOT NULL COMMENT 'Username for login authentication',
  `password` varchar(500) NOT NULL COMMENT 'Encrypted password for user authentication',
  `name` varchar(256) NOT NULL COMMENT 'Full name of the user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `computer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comproom` (`isassignedto`),
  ADD KEY `compcat` (`belongstocategory`);

ALTER TABLE `computer_cat`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `lab_utility`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignedroom` (`isassignedto`);

ALTER TABLE `room`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `smart_board`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_index` (`isassignedto`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `computer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

ALTER TABLE `computer_cat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `lab_utility`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

ALTER TABLE `smart_board`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `computer`
  ADD CONSTRAINT `compcat` FOREIGN KEY (`belongstocategory`) REFERENCES `computer_cat` (`id`),
  ADD CONSTRAINT `comproom` FOREIGN KEY (`isassignedto`) REFERENCES `room` (`id`);

ALTER TABLE `lab_utility`
  ADD CONSTRAINT `assignedroom` FOREIGN KEY (`isassignedto`) REFERENCES `room` (`id`);

ALTER TABLE `smart_board`
  ADD CONSTRAINT `assigned_index` FOREIGN KEY (`isassignedto`) REFERENCES `room` (`id`);
COMMIT;
