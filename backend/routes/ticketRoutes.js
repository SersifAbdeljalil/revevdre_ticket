const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

// Récupérer tous les tickets disponibles à la vente
router.get("/", async (req, res) => {
  try {
    const { matchId, status, minPrice, maxPrice } = req.query;

    let query = `
      SELECT 
        t.id, t.prix, t.estRevendu,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (matchId) {
      query += " AND t.match_id = ?";
      queryParams.push(matchId);
    }

    if (status === "available") {
      query += " AND t.estRevendu = 0";
    } else if (status === "sold") {
      query += " AND t.estRevendu = 1";
    }

    if (minPrice) {
      query += " AND t.prix >= ?";
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      query += " AND t.prix <= ?";
      queryParams.push(maxPrice);
    }

    query += " ORDER BY m.date ASC, t.prix ASC";

    const [tickets] = await pool.execute(query, queryParams);

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: Boolean(ticket.estRevendu),
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail,
      },
    }));

    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer les tickets mis en vente par l'utilisateur connecté
router.get("/my-sales", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [tickets] = await pool.execute(
      `
      SELECT 
        t.id, t.prix, t.estRevendu,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      WHERE t.vendeurId = ?
      ORDER BY t.estRevendu ASC, m.date ASC
    `,
      [userId]
    );

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: Boolean(ticket.estRevendu),
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
    }));

    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets mis en vente:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer les tickets achetés par l'utilisateur connecté
router.get("/my-purchases", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [tickets] = await pool.execute(
      `
      SELECT 
        t.id, t.prix,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail,
        ha.date_achat as dateAchat
      FROM historique_achat ha
      JOIN ticket t ON ha.ticket_id = t.id
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE ha.client_id = ?
      ORDER BY ha.date_achat DESC
    `,
      [userId]
    );

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: true,
      dateAchat: ticket.dateAchat,
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail,
      },
    }));

    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets achetés:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer un ticket spécifique par son ID
router.get("/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;

    const [tickets] = await pool.execute(
      `
      SELECT 
        t.id, t.prix, t.estRevendu,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE t.id = ?
    `,
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ message: "Ticket non trouvé" });
    }

    const ticket = tickets[0];

    const formattedTicket = {
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: Boolean(ticket.estRevendu),
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail,
      },
    };

    res.status(200).json({ ticket: formattedTicket });
  } catch (error) {
    console.error("Erreur lors de la récupération du ticket:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Créer un nouveau ticket à vendre
router.post("/", protect, async (req, res) => {
  try {
    const { prix, matchId } = req.body;
    const vendeurId = req.user.id;

    console.log(`Création d'un ticket - Prix: ${prix}, Match ID: ${matchId}, Vendeur ID: ${vendeurId}`);

    if (!prix || !matchId) {
      console.log("Données manquantes: prix ou matchId");
      return res.status(400).json({ message: "Le prix et l'ID du match sont requis" });
    }

    const [matchRows] = await pool.execute("SELECT * FROM matchs WHERE id = ?", [matchId]);
    if (matchRows.length === 0) {
      console.log(`Match ID ${matchId} non trouvé`);
      return res.status(404).json({ message: "Match non trouvé" });
    }

    const match = matchRows[0];
    console.log('Match trouvé:', match);

    const [result] = await pool.execute(
      "INSERT INTO ticket (prix, match_id, vendeurId, estRevendu) VALUES (?, ?, ?, 0)",
      [prix, matchId, vendeurId]
    );
    console.log(`Ticket inséré avec ID: ${result.insertId}`);

    const [newTicket] = await pool.execute(
      `
      SELECT 
        t.id, t.prix, t.estRevendu,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE t.id = ?
    `,
      [result.insertId]
    );

    const ticket = newTicket[0];

    const formattedTicket = {
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: Boolean(ticket.estRevendu),
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail,
      },
    };

    const [userRows] = await pool.execute("SELECT * FROM utilisateur WHERE id = ?", [vendeurId]);
    if (userRows.length === 0) {
      console.log(`Utilisateur ID ${vendeurId} non trouvé`);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const user = userRows[0];
    console.log('Utilisateur trouvé:', user);

    res.status(201).json({
      message: "Ticket mis en vente avec succès",
      ticket: formattedTicket,
    });
  } catch (error) {
    console.error("Erreur lors de la création du ticket:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Acheter un ticket
router.post("/:id/purchase", protect, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const acheteurId = req.user.id;
    const { methode, cardNumber, cvv, expiryMonth, expiryYear, password, phoneNumber } = req.body;

    console.log(`Tentative d'achat du ticket ${ticketId} par l'utilisateur ${acheteurId}`);
    console.log('Données de paiement reçues:', req.body);

    const [ticketRows] = await pool.execute(
      "SELECT id, prix, vendeurId, estRevendu, match_id FROM ticket WHERE id = ?",
      [ticketId]
    );

    if (ticketRows.length === 0) {
      console.log(`Ticket ${ticketId} non trouvé`);
      return res.status(404).json({ message: "Ticket non trouvé" });
    }

    const ticket = ticketRows[0];
    console.log('Ticket trouvé:', ticket);

    if (ticket.estRevendu) {
      console.log(`Ticket ${ticketId} déjà vendu`);
      return res.status(400).json({ message: "Ce ticket a déjà été vendu" });
    }

    if (ticket.vendeurId === acheteurId) {
      console.log(`Utilisateur ${acheteurId} tente d'acheter son propre ticket`);
      return res.status(400).json({ message: "Vous ne pouvez pas acheter votre propre ticket" });
    }

    const [matchRows] = await pool.execute("SELECT date, equipe1, equipe2 FROM matchs WHERE id = ?", [
      ticket.match_id,
    ]);
    if (matchRows.length === 0) {
      console.log(`Match ${ticket.match_id} non trouvé`);
      return res.status(404).json({ message: "Match non trouvé" });
    }
    const match = matchRows[0];
    console.log('Match trouvé:', match);

    if (new Date(match.date) < new Date()) {
      console.log(`Match ${ticket.match_id} déjà passé à la date ${match.date}`);
      return res.status(400).json({ message: "Ce match a déjà eu lieu" });
    }

    const connection = await pool.getConnection();
    console.log('Connexion à la base de données établie');
    await connection.beginTransaction();
    console.log('Transaction démarrée');

    try {
      await connection.execute("UPDATE ticket SET estRevendu = 1 WHERE id = ?", [ticketId]);
      console.log(`Ticket ${ticketId} marqué comme vendu`);

      await connection.execute(
        "INSERT INTO paiement (montant, methode, client_id, ticket_id, date_paiement, card_number, cvv, expiry_month, expiry_year, password, phone_number) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)",
        [
          ticket.prix,
          methode || "carte",
          acheteurId,
          ticketId,
          cardNumber || null,
          cvv || null,
          expiryMonth || null,
          expiryYear || null,
          password || null,
          phoneNumber || null,
        ]
      );
      console.log('Paiement enregistré');

      await connection.execute(
        "INSERT INTO historique_achat (client_id, ticket_id, date_achat) VALUES (?, ?, NOW())",
        [acheteurId, ticketId]
      );
      console.log('Historique d\'achat enregistré');

      await connection.commit();
      console.log('Transaction validée');

      res.status(200).json({
        message: "Ticket acheté avec succès",
        ticketId,
      });
    } catch (error) {
      console.error('Erreur dans la transaction:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
      console.log('Connexion à la base de données libérée');
    }
  } catch (error) {
    console.error("Erreur lors de l'achat du ticket:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Modifier un ticket
router.put("/:id", protect, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { prix } = req.body;
    const userId = req.user.id;

    console.log(`Modification du ticket ${ticketId} par l'utilisateur ${userId}`);

    const [ticketRows] = await pool.execute(
      "SELECT id, vendeurId, estRevendu FROM ticket WHERE id = ?",
      [ticketId]
    );

    if (ticketRows.length === 0) {
      console.log(`Ticket ${ticketId} non trouvé`);
      return res.status(404).json({ message: "Ticket non trouvé" });
    }

    const ticket = ticketRows[0];
    console.log('Ticket trouvé:', ticket);

    if (ticket.vendeurId !== userId) {
      console.log(`Utilisateur ${userId} n'est pas le vendeur du ticket ${ticketId}`);
      return res.status(403).json({
        message: "Vous ne pouvez pas modifier un ticket qui ne vous appartient pas",
      });
    }

    if (ticket.estRevendu) {
      console.log(`Ticket ${ticketId} déjà vendu`);
      return res.status(400).json({
        message: "Vous ne pouvez pas modifier un ticket déjà vendu",
      });
    }

    await pool.execute("UPDATE ticket SET prix = ? WHERE id = ?", [prix, ticketId]);
    console.log(`Ticket ${ticketId} modifié avec succès`);

    res.status(200).json({
      message: "Ticket modifié avec succès",
      ticketId,
      prix,
    });
  } catch (error) {
    console.error("Erreur lors de la modification du ticket:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprimer un ticket
router.delete("/:id", protect, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;

    console.log(`Suppression du ticket ${ticketId} par l'utilisateur ${userId}`);

    const [ticketRows] = await pool.execute(
      "SELECT id, vendeurId, estRevendu FROM ticket WHERE id = ?",
      [ticketId]
    );

    if (ticketRows.length === 0) {
      console.log(`Ticket ${ticketId} non trouvé`);
      return res.status(404).json({ message: "Ticket non trouvé" });
    }

    const ticket = ticketRows[0];
    console.log('Ticket trouvé:', ticket);

    if (ticket.vendeurId !== userId) {
      console.log(`Utilisateur ${userId} n'est pas le vendeur du ticket ${ticketId}`);
      return res.status(403).json({
        message: "Vous ne pouvez pas supprimer un ticket qui ne vous appartient pas",
      });
    }

    if (ticket.estRevendu) {
      console.log(`Ticket ${ticketId} déjà vendu`);
      return res.status(400).json({
        message: "Vous ne pouvez pas supprimer un ticket déjà vendu",
      });
    }

    await pool.execute("DELETE FROM ticket WHERE id = ?", [ticketId]);
    console.log(`Ticket ${ticketId} supprimé avec succès`);

    res.status(200).json({ message: "Ticket supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du ticket:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;