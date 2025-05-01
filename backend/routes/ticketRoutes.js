// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Middleware pour vérifier que l'utilisateur est admin
router.use(protect, adminOnly);

// --- GESTION DES TICKETS ---

// Récupérer tous les tickets
router.get('/tickets', async (req, res) => {
  try {
    // Modifié pour ajouter client_id dans la table ticket
    const [tickets] = await pool.execute(`
      SELECT t.*, 
        m.equipe1, m.equipe2, m.lieu, m.date as matchDate,
        u.nom as clientNom, u.email as clientEmail
      FROM ticket t
      LEFT JOIN matchs m ON t.match_id = m.id
      LEFT JOIN historique_achat ha ON t.id = ha.ticket_id
      LEFT JOIN client c ON ha.client_id = c.id
      LEFT JOIN utilisateur u ON c.id = u.id
      ORDER BY t.id DESC
    `);
    
    // Formatage des données pour le frontend
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: ticket.estRevendu === 1,
      dateAchat: ticket.date_achat || new Date(),
      matchId: ticket.match_id,
      clientId: ticket.client_id,
      match: {
        id: ticket.match_id,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
        lieu: ticket.lieu,
        date: ticket.matchDate
      },
      client: ticket.clientNom ? {
        id: ticket.client_id,
        nom: ticket.clientNom,
        email: ticket.clientEmail
      } : null
    }));
    
    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer un ticket par son ID
router.get('/tickets/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    const [tickets] = await pool.execute(`
      SELECT t.*, 
        m.equipe1, m.equipe2, m.lieu, m.date as matchDate,
        u.nom as clientNom, u.email as clientEmail,
        p.montant as paiementMontant, p.methode as paiementMethode, p.date as paiementDate,
        ha.client_id, ha.date_achat
      FROM ticket t
      LEFT JOIN matchs m ON t.match_id = m.id
      LEFT JOIN historique_achat ha ON t.id = ha.ticket_id
      LEFT JOIN client c ON ha.client_id = c.id
      LEFT JOIN utilisateur u ON c.id = u.id
      LEFT JOIN paiement p ON p.ticket_id = t.id
      WHERE t.id = ?
    `, [ticketId]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    const ticket = tickets[0];
    
    // Formatage des données pour le frontend
    const formattedTicket = {
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: ticket.estRevendu === 1,
      dateAchat: ticket.date_achat || ticket.date_achat || new Date(),
      matchId: ticket.match_id,
      clientId: ticket.client_id,
      match: {
        id: ticket.match_id,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
        lieu: ticket.lieu,
        date: ticket.matchDate
      },
      client: ticket.clientNom ? {
        id: ticket.client_id,
        nom: ticket.clientNom,
        email: ticket.clientEmail
      } : null,
      paiement: ticket.paiementMontant ? {
        montant: ticket.paiementMontant,
        methode: ticket.paiementMethode,
        date: ticket.paiementDate
      } : null
    };
    
    res.status(200).json({ ticket: formattedTicket });
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter un nouveau ticket
router.post('/tickets', async (req, res) => {
  try {
    const { matchId, clientId, prix, estRevendu = false } = req.body;
    
    // Validation des données
    if (!matchId || !clientId || !prix) {
      return res.status(400).json({ message: 'Les champs matchId, clientId et prix sont requis' });
    }
    
    // Vérifier que le match existe
    const [matchCheck] = await pool.execute(
      'SELECT id FROM matchs WHERE id = ?',
      [matchId]
    );
    
    if (matchCheck.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }
    
    // Vérifier que le client existe
    const [clientCheck] = await pool.execute(
      'SELECT id FROM client WHERE id = ?',
      [clientId]
    );
    
    if (clientCheck.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    // Début de transaction pour assurer l'intégrité des données
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insérer le ticket - Notez que nous n'incluons pas client_id car il n'existe pas dans la table ticket
      const [ticketResult] = await connection.execute(
        'INSERT INTO ticket (prix, estRevendu, match_id) VALUES (?, ?, ?)',
        [prix, estRevendu ? 1 : 0, matchId]
      );
      
      const ticketId = ticketResult.insertId;
      
      // Créer une entrée dans l'historique des achats
      await connection.execute(
        'INSERT INTO historique_achat (client_id, ticket_id, date_achat) VALUES (?, ?, NOW())',
        [clientId, ticketId]
      );
      
      // Créer un enregistrement de paiement
      await connection.execute(
        'INSERT INTO paiement (montant, date, methode, client_id, ticket_id) VALUES (?, NOW(), ?, ?, ?)',
        [prix, 'Carte bancaire', clientId, ticketId]
      );
      
      // Valider la transaction
      await connection.commit();
      
      res.status(201).json({
        message: 'Ticket créé avec succès',
        ticket: {
          id: ticketId,
          prix,
          estRevendu,
          matchId,
          clientId,
          dateAchat: new Date()
        }
      });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un ticket
router.put('/tickets/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { matchId, clientId, prix, estRevendu } = req.body;
    
    // Validation des données
    if (!matchId || !clientId || prix === undefined) {
      return res.status(400).json({ message: 'Les champs matchId, clientId et prix sont requis' });
    }
    
    // Vérifier que le ticket existe
    const [ticketCheck] = await pool.execute(
      'SELECT id FROM ticket WHERE id = ?',
      [ticketId]
    );
    
    if (ticketCheck.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Début de transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Mettre à jour le ticket
      await connection.execute(
        'UPDATE ticket SET prix = ?, estRevendu = ?, match_id = ? WHERE id = ?',
        [prix, estRevendu ? 1 : 0, matchId, ticketId]
      );
      
      // Mettre à jour l'historique_achat pour le client
      // D'abord, vérifier s'il existe déjà une entrée
      const [historyCheck] = await connection.execute(
        'SELECT client_id FROM historique_achat WHERE ticket_id = ?',
        [ticketId]
      );
      
      if (historyCheck.length > 0) {
        // Supprimer l'ancienne entrée
        await connection.execute(
          'DELETE FROM historique_achat WHERE ticket_id = ?',
          [ticketId]
        );
      }
      
      // Insérer la nouvelle entrée
      await connection.execute(
        'INSERT INTO historique_achat (client_id, ticket_id, date_achat) VALUES (?, ?, NOW())',
        [clientId, ticketId]
      );
      
      // Valider la transaction
      await connection.commit();
      
      res.status(200).json({
        message: 'Ticket mis à jour avec succès',
        ticket: {
          id: parseInt(ticketId),
          prix,
          estRevendu,
          matchId,
          clientId
        }
      });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un ticket
router.delete('/tickets/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Vérifier que le ticket existe
    const [ticketCheck] = await pool.execute(
      'SELECT id FROM ticket WHERE id = ?',
      [ticketId]
    );
    
    if (ticketCheck.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    // Supprimer les références dans d'autres tables
    await pool.execute('DELETE FROM historique_achat WHERE ticket_id = ?', [ticketId]);
    await pool.execute('DELETE FROM paiement WHERE ticket_id = ?', [ticketId]);
    
    // Supprimer le ticket
    await pool.execute('DELETE FROM ticket WHERE id = ?', [ticketId]);
    
    res.status(200).json({ message: 'Ticket supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Renvoyer un ticket par email
router.post('/tickets/:id/resend', async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Vérifier que le ticket existe
    const [ticketCheck] = await pool.execute(
      'SELECT t.id, t.prix, t.estRevendu, t.match_id, ha.client_id, u.email as clientEmail, m.equipe1, m.equipe2, m.date as matchDate, m.lieu ' +
      'FROM ticket t ' +
      'JOIN historique_achat ha ON t.id = ha.ticket_id ' +
      'JOIN client c ON ha.client_id = c.id ' +
      'JOIN utilisateur u ON c.id = u.id ' +
      'JOIN matchs m ON t.match_id = m.id ' +
      'WHERE t.id = ?',
      [ticketId]
    );
    
    if (ticketCheck.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    const ticket = ticketCheck[0];
    
    // Ici, vous intégreriez l'envoi d'email
    // Comme c'est une démonstration, on simule juste l'action réussie
    
    console.log(`Email envoyé à ${ticket.clientEmail} avec les détails du ticket #${ticketId} pour le match ${ticket.equipe1} vs ${ticket.equipe2}`);
    
    res.status(200).json({ 
      message: 'Ticket renvoyé par email avec succès',
      emailSent: true,
      emailAddress: ticket.clientEmail
    });
  } catch (error) {
    console.error('Erreur lors du renvoi du ticket par email:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Valider un ticket (pour entrée au stade)
router.post('/tickets/:id/validate', async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Vérifier que le ticket existe et n'est pas revendu
    const [ticketCheck] = await pool.execute(
      'SELECT id, estRevendu FROM ticket WHERE id = ?',
      [ticketId]
    );
    
    if (ticketCheck.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }
    
    if (ticketCheck[0].estRevendu === 1) {
      return res.status(400).json({ message: 'Ce ticket a été revendu et n\'est pas valide' });
    }
    
    // Ici vous pourriez enregistrer l'utilisation du ticket dans une table dédiée
    // Pour cette démonstration, nous allons simplement simuler une validation réussie
    
    res.status(200).json({ 
      message: 'Ticket validé avec succès pour l\'entrée au stade',
      validated: true,
      ticketId
    });
  } catch (error) {
    console.error('Erreur lors de la validation du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les clients (pour la création de tickets)
router.get('/clients', async (req, res) => {
  try {
    const [clients] = await pool.execute(`
      SELECT c.id, u.nom, u.email, u.estBloque
      FROM client c
      JOIN utilisateur u ON c.id = u.id
      ORDER BY u.nom
    `);
    
    res.status(200).json({ clients });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;