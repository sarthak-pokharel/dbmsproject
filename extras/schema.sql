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

CREATE TABLE `computer_cat` (
  `id` int(11) NOT NULL,
  `label` varchar(200) NOT NULL DEFAULT 'Untitled' COMMENT 'Category Name/ID if exists',
  `model_release_date` date NOT NULL COMMENT 'Release date of this computer category',
  `description` varchar(2000) NOT NULL COMMENT 'Detailed description of the computer category'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `lab_utility` (
  `id` int(11) NOT NULL,
  `label` varchar(100) NOT NULL COMMENT 'Name/Label for utility',
  `description` varchar(500) NOT NULL COMMENT 'Short Description',
  `quantity` int(11) NOT NULL COMMENT 'No. of items existent',
  `isassignedto` int(11) NOT NULL COMMENT 'Reference to the room ID where the utility is located',
  `status` varchar(100) NOT NULL COMMENT 'Current operational status of the utility'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `room` (
  `id` int(11) NOT NULL,
  `label` varchar(200) NOT NULL COMMENT 'Classroom name if any',
  `type` varchar(20) NOT NULL COMMENT 'Type or category of the room',
  `status` varchar(100) NOT NULL DEFAULT 'functional' COMMENT 'Current operational status of the room',
  `image_file_id` varchar(255) DEFAULT NULL COMMENT 'Stores the uploaded image filename'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `smart_board` (
  `id` int(11) NOT NULL,
  `model_id` varchar(200) NOT NULL DEFAULT 'Unknown' COMMENT 'Model identifier of the smart board',
  `isassignedto` int(11) NOT NULL COMMENT 'Room that this smart board is assigned to, room id that is',
  `installed_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Date and time when the smart board was installed',
  `status` varchar(100) NOT NULL COMMENT 'Current operational status of the smart board',
  `image_file_id` varchar(255) DEFAULT NULL COMMENT 'Stores the uploaded image filename'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `computer_cat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lab_utility`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `smart_board`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
