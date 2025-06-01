const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Utiliser le middleware protect pour s'assurer que l'utilisateur est authentifié
router.use(protect);

// --- Gestion du Profil ---

// Récupérer le profil de l'utilisateur
router.get('/profile', async (req, res) => {
  try {
    const clientId = req.user.id;
    const [users] = await pool.execute(
      'SELECT id, nom, email, role, estBloque FROM utilisateur WHERE id = ?',
      [clientId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour le profil de l'utilisateur
router.put('/profile', async (req, res) => {
  try {
    const clientId = req.user.id;
    const { nom, email } = req.body;

    if (!nom || !email) {
      return res.status(400).json({ message: 'Le nom et l\'email sont requis' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const [existingUser] = await pool.execute(
      'SELECT id FROM utilisateur WHERE email = ? AND id != ?',
      [email, clientId]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    await pool.execute(
      'UPDATE utilisateur SET nom = ?, email = ? WHERE id = ?',
      [nom, email, clientId]
    );

    const [updatedUser] = await pool.execute(
      'SELECT id, nom, email, role, estBloque FROM utilisateur WHERE id = ?',
      [clientId]
    );

    // Mettre à jour le localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    localStorage.setItem('user', JSON.stringify({ ...storedUser, nom, email }));

    res.status(200).json(updatedUser[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour le mot de passe
router.put('/profile/password', async (req, res) => {
  try {
    const clientId = req.user.id;
    const { motDePasse } = req.body;

    if (!motDePasse || motDePasse.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    await pool.execute(
      'UPDATE utilisateur SET motDePasse = ? WHERE id = ?',
      [hashedPassword, clientId]
    );

    await pool.execute(
      'INSERT INTO notification (titre, contenu, type, estLue, date_creation, entite_id, entite_type) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
      [
        'Mot de passe modifié',
        `${req.user.nom} a modifié son mot de passe.`,
        'user',
        false,
        clientId,
        'utilisateur',
      ]
    );

    res.status(200).json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Demander la suppression du compte
router.post('/profile/delete-request', async (req, res) => {
  try {
    const clientId = req.user.id;

    const [userCheck] = await pool.execute(
      'SELECT id, estBloque FROM utilisateur WHERE id = ?',
      [clientId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (userCheck[0].estBloque) {
      return res.status(400).json({ message: 'Compte déjà bloqué, suppression impossible' });
    }

    await pool.execute(
      'INSERT INTO notification (titre, contenu, type, estLue, date_creation, entite_id, entite_type) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
      [
        'Demande de suppression de compte',
        `${req.user.nom} a demandé la suppression de son compte.`,
        'user',
        false,
        clientId,
        'utilisateur',
      ]
    );

    res.status(200).json({ message: 'Demande de suppression envoyée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la demande de suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- Gestion des Matchs ---

router.get('/matches', async (req, res) => {
  try {
    const [matches] = await pool.execute(
      `SELECT m.*, 
        (SELECT COUNT(*) FROM ticket t WHERE t.match_id = m.id AND t.estRevendu = 0) AS ticketsDisponibles,
        COALESCE(NULL, 0) AS capacite
       FROM matchs m
       ORDER BY m.date DESC`
    );

    res.status(200).json({ matches });
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/matches/:id', async (req, res) => {
  try {
    const matchId = req.params.id;

    const [matchDetails] = await pool.execute(
      `SELECT m.*, 
        (SELECT COUNT(*) FROM ticket t WHERE t.match_id = m.id AND t.estRevendu = 0) AS ticketsDisponibles,
        COALESCE(NULL, 0) AS capacite
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

    await pool.query('START TRANSACTION');

    try {
      for (let i = 0; i < quantity; i++) {
        const [ticketResult] = await pool.execute(
          'INSERT INTO ticket (match_id, prix, vendeurId, estRevendu) VALUES (?, ?, ?, ?)',
          [matchId, ticketPrice, clientId, false]
        );

        const ticketId = ticketResult.insertId;
        await pool.execute(
          'INSERT INTO historique_achat (client_id, ticket_id, date_achat) VALUES (?, ?, NOW())',
          [clientId, ticketId]
        );

        await pool.execute(
          'INSERT INTO paiement (montant, methode, client_id, ticket_id, date_paiement) VALUES (?, ?, ?, ?, NOW())',
          [ticketPrice, 'carte', clientId, ticketId]
        );

        await pool.execute(
          'INSERT INTO notification (titre, contenu, type, estLue, date_creation, entite_id, entite_type) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
          [
            'Achat de ticket',
            `${req.user.nom} a acheté un ticket pour le match ID ${matchId}.`,
            'ticket',
            false,
            ticketId,
            'ticket',
          ]
        );

        tickets.push({ id: ticketId, match_id: matchId, prix: ticketPrice });
      }

      await pool.query('COMMIT');
      res.status(200).json({ message: 'Tickets achetés avec succès', tickets });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de l\'achat des tickets:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- Gestion des Tickets ---

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

    await pool.query('START TRANSACTION');

    try {
      const [ticketResult] = await pool.execute(
        'INSERT INTO ticket (match_id, prix, vendeurId, estRevendu) VALUES (?, ?, ?, ?)',
        [matchId, prix, clientId, false]
      );

      await pool.execute(
        'INSERT INTO notification (titre, contenu, type, estLue, date_creation, entite_id, entite_type) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
        [
          'Nouveau ticket mis en vente',
          `${req.user.nom} a mis en vente un ticket pour le match ID ${matchId} au prix de ${prix}€.`,
          'ticket',
          false,
          ticketResult.insertId,
          'ticket',
        ]
      );

      await pool.query('COMMIT');
      res.status(201).json({
        message: 'Ticket mis en vente avec succès',
        ticket: { id: ticketResult.insertId, match_id: matchId, prix },
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la mise en vente du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/tickets/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;
    const clientId = req.user.id;

    const [ticketCheck] = await pool.execute(
      'SELECT vendeurId, estRevendu FROM ticket WHERE id = ?',
      [ticketId]
    );

    if (ticketCheck.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    if (ticketCheck[0].vendeurId !== clientId) {
      return res.status(403).json({ message: 'Non autorisé : vous n\'êtes pas le vendeur de ce ticket' });
    }

    if (ticketCheck[0].estRevendu) {
      return res.status(400).json({ message: 'Impossible de supprimer un ticket déjà vendu' });
    }

    await pool.query('START TRANSACTION');

    try {
      await pool.execute('DELETE FROM ticket WHERE id = ?', [ticketId]);

      await pool.execute(
        'INSERT INTO notification (titre, contenu, type, estLue, date_creation, entite_id, entite_type) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
        [
          'Suppression de ticket',
          `${req.user.nom} a supprimé un ticket (ID ${ticketId}).`,
          'ticket',
          false,
          ticketId,
          'ticket',
        ]
      );

      await pool.query('COMMIT');
      res.status(200).json({ message: 'Ticket supprimé avec succès' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/tickets/purchased', async (req, res) => {
  try {
    const clientId = req.user.id;

    const [tickets] = await pool.execute(
      `SELECT t.id, t.prix, t.estRevendu AS estVendu, ha.date_achat AS dateAchat, 
              m.id AS match_id, m.equipe1, m.equipe2, m.lieu, m.date,
              u.nom AS vendeur_nom
       FROM historique_achat ha
       JOIN ticket t ON ha.ticket_id = t.id
       JOIN matchs m ON t.match_id = m.id
       LEFT JOIN utilisateur u ON t.vendeurId = u.id
       WHERE ha.client_id = ?
       ORDER BY ha.date_achat DESC`,
      [clientId]
    );

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets achetés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get('/tickets/selling', async (req, res) => {
  try {
    const clientId = req.user.id;

    const [tickets] = await pool.execute(
      `SELECT t.id, t.prix, t.estRevendu AS estVendu,
              m.id AS match_id, m.equipe1, m.equipe2, m.lieu, m.date
       FROM ticket t
       JOIN matchs m ON t.match_id = m.id
       WHERE t.vendeurId = ?
       ORDER BY t.id DESC`,
      [clientId]
    );

    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets en vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- Gestion des Paiements ---

router.get('/payments', async (req, res) => {
  try {
    const clientId = req.user.id;

    const [payments] = await pool.execute(
      `SELECT p.id, p.montant, p.methode, p.date_paiement,
              m.equipe1, m.equipe2
       FROM paiement p
       JOIN ticket t ON p.ticket_id = t.id
       JOIN matchs m ON t.match_id = m.id
       WHERE p.client_id = ?
       ORDER BY p.date_paiement DESC`,
      [clientId]
    );

    res.status(200).json({ payments });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;