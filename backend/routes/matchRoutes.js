// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/matches', async (req, res) => {
  try {
    const [matches] = await pool.execute(
      `SELECT m.*,
        (SELECT COUNT(*) FROM ticket t WHERE t.match_id = m.id) AS ticketsVendus
       FROM matchs m
       WHERE m.date > NOW()
       ORDER BY m.date ASC`
    );

    res.status(200).json({ matches });
  } catch (error) {
    console.error('Erreur lors de la récupération des matchs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;