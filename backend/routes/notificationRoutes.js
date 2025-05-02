// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Middleware administrateur spécifique pour cette route
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'administrateur') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, droits administrateur requis' });
  }
};

// Récupérer toutes les notifications (admin seulement)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const [notifications] = await pool.execute(`
      SELECT * FROM notification
      ORDER BY date_creation DESC
    `);
    
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer le nombre de notifications non lues
router.get('/unread-count', protect, adminOnly, async (req, res) => {
  try {
    const [result] = await pool.execute(`
      SELECT COUNT(*) as count FROM notification
      WHERE estLue = 0
    `);
    
    res.status(200).json({ count: result[0].count });
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer une notification comme lue
router.put('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    await pool.execute(`
      UPDATE notification
      SET estLue = 1
      WHERE id = ?
    `, [notificationId]);
    
    res.status(200).json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer toutes les notifications comme lues
router.put('/read-all', protect, adminOnly, async (req, res) => {
  try {
    await pool.execute(`
      UPDATE notification
      SET estLue = 1
      WHERE estLue = 0
    `);
    
    res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une notification
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    await pool.execute(`
      DELETE FROM notification
      WHERE id = ?
    `, [notificationId]);
    
    res.status(200).json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;