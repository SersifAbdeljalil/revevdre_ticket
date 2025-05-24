const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Utiliser le middleware protect pour s'assurer que l'utilisateur est authentifié
router.use(protect);

// --- GESTION DES MATCHS (unchanged) ---

// Récupérer tous les matchs
router.get('/matches', async (req, res) => {
  try {
    const [matches] = await pool.execute(
      `SELECT m.*, 
        (SELECT COUNT(*) FROM ticket t WHERE t.match_id = m.id) AS ticketsVendus,
        COALESCE(NULL, 0) as capacite
       FROM matchs m
       ORDER BY m.date DESC`
    );

    res.status(200).json({ matches });
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les détails d'un match spécifique
router.get('/matches/:id', async (req, res) => {
  try {
    const matchId = req.params.id;

    const [matchDetails] = await pool.execute(
      `SELECT m.*, 
        (SELECT COUNT(*) FROM ticket t WHERE t.match_id = m.id) AS ticketsVendus,
        COALESCE(NULL, 0) as capacite
       FROM matchs m
       WHERE m.id = ?`,
      [matchId]
    );

    if (matchDetails.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    res.status(200).json({ match: matchDetails[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du match:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Acheter un ticket pour un match
router.post('/matches/:id/buy', async (req, res) => {
  try {
    const matchId = req.params.id;
    const { quantity } = req.body;
    const clientId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantité invalide' });
    }

    const [matchCheck] = await pool.execute(
      'SELECT id, date FROM matchs WHERE id = ?',
      [matchId]
    );

    if (matchCheck.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    const matchDate = new Date(matchCheck[0].date);
    const now = new Date();
    if (matchDate < now) {
      return res.status(400).json({ message: 'Impossible d\'acheter des tickets pour un match passé' });
    }

    const ticketPrice = 5000; // Prix arbitraire, à ajuster
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const [ticketResult] = await pool.execute(
        'INSERT INTO ticket (match_id, prix, vendeur_id) VALUES (?, ?, ?)',
        [matchId, ticketPrice, clientId]
      );

      const ticketId = ticketResult.insertId;
      await pool.execute(
        'INSERT INTO historique_achat (client_id, ticket_id, date_achat) VALUES (?, ?, NOW())',
        [clientId, ticketId]
      );

      tickets.push({ id: ticketId, match_id: matchId, prix: ticketPrice });
    }

    res.status(200).json({ message: 'Tickets achetés avec succès', tickets });
  } catch (error) {
    console.error('Erreur lors de l\'achat des tickets:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- GESTION DES TICKETS ---

// Ajouter un ticket à vendre
router.post('/tickets/sell', async (req, res) => {
  try {
    const { matchId, prix } = req.body;
    const clientId = req.user.id;

    if (!matchId || !prix || prix <= 0) {
      return res.status(400).json({ message: 'Match et prix requis, prix doit être supérieur à 0' });
    }

    const [matchCheck] = await pool.execute(
      'SELECT id, date FROM matchs WHERE id = ?',
      [matchId]
    );

    if (matchCheck.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    const matchDate = new Date(matchCheck[0].date);
    const now = new Date();
    if (matchDate < now) {
      return res.status(400).json({ message: 'Impossible de vendre des tickets pour un match passé' });
    }

    const [ticketResult] = await pool.execute(
      'INSERT INTO ticket (match_id, prix, vendeur_id, estVendu) VALUES (?, ?, ?, ?)',
      [matchId, prix, clientId, false]
    );

    res.status(201).json({
      message: 'Ticket mis en vente avec succès',
      ticket: { id: ticketResult.insertId, match_id: matchId, prix }
    });
  } catch (error) {
    console.error('Erreur lors de la mise en vente du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les tickets achetés par le client
router.get('/tickets/purchased', async (req, res) => {
  try {
    const clientId = req.user.id;

    const [tickets] = await pool.execute(
      `SELECT t.id, t.prix, t.estVendu, ha.date_achat as dateAchat, 
              m.id as match_id, m.equipe1, m.equipe2, m.lieu, m.date,
              u.nom as vendeur_nom
       FROM historique_achat ha
       JOIN ticket t ON ha.ticket_id = t.id
       JOIN matchs m ON t.match_id = m.id
       LEFT JOIN utilisateur u ON t.vendeur_id = u.id
       WHERE ha.client_id = ?`,
      [clientId]
    );

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets achetés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les tickets mis en vente par le client
router.get('/tickets/selling', async (req, res) => {
  try {
    const clientId = req.user.id;

    const [tickets] = await pool.execute(
      `SELECT t.id, t.prix, t.estVendu,
              m.id as match_id, m.equipe1, m.equipe2, m.lieu, m.date
       FROM ticket t
       JOIN matchs m ON t.match_id = m.id
       WHERE t.vendeur_id = ?`,
      [clientId]
    );

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets en vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;