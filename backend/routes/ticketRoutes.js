// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Récupérer tous les tickets disponibles à la vente
router.get('/', async (req, res) => {
  try {
    // On peut filtrer par différents critères
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
    
    // Ajouter les filtres si présents
    if (matchId) {
      query += ' AND t.match_id = ?';
      queryParams.push(matchId);
    }
    
    if (status === 'available') {
      query += ' AND t.estRevendu = 0';
    } else if (status === 'sold') {
      query += ' AND t.estRevendu = 1';
    }
    
    if (minPrice) {
      query += ' AND t.prix >= ?';
      queryParams.push(minPrice);
    }
    
    if (maxPrice) {
      query += ' AND t.prix <= ?';
      queryParams.push(maxPrice);
    }
    
    // Tri par date du match puis par prix
    query += ' ORDER BY m.date ASC, t.prix ASC';
    
    const [tickets] = await pool.execute(query, queryParams);
    
    // Restructurer les données pour le format souhaité
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      prix: ticket.prix,
      estVendu: Boolean(ticket.estRevendu), // Adapter le nom pour la cohérence frontend
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail
      }
    }));
    
    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// IMPORTANT: Routes spécifiques AVANT les routes paramétriques /:id

// Récupérer les tickets mis en vente par l'utilisateur connecté
router.get('/my-sales', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [tickets] = await pool.execute(`
      SELECT 
        t.id, t.prix, t.estRevendu,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      WHERE t.vendeurId = ?
      ORDER BY t.estRevendu ASC, m.date ASC
    `, [userId]);
    
    // Formatage des tickets
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      prix: ticket.prix,
      estVendu: Boolean(ticket.estRevendu), // Adapter le nom pour la cohérence frontend
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2
      }
    }));
    
    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets mis en vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les tickets achetés par l'utilisateur connecté
router.get('/my-purchases', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [tickets] = await pool.execute(`
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
    `, [userId]);
    
    // Formatage des tickets
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      prix: ticket.prix,
      estVendu: true, // Ils ont déjà été achetés
      dateAchat: ticket.dateAchat,
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail
      }
    }));
    
    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets achetés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// MAINTENANT les routes paramétriques /:id qui pourraient intercepter /my-sales ou /my-purchases

// Récupérer un ticket spécifique par son ID
router.get('/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    const [tickets] = await pool.execute(`
      SELECT 
        t.id, t.prix, t.estRevendu,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE t.id = ?
    `, [ticketId]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    const ticket = tickets[0];
    
    // Formater la réponse
    const formattedTicket = {
      id: ticket.id,
      prix: ticket.prix,
      estVendu: Boolean(ticket.estRevendu), // Adapter le nom pour la cohérence frontend
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail
      }
    };
    
    res.status(200).json({ ticket: formattedTicket });
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouveau ticket à vendre (nécessite d'être connecté)
router.post('/', protect, async (req, res) => {
  try {
    const { prix, matchId } = req.body;
    const vendeurId = req.user.id;
    
    // Validation
    if (!prix || !matchId) {
      return res.status(400).json({ message: 'Le prix et l\'ID du match sont requis' });
    }
    
    // Vérifier que le match existe
    const [matchRows] = await pool.execute('SELECT id FROM matchs WHERE id = ?', [matchId]);
    if (matchRows.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }
    
    // Insérer le ticket (adapter à votre structure de base de données)
    const [result] = await pool.execute(
      'INSERT INTO ticket (prix, match_id, vendeurId, estRevendu) VALUES (?, ?, ?, 0)',
      [prix, matchId, vendeurId]
    );
    
    // Récupérer le ticket créé
    const [newTicket] = await pool.execute(`
      SELECT 
        t.id, t.prix, t.estRevendu,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE t.id = ?
    `, [result.insertId]);
    
    const ticket = newTicket[0];
    
    // Formater la réponse
    const formattedTicket = {
      id: ticket.id,
      prix: ticket.prix,
      estVendu: Boolean(ticket.estRevendu), // Adapter le nom pour la cohérence frontend
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail
      }
    };
    
    res.status(201).json({ 
      message: 'Ticket mis en vente avec succès',
      ticket: formattedTicket
    });
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Acheter un ticket (nécessite d'être connecté)
router.post('/:id/purchase', protect, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const acheteurId = req.user.id;
    const { methode } = req.body;
    
    // Vérifier que le ticket existe et n'est pas déjà vendu
    const [ticketRows] = await pool.execute(
      'SELECT id, prix, vendeurId, estRevendu FROM ticket WHERE id = ?',
      [ticketId]
    );
    
    if (ticketRows.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    const ticket = ticketRows[0];
    
    if (ticket.estRevendu) {
      return res.status(400).json({ message: 'Ce ticket a déjà été vendu' });
    }
    
    if (ticket.vendeurId === acheteurId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas acheter votre propre ticket' });
    }
    
    // Commencer une transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Marquer le ticket comme vendu
      await connection.execute(
        'UPDATE ticket SET estRevendu = 1 WHERE id = ?',
        [ticketId]
      );
      
      // Créer l'enregistrement de paiement
      await connection.execute(
        'INSERT INTO paiement (montant, methode, client_id, ticket_id) VALUES (?, ?, ?, ?)',
        [ticket.prix, methode || 'carte', acheteurId, ticketId]
      );
      
      // Ajouter à l'historique d'achat
      await connection.execute(
        'INSERT INTO historique_achat (client_id, ticket_id) VALUES (?, ?)',
        [acheteurId, ticketId]
      );
      
      // Valider la transaction
      await connection.commit();
      
      res.status(200).json({ 
        message: 'Ticket acheté avec succès',
        ticketId
      });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'achat du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Modifier un ticket (seulement par le vendeur)
router.put('/:id', protect, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { prix } = req.body;
    const userId = req.user.id;
    
    // Vérifier que le ticket existe et appartient bien à l'utilisateur
    const [ticketRows] = await pool.execute(
      'SELECT id, vendeurId, estRevendu FROM ticket WHERE id = ?',
      [ticketId]
    );
    
    if (ticketRows.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    const ticket = ticketRows[0];
    
    if (ticket.vendeurId !== userId) {
      return res.status(403).json({ message: 'Vous ne pouvez pas modifier un ticket qui ne vous appartient pas' });
    }
    
    if (ticket.estRevendu) {
      return res.status(400).json({ message: 'Vous ne pouvez pas modifier un ticket déjà vendu' });
    }
    
    // Modifier le ticket
    await pool.execute(
      'UPDATE ticket SET prix = ? WHERE id = ?',
      [prix, ticketId]
    );
    
    res.status(200).json({ 
      message: 'Ticket modifié avec succès',
      ticketId,
      prix
    });
  } catch (error) {
    console.error('Erreur lors de la modification du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un ticket (seulement par le vendeur)
router.delete('/:id', protect, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;
    
    // Vérifier que le ticket existe et appartient bien à l'utilisateur
    const [ticketRows] = await pool.execute(
      'SELECT id, vendeurId, estRevendu FROM ticket WHERE id = ?',
      [ticketId]
    );
    
    if (ticketRows.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    const ticket = ticketRows[0];
    
    if (ticket.vendeurId !== userId) {
      return res.status(403).json({ message: 'Vous ne pouvez pas supprimer un ticket qui ne vous appartient pas' });
    }
    
    if (ticket.estRevendu) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer un ticket déjà vendu' });
    }
    
    // Supprimer le ticket
    await pool.execute('DELETE FROM ticket WHERE id = ?', [ticketId]);
    
    res.status(200).json({ message: 'Ticket supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;