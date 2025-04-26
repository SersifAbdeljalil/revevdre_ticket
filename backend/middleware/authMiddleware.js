// config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'revente_tickets_can2025',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fonction utilitaire pour vérifier la connexion à la base de données
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connexion à la base de données MySQL établie avec succès');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données MySQL:', error);
    return false;
  }
};

module.exports = { pool, testDbConnection };

// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware pour protéger les routes
const protect = (req, res, next) => {
  try {
    // Récupérer le token du header
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé. Veuillez vous connecter.' });
    }
    
    const token = authorization.split(' ')[1];
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter les données de l'utilisateur à la requête
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Erreur de token:', error);
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// Middleware pour restreindre l'accès selon le rôle
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Vous n\'avez pas la permission d\'effectuer cette action' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };