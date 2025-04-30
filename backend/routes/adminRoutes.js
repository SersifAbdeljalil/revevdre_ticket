// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Middleware pour vérifier que l'utilisateur est admin
router.use(protect, adminOnly);

// --- GESTION DES UTILISATEURS ---

// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, nom, email, role, estBloque, DATE(CURRENT_TIMESTAMP) as dateCreation FROM utilisateur'
    );
    
    res.status(200).json({ users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les détails d'un utilisateur
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [userRows] = await pool.execute(
      'SELECT id, nom, email, role, estBloque, DATE(CURRENT_TIMESTAMP) as dateCreation FROM utilisateur WHERE id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Si c'est un client, récupérer ses achats
    let achats = [];
    if (userRows[0].role === 'client') {
      const [achatsRows] = await pool.execute(
        `SELECT t.id, t.prix, ha.date_achat as dateAchat, m.equipe1, m.equipe2, m.lieu, m.date 
         FROM historique_achat ha
         JOIN ticket t ON ha.ticket_id = t.id 
         JOIN matchs m ON t.match_id = m.id 
         WHERE ha.client_id = ?`,
        [userId]
      );
      achats = achatsRows;
    }
    
    res.status(200).json({ 
      user: userRows[0],
      achats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Bloquer/débloquer un utilisateur
router.put('/users/:id/block', async (req, res) => {
  try {
    const userId = req.params.id;
    const { estBloque } = req.body;
    
    // Vérifier que l'utilisateur existe
    const [userCheck] = await pool.execute(
      'SELECT id FROM utilisateur WHERE id = ?',
      [userId]
    );
    
    if (userCheck.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Bloquer/débloquer l'utilisateur
    await pool.execute(
      'UPDATE utilisateur SET estBloque = ? WHERE id = ?',
      [estBloque, userId]
    );
    
    res.status(200).json({ 
      message: estBloque 
        ? 'Utilisateur bloqué avec succès' 
        : 'Utilisateur débloqué avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du blocage/déblocage de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- GESTION DES MATCHS ---

// Récupérer tous les matchs
router.get('/matches', async (req, res) => {
  try {
    // Pour adapter le code à votre structure de base de données
    // On utilise "matchs" au lieu de "match" et on ajoute capacite avec COALESCE
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

// Ajouter un match
router.post('/matches', async (req, res) => {
  try {
    const { date, lieu, equipe1, equipe2 } = req.body;
    // On ignore capacite car il n'existe pas dans votre structure
    
    // Validation des données
    if (!date || !lieu || !equipe1 || !equipe2) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    // Insérer le match dans la base de données
    const [result] = await pool.execute(
      'INSERT INTO matchs (date, lieu, equipe1, equipe2) VALUES (?, ?, ?, ?)',
      [date, lieu, equipe1, equipe2]
    );
    
    res.status(201).json({
      message: 'Match ajouté avec succès',
      match: {
        id: result.insertId,
        date,
        lieu,
        equipe1,
        equipe2
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du match:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer un match
router.delete('/matches/:id', async (req, res) => {
  try {
    const matchId = req.params.id;
    
    // Vérifier que le match existe
    const [matchCheck] = await pool.execute(
      'SELECT id FROM matchs WHERE id = ?',
      [matchId]
    );
    
    if (matchCheck.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }
    
    // Vérifier s'il y a des tickets vendus
    const [ticketsCheck] = await pool.execute(
      'SELECT COUNT(*) as count FROM ticket WHERE match_id = ?',
      [matchId]
    );
    
    if (ticketsCheck[0].count > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer un match avec des tickets vendus'
      });
    }
    
    // Supprimer le match
    await pool.execute(
      'DELETE FROM matchs WHERE id = ?',
      [matchId]
    );
    
    res.status(200).json({ message: 'Match supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du match:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour un match
router.put('/matches/:id', async (req, res) => {
  try {
    const matchId = req.params.id;
    const { date, lieu, equipe1, equipe2 } = req.body;
    
    // Validation des données
    if (!date || !lieu || !equipe1 || !equipe2) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }
    
    // Vérifier que le match existe
    const [matchCheck] = await pool.execute(
      'SELECT id FROM matchs WHERE id = ?',
      [matchId]
    );
    
    if (matchCheck.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }
    
    // Mettre à jour le match
    await pool.execute(
      'UPDATE matchs SET date = ?, lieu = ?, equipe1 = ?, equipe2 = ? WHERE id = ?',
      [date, lieu, equipe1, equipe2, matchId]
    );
    
    res.status(200).json({
      message: 'Match mis à jour avec succès',
      match: {
        id: parseInt(matchId),
        date,
        lieu,
        equipe1,
        equipe2
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du match:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- STATISTIQUES ---

// Obtenir les statistiques du tableau de bord
router.get('/stats/dashboard', async (req, res) => {
  try {
    // Nombre total d'utilisateurs
    const [userCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM utilisateur WHERE role = "client"'
    );
    
    // Nombre total de tickets vendus
    const [ticketCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM ticket'
    );
    
    // Revenus totaux
    const [revenue] = await pool.execute(
      'SELECT SUM(prix) as total FROM ticket'
    );
    
    // Matchs à venir
    const [upcomingMatches] = await pool.execute(
      `SELECT m.id, m.date, m.equipe1, m.equipe2, m.lieu,
        (SELECT COUNT(*) FROM ticket t WHERE t.match_id = m.id) AS ticketsVendus
       FROM matchs m
       WHERE m.date > NOW()
       ORDER BY m.date
       LIMIT 5`
    );
    
    res.status(200).json({
      userCount: userCount[0].count,
      ticketCount: ticketCount[0].count,
      revenue: revenue[0].total || 0,
      upcomingMatches
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les statistiques de vente par match
router.get('/stats/matches/:id/sales', async (req, res) => {
  try {
    const matchId = req.params.id;
    
    // Vérifier que le match existe
    const [matchDetails] = await pool.execute(
      'SELECT * FROM matchs WHERE id = ?',
      [matchId]
    );
    
    if (matchDetails.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }
    
    // Récupérer les statistiques de vente
    const [ticketsSold] = await pool.execute(
      'SELECT COUNT(*) as count, SUM(prix) as revenue FROM ticket WHERE match_id = ?',
      [matchId]
    );
    
    // Comme capacite n'existe pas dans la base de données, on utilise une valeur arbitraire
    // pour calculer le taux de remplissage
    const estimatedCapacity = 60000; // Valeur arbitraire pour un stade
    const fillRate = (ticketsSold[0].count / estimatedCapacity) * 100;
    
    res.status(200).json({
      match: {
        ...matchDetails[0],
        capacite: estimatedCapacity // Ajouter capacité manuellement
      },
      sales: {
        ticketsSold: ticketsSold[0].count,
        revenue: ticketsSold[0].revenue || 0,
        fillRate: fillRate.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;