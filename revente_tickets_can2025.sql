-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 11 juil. 2025 à 16:12
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `revente_tickets_can2025`
--

-- --------------------------------------------------------

--
-- Structure de la table `administrateur`
--

CREATE TABLE `administrateur` (
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

CREATE TABLE `client` (
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `client`
--

INSERT INTO `client` (`id`) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8),
(9),
(10),
(12),
(13),
(14),
(15),
(16),
(17),
(18),
(19);

-- --------------------------------------------------------

--
-- Structure de la table `historique_achat`
--

CREATE TABLE `historique_achat` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `date_achat` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matchs`
--

CREATE TABLE `matchs` (
  `id` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `lieu` varchar(100) NOT NULL,
  `equipe1` varchar(100) NOT NULL,
  `equipe2` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `matchs`
--

INSERT INTO `matchs` (`id`, `date`, `lieu`, `equipe1`, `equipe2`) VALUES
(2, '2025-04-30 12:27:00', 'xec', 'ertyuytrer', 'ertyu'),
(3, '2025-04-11 16:37:00', 'Stad hassan ||', 'maroc ', 'algerie '),
(7, '2025-06-10 18:00:00', 'Stade Mohammed V', 'Maroc', 'Algérie'),
(8, '2025-06-12 20:00:00', 'Stade Al Hassan', 'Égypte', 'Nigeria'),
(9, '2025-06-14 10:32:00', 'Stade d\'Ebimpé', 'WAC', 'DHJ');

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `type` enum('user','ticket','system') NOT NULL,
  `estLue` tinyint(1) DEFAULT 0,
  `date_creation` datetime DEFAULT current_timestamp(),
  `entite_id` int(11) DEFAULT NULL,
  `entite_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notification`
--

INSERT INTO `notification` (`id`, `titre`, `contenu`, `type`, `estLue`, `date_creation`, `entite_id`, `entite_type`) VALUES
(8, 'Nouvel utilisateur inscrit', 'yuuuuuuuupiii (ayoub.kmar@example.com) vient de créer un compte.', 'user', 1, '2025-05-02 12:52:51', 15, 'utilisateur'),
(9, 'Nouveau ticket mis en vente', 'Ahmed Kamara a mis en vente un ticket pour le match Côte d\'Ivoire vs Nigéria au prix de 150€.', 'ticket', 1, '2025-05-02 12:53:17', 15, 'ticket'),
(10, 'Nouvel utilisateur inscrit', 'redwan (rr@gmail.com) vient de créer un compte.', 'user', 1, '2025-05-04 14:50:41', 16, 'utilisateur'),
(11, 'Nouvel utilisateur inscrit', 'sakina sakina  (ss1@gmail.com) vient de créer un compte.', 'user', 1, '2025-05-14 11:14:20', 17, 'utilisateur'),
(12, 'Nouveau ticket mis en vente', 'ayoub a mis en vente un ticket pour le match Maroc vs Algérie au prix de 1000€.', 'ticket', 1, '2025-06-01 11:29:49', 17, 'ticket'),
(13, 'Nouvel utilisateur inscrit', 'abdo (abdosarsif28@gmail.com) vient de créer un compte.', 'user', 1, '2025-06-01 11:57:25', 18, 'utilisateur'),
(14, 'Nouveau ticket mis en vente', 'abdo a mis en vente un ticket pour le match Maroc vs Algérie au prix de 60€.', 'ticket', 1, '2025-06-01 12:13:00', 18, 'ticket'),
(15, 'Nouvel utilisateur inscrit', 'hiba (hiba@gmail.com) vient de créer un compte.', 'user', 1, '2025-06-01 17:31:13', 19, 'utilisateur'),
(16, 'Achat de ticket', 'ayoub a acheté un ticket pour le match ID 8.', 'ticket', 1, '2025-06-01 19:43:11', 34, 'ticket'),
(17, 'Achat de ticket', 'ayoub a acheté un ticket pour le match ID 7.', 'ticket', 1, '2025-06-01 19:43:23', 35, 'ticket');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `date_creation` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

CREATE TABLE `paiement` (
  `id` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `methode` varchar(50) NOT NULL,
  `client_id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `date_paiement` datetime DEFAULT current_timestamp(),
  `card_number` varchar(16) DEFAULT NULL,
  `cvv` varchar(4) DEFAULT NULL,
  `expiry_month` varchar(2) DEFAULT NULL,
  `expiry_year` varchar(2) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `paiement`
--

INSERT INTO `paiement` (`id`, `montant`, `methode`, `client_id`, `ticket_id`, `date_paiement`, `card_number`, `cvv`, `expiry_month`, `expiry_year`, `password`, `phone_number`) VALUES
(7, 150.00, 'mobile', 19, 39, '2025-06-07 11:57:29', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 152.00, 'carte', 2, 39, '2025-06-07 12:11:35', '1544526526426352', '123', '12', '29', '00000158', NULL),
(9, 150.00, 'mobile', 2, 40, '2025-06-09 23:24:40', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `ticket`
--

CREATE TABLE `ticket` (
  `id` int(11) NOT NULL,
  `prix` double NOT NULL,
  `estRevendu` tinyint(1) DEFAULT 0,
  `match_id` int(11) NOT NULL,
  `vendeurId` int(11) NOT NULL,
  `estVendu` tinyint(1) GENERATED ALWAYS AS (`estRevendu`) VIRTUAL,
  `pdf_path` varchar(255) DEFAULT NULL COMMENT 'Chemin ou identifiant du fichier PDF du ticket'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ticket`
--

INSERT INTO `ticket` (`id`, `prix`, `estRevendu`, `match_id`, `vendeurId`, `pdf_path`) VALUES
(39, 180, 0, 7, 2, '/uploads/tickets/ticket_1749294754174_ticket_Maroc_vs_AlgÃ©rie_39 (1).pdf'),
(40, 1200, 0, 7, 2, '/uploads/tickets/ticket_1749507927789_ticket_Maroc_vs_AlgÃ©rie_39.pdf'),
(41, 200, 0, 7, 19, '/uploads/tickets/ticket_1749293958469_ticket_Maroc_vs_AlgÃ©rie_39.pdf'),
(42, 1500, 0, 7, 19, '/uploads/tickets/ticket_1749294873280_ticket_Ãgypte_vs_Nigeria_34.pdf');

-- --------------------------------------------------------

--
-- Structure de la table `ticket_pdf_history`
--

CREATE TABLE `ticket_pdf_history` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `pdf_path` varchar(255) NOT NULL COMMENT 'Chemin ou identifiant du fichier PDF',
  `vendeur_id` int(11) NOT NULL COMMENT 'Utilisateur qui a uploadé ce PDF',
  `acheteur_id` int(11) DEFAULT NULL COMMENT 'Utilisateur qui a acheté ce ticket (NULL si pas encore acheté)',
  `date_creation` datetime NOT NULL DEFAULT current_timestamp(),
  `is_current` tinyint(1) DEFAULT 1 COMMENT 'Indique si ce PDF est la version actuelle'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ticket_pdf_history`
--

INSERT INTO `ticket_pdf_history` (`id`, `ticket_id`, `pdf_path`, `vendeur_id`, `acheteur_id`, `date_creation`, `is_current`) VALUES
(3, 39, '/uploads/tickets/ticket_1749293661345_ticket_Maroc_vs_AlgÃ©rie_18.pdf', 2, NULL, '2025-06-07 11:54:21', 0),
(4, 40, '/uploads/tickets/ticket_1749293806001_ticket_Ãgypte_vs_Nigeria_34.pdf', 19, NULL, '2025-06-07 11:56:46', 0),
(5, 39, '/uploads/tickets/ticket_39_1749293849642.pdf', 2, 19, '2025-06-07 11:57:29', 0),
(6, 41, '/uploads/tickets/ticket_1749293958469_ticket_Maroc_vs_AlgÃ©rie_39.pdf', 19, NULL, '2025-06-07 11:59:18', 1),
(7, 39, '/uploads/tickets/ticket_1749294590408_ticket_Maroc_vs_AlgÃ©rie_39.pdf', 19, NULL, '2025-06-07 12:09:50', 0),
(8, 39, '/uploads/tickets/ticket_39_1749294694996.pdf', 19, 2, '2025-06-07 12:11:35', 0),
(9, 39, '/uploads/tickets/ticket_1749294754174_ticket_Maroc_vs_AlgÃ©rie_39 (1).pdf', 2, NULL, '2025-06-07 12:12:34', 1),
(10, 42, '/uploads/tickets/ticket_1749294873280_ticket_Ãgypte_vs_Nigeria_34.pdf', 19, NULL, '2025-06-07 12:14:33', 1),
(11, 40, '/uploads/tickets/ticket_40_1749507880433.pdf', 19, 2, '2025-06-09 23:24:40', 0),
(12, 40, '/uploads/tickets/ticket_1749507927789_ticket_Maroc_vs_AlgÃ©rie_39.pdf', 2, NULL, '2025-06-09 23:25:27', 1);

-- --------------------------------------------------------

--
-- Structure de la table `transaction`
--

CREATE TABLE `transaction` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `acheteur_id` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `méthode` varchar(50) NOT NULL,
  `date_transaction` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `motDePasse` varchar(255) NOT NULL,
  `role` enum('client','administrateur') NOT NULL DEFAULT 'client',
  `estBloque` tinyint(1) DEFAULT 0,
  `reset_code` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `nom`, `email`, `motDePasse`, `role`, `estBloque`, `reset_code`) VALUES
(1, 'ayoub mhdi', 'aa@gmail.com', '$2b$10$CjdIy5oROJHzaHAd.89lq.ydgnlD6VPTFxjim9cHx6zy0kLen39T6', 'client', 1, NULL),
(2, 'ayoub', 'aa1@gmail.com', '$2b$10$J1zq2lyaPdCfjaqyBrsS1eRA13MOCHWsjbPFZSTt0FRL7G5L1fTSe', 'client', 0, NULL),
(3, 'abdeljalil sersif', 'a1@gmail.com', '$2b$10$F48CWmEq5E.sHWuG3fhmueTHKnMbRWbyq4a00XTa2.1i0iDiuOa/i', 'client', 0, NULL),
(4, 'soukaina el omrani el idrissi', 'ss@gmail.com', '$2b$10$fD3JB2EhBJpiaD5KoSQtG.vy7bSy9/EKpkD1esaUFMKv4.b1jSDjq', 'client', 0, NULL),
(5, 'yuuup', 'a45@gmail.com', '$2b$10$NQtxzGnMnL0tbzn0oWQ53uvnx5goGpYjl1NCjSl45wVRPPwhMow4m', 'client', 0, NULL),
(6, 'yuppi', 'yup@gmail.com', '$2b$10$tY96xvH/lnBHz.gRfUDMr.vOJk5RYgG0DvjjB8E3BQglMMLytQZwi', 'client', 0, NULL),
(7, 'irlkj,xfhnvefjd', 'aaad@gmail.com', '$2b$10$38c8hbhAQdR/eYSDToiTc.Q7PbRPAHfb7rjWT5Ya5u361ICBAYVrq', 'client', 0, NULL),
(8, 'admin', 'admin@admin.com', '$2b$10$CGl93EU9H6ClWXi1SQjdxeqPRzIjBSJOeCMm06EBfV6fXdmG4JU02', 'administrateur', 0, NULL),
(9, 'abod', 'abod@gmail.com', '$2b$10$46XSFaGWaZkOoq6pltdHm.cVULpkBSU3WSed/TCpn0xiSnMa0irEu', 'client', 0, NULL),
(10, 'test1', 'abdo@adbd.com', '$2b$10$Gz6v.0STed2EiM4UV7DNeexYQ7IBqVVQ8pwojse62lRZpYOnqjZpq', 'client', 0, NULL),
(11, 'Ahmed Kamara', 'ahmed.kamara@example.com', '$2a$10$xJFGdH6gKfRJ9ZyZLx0x7eYeUF.pRKaOk5RGT9vD4Jt8jKzm2THKW', 'client', 1, NULL),
(12, 'Ahmed Kamara', 'ahmed.kamarao@example.com', '$2b$10$xpM1IBp32OIpBgglgKD0W.GTVogyK3m/o5PjCoEeEAO9vSpPlhDNS', 'client', 1, NULL),
(13, 'Ahmed Kamara', 'ahmed.kamar@example.com', '$2b$10$DhWe8oWLtJpI8kOtjlst/uK88d8Qn1.pXIRMr/hZUCZv/UAF1SBYS', 'client', 1, NULL),
(14, 'Ahmed Kamara', 'ahmed.kmar@example.com', '$2b$10$nV62rn1V/0Eob6yiM4rv6./XY56P.YkBFXiTnHGVQ1Bkv1sBh/JJS', 'client', 0, NULL),
(15, 'yuuuuuuuupiii', 'ayoub.kmar@example.com', '$2b$10$h8DjbZvgYVsMiXJzHPvqAO1Kvmt5zE8b9/Z1yS.JXmfqJoHTBoq.K', 'client', 0, NULL),
(16, 'redwan', 'rr@gmail.com', '$2b$10$wzkHa/W7xCDn/QWz7gAQZejb0sgxq92eRpYAdUMZO.LBOsfhHSDme', 'client', 0, NULL),
(17, 'sakina sakina ', 'ss1@gmail.com', '$2b$10$.D3LGKF6CVwOkyb3of5f3ezWvoSoFURpeu60ZoAPBBQCT1aIh34ji', 'client', 0, NULL),
(18, 'abdo', 'abdosarsif28@gmail.com', '$2b$10$qndMYoUcbXziIMTEXmod3.WftnRYKsTfkjPx7redquRJBnSrykl8C', 'client', 0, NULL),
(19, 'hiba', 'hiba@gmail.com', '$2b$10$zt0A/IiCrMYvolnAFJ7o4eN7.jhwWgZnAy958YhOOomPIN7jku64G', 'client', 0, NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `administrateur`
--
ALTER TABLE `administrateur`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `historique_achat`
--
ALTER TABLE `historique_achat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Index pour la table `matchs`
--
ALTER TABLE `matchs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- Index pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Index pour la table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `match_id` (`match_id`),
  ADD KEY `vendeurId` (`vendeurId`);

--
-- Index pour la table `ticket_pdf_history`
--
ALTER TABLE `ticket_pdf_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendeur_id` (`vendeur_id`),
  ADD KEY `acheteur_id` (`acheteur_id`),
  ADD KEY `idx_ticket_pdf_history_ticket_id` (`ticket_id`);

--
-- Index pour la table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `acheteur_id` (`acheteur_id`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `historique_achat`
--
ALTER TABLE `historique_achat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `matchs`
--
ALTER TABLE `matchs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `paiement`
--
ALTER TABLE `paiement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT pour la table `ticket_pdf_history`
--
ALTER TABLE `ticket_pdf_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `administrateur`
--
ALTER TABLE `administrateur`
  ADD CONSTRAINT `administrateur_ibfk_1` FOREIGN KEY (`id`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `client`
--
ALTER TABLE `client`
  ADD CONSTRAINT `client_ibfk_1` FOREIGN KEY (`id`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `historique_achat`
--
ALTER TABLE `historique_achat`
  ADD CONSTRAINT `historique_achat_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `historique_achat_ibfk_2` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`);

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `paiement_ibfk_2` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`);

--
-- Contraintes pour la table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matchs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`vendeurId`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `ticket_pdf_history`
--
ALTER TABLE `ticket_pdf_history`
  ADD CONSTRAINT `ticket_pdf_history_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_pdf_history_ibfk_2` FOREIGN KEY (`vendeur_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `ticket_pdf_history_ibfk_3` FOREIGN KEY (`acheteur_id`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `transaction`
--
ALTER TABLE `transaction`
  ADD CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`),
  ADD CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`acheteur_id`) REFERENCES `utilisateur` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
