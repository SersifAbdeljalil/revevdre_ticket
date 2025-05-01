// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Récupérer tous les clients (avec plus de détails)
router.get('/clients', protect, adminOnly, async (req, res) => {
  try {
    const [clients] = await pool.execute(`
      SELECT 
        c.id, 
        u.nom, 
        u.email, 
        u.role,
        u.estBloque,
        COUNT(t.id) as nombreTickets,
        COALESCE(SUM(t.prix), 0) as montantTotal
      FROM client c
      JOIN utilisateur u ON c.id = u.id
      LEFT JOIN historique_achat ha ON c.id = ha.client_id
      LEFT JOIN ticket t ON ha.ticket_id = t.id
      GROUP BY c.id, u.nom, u.email, u.role, u.estBloque
      ORDER BY u.nom
    `);
    
    const formattedClients = clients.map(client => ({
      id: client.id,
      nom: client.nom,
      email: client.email,
      role: client.role,
      estBloque: client.estBloque === 1,
      nombreTickets: client.nombreTickets,
      montantTotal: parseFloat(client.montantTotal)
    }));
    
    res.status(200).json({ clients: formattedClients });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Récupérer les détails d'un client spécifique
router.get('/clients/:id', protect, adminOnly, async (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Récupérer les informations du client
    const [clientRows] = await pool.execute(`
      SELECT 
        c.id, 
        u.nom, 
        u.email, 
        u.role,
        u.estBloque,
        COUNT(t.id) as nombreTickets,
        COALESCE(SUM(t.prix), 0) as montantTotal
      FROM client c
      JOIN utilisateur u ON c.id = u.id
      LEFT JOIN historique_achat ha ON c.id = ha.client_id
      LEFT JOIN ticket t ON ha.ticket_id = t.id
      WHERE c.id = ?
      GROUP BY c.id, u.nom, u.email, u.role, u.estBloque
    `, [clientId]);
    
    if (clientRows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    // Récupérer l'historique des achats
    const [achats] = await pool.execute(`
      SELECT 
        t.id as ticketId, 
        t.prix, 
        ha.date_achat as dateAchat, 
        m.equipe1, 
        m.equipe2, 
        m.lieu, 
        m.date as dateMatch
      FROM historique_achat ha
      JOIN ticket t ON ha.ticket_id = t.id 
      JOIN matchs m ON t.match_id = m.id 
      WHERE ha.client_id = ?
      ORDER BY ha.date_achat DESC
    `, [clientId]);
    
    const client = clientRows[0];
    
    res.status(200).json({ 
      client: {
        id: client.id,
        nom: client.nom,
        email: client.email,
        role: client.role,
        estBloque: client.estBloque === 1,
        nombreTickets: client.nombreTickets,
        montantTotal: parseFloat(client.montantTotal)
      },
      achats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du client:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Créer un nouveau client
router.post('/clients', protect, adminOnly, async (req, res) => {
  try {
    const { nom, email, motDePasse, role = 'client' } = req.body;
    
    // Validation des données
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    // Vérifier si l'email existe déjà
    const [existingUser] = await pool.execute(
      'SELECT id FROM utilisateur WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);
    
    // Début de transaction
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insérer l'utilisateur
      const [userResult] = await connection.execute(
        'INSERT INTO utilisateur (nom, email, motDePasse, role, estBloque) VALUES (?, ?, ?, ?, 0)',
        [nom, email, hashedPassword, role]
      );
      
      const userId = userResult.insertId;
      
      // Insérer dans la table client
      if (role === 'client') {
        await connection.execute('INSERT INTO client (id) VALUES (?)', [userId]);
      }
      
      // Valider la transaction
      await connection.commit();
      
      res.status(201).json({
        message: 'Client créé avec succès',
        client: {
          id: userId,
          nom,
          email,
          role,
          estBloque: false
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
    console.error('Erreur lors de la création du client:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Mettre à jour un client
router.put('/clients/:id', protect, adminOnly, async (req, res) => {
  try {
    const clientId = req.params.id;
    const { nom, email, role } = req.body;
    
    // Validation des données
    if (!nom || !email) {
      return res.status(400).json({ message: 'Nom et email sont requis' });
    }
    
    // Vérifier que le client existe
    const [clientCheck] = await pool.execute(
      'SELECT id FROM utilisateur WHERE id = ?',
      [clientId]
    );
    
    if (clientCheck.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    // Mettre à jour le client
    await pool.execute(
      'UPDATE utilisateur SET nom = ?, email = ?, role = ? WHERE id = ?',
      [nom, email, role || 'client', clientId]
    );
    
    res.status(200).json({
      message: 'Client mis à jour avec succès',
      client: {
        id: clientId,
        nom,
        email,
        role: role || 'client'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Bloquer/débloquer un client
router.put('/clients/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const clientId = req.params.id;
    const { estBloque } = req.body;
    
    // Vérifier que le client existe
    const [clientCheck] = await pool.execute(
      'SELECT id FROM utilisateur WHERE id = ?',
      [clientId]
    );
    
    if (clientCheck.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    // Bloquer/débloquer le client
    await pool.execute(
      'UPDATE utilisateur SET estBloque = ? WHERE id = ?',
      [estBloque ? 1 : 0, clientId]
    );
    
    res.status(200).json({ 
      message: estBloque 
        ? 'Client bloqué avec succès' 
        : 'Client débloqué avec succès',
      estBloque: estBloque ? 1 : 0
    });
  } catch (error) {
    console.error('Erreur lors du blocage/déblocage du client:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Supprimer un client
router.delete('/clients/:id', protect, adminOnly, async (req, res) => {
  try {
    const clientId = req.params.id;
    
    // Vérifier que le client existe et n'a pas d'achats
    const [ticketCheck] = await pool.execute(
      'SELECT COUNT(*) as count FROM historique_achat WHERE client_id = ?',
      [clientId]
    );
    
    if (ticketCheck[0].count > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer un client ayant des achats' 
      });
    }
    
    // Supprimer le client
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Supprimer de la table client
      await connection.execute('DELETE FROM client WHERE id = ?', [clientId]);
      
      // Supprimer de la table utilisateur
      await connection.execute('DELETE FROM utilisateur WHERE id = ?', [clientId]);
      
      await connection.commit();
      
      res.status(200).json({ message: 'Client supprimé avec succès' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;