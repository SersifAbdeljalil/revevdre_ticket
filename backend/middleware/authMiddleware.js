// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Middleware pour protéger les routes (vérifier si l'utilisateur est connecté)
const protect = async (req, res, next) => {
  let token;
  
  // Vérifier si le token est dans le header d'autorisation
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Récupérer le token du header
      token = req.headers.authorization.split(' ')[1];
      
      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Récupérer les infos de l'utilisateur à partir du token (sans le mot de passe)
      const [userRows] = await pool.execute(
        'SELECT id, nom, email, role, estBloque FROM utilisateur WHERE id = ?',
        [decoded.id]
      );
      
      if (userRows.length === 0) {
        return res.status(401).json({ message: 'Non autorisé, utilisateur non trouvé' });
      }
      
      // Vérifier si l'utilisateur est bloqué
      if (userRows[0].estBloque) {
        return res.status(403).json({ message: 'Accès refusé, votre compte a été bloqué' });
      }
      
      // Ajouter l'utilisateur à la requête
      req.user = userRows[0];
      next();
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  } else if (!token) {
    res.status(401).json({ message: 'Non autorisé, aucun token fourni' });
  }
};

// Middleware pour vérifier si l'utilisateur est administrateur
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'administrateur') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé, droits administrateur requis' });
  }
};

module.exports = { protect, adminOnly };